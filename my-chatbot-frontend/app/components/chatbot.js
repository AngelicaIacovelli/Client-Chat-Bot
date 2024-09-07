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
      console.log('Conversation History:', response.data.conversation_history);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const clearHistory = async () => {
    const confirmClear = window.confirm('Are you sure you want to clear the chat history?');
    if (confirmClear) {
      try {
        await axios.post('http://localhost:5000/clear-history');
        setConversationHistory([]);
        alert('Chat history cleared successfully');
      } catch (error) {
        console.error('Error clearing chat history:', error);
        alert('Failed to clear chat history');
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  return (
    <div style={{
      display: 'flex',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '30%',
        marginRight: '20px',
        borderRight: '1px solid #e0e0e0',
        paddingRight: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto',
        height: '100%'
      }}>
        <ChatHistory />
        <button style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          transition: 'all 0.3s ease',
          marginTop: '20px'
        }} onClick={clearHistory}>Clear Chat History</button>
      </div>
      <div style={{
        width: '70%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Chatbot</h1>
          <div>
            <label htmlFor="model" style={{ marginRight: '10px', color: '#555' }}>Model:</label>
            <select id="model" value={modelChoice} onChange={handleModelChange} style={{
              padding: '8px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
        </div>

        <div ref={chatContainerRef} style={{
          flexGrow: 1,
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#fff'
        }}>
          {conversationHistory.map((message, index) => (
            <div key={index} style={{
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: message.role === 'user' ? '#e6f2ff' : '#f5f5f5',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontWeight: 'bold', color: message.role === 'user' ? '#2c3e50' : '#34495e' }}>{message.role}:</span> {message.content}
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
              padding: '12px',
              fontSize: '16px',
              borderRadius: '25px',
              border: '1px solid #ccc',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
          <button onClick={sendMessage} style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            transition: 'all 0.3s ease'
          }}>Send</button>
        </div>
        <div style={{
          marginTop: '20px',
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#fff'
        }}>
          <SummarizeHistory />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;