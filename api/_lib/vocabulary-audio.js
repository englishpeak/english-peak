export function vocabularyAudioPath(entry) {
  return entry.audioPath ?? `en-US/${entry.word.toLowerCase()}.mp3`;
}

// Callers authorize access and resolve a trusted entry before serving its audio.
export async function sendVocabularyAudio(supabase, entry, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  const { data, error } = await supabase.storage.from('word-audio').download(vocabularyAudioPath(entry));
  if (error?.status === 404 || Number(error?.statusCode) === 404 || error?.statusCode === 'NoSuchKey') {
    return res.status(404).json({ error: 'Pronunciation not found.' });
  }
  if (error || !data?.size) {
    return res.status(503).json({ error: 'Pronunciation is temporarily unavailable.' });
  }
  const bytes = Buffer.from(await data.arrayBuffer());
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Length', bytes.length);
  return res.status(200).end(bytes);
}
