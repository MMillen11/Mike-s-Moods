# Mood Tracker Application

A web application to track daily moods and behaviors to identify correlations between actions and emotional states.

## Features

- Track 7 different types of moods (Relaxed, Content, Irritable, Sad, Angry, Excited, Anxious)
- Record daily behavioral actions (exercise, sleep, alcohol consumption, diet adherence, work stress, relationship status, social activity, weather)
- Visualize correlations between behaviors and moods through graphs

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask)

## Project Structure

- `/frontend`: Contains all HTML, CSS, and JavaScript files
- `/backend_python`: Contains Python backend code

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for running the frontend server)
- [Python 3.6+](https://www.python.org/downloads/) (for running the backend)

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Start the Node.js server:
   ```
   node server.js
   ```

3. Open your browser and go to http://localhost:5000

### Running the Backend

1. Navigate to the backend_python directory:
   ```
   cd backend_python
   ```

2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. Start the Flask server:
   ```
   python app.py
   ```

4. The API will be available at http://localhost:5001

## Using the Application

1. Fill out the daily mood entry form with your current mood and behavioral actions
2. Submit the form to save your entry
3. View visualizations to see patterns between your behaviors and moods
4. Over time, identify which behaviors correlate with positive or negative moods

## Offline Functionality

The application stores your mood entries in the browser's localStorage, so you can use it even when offline. When you reconnect to the internet, the data will be synchronized with the backend. 