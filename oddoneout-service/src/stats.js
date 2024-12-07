export class Stats {
  constructor() {
    this.accuracy = new AccuracyStat();
    this.precision = new PrecisionStat();
  };
};

class AccuracyStat {
  constructor() {
    this.coarse = {
      wins: 0,
      losses: 0,
    };
    this.fine = {
      this.botsSaved = 0,
      this.captchasFailed = 0,
      this.connectionsLost = 0,
    };
  };
};

class PrecisionStat {
  constructor() {
    this.coarse = {
      humans: 0,
      bots: 0,
    };
    this.fine = {
      truePositives: 0,
      falsePositives: 0,
      trueNegatives: 0,
      falseNegatives: 0,
    };
  };
};
