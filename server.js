const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/actions');

const server = http.createServer(app);
const port = process.env.PORT || 5000;

const io = new Server(server);
app.use(express.static('build'));
app.use((_, res, __) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on('connection', (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username, socketId }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    io.to(roomId).emit(ACTIONS.TYPING, { socketId: socket.id });
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
      code,
    });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, {
      code,
    });
  });

  socket.on(ACTIONS.BLUR, ({ roomId }) => {
    io.to(roomId).emit(ACTIONS.STOP_TYPING, { socketId: socket.id });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});
