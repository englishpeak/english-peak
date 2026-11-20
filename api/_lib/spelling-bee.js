import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, randomInt } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { createClient } from '@supabase/supabase-js';
import { stripMp3Tags } from './spelling-bee-audio.js';
import { LEVELS_BY_DIFFICULTY, SPELLING_BEE_WORDS } from './spelling-bee-data.js';
import { SPELLING_BEE_MARKUP } from './spelling-bee-page.js';

const ROUND_LIFETIME_MS = 24 * 60 * 60 * 1000;
const ANSWER_AUTH_TTL_MS = 30_000;
const MAX_VERIFIED_TOKENS = 256;
const LIST_LIMIT = 1000;
const AUDIO_BUCKET = 'word-audio';
const difficultyByLevel = new Map(Object.entries(LEVELS_BY_DIFFICULTY).flatMap(
  ([difficulty, levels]) => levels.map(level => [level, difficulty])
));
const allDifficulties = Object.keys(LEVELS_BY_DIFFICULTY);
const catalogVersion = createHash('sha256').update(JSON.stringify(SPELLING_BEE_WORDS)).digest('base64url');

function setResponseHeaders(res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}

function createQuestions(secret) {
  const key = Buffer.from(hkdfSync('sha256', secret, '', 'english-peak/spelling-bee/question/v1', 32));

  return {
    seal(question, userId) {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(Buffer.from(userId));
      const ciphertext = Buffer.concat([cipher.update(JSON.stringify(question)), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url');
    },
    open(token, userId) {
      if (typeof token !== 'string' || token.length > 32_768 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
      try {
        const bytes = Buffer.from(token, 'base64url');
        const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12));
        decipher.setAAD(Buffer.from(userId));
        decipher.setAuthTag(bytes.subarray(12, 28));
        const question = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]));
        if (question.version !== catalogVersion || question.expiresAt <= Date.now()) return null;
        if (question.remaining) return question;
        // Earlier rounds used a cursor into a single-difficulty list.
        const { order, ...state } = question;
        return { ...state, remaining: order.slice(state.index), index: 0 };
      } catch {
        return null;
      }
    },
  };
}

function readDifficulties(body, fallback) {
  let difficulties = body.difficulties;
  if (difficulties === undefined) difficulties = body.difficulty === undefined ? fallback : [body.difficulty];
  if (!Array.isArray(difficulties) || !difficulties.length || difficulties.length > allDifficulties.length ||
      difficulties.some(difficulty => !allDifficulties.includes(difficulty))) return null;
  return new Set(difficulties);
}

function entryDifficulty(entryIndex) {
  return difficultyByLevel.get(SPELLING_BEE_WORDS[entryIndex].cefrLevel);
}

async function getAvailableWords(storage, difficulties) {
  const candidates = new Map();
  SPELLING_BEE_WORDS.forEach((entry, index) => {
    if (!difficulties.has(entryDifficulty(index))) return;
    const slash = entry.audioPath.lastIndexOf('/');
    const folder = entry.audioPath.slice(0, slash);
    const filename = entry.audioPath.slice(slash + 1);
    if (!candidates.has(folder)) candidates.set(folder, new Map());
    candidates.get(folder).set(filename, index);
  });

  const available = [];
  for (const [folder, wanted] of candidates) {
    for (let offset = 0; wanted.size; offset += LIST_LIMIT) {
      const { data, error } = await storage.list(folder, {
        limit: LIST_LIMIT, offset, sortBy: { column: 'name', order: 'asc' },
      });
      if (error || !Array.isArray(data)) throw error ?? new Error('Storage inventory unavailable');
      for (const item of data) {
        if (wanted.has(item.name) && item.id && Number(item.metadata?.size ?? 1) > 0) {
          available.push(wanted.get(item.name));
          wanted.delete(item.name);
        }
      }
      if (data.length < LIST_LIMIT) break;
    }
  }

  for (let index = available.length - 1; index > 0; index--) {
    const swap = randomInt(index + 1);
    [available[index], available[swap]] = [available[swap], available[index]];
  }
  return available;
}

async function sendAudio(storage, entry, res) {
  const { data, error } = await storage.download(entry.audioPath).asStream();
  if (error?.status === 404 || Number(error?.statusCode) === 404 ||
      [error?.code, error?.statusCode].some(code => code === 'NoSuchKey' || code === 'not_found')) {
    return res.status(404).json({ error: 'This pronunciation recording is unavailable.' });
  }
  if (error || !data) throw error ?? new Error('Missing audio stream');

  const audio = stripMp3Tags(data);
  const first = await audio.next();
  if (first.done) return res.status(404).json({ error: 'This pronunciation recording is unavailable.' });

  res.status(200);
  res.setHeader('Content-Type', 'audio/mpeg');
  await pipeline((async function* () {
    try {
      yield first.value;
      yield* audio;
    } finally {
      await audio.return();
    }
  })(), res);
}

