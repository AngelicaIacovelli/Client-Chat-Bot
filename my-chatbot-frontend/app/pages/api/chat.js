import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { user_input, model_choice, conversation_history } = req.query;

      // Forward the request to your backend
      const response = await axios.get('http://localhost:8000/chat', { 
        params: { 
          user_input, 
          model_choice, 
          conversation_history: JSON.stringify(conversation_history) // Stringify array
        }
      });

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
