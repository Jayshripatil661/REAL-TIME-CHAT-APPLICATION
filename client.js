import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import './App.css';

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { room, username });
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message !== "") {
      socket.emit("send_message", {
        room,
        user: username,
        text: message,
      });
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  return (
    <div className="App">
      {!joined ? (
        <div className="join">
          <input placeholder="Name" onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Room" onChange={(e) => setRoom(e.target.value)} />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="header">💬 {room}</div>
          <div className="messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.user === username ? "own" : "other"}`}
              >
                <b>{msg.user}:</b> {msg.text}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type to send a message"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
