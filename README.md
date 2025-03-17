# Mike's Moods Tracker

A comprehensive web application for tracking daily moods and variables that may affect your emotional well-being. This application helps users identify patterns and correlations between their mood and various factors such as sleep, exercise, diet, and weather.

## Features

- **Daily Mood Tracking**: Record your mood on a scale from 1-10
- **Variable Tracking**: Monitor factors that may affect your mood:
  - Exercise Quality
  - Sleep Quality
  - Diet Observance
  - Stock Portfolio Performance
  - Job Satisfaction
  - Social Interaction
  - Alcohol Consumption
  - Sunlight Exposure
  - Weather Conditions
- **Data Visualization**:
  - Comprehensive Chart showing trends over time
  - Weather Conditions analysis showing how weather affects mood
  - Data table with all entries
- **Weather Integration**: Automatically fetches current weather data for Pittsburgh
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Functionality**: Uses localStorage to store data when offline
- **AI-Powered Insights**: Integration with Anthropic's Claude API for deep analysis

## Technologies Used

- HTML5, CSS3, and JavaScript
- Chart.js for data visualization
- OpenWeatherMap API for weather data
- Anthropic Claude API for AI-powered insights

## Setup Instructions

### Basic Setup

1. Clone this repository
2. Open `index.html` in your web browser
3. Start tracking your mood!

### Weather API Setup

The application uses OpenWeatherMap API to fetch current weather data:

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Replace the `WEATHER_API_KEY` value in `frontend/js/app.js` with your API key

## Anthropic Claude API Integration

The Mood Tracker includes an optional "Deep Dive Analysis" feature that uses Anthropic's Claude API to provide AI-powered insights about your mood patterns.

### Backend Setup

1. Create a backend server to securely handle the API calls:
```bash
mkdir mood-tracker-backend
cd mood-tracker-backend
npm init -y
npm install express cors axios dotenv
```

2. Create a `.env` file in the backend root directory:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3000
```

3. Create a `server.js` file in the backend root directory:
```javascript
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
    
    // Call Anthropic API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `You are an expert in behavioral psychology and data analysis, helping analyze mood tracking data. 
            Focus on identifying patterns, correlations, and providing actionable insights. 
            Be specific, evidence-based, and compassionate in your analysis.`
          },
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
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    res.json({ insights: response.data.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

4. Start the backend server:
```bash
node server.js
```

### Frontend Integration

1. Add the Deep Dive CSS styles to your `frontend/css/styles.css` file:
```css
/* Deep Dive Analysis Styles */
.deep-dive-button {
  background-color: #4a6fa5;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  transition: background-color 0.3s;
}

.deep-dive-button:hover {
  background-color: #3a5a8c;
}

.deep-dive-button:disabled {
  background-color: #8ca5c2;
  cursor: not-allowed;
}

