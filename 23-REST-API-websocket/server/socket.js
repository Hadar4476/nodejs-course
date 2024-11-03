let io;

const initScoketIO = (httpServer) => {
  // SOCKET.IO
  // establishing Socket.io connection/port on the server
  io = require("socket.io")(httpServer, {
    // need to enable CORS for the connection
    cors: {
      origin: "*",
      methods: "*",
    },
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }

  return io;
};

module.exports = {
  init: initScoketIO,
  getIO,
};
