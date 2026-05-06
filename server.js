const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.static(__dirname)); // serve HTML

// Socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    users[socket.id] = { username, room };

    // Notify others
    socket.to(room).emit("receive_message", {
      user: "system",
      text: `${username} joined the chat`,
    });

    // Welcome message
    socket.emit("receive_message", {
      user: "system",
      text: `Welcome ${username}!`,
    });
  });

  // Send message
  socket.on("send_message", ({ room, user, text }) => {
    if (!text) return;

    io.to(room).emit("receive_message", {
      user,
      text,
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const userData = users[socket.id];

    if (userData) {
      socket.to(userData.room).emit("receive_message", {
        user: "system",
        text: `${userData.username} left`,
      });
      delete users[socket.id];
    }

    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});