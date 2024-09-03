"use client";

import React from "react";

// Component to display chat messages
const ChatBox = ({ messages }) => {
  return (
    <div className="chat-box">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          // Styling based on the sender
          className={`message ${msg.sender === "user" ? "user" : "bot"}`}
        >
          <div className="message-content">
            <p>{msg.text}</p>
            <span className="timestamp">{msg.timestamp}</span>
          </div>
        </div>
      ))}
      <style jsx>{`
        .chat-box {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 10px;
          height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 8px;
          max-width: 70%;
        }
        .message.user {
          background-color: #cce4ff;
          align-self: flex-end;
        }
        .message.bot {
          background-color: #e0e0e0;
          align-self: flex-start;
        }
        .message-content {
          position: relative;
        }
        .timestamp {
          font-size: 0.8rem;
          color: #999;
          position: absolute;
          bottom: -15px;
          right: 0;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
