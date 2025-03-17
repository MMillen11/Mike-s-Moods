# Mike's Moods

A comprehensive web application for tracking daily mood and various lifestyle factors to discover patterns and correlations.

## Features

- **Daily Mood Entry**: Record your mood and various lifestyle factors on a 1-10 scale
- **Weather Integration**: Automatically fetches weather data for Pittsburgh, PA
- **Comprehensive Visualizations**:
  - Mood trends over time
  - Correlations between mood and lifestyle factors
  - Interactive charts with selectable variables
- **Data Management**: All entries are stored in your browser's localStorage

## Project Structure

```
Mike's Moods/
├── index.html              # Main application entry point
├── frontend/
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   └── backfill.js     # Script to generate test data
│   ├── css/
│   │   └── styles.css      # Application styling
│   ├── backfill.html       # Page to generate test data
│   └── server.js           # Development server
├── backend_python/
│   └── app.py              # Python backend API
└── backend/
    └── ...                 # .NET backend (alternative)
```

## How to Run

1. **Start the frontend server**:
   ```
   cd frontend
   npm install
   node server.js
   ```

2. **Access the application**:
   Open your browser and navigate to `http://localhost:5000`

3. **Generate test data** (optional):
   Click on "Generate Test Data" link at the bottom of the page

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Python Flask API
- **Data Storage**: Browser localStorage (client-side)
- **Weather Data**: OpenWeatherMap API

## Behavioral Variables Tracked

- Mood (1-10)
- Exercise Quality (1-10)
- Sleep Quality (1-10)
- Diet Observance (1-10)
- Stock Portfolio Performance (1-10)
- Job Satisfaction (1-10)
- Social Interaction (1-10)
- Alcohol Consumption (1-10)
- Sunlight Exposure (1-10)
- Weather Conditions 