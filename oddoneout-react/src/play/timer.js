export class Timer {
  constructor (total) {
    this.start = Date.now();
    this.total = total * 1000;
    this.curr = this.total;
  }

  reset () {
    this.start = Date.now();
    this.curr = this.total;
  }

  now () {
    if (!this.curr) {
      return 0;
    }
    const update = Date.now();
    this.curr -= update - this.start;
    this.start = update;
    return Math.round(this.curr / 1000);
  }
}
