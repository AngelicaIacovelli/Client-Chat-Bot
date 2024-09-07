import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ChatHistory() {
  const [fullChatHistory, setFullChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);

  const toggleChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get('http://localhost:5000/chat/history');
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
      <button onClick={toggleChatHistory} style={{
        padding: '10px 15px',
        fontSize: '16px',
        cursor: 'pointer',
        marginBottom: '20px'
      }}>
        {chatHistoryVisible ? 'Hide Chat History' : 'Show Chat History'}
      </button>

      {chatHistoryVisible && (
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '20px'
        }}>
          {isLoadingHistory ? (
            <p>Loading chat history...</p>
          ) : fullChatHistory?.length > 0 ? (
            fullChatHistory.map((interaction, interactionIndex) => (
              <div key={interactionIndex} style={{
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: 'bold' }}>User:</span> {interaction[0]}
                <br />
                <span style={{ fontWeight: 'bold' }}>Assistant:</span> {interaction[1]}
              </div>
            ))
          ) : (
            <p>No chat history yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
