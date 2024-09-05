import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatHistory from './ChatHistory';
import SummarizeHistory from './SummarizeHistory';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [modelChoice, setModelChoice] = useState('openai'); 

  const chatContainerRef = useRef(null);

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleModelChange = (event) => {
    setModelChoice(event.target.value);
  };

  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    const newMessage = {
      user_input: userInput,
      model_choice: modelChoice,
      conversation_history: conversationHistory,
    };

    try {
      const response = await axios.get('http://localhost:5000/chat', { 
        params: newMessage 
      });

      setConversationHistory(response.data.conversation_history);
      setUserInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>Chatbot</h1>
        <div>
          <label htmlFor="model" style={{ marginRight: '10px' }}>Model:</label>
          <select id="model" value={modelChoice} onChange={handleModelChange} style={{
            padding: '5px',
            fontSize: '16px'
          }}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
      </div>

      <div ref={chatContainerRef} style={{
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '20px'
      }}>
        {conversationHistory.map((message, index) => (
          <div key={index} style={{
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: message.role === 'user' ? '#e6f2ff' : '#f0f0f0',
            borderRadius: '5px'
          }}>
            <span style={{ fontWeight: 'bold' }}>{message.role}:</span> {message.content}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={handleInputChange}
          style={{
            flexGrow: 1,
            padding: '10px',
            fontSize: '16px'
          }}
        />
        <button onClick={sendMessage} style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>Send</button>
      </div>

      <ChatHistory />
      <SummarizeHistory />
    </div>
  );
};

export default Chatbot;