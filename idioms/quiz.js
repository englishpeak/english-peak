// A round owns its option order and first answers; revisiting never changes a score.
export class QuizRound {
  constructor(items, random = Math.random) {
    this.random = random;
    this.source = items;
    this.reset();
  }

  reset() {
    this.items = this.source.map(item => {
      const order = item.options.map((_, index) => index);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return { ...item, options: order.map(index => item.options[index]), correct: order.indexOf(item.correct) };
    });
    this.selected = this.items.map(() => null);
    this.pos = 0;
  }

  get item() { return this.items[this.pos]; }
  get answer() { return this.selected[this.pos]; }
  get complete() { return this.pos === this.items.length; }
  get score() { return this.selected.filter((answer, i) => answer === this.items[i].correct).length; }

  choose(index) {
    if (!this.item || this.answer !== null || !Number.isInteger(index) || index < 0 || index >= this.item.options.length) return false;
    this.selected[this.pos] = index;
    return true;
  }

  next() {
    if (this.item && this.answer !== null) { this.pos++; return true; }
    return false;
  }

  previous() {
    if (this.pos > 0) { this.pos--; return true; }
    return false;
  }
}
