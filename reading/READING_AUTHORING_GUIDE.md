# Reading Authoring Guide

Use this guide before adding or editing Reading tests.

## Test Structure

Each Reading test has:

- 3 reading passages
- 4 questions per passage
- 12 questions total
- Multiple-choice questions only
- 4 answer options per question
- 1 correct answer index per question
- 1 clear feedback explanation per question

Add each new test as a complete object inside the Reading test array in `reading/index.html`. Paste the new object directly below the latest completed test object.

## Passage Style

Reading passages should feel polished and useful for adult English learners. Use topics such as:

- Business
- Science
- Pop culture
- Biographies
- Innovation
- Workplace trends
- Historical or cultural context

Good biography subjects include people such as Steve Jobs, Michael Jordan, entrepreneurs, scientists, artists, athletes, or public figures with interesting decision-making stories.

## Question Style

Questions should be challenging and should test:

- Main idea
- Inference
- Author purpose
- Detail recognition
- Meaning from context
- Cause and effect
- Tone or attitude
- How one idea supports another

Avoid questions that are too obvious or that can be answered by matching a single word.

## Feedback Rules

Every question must include feedback explaining why the correct answer is correct.

Strong feedback:

- Points back to the relevant idea in the passage.
- Explains the reasoning, not only the location of the answer.
- Clarifies why the correct answer is stronger than the distractors when useful.

Example:

```js
why: "The passage says the company delayed expansion because demand was uncertain, so the best answer is the option about reducing risk before committing more resources."
```

## Access Rules

- Tests 1 and 2: open to all visitors.
- Tests 3, 4, and 5: visitors with an existing account.
- Tests 6 and later: ePeak+ members.

Make sure any access logic continues to follow this pattern.

## Copy-Paste Template

```js
{
  id: "reading9",
  title: "Reading Test 9",
  theme: "Short description of the topics",
  passages: [
    {
      title: "Passage title",
      text: [
        "Paragraph one.",
        "Paragraph two.",
        "Paragraph three."
      ],
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
        },
        {
          q: "Question text?",
          options: [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          answer: 3,
          why: "Explain clearly why the correct answer is correct."
        }
      ]
    },
    {
      title: "Passage title",
      text: [
        "Paragraph one.",
        "Paragraph two.",
        "Paragraph three."
      ],
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
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 3,
          why: "Explain clearly why the correct answer is correct."
        }
      ]
    },
    {
      title: "Passage title",
      text: [
        "Paragraph one.",
        "Paragraph two.",
        "Paragraph three."
      ],
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
        },
        {
          q: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 3,
          why: "Explain clearly why the correct answer is correct."
        }
      ]
    }
  ]
}
```
