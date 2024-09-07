import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

export default function SummarizeHistory() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // Store chat history

  // Function to fetch chat history
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/chat/history');
      setChatHistory(response.data.chat_history || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  // Function to summarize chat history
  const summarizeChatHistory = async () => {
    try {
      setIsLoading(true);
      // URL encode the chat history
      const params = new URLSearchParams();
      params.append('chatHistory', JSON.stringify(chatHistory));

      // Send to the backend
      const summaryResponse = await axios.get('http://localhost:5000/summarize',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      setSummary(summaryResponse.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch chat history when the component mounts
    fetchChatHistory();
  }, []);

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        disabled={isLoading}
        onClick={summarizeChatHistory} // Call summarizeChatHistory on click
      >
        Summarize Chat History
      </Button>
      {isLoading ? (
        <CircularProgress size={24} style={{ marginLeft: 10 }} />
      ) : (
        summary && (
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={summary}
            placeholder="Summary will appear here"
            InputProps={{
              readOnly: true,
            }}
            style={{ marginTop: 20 }}
          />
        )
      )}
    </div>
  );
}
