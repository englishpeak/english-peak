const MODEL = 'gpt-4o-mini-tts';
const MAX_LINES = 40;
const MAX_CHARS_PER_LINE = 900;
const VALID_VOICES = new Set(['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer', 'verse']);


function createOpenAIClient(apiKey) {
  return {
    audio: {
      speech: {
        async create(payload) {
          const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (!response.ok) {
            let message = 'OpenAI speech generation failed.';
            try {
              const data = await response.json();
              message = data?.error?.message || message;
            } catch (_) {}
            throw new Error(message);
          }
          return response;
        }
      }
    }
  };
}

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function validateLines(lines) {
  if (!Array.isArray(lines) || !lines.length) throw new Error('Add at least one Speaker: line before generating audio.');
  if (lines.length > MAX_LINES) throw new Error(`Please keep scripts to ${MAX_LINES} lines or fewer for one generation.`);
  lines.forEach((line, index) => {
    if (!line || typeof line.speaker !== 'string' || typeof line.text !== 'string') {
      throw new Error(`Line ${index + 1} is missing speaker or text.`);
    }
    if (!line.speaker.trim() || !line.text.trim()) throw new Error(`Line ${index + 1} must include Speaker: text.`);
    if (line.text.length > MAX_CHARS_PER_LINE) throw new Error(`Line ${index + 1} is too long. Please keep each turn under ${MAX_CHARS_PER_LINE} characters.`);
  });
}

function voiceForSpeaker(speaker, speakerSettings = {}) {
  const setting = speakerSettings[speaker] || {};
  return VALID_VOICES.has(setting.voice) ? setting.voice : speaker.toLowerCase() === 'supplier' ? 'sage' : 'onyx';
}

function instructionsForSpeaker(speaker, speakerSettings = {}) {
  const setting = speakerSettings[speaker] || {};
  const fallback = speaker.toLowerCase() === 'supplier'
    ? 'Calm, businesslike ESL dialogue voice. Clear pronunciation, natural pacing, supportive professional tone.'
    : 'Professional, confident ESL dialogue voice. Clear pronunciation, natural pacing, polished business tone.';
  return String(setting.instructions || fallback).slice(0, 700);
}


function silentMp3FrameCount(durationMs) {
  const frameDurationMs = 26.122;
  return Math.max(0, Math.round(Number(durationMs || 0) / frameDurationMs));
}

function createSilentMp3(durationMs) {
  // MPEG-1 Layer III, 128 kbps, 44.1 kHz silent frame. Repeating valid MP3 frames
  // creates a practical pause segment while keeping the final file downloadable as MP3.
  const frame = Buffer.from('/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
  return Buffer.concat(Array.from({ length: silentMp3FrameCount(durationMs) }, () => frame));
}

function mergeMp3(clips, pauseMs) {
  const pause = createSilentMp3(pauseMs);
  const parts = [];
  clips.forEach((clip, index) => {
    parts.push(clip);
    if (index < clips.length - 1 && pause.length) parts.push(pause);
  });
  return Buffer.concat(parts);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST to generate Audio Studio files.' });
  if (!process.env.OPENAI_API_KEY) return json(res, 500, { error: 'OPENAI_API_KEY is missing. Add it to .env.local or your hosting environment.' });

  try {
    const { lines, speakerSettings, pauseMs = 400 } = req.body || {};
    validateLines(lines);
    const normalizedPause = Math.max(0, Math.min(2000, Number(pauseMs) || 400));
    const openai = createOpenAIClient(process.env.OPENAI_API_KEY);
    const audioChunks = [];

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const speech = await openai.audio.speech.create({
        model: MODEL,
        voice: voiceForSpeaker(line.speaker, speakerSettings),
        input: line.text.trim(),
        instructions: instructionsForSpeaker(line.speaker, speakerSettings),
        response_format: 'mp3'
      });
      audioChunks.push(Buffer.from(await speech.arrayBuffer()));
    }

    const mp3 = mergeMp3(audioChunks, normalizedPause);
    json(res, 200, {
      audioBase64: mp3.toString('base64'),
      mimeType: 'audio/mpeg',
      fileName: 'epeak-audio-studio.mp3',
      model: MODEL,
      lineCount: lines.length
    });
  } catch (error) {
    console.error('[audio-studio]', error);
    json(res, 400, { error: error.message || 'Audio generation failed. Please try again.' });
  }
}
