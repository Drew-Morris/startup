import { Player } from '../../player';

const QuestionEvent = {
  System: 'system',
  Player: 'player',
};

class EventMessage {
  constructor(from, type, value) {
    this.from = from;
    this.type = type;
    this.value = value;
  };
};

class QuestionEventNotifier {
  handlers = [];
  index = 0;

  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    this.socket.onopen = (event) => {
      this.receiveEvent(new EventMessage('Question', QuestionEvent.System, { msg: 'connected' }));
    };
    this.socket.onclose = (event) => {
      this.receiveEvent(new EventMessage('Question', QuestionEvent.System, { msg: 'disconnected' }));
    };
    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        this.receiveEvent(event);
      } catch {}
    };
  };

  broadcastEvent(from, value) {
    const event = new EventMessage(from, QuestionEvent.Player, value);
    this.socket.send(JSON.stringify(event));
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
}

const QuestionNotifier = new QuestionEventNotifier();
export { QuestionNotifier };
