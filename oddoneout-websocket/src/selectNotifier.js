const SelectEvent = {
  System: 'system',
  Question: 'question',
  Vote: 'vote',
};

class EventMessage {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  };
};

class SelectEventNotifier {
  handlers = [];
  index = 0;

  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    this.socket.onopen = (event) => {
      this.receiveEvent(new EventMessage('Select', SelectEvent.System, { msg: 'connected' }));
    };
    this.socket.onclose = (event) => {
      this.receiveEvent(new EventMessage('Select', SelectEvent.System, { msg: 'disconnected' }));
    };
    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        this.receiveEvent(event);
      } catch {}
    };
  };

  broadcastEvent(type, value) {
    const event = new EventMessage(type, value);
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

const SelectNotifier = new SelectEventNotifier();
export { SelectEvent, SelectNotifier };
