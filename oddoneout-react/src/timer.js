export class Timer {
  constructor(total = 0, on = false) {
    this.on = on;
    this.start = Date.now(); 
    this.total = total * 1000;
  }

  set(total) {
    this.total = total * 1000;
  }

  reset() {
    this.start = Date.now();
  }

  begin() {
    this.on = true;
    this.start = Date.now();
  }

  now() {
    if (!this.on) {
      return Math.round(this.total / 1000);
    }
    else {
      const elapsed = Date.now() - this.start;
      const remaining = this.total - elapsed;
      return Math.max(0, Math.round(remaining / 1000));
    }
  }
}
