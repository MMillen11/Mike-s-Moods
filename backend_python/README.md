# Mood Tracker Python Backend

This is the Python backend for the Mood Tracker application. It provides a RESTful API for storing and retrieving mood entries.

## Setup

1. Make sure you have Python 3.6+ installed
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Running the Server

1. Start the Flask server:
   ```
   python app.py
   ```
   
2. The API will be available at http://localhost:5001

## API Endpoints

- `GET /api/mood-entries` - Get all mood entries
- `GET /api/mood-entries/<id>` - Get a specific mood entry
- `POST /api/mood-entries` - Create a new mood entry
- `PUT /api/mood-entries/<id>` - Update a mood entry
- `DELETE /api/mood-entries/<id>` - Delete a mood entry
- `GET /api/statistics/mood-counts` - Get counts of each mood
- `GET /api/statistics/correlations` - Get correlations between behaviors and moods

## Database

The application uses SQLite for data storage. The database file will be created automatically when the application starts. 