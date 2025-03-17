const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

app.post('/api/analyze-mood', async (req, res) => {
  try {
    const moodData = req.body;
    
    console.log('Received mood data. Calling Anthropic API...');
    
    // Call Anthropic API with the correct format
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        system: "You are an expert in behavioral psychology and data analysis, helping analyze mood tracking data. Focus on identifying patterns, correlations, and providing actionable insights. Be specific, evidence-based, and compassionate in your analysis.",
        messages: [
          {
            role: "user",
            content: `Here is my mood tracking data from the past ${moodData.stats.totalEntries} days:
            
            ${JSON.stringify(moodData, null, 2)}
            
            Please analyze this data and provide:
            1. The 3-5 most significant patterns you observe
            2. Key correlations between my mood and other variables
            3. Actionable recommendations based on the data
            4. Any interesting insights about how external factors (weather, day of week) affect my mood
            
            Please format your response in clear sections with bullet points where appropriate.`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-beta': 'messages-2023-12-15',
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    console.log('API response received successfully');
    
    // Check the structure of the response
    if (response.data && response.data.content && response.data.content[0] && response.data.content[0].text) {
      res.json({ insights: response.data.content[0].text });
    } else {
      console.error('Unexpected API response structure:', JSON.stringify(response.data));
      res.json({ insights: "The AI generated a response but it was in an unexpected format. Please try again." });
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      res.status(500).json({ 
        error: 'Failed to generate insights', 
        details: error.response.data 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate insights', 
        message: error.message 
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});