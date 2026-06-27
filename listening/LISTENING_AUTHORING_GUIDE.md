# Listening Authoring Guide

Use this guide before adding or editing Listening tests.

## Test Structure

Each Listening test has:

- 4 audios total
- 2 monologues
- 2 conversations
- 3 multiple-choice questions per audio
- 4 answer options per question
- 1 correct answer index per question
- 1 feedback explanation per question
- A script for every audio
- A direct audio URL for every audio

Add each new test as a complete object inside the `LISTENING_TESTS` array in `listening/index.html`. Paste the new object directly below the latest completed test object.

## Audio Order

Preferred order:

1. Monologue
2. Conversation
3. Monologue
4. Conversation

This matches the current workflow and keeps the experience predictable.

## Question Style

Questions should be challenging and should test:

- Main idea
- Speaker purpose
- Inference
- Tone or attitude
- Important details
- Cause and effect
- Implied next action

Avoid overly easy questions that only repeat a phrase from the script.

## Script Reveal

Every audio should have a script available through the page's existing "Show script" button. Keep the playful reminder text near the button:

```text
Use only if needed and as a last resort :)
```

The script is a fallback support tool, not the main test experience.

## Dropbox Audio Links

Use individual Dropbox file links, not Dropbox folder links.

Convert this:

```text
https://www.dropbox.com/scl/fi/FILE_ID/Audio-1.mp3?rlkey=KEY&st=TOKEN&dl=0
```

to this:

```text
https://dl.dropboxusercontent.com/scl/fi/FILE_ID/Audio-1.mp3?rlkey=KEY&st=TOKEN&raw=1
```

The final `audioUrl` should look like:

```js
audioUrl: "https://dl.dropboxusercontent.com/scl/fi/FILE_ID/Audio-1.mp3?rlkey=KEY&st=TOKEN&raw=1",
```

## Access Rules

- Tests 1 and 2: open to all visitors.
- Tests 3, 4, and 5: ePeak members.
- Tests 6 and later: ePeak+ members.

Make sure any access logic continues to follow this pattern.

## Copy-Paste Template

```js
{
  id: "listening3",
  title: "Listening Test 3",
  theme: "Short description of the topics",
  audios: [
    {
      type: "monologue",
      title: "Audio title",
      audioUrl: "DIRECT_DROPBOX_RAW_LINK",
      script: "Full script text.",
      questions: [
        {
          q: "Question text?",
          options: [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          answer: 0,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          answer: 1,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          answer: 2,
          why: "Explain clearly why the correct answer is correct."
        }
      ]
    },
    {
      type: "conversation",
      title: "Audio title",
      audioUrl: "DIRECT_DROPBOX_RAW_LINK",
      script: "Speaker A: Line.\n\nSpeaker B: Line.",
      questions: [
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 0,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 1,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 2,
          why: "Explain clearly why the correct answer is correct."
        }
      ]
    },
    {
      type: "monologue",
      title: "Audio title",
      audioUrl: "DIRECT_DROPBOX_RAW_LINK",
      script: "Full script text.",
      questions: [
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 0,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 1,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 2,
          why: "Explain clearly why the correct answer is correct."
        }
      ]
    },
    {
      type: "conversation",
      title: "Audio title",
      audioUrl: "DIRECT_DROPBOX_RAW_LINK",
      script: "Speaker A: Line.\n\nSpeaker B: Line.",
      questions: [
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 0,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 1,
          why: "Explain clearly why the correct answer is correct."
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 2,
          why: "Explain clearly why the correct answer is correct."
        }
      ]
    }
  ]
}
```
