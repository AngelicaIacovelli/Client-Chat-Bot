import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatHistory from './ChatHistory';
import SummarizeHistory from './SummarizeHistory';
import styles from '../chatbot.module.css';

const Chatbot = () => {
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [modelChoice, setModelChoice] = useState('openai');
  const [isDarkMode, setIsDarkMode] = useState(false);
 
  const chatContainerRef = useRef(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
      const response = await axios.get('https://context-by-nucleo-research.onrender.com/chat', { 
        params: newMessage,
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
        await axios.post('https://context-by-nucleo-research.onrender.com/clear-history');
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
    <div className={styles.chatbotWrapper}>
      <div className={`${styles.chatbotContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          {/* <button onClick={() => window.location.href = '/'} className={styles.button}>Home</button> */}
          {/* <button onClick={toggleDarkMode} className={styles.button}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button> */}
        </div>
        <ChatHistory />
        <button className={`${styles.button} ${styles.clearButton}`} onClick={clearHistory}>Clear Chat History</button>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.modelSelector}>
          <label htmlFor="model" className={styles.label}>Model:</label>
          <select id="model" value={modelChoice} onChange={handleModelChange} className={styles.select}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        <div className={styles.chatArea} ref={chatContainerRef}>
          {conversationHistory.map((message, index) => (
            <div key={index} className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.botMessage}`}>
              <span className={styles.messageRole}>{message.role}:</span> {message.content}
            </div>
          ))}
        </div>
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder="Type your message..."
            value={userInput}
            onChange={handleInputChange}
            className={styles.input}
          />
          <button onClick={sendMessage} className={`${styles.button} ${styles.sendButton}`}>Send</button>
        </div>
        <div className={styles.summaryArea}>
          <SummarizeHistory />
        </div>
      </div>
    </div>
    </div>
  );
};

export default Chatbot;
