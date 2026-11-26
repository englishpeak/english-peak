import { TOEFL_DICTIONARY } from './toefl-dictionary-data.js';
import { vocabularyAudioPath } from './vocabulary-audio.js';

export const LEVELS_BY_DIFFICULTY = {
  easy: ['A1', 'A2'],
  medium: ['B1', 'B2'],
  hard: ['C1', 'C2'],
};

// Add Bee-specific vocabulary by listing it under its explicit CEFR level.
// These levels take precedence in the Bee if the dictionary teaches the same spelling.
const BEE_WORDS_BY_LEVEL = {
  A1: [
    'apple', 'banana', 'brother', 'family', 'garden', 'kitchen', 'morning', 'picture', 'teacher', 'window',
    'breakfast', 'daughter', 'elephant', 'hospital', 'restaurant',
  ],
  A2: [
    'appointment', 'calendar', 'customer', 'furniture', 'invitation', 'journey', 'luggage', 'medicine', 'passenger', 'suitcase',
    'beautiful', 'bicycle', 'mountain', 'neighbor', 'vegetable',
  ],
  B1: ['achievement', 'available', 'environment', 'necessary', 'recommend'],
  B2: [
    'accommodation', 'acknowledge', 'conscious', 'consequence', 'guarantee', 'maintenance', 'perspective', 'pronunciation', 'sufficient', 'thoroughly',
    'exaggerate', 'independent', 'responsibility', 'suspicious', 'colleague',
  ],
  C1: ['notion', 'outcome'],
};

const availableLevels = new Set(Object.values(LEVELS_BY_DIFFICULTY).flat());
const beeEntries = Object.entries(BEE_WORDS_BY_LEVEL).flatMap(([cefrLevel, words]) =>
  words.map(word => ({ word, cefrLevel }))
);

const entriesByWord = new Map();
for (const entry of [...beeEntries, ...TOEFL_DICTIONARY]) {
  const word = entry.word.trim().toLowerCase();
  if (!availableLevels.has(entry.cefrLevel) || entriesByWord.has(word)) continue;
  entriesByWord.set(word, {
    word,
    cefrLevel: entry.cefrLevel,
    audioPath: vocabularyAudioPath(entry),
  });
}

export const SPELLING_BEE_WORDS = [...entriesByWord.values()];
