export class Timer {
  constructor(total = 0, on = false) {
    this.on = on;
    this.begin = Date.now(); 
    this.total = total * 1000;
    this.remaining = total * 1000;
  };

  set(total) {
    this.total = total * 1000;
  };

  reset() {
    this.begin = Date.now();
  };

  start() {
    this.on = true;
    this.begin = Date.now();
  };

  stop() {
    this.on = false;
  };

  now() {
    if (!this.on) {
      return Math.round(this.remaining / 1000);
    }
    else {
      const elapsed = Date.now() - this.begin;
      const remaining = this.total - elapsed;
      this.remaining = remaining;
      return Math.max(0, Math.round(remaining / 1000));
    }
  };
}
