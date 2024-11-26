import { Player } from '../../player';

class EventMessage {
  constructor(from, value) {
    this.from = from;
    this.value = value;
  }
}

const fakePlayers = [
  new Player('c4b713280cd32c', 'Ada'),
  new Player('89n9c0ewnqce8w', 'Benson'),
  new Player('luncew087980ad', 'Carl'),
  new Player('78v0grewvruy2e', 'Drew'),
  new Player('z890n9cp8oceqn', 'Emma'),
];

const fakeBallots = [
  [], 
  ['c4b713280cd32c', 'z890n9cp8oceqn'], 
  ['89n9c0ewnqce8w'],
  ['z890n9cp8oceqn', '89n9c0ewnqce8w'],
  ['89n9c0ewnqce8w', '78v0grewvruy2e'],
];

class BallotEventNotifier {
  handlers = [];
  index = 0;

  constructor() {
    // Simulate chat messages that will eventually come over WebSocket
    setInterval(() => {
      this.broadcastEvent(fakePlayers[this.index], fakeBallots[this.index]);
      this.index += 1;
      this.index %= fakeBallots.length;
    }, 5000);
  };

  broadcastEvent(from, value) {
    const event = new EventMessage(from, value);
    this.receiveEvent(event);
  };

  addHandler(handler) {
    this.handlers.push(handler);
  };

  removeHandler(handler) {
    this.handlers.filter((h) => h !== handler);
  };

  receiveEvent(event) {
    this.handlers.forEach((handler) => {
      handler(event);
    });
  };

};

const BallotNotifier = new BallotEventNotifier();
export { BallotNotifier };
