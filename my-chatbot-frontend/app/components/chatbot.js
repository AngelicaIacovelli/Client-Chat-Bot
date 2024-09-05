import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [modelChoice, setModelChoice] = useState('openai'); 
  const [fullChatHistory, setFullChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);

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

  const toggleChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get('http://localhost:5000/chat/history');
      setFullChatHistory(response.data.chat_history || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
    setChatHistoryVisible(!chatHistoryVisible);
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
    </div>
  );
};

export default Chatbot;