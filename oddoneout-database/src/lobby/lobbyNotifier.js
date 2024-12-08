import { Player } from '../player';

const LobbyEvent = {
  System: 'system',
  End: 'connectionEnd',
  Start: 'connectionStart',
};

class EventMessage {
  constructor(from, type, value) {
    this.from = from;
    this.type = type;
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

class LobbyEventNotifier {
  handlers = [];
  index = 0;

  constructor() {
    // Simulate chat messages that will eventually come over WebSocket
    setInterval(() => {
      this.broadcastEvent(fakePlayers[this.index].name, LobbyEvent.Start, fakePlayers[this.index]);
      this.index += 1;
      this.index %= fakePlayers.length;
    }, 5000);
  }

  broadcastEvent(from, type, value) {
    const event = new EventMessage(from, type, value);
    this.receiveEvent(event);
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    this.handlers.filter((h) => h !== handler);
  }

  receiveEvent(event) {
    this.handlers.forEach((handler) => {
      handler(event);
    });
  }
}

const LobbyNotifier = new LobbyEventNotifier();
export { LobbyEvent, LobbyNotifier };