.insights-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.insights-content {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.insights-content h2 {
  color: #4a6fa5;
  margin-bottom: 20px;
  text-align: center;
}

.insights-text {
  line-height: 1.6;
  margin-bottom: 20px;
}

.insights-text h3 {
  color: #4a6fa5;
  margin-top: 20px;
  margin-bottom: 10px;
}

.insights-text ul {
  margin-left: 20px;
  margin-bottom: 15px;
}

.btn-close {
  background-color: #f0f0f0;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  margin: 0 auto;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

2. Add the Deep Dive JavaScript functions to your `frontend/js/app.js` file. 

The following code should be added to your `renderComprehensiveChart` function:

```javascript
// After creating the chart and legend, add the Deep Dive button
const deepDiveContainer = document.createElement('div');
deepDiveContainer.style.textAlign = 'center';
deepDiveContainer.style.marginTop = '30px';

const deepDiveButton = document.createElement('button');
deepDiveButton.className = 'deep-dive-button';
deepDiveButton.innerHTML = '🧠 Deep Dive Analysis';
deepDiveButton.addEventListener('click', handleDeepDiveClick);

deepDiveContainer.appendChild(deepDiveButton);
chartContainer.appendChild(deepDiveContainer);
```

3. Add these functions to your JavaScript file:

```javascript
// Handle the Deep Dive button click
async function handleDeepDiveClick() {
  const button = document.querySelector('.deep-dive-button');
  
  // Show loading state
  button.disabled = true;
  button.innerHTML = '<span class="loading-spinner"></span> Analyzing your data...';
  
  try {
    // Prepare the data for analysis
    const analysisData = prepareDataForAnalysis(moodEntries);
    
    // Call your backend API
    const response = await fetch('http://localhost:3000/api/analyze-mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to get analysis');
    }
    
    const data = await response.json();
    showInsightsModal(data.insights);
  } catch (error) {
    console.error('Error during deep dive analysis:', error);
    alert('Sorry, we encountered an error analyzing your mood data. Please try again later.');
  } finally {
    // Reset button state
    button.disabled = false;
    button.innerHTML = '🧠 Deep Dive Analysis';
  }
}

// Prepare mood data for analysis
function prepareDataForAnalysis(entries) {
  if (entries.length === 0) {
    return { stats: { totalEntries: 0 } };
  }
  
  // Calculate basic statistics
  const moodAvg = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
  
  // Calculate day of week distribution
  const dayOfWeekData = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dayOfWeekMoods = [[], [], [], [], [], [], []];
  
  entries.forEach(entry => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();
    dayOfWeekData[dayOfWeek]++;
    dayOfWeekMoods[dayOfWeek].push(entry.mood);
  });
  
  // Calculate average mood by day of week
  const dayOfWeekMoodAvg = dayOfWeekMoods.map(moods => 
    moods.length ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length : 0
  );
  
  // Calculate correlations between mood and other factors
  const factors = ['exercise', 'sleep', 'diet', 'portfolio', 'job', 'social', 'alcohol', 'sunlight'];
  const correlations = {};
  
  factors.forEach(factor => {
    const correlation = calculateCorrelation(
      entries.map(entry => entry.mood),
      entries.map(entry => entry[factor])
    );
    correlations[factor] = correlation;
  });
  
  // Weather impact
  const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
  const weatherMoods = {};
  
  weatherTypes.forEach(type => {
    const weatherEntries = entries.filter(entry => entry.weather === type);
    if (weatherEntries.length > 0) {
      weatherMoods[type] = {
        count: weatherEntries.length,
        avgMood: weatherEntries.reduce((sum, entry) => sum + entry.mood, 0) / weatherEntries.length
      };
    }
  });
  
  // Recent trends (last 7 days vs previous 7 days)
  let recentTrend = null;
  if (entries.length >= 14) {
    const recent7 = entries.slice(-7);
    const previous7 = entries.slice(-14, -7);
    
    const recent7Avg = recent7.reduce((sum, entry) => sum + entry.mood, 0) / 7;
    const previous7Avg = previous7.reduce((sum, entry) => sum + entry.mood, 0) / 7;
    
    recentTrend = {
      recent7Avg,
      previous7Avg,
      change: recent7Avg - previous7Avg,
      percentChange: ((recent7Avg - previous7Avg) / previous7Avg) * 100
    };
  }
  
  // Return the prepared data
  return {
    stats: {
      totalEntries: entries.length,
      dateRange: {
        start: entries[0].date,
        end: entries[entries.length - 1].date
      },
      moodAvg,
      dayOfWeekData,
      dayOfWeekMoodAvg,
      correlations,
      weatherMoods,
      recentTrend
    },
    // Include a sample of recent entries (last 10)
    recentEntries: entries.slice(-10)
  };
}

// Helper function to calculate correlation coefficient
function calculateCorrelation(xValues, yValues) {
  const n = xValues.length;
  
  // Calculate means
  const xMean = xValues.reduce((sum, val) => sum + val, 0) / n;
  const yMean = yValues.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let xStdDev = 0;
  let yStdDev = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    covariance += xDiff * yDiff;
    xStdDev += xDiff * xDiff;
    yStdDev += yDiff * yDiff;
  }
  
  // Avoid division by zero
  if (xStdDev === 0 || yStdDev === 0) return 0;
  
  // Calculate correlation coefficient
  return covariance / (Math.sqrt(xStdDev) * Math.sqrt(yStdDev));
}

// Display the insights modal
function showInsightsModal(insights) {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'insights-modal';
  
  // Format the insights text with proper HTML
  const formattedInsights = formatInsightsText(insights);
  
  // Create modal content
  modal.innerHTML = `
    <div class="insights-content">
      <h2>Your Personalized Mood Analysis</h2>
      <div class="insights-text">
        ${formattedInsights}
      </div>
      <button class="btn-close">Close</button>
    </div>
  `;
  
  // Add event listener to close button
  document.body.appendChild(modal);
  modal.querySelector('.btn-close').addEventListener('click', () => {
    modal.remove();
  });
  
  // Close when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Format the insights text with proper HTML formatting
function formatInsightsText(text) {
  // Convert plain text to HTML with proper formatting
  let formatted = text
    // Convert markdown-style headers to HTML
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    
    // Convert markdown-style lists to HTML
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    
    // Wrap adjacent list items in ul tags
    .replace(/(<li>.*<\/li>)\n(?=<li>)/g, '$1')
    
    // Convert paragraphs
    .replace(/^(?!<h|<li|<ul|<\/ul>)(.*$)/gm, '<p>$1</p>')
    
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '');
  
  // Wrap lists in ul tags (simplified approach)
  let hasLists = /<li>/.test(formatted);
  if (hasLists) {
    formatted = '<ul>' + formatted + '</ul>';
    // Fix nested lists
    formatted = formatted.replace(/<\/ul><ul>/g, '');
  }
  
  return formatted;
}
```

### Getting an Anthropic API Key

1. Sign up for an account at [Anthropic's Console](https://console.anthropic.com/)
2. Create a new API key from your dashboard
3. Store the API key securely in your backend's `.env` file
4. Never expose your API key in frontend code or commit it to version control

### Testing the Integration

1. Make sure your backend server is running
2. Open your Mood Tracker application in the browser
3. Navigate to the Comprehensive Chart tab
4. Click the "Deep Dive Analysis" button
5. Review the AI-generated insights

### Deployment Considerations

When deploying to production:

1. **Secure Hosting**: Deploy your backend to a secure hosting service
2. **Environment Variables**: Ensure your API key is stored as an environment variable
3. **Rate Limiting**: Add rate limiting to prevent excessive API usage
4. **HTTPS**: Ensure all communication uses HTTPS
5. **CORS**: Configure CORS to only allow requests from your frontend domain

## Privacy and Data Storage

The Mood Tracker stores all your data locally in your browser's localStorage by default. When you use the Deep Dive Analysis feature, your mood data is temporarily sent to the backend server and then to Anthropic's Claude API for analysis. No data is permanently stored on our servers.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenWeatherMap for weather data
- Anthropic for the Claude API
- Chart.js for the visualization library