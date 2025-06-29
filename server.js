const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    socket.to(room).emit("receive_message", {
      user: "system",
      text: `${username} has joined the chat!`,
    });
    socket.emit("receive_message", {
      user: "system",
      text: `Welcome to the room, ${username}!!`,
    });
  });

  socket.on("send_message", ({ room, user, text }) => {
    io.to(room).emit("receive_message", { user, text });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
