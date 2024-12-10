import { Player } from '../player';

const LobbyEvent = {
  System: 'system',
  End: 'connectionEnd',
  Start: 'connectionStart',
  Join: 'connectionJoin',
  Accept: 'connectionAccept',
  Reject: 'connectionReject',
  Full: 'connectionFull',
};

class EventMessage {
  constructor(from, to = null, type, value) {
    this.from = from;
    this.to = to;
    this.type = type;
    this.value = value;
  }
};

class LobbyEventNotifier {
  handlers = [];
  index = 0;

  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    this.socket.onopen = (event) => {
      this.receiveEvent(new EventMessage('Lobby', LobbyEvent.System, { msg: 'connected' }));
    };
    this.socket.onclose = (event) => {
      this.receiveEvent(new EventMessage('Lobby', LobbyEvent.System, { msg: 'disconnected' }));
    };
    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        this.receiveEvent(event);
      } catch {}
    };
  }

  broadcastEvent(from, to, type, value) {
    const event = new EventMessage(from, to, type, value);
    this.socket.send(JSON.stringify(event));
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
