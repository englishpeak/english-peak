import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes, randomInt } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { createClient } from '@supabase/supabase-js';
import { stripMp3Tags } from './spelling-bee-audio.js';
import { LEVELS_BY_DIFFICULTY, SPELLING_BEE_WORDS } from './spelling-bee-data.js';
import { SPELLING_BEE_MARKUP } from './spelling-bee-page.js';

const ROUND_LIFETIME_MS = 24 * 60 * 60 * 1000;
const LIST_LIMIT = 1000;
const AUDIO_BUCKET = 'word-audio';
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
        return question.version === catalogVersion && question.expiresAt > Date.now() ? question : null;
      } catch {
        return null;
      }
    },
  };
}

async function getAvailableWords(storage, levels) {
  const candidates = new Map();
  SPELLING_BEE_WORDS.forEach((entry, index) => {
    if (!levels.includes(entry.cefrLevel)) return;
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
      const { data, error } = await supabase.auth.getUser(token);
      if (error?.status >= 500) throw error;
      const user = data?.user;
      if (error || !user?.id || user.is_anonymous) {
        return res.status(401).json({ error: 'Sign in to use Spelling Bee.' });
      }

      const body = req.body;
      if (body?.action === 'page') {
        return res.status(200).json({ html: SPELLING_BEE_MARKUP });
      }
      if (body?.action === 'start') {
        if (typeof body.difficulty !== 'string' || !Object.hasOwn(LEVELS_BY_DIFFICULTY, body.difficulty)) {
          return res.status(400).json({ error: 'Choose a difficulty.' });
        }
        const order = await getAvailableWords(supabase.storage.from(AUDIO_BUCKET), LEVELS_BY_DIFFICULTY[body.difficulty]);
        if (!order.length) return res.status(200).json({ state: 'empty' });
        const questionId = questions.seal({
          version: catalogVersion, expiresAt: Date.now() + ROUND_LIFETIME_MS,
          order, index: 0, stage: 'active',
        }, user.id);
        return res.status(200).json({ state: 'question', questionId });
      }
      if (!['audio', 'check', 'reveal', 'next', 'skip'].includes(body?.action)) {
        return res.status(400).json({ error: 'Invalid exercise action.' });
      }

      const question = questions.open(body.questionId, user.id);
      if (!question) return res.status(409).json({ error: 'This round has expired. Start a new round to continue.' });
      const entry = SPELLING_BEE_WORDS[question.order[question.index]];
      const finished = question.stage === 'correct' || question.stage === 'revealed';
      if (body.action === 'audio') return await sendAudio(supabase.storage.from(AUDIO_BUCKET), entry, res);
      if (body.action === 'skip' || (body.action === 'next' && finished)) {
        const index = question.index + 1;
        if (index === question.order.length) return res.status(200).json({ state: 'complete' });
        const questionId = questions.seal({ ...question, index, stage: 'active' }, user.id);
        return res.status(200).json({ state: 'question', questionId });
      }
      if (body.action === 'reveal' && question.stage === 'incorrect') {
        const questionId = questions.seal({ ...question, stage: 'revealed' }, user.id);
        return res.status(200).json({ state: 'revealed', word: entry.word, questionId });
      }
      if (body.action === 'check' && !finished) {
        const answer = typeof body.answer === 'string' && body.answer.length <= 100 ? body.answer.trim() : '';
        if (!answer) return res.status(400).json({ error: 'Enter a spelling to check.' });
        const state = answer.toLowerCase() === entry.word ? 'correct' : 'incorrect';
        const questionId = questions.seal({ ...question, stage: state }, user.id);
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
