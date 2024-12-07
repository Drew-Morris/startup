export class GameState {
  static Question = new GameState('question');
  static Answer = new GameState('answer');
  static Ballot = new GameState('ballot');
  static Kick = new GameState('kick');
  static Vote = new GameState('vote');
  static Results = new GameState('results');
  static Unknown = new GameState('unknown');

  constructor(name) {
    this.name = name;
  }

}
