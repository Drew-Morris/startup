import { Player } from '../../player';

const VoteEvent = {
  System: 'system',
  Player: 'player',
};

class EventMessage {
  constructor(from, value) {
    this.from = from;
    this.value = value;
  }
}

class VoteEventNotifier {
  handlers = [];
  index = 0;

  
  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    this.socket.onopen = (event) => {
      this.receiveEvent(new EventMessage('Vote', VoteEvent.System, { msg: 'connected' }));
    };
    this.socket.onclose = (event) => {
      this.receiveEvent(new EventMessage('Vote', VoteEvent.System, { msg: 'disconnected' }));
    };
    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        this.receiveEvent(event);
      } catch {}
    };
  };

  broadcastEvent(from, value) {
    const event = new EventMessage(from, value);
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

};

const VoteNotifier = new VoteEventNotifier();
export { VoteNotifier };