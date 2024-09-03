"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatBox from "./components/chatbox";
import InputBox from "./components/inputbox";
import ModelSwitcher from "./components/modelswitcher";
import Summary from "./components/summary";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  useEffect(() => {
    // Fetch initial chat history and summary from the backend
    // axios.get('/api/chat-history').then(response => setMessages(response.data));
    // axios.get('/api/summary').then(response => setSummary(response.data));
    //   axios
    //   .get("/api/chat-history")
    //   .then((response) => setMessages(response.data))
    //   .catch((error) => console.error("Error fetching chat history:", error));
    // axios
    //   .get("/api/summary")
    //   .then((response) => setSummary(response.data))
    //   .catch((error) => console.error("Error fetching summary:", error));
  }, []);

  const handleSend = (message) => {
    const newMessage = {
      text: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMessage]);

    // Send message to backend and get bot response
    axios
      .post("/api/chat", { message, model: selectedModel })
      .then((response) => {
        const botMessage = {
          text: response.data.text,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);

        // Update summary
        axios.get("/api/summary").then((response) => setSummary(response.data));
      });
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  return (
    <div className="container">
      <ModelSwitcher
        selectedModel={selectedModel}
        onSelectModel={handleModelChange}
      />
      <ChatBox messages={messages} />
      <InputBox onSend={handleSend} />
      <Summary summary={summary} />

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }
      `}</style>
    </div>
  );
}
