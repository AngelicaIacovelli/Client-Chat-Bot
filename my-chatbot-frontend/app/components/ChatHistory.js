import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../chatbot.module.css';

export default function ChatHistory() {
  const [fullChatHistory, setFullChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);

  const toggleChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get('https://context-by-nucleo-research.onrender.com/chat/history');
      const chatHistory = response.data.chat_history || [];
      const formattedChatHistory = chatHistory.map(([userInput, modelResponse]) => [
        userInput,
        modelResponse,
      ]);
      setFullChatHistory(formattedChatHistory);
      
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
    setChatHistoryVisible(!chatHistoryVisible);
  };

  return (
    <div>
      <style jsx>{`
        .toggle-button {
          padding: 10px 15px;
          font-size: 16px;
          cursor: pointer;
          margin-bottom: 20px;
          background-color: var(--accent-color);
          color: var(--text-color);
          border: none;
          border-radius: 20px;
          transition: background-color 0.3s ease;
        }
        .toggle-button:hover {
          background-color: var(--highlight-color);
          color: black;
        }
        .chat-history-container {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
          opacity: 1;
        }
        .chat-history-container.hidden {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
        }
        .interaction {
          margin-bottom: 10px;
          padding: 10px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        .user-message, .assistant-message {
          margin: 5px 0;
        }
        .user-message span, .assistant-message span {
          font-weight: bold;
          color: #333;
        }
        .loading-message, .no-history-message {
          text-align: center;
          color: #666;
        }
      `}</style>
      <button onClick={toggleChatHistory} className="toggle-button">
        {chatHistoryVisible ? 'Hide Chat History' : 'Show Chat History'}
      </button>

      <div className={`chat-history-container ${!chatHistoryVisible ? 'hidden' : ''}`}>
        {isLoadingHistory ? (
          <p className="loading-message">Loading chat history...</p>
        ) : fullChatHistory?.length > 0 ? (
          fullChatHistory.map((interaction, interactionIndex) => (
            <div key={interactionIndex} className="interaction">
              <div className="user-message">
                <span>User:</span> {interaction[0]}
              </div>
              <div className="assistant-message">
                <span>Assistant:</span> {interaction[1]}
              </div>
            </div>
          ))
        ) : (
          <p className="no-history-message">No chat history yet.</p>
        )}
      </div>
    </div>
  );
}