export function createSpellingBeeHandler({ supabase, secret }) {
  const questions = createQuestions(secret);
  const verifiedTokens = new Map();

  async function verifyMember(token, action) {
    const key = createHash('sha256').update(token).digest('base64url');
    const cached = verifiedTokens.get(key);
    if (action === 'check' && cached?.expiresAt > Date.now()) return cached.userId;

    const { data, error } = await supabase.auth.getUser(token);
    verifiedTokens.delete(key);
    if (error?.status >= 500) throw error;
    const user = data?.user;
    if (error || !user?.id || user.is_anonymous) return null;

    // Only reuse a remote verification for this exact token, within its JWT lifetime.
    let expiry;
    try {
      expiry = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')).exp;
    } catch {
      return user.id;
    }
    const now = Date.now();
    if (Number.isFinite(expiry) && expiry * 1000 > now) {
      verifiedTokens.set(key, { userId: user.id, expiresAt: Math.min(expiry * 1000, now + ANSWER_AUTH_TTL_MS) });
      if (verifiedTokens.size > MAX_VERIFIED_TOKENS) verifiedTokens.delete(verifiedTokens.keys().next().value);
    }
    return user.id;
  }

  function selectQuestion(round, difficulties, userId) {
    if (!round.remaining.length) return { state: 'complete' };
    const index = round.remaining.findIndex(entry => difficulties.has(entryDifficulty(entry)));
    if (index === -1) {
      return { state: 'filtered', questionId: questions.seal({ ...round, index, stage: 'waiting' }, userId) };
    }
    const questionId = questions.seal({ ...round, index, stage: 'active' }, userId);
    return { state: 'question', questionId, difficulty: entryDifficulty(round.remaining[index]) };
  }

  async function startRound(difficulties, pool, userId) {
    const remaining = await getAvailableWords(supabase.storage.from(AUDIO_BUCKET), pool);
    if (!remaining.length) return { state: 'empty' };
    return selectQuestion({
      version: catalogVersion, expiresAt: Date.now() + ROUND_LIFETIME_MS, remaining,
    }, difficulties, userId);
  }

  return async function handler(req, res) {
    setResponseHeaders(res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }

    const authorization = req.headers?.authorization;
    const token = typeof authorization === 'string' ? authorization.match(/^Bearer ([^\s]+)$/i)?.[1] : null;
    if (!token) return res.status(401).json({ error: 'Sign in to use Spelling Bee.' });

    try {
      const body = req.body;
      const userId = await verifyMember(token, body?.action);
      if (!userId) {
        return res.status(401).json({ error: 'Sign in to use Spelling Bee.' });
      }

      if (body?.action === 'page') {
        const payload = { html: SPELLING_BEE_MARKUP };
        if (body.includeRound === true) {
          const difficulties = new Set(allDifficulties);
          payload.round = await startRound(difficulties, difficulties, userId);
        }
        return res.status(200).json(payload);
      }
      if (body?.action === 'start') {
        const difficulties = readDifficulties(body);
        if (!difficulties) return res.status(400).json({ error: 'Choose at least one difficulty level.' });
        // Multi-level rounds retain disabled words so re-enabling a level can resume the same shuffle.
        const pool = body.difficulties === undefined ? difficulties : new Set(allDifficulties);
        return res.status(200).json(await startRound(difficulties, pool, userId));
      }
      if (!['audio', 'check', 'reveal', 'next', 'skip', 'resume'].includes(body?.action)) {
        return res.status(400).json({ error: 'Invalid exercise action.' });
      }

      const question = questions.open(body.questionId, userId);
      if (!question) return res.status(409).json({ error: 'This round has expired. Start a new round to continue.' });
      const finished = question.stage === 'correct' || question.stage === 'revealed';
      const waiting = question.stage === 'waiting';
      const canAdvance = !waiting && (body.action === 'skip' || (body.action === 'next' && finished));
      if (canAdvance || (waiting && body.action === 'resume')) {
        const difficulties = readDifficulties(body, allDifficulties);
        if (!difficulties) return res.status(400).json({ error: 'Choose at least one difficulty level.' });
        const remaining = canAdvance
          ? question.remaining.filter((_, index) => index !== question.index)
          : question.remaining;
        return res.status(200).json(selectQuestion({ ...question, remaining }, difficulties, userId));
      }

      if (waiting) return res.status(400).json({ error: 'Choose a difficulty level with words left in this round.' });
      const entry = SPELLING_BEE_WORDS[question.remaining[question.index]];
      if (body.action === 'audio') return await sendAudio(supabase.storage.from(AUDIO_BUCKET), entry, res);
      if (body.action === 'reveal' && question.stage === 'incorrect') {
        const questionId = questions.seal({ ...question, stage: 'revealed' }, userId);
        return res.status(200).json({ state: 'revealed', word: entry.word, questionId });
      }
      if (body.action === 'check' && !finished) {
        const answer = typeof body.answer === 'string' && body.answer.length <= 100 ? body.answer.trim() : '';
        if (!answer) return res.status(400).json({ error: 'Enter a spelling to check.' });
        const state = answer.toLowerCase() === entry.word ? 'correct' : 'incorrect';
        const questionId = questions.seal({ ...question, stage: state }, userId);
        return res.status(200).json({ state, questionId });
      }

      return res.status(400).json({ error: 'This action is unavailable for the current question.' });
    } catch {
      if (res.headersSent || res.destroyed) return res.end();
      return res.status(503).json({ error: 'Spelling Bee is temporarily unavailable. Please try again.' });
    }
  };
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const configuredHandler = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createSpellingBeeHandler({
      secret: SUPABASE_SERVICE_ROLE_KEY,
      supabase: createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    })
  : null;

export default function handler(req, res) {
  if (configuredHandler) return configuredHandler(req, res);
  setResponseHeaders(res);
  return res.status(503).json({ error: 'Spelling Bee is temporarily unavailable. Please try again.' });
}
