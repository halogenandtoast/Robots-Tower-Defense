var socket = new io.Socket(window.location.hostname, { port: 8024 });

if (socket.connect()) {
  console.log('Connected.');
}
