"use client";

import React, { useState } from "react";

const InputBox = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    // Checks for if it's empty or not
    if (message.trim()) {
      onSend(message);
      setMessage(""); // Clear input field
    }
  };

  return (
    <div className="input-box">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        onKeyPress={(e) => e.key === "Enter" && handleSend()} // Send message when "Enter" is pressed
      />
      <button onClick={handleSend}>Send</button>

      <style jsx>{`
        .input-box {
          display: flex;
          margin-top: 10px;
        }
        input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 10px;
        }
        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default InputBox;
