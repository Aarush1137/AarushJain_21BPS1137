const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to server');
  ws.send('Hello Server!');
};

ws.onmessage = (event) => {
  console.log(`Message from server: ${event.data}`);
};

ws.onclose = () => {
  console.log('Disconnected from server');
};
