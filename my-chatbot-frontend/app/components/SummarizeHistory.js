import React, { useState } from 'react';
import axios from 'axios';
import styles from '../chatbot.module.css';

export default function SummarizeHistory() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://context-by-nucleo-research.onrender.com/chat/summary');
      setSummary(response.data.summary);
      setShowSummary(true);
      console.log('Chat History Summary:', response.data.chat_history);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSummary = () => {
    if (!showSummary) {
      fetchSummary();
    } else {
      setShowSummary(false);
    }
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
          position: relative;
          top: 5px;
          left: 5px;
        }
        .toggle-button:hover {
          background-color: var(--highlight-color);
          color: black;
        }
        .summary-container {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid var(--secondary-text);
          padding: 10px;
          margin-bottom: 20px;
          background-color: var(--translucent-background);
          border-radius: 8px;
          transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
          opacity: 1;
        }
        .summary-container.hidden {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
        }
        .summary-text {
          color: var(--text-color);
          white-space: pre-wrap;
        }
        .loading-message, .no-summary-message {
          text-align: center;
          color: var(--secondary-text);
        }
      `}</style>
      <button onClick={toggleSummary} className="toggle-button">
        {showSummary ? 'Hide Summary' : 'Show Summary'}
      </button>

      <div className={`summary-container ${!showSummary ? 'hidden' : ''}`}>
        {isLoading ? (
          <p className="loading-message">Loading summary...</p>
        ) : summary ? (
          <div className="summary-text">{summary}</div>
        ) : (
          <p className="no-summary-message">No summary available.</p>
        )}
      </div>
    </div>
  );
}
