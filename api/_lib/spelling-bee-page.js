export const SPELLING_BEE_MARKUP = `
  <h1 class="ep-heading">Spelling Bee</h1>
  <div class="levels" role="group" aria-label="Difficulty">
    <button type="button" data-level="easy" aria-pressed="true">Easy <small>A1–A2</small></button>
    <button type="button" data-level="medium" aria-pressed="true">Medium <small>B1–B2</small></button>
    <button type="button" data-level="hard" aria-pressed="true">Hard <small>C1–C2</small></button>
  </div>
  <section class="ep-card practice" aria-labelledby="practice-title">
    <h2 class="ep-heading" id="practice-title">Listen and spell</h2>
    <p class="instructions">Listen carefully and type the word you hear.</p>
    <p id="round-status" role="status"></p>
    <button type="button" class="secondary" id="restart" hidden></button>
    <div id="question" hidden>
      <button type="button" id="play" aria-label="Play pronunciation" aria-describedby="audio-status">
        <span aria-hidden="true">▶</span>
      </button>
      <p id="audio-status" role="status"></p>
      <button type="button" class="secondary" id="skip" hidden>Skip this word</button>
      <form id="answer-form">
        <label for="answer">Your spelling</label>
        <input id="answer" type="text" required maxlength="100" spellcheck="false"
          autocorrect="off" autocomplete="off" autocapitalize="none" enterkeyhint="done">
        <button type="submit" class="ep-btn-primary" id="check">Check spelling</button>
      </form>
      <p id="feedback" role="status" aria-atomic="true"></p>
      <div class="actions">
        <button type="button" class="secondary" id="reveal" hidden>Show spelling</button>
        <button type="button" class="ep-btn-primary" id="next" hidden>Next word</button>
      </div>
    </div>
  </section>
`;
