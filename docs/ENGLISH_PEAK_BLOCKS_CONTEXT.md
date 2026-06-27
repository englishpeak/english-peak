# English Peak Reading and Listening Blocks Context

Use this file as project memory before editing the Reading or Listening blocks.

## Product Placement

- Reading and Listening belong under the "New" category on the main English Peak index.
- Irregular Verbs and Unscramble the Questions belong under "General English".
- The Listening page should remain hidden from the main index until it has publish-ready content.
- Once content is ready, expose the block card through the same index logic used by the other sections.

## Shared Requirements

- Tests must be modular JavaScript objects inside each block's `index.html`.
- New tests should be added by copying a complete test object and pasting it directly below the latest test in the test array.
- Every question must be multiple choice.
- Every question must include clear feedback explaining why the correct answer is correct.
- Finished test results must report to the "My Progress" system using the existing parent-window progress message pattern.
- Keep the user flow page-based: show one passage/audio group at a time, then move with Next or Submit buttons.
- Final result screens should show the score and per-question feedback.
- Keep styling aligned with the existing English Peak branding: polished, warm, premium, and consistent with the current block designs.

## Access Tiers

Reading:

- Tests 1 and 2 are open to all visitors, no account required.
- Tests 3, 4, and 5 are for visitors with an existing account.
- Tests 6 and later are for ePeak+ members.

Listening:

- Tests 1 and 2 are open to all visitors, no account required.
- Tests 3, 4, and 5 are for ePeak members.
- Tests 6 and later are for ePeak+ members.

## Content Direction

Reading topics should include:

- Business
- Science
- Pop culture
- Biographies of interesting figures, such as Steve Jobs or Michael Jordan

Listening topics should include:

- Practical professional situations
- Workplace conversations
- Academic mini-lectures
- Business meetings or negotiations

Questions should be challenging enough to test inference, purpose, tone, detail, and implied meaning. Avoid questions that are answerable from a single obvious keyword unless the detail is genuinely important.

## Audio Hosting Guidance

For Listening audio, individual Dropbox file links are preferred when the user does not want to add audio folders to GitHub.

Convert Dropbox share links like this:

```text
https://www.dropbox.com/scl/fi/FILE_ID/Audio-1.mp3?rlkey=KEY&st=TOKEN&dl=0
```

to direct streaming links like this:

```text
https://dl.dropboxusercontent.com/scl/fi/FILE_ID/Audio-1.mp3?rlkey=KEY&st=TOKEN&raw=1
```

Rules:

- Replace `www.dropbox.com` with `dl.dropboxusercontent.com`.
- Replace `dl=0` with `raw=1`.
- Keep the `rlkey` and `st` parameters.
- Use one individual Dropbox link per audio file.
- Do not use a shared Dropbox folder link inside an audio player.

## Codex Web Startup Prompt

When working from Codex Web or another machine, start with:

```text
Read docs/ENGLISH_PEAK_BLOCKS_CONTEXT.md and the authoring guide for the block we are editing before making changes. Preserve the existing styling and modular test workflow.
```
