from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mood_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define MoodEntry model
class MoodEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    mood = db.Column(db.Integer, nullable=False)  # Changed from String to Integer for 1-10 scale
    exercise = db.Column(db.Integer, nullable=False)  # 1-10 rating
    sleep = db.Column(db.Integer, nullable=False)     # 1-10 rating
    diet = db.Column(db.Integer, nullable=False)      # 1-10 rating
    portfolio = db.Column(db.Integer, nullable=False) # 1-10 rating
    job = db.Column(db.Integer, nullable=False)       # 1-10 rating
    social = db.Column(db.Integer, nullable=False)    # 1-10 rating
    alcohol = db.Column(db.Integer, nullable=False)   # 1-10 rating
    sunlight = db.Column(db.Integer, nullable=False)  # 1-10 rating
    weather = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'mood': self.mood,
            'exercise': self.exercise,
            'sleep': self.sleep,
            'diet': self.diet,
            'portfolio': self.portfolio,
            'job': self.job,
            'social': self.social,
            'alcohol': self.alcohol,
            'sunlight': self.sunlight,
            'weather': self.weather,
            'notes': self.notes
        }

# Create database tables
with app.app_context():
    db.create_all()

# API Routes
@app.route('/api/mood-entries', methods=['GET'])
def get_mood_entries():
    entries = MoodEntry.query.order_by(MoodEntry.date.desc()).all()
    return jsonify([entry.to_dict() for entry in entries])

@app.route('/api/mood-entries/<int:id>', methods=['GET'])
def get_mood_entry(id):
    entry = MoodEntry.query.get_or_404(id)
    return jsonify(entry.to_dict())

@app.route('/api/mood-entries', methods=['POST'])
def create_mood_entry():
    data = request.json
    
    # Parse date from string to datetime
    date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
    
    new_entry = MoodEntry(
        date=date,
        mood=data['mood'],
        exercise=data['exercise'],
        sleep=data['sleep'],
        diet=data['diet'],
        portfolio=data['portfolio'],
        job=data['job'],
        social=data['social'],
        alcohol=data['alcohol'],
        sunlight=data['sunlight'],
        weather=data['weather'],
        notes=data.get('notes', '')
    )
    
    db.session.add(new_entry)
    db.session.commit()
    
    return jsonify(new_entry.to_dict()), 201

@app.route('/api/mood-entries/<int:id>', methods=['PUT'])
def update_mood_entry(id):
    entry = MoodEntry.query.get_or_404(id)
    data = request.json
    
    # Parse date from string to datetime if provided
    if 'date' in data:
        data['date'] = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
    
    # Update entry fields
    for key, value in data.items():
        if hasattr(entry, key):
            setattr(entry, key, value)
    
    db.session.commit()
    return jsonify(entry.to_dict())

@app.route('/api/mood-entries/<int:id>', methods=['DELETE'])
def delete_mood_entry(id):
    entry = MoodEntry.query.get_or_404(id)
    db.session.delete(entry)
    db.session.commit()
    return '', 204

# Statistics and analysis endpoints
@app.route('/api/statistics/mood-counts', methods=['GET'])
def get_mood_counts():
    # Count occurrences of each mood rating
    result = db.session.query(MoodEntry.mood, db.func.count(MoodEntry.id)).group_by(MoodEntry.mood).all()
    return jsonify({str(mood): count for mood, count in result})

@app.route('/api/statistics/correlations', methods=['GET'])
def get_correlations():
    # Calculate correlations between variables and mood
    variables = ['exercise', 'sleep', 'diet', 'portfolio', 'job', 'social', 'alcohol', 'sunlight']
    
    # Get all entries
    entries = MoodEntry.query.all()
    
    # Calculate average variable rating for each mood level
    mood_averages = {}
    
    # Group entries by mood rating
    for mood_rating in range(1, 11):  # 1-10 scale
        mood_entries = [entry for entry in entries if entry.mood == mood_rating]
        if not mood_entries:
            continue
            
        mood_averages[str(mood_rating)] = {}
        
        for variable in variables:
            values = [getattr(entry, variable) for entry in mood_entries]
            mood_averages[str(mood_rating)][variable] = sum(values) / len(values) if values else 0
    
    # Calculate correlation coefficients
    correlations = {}
    all_mood_values = [entry.mood for entry in entries]
    
    for variable in variables:
        variable_values = [getattr(entry, variable) for entry in entries]
        
        # Simple correlation calculation (this is a simplified version)
        # For a real app, you might want to use scipy.stats.pearsonr
        n = len(entries)
        if n > 0:
            mean_mood = sum(all_mood_values) / n
            mean_var = sum(variable_values) / n
            
            numerator = sum((x - mean_mood) * (y - mean_var) for x, y in zip(all_mood_values, variable_values))
            denominator_mood = sum((x - mean_mood) ** 2 for x in all_mood_values)
            denominator_var = sum((y - mean_var) ** 2 for y in variable_values)
            
            if denominator_mood > 0 and denominator_var > 0:
                correlation = numerator / ((denominator_mood ** 0.5) * (denominator_var ** 0.5))
                correlations[variable] = round(correlation, 2)
            else:
                correlations[variable] = 0
        else:
            correlations[variable] = 0
    
    return jsonify({
        "mood_averages": mood_averages,
        "variables": variables,
        "correlations": correlations
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) 