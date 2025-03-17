const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

app.post('/api/analyze-mood', async (req, res) => {
  try {
    const moodData = req.body;
    console.log('Received mood data, preparing API call...');

    const requestBody = {
      model: "claude-3-opus-20240229",  // Try opus instead of sonnet
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `As an expert in behavioral psychology and data analysis, please analyze this mood tracking data:
          
          ${JSON.stringify(moodData, null, 2)}
          
          Please provide:
          1. The 3-5 most significant patterns you observe
          2. Key correlations between my mood and other variables
          3. Actionable recommendations based on the data
          4. Any interesting insights about how external factors (weather, day of week) affect my mood
          
          Format your response in clear sections with bullet points where appropriate.`
        }
      ]
    };

    console.log('Sending request to Claude API...');

    const response = await axios({
      method: 'post',
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      data: requestBody
    });

    console.log('Response received from Claude API');
    
    if (response.data && response.data.content) {
      res.json({ insights: response.data.content[0].text });
    } else {
      console.error('Unexpected response structure:', response.data);
      res.status(500).json({ error: 'Unexpected API response structure' });
    }
  } catch (error) {
    console.error('Error details:', error.message);
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
    
    res.status(500).json({ 
      error: 'Failed to generate insights', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server by visiting http://localhost:${PORT}/test`);
});