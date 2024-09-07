import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

export default function SummarizeHistory() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/chat/summary');
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
      <Button
        variant="contained"
        color="primary"
        disabled={isLoading}
        onClick={toggleSummary}
        style={{ marginRight: 10 }}
      >
        {showSummary ? 'Hide Summary' : 'Show Summary'}
      </Button>
      {isLoading ? (
        <CircularProgress size={24} style={{ marginLeft: 10 }} />
      ) : (
        showSummary && summary && (
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={summary}
            InputProps={{ readOnly: true }}
            style={{ marginTop: 20 }}
          />
        )
      )}
    </div>
  );
}
