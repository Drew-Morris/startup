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

const fakeAnswers = [
  "What is your favorite color?", 
  "What is your favorite dinosaur?", 
  "Are you a robot?", 
  "What is your favorite number?",
  "What is your favorite question?",
];

class QuestionEventNotifier {
  handlers = [];
  index = 0;

  constructor() {
    // Simulate chat messages that will eventually come over WebSocket
    setInterval(() => {
      this.broadcastEvent(fakePlayers[this.index].id, fakeAnswers[this.index]);
      this.index += 1;
      this.index %= fakeAnswers.length;
    }, 5000);
  }

  broadcastEvent(from, value) {
    const event = new EventMessage(from, value);
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

const QuestionNotifier = new QuestionEventNotifier();
export { QuestionNotifier };
