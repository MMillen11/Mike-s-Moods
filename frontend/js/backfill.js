// Backfill script to generate 30 days of random mood entries
(function() {
    // Function to generate a random integer between min and max (inclusive)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Function to generate a random date within the last 30 days
    function getRandomDate() {
        const today = new Date();
        const daysAgo = getRandomInt(0, 29); // 0 to 29 days ago
        const randomDate = new Date(today);
        randomDate.setDate(today.getDate() - daysAgo);
        return randomDate.toISOString().substr(0, 10); // Format as YYYY-MM-DD
    }
    
    // Function to generate a random weather condition
    function getRandomWeather() {
        const weatherConditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
        return weatherConditions[getRandomInt(0, weatherConditions.length - 1)];
    }
    
    // Function to generate random notes
    function getRandomNotes() {
        const notes = [
            'Feeling productive today!',
            'Had a great workout session.',
            'Stressful day at work.',
            'Spent time with friends.',
            'Relaxing day at home.',
            'Didn\'t sleep well last night.',
            'Great day overall!',
            'Feeling a bit under the weather.',
            'Productive meeting with the team.',
            'Enjoyed some time outdoors.',
            ''  // Empty notes sometimes
        ];
        return notes[getRandomInt(0, notes.length - 1)];
    }
    
    // Generate 30 random mood entries
    const randomEntries = [];
    const usedDates = new Set(); // To avoid duplicate dates
    
    // Create entries with some realistic patterns
    for (let i = 0; i < 30; i++) {
        // Generate a unique date
        let date;
        do {
            date = getRandomDate();
        } while (usedDates.has(date));
        usedDates.add(date);
        
        // Generate random values with some realistic correlations
        const exercise = getRandomInt(1, 10);
        const sleep = getRandomInt(1, 10);
        const diet = getRandomInt(1, 10);
        
        // Make mood somewhat correlated with exercise, sleep, and diet
        // Higher values in these tend to lead to better mood
        let moodBase = (exercise + sleep + diet) / 3;
        // Add some randomness
        let mood = Math.min(10, Math.max(1, Math.round(moodBase + getRandomInt(-3, 3))));
        
        // Other variables with some loose correlations
        const portfolio = getRandomInt(1, 10);
        const job = getRandomInt(1, 10);
        const social = getRandomInt(1, 10);
        const alcohol = getRandomInt(1, 10); // Remember: 10 = no alcohol, 1 = high consumption
        const sunlight = getRandomInt(1, 10);
        
        // Create the entry
        randomEntries.push({
            id: Date.now() - i * 86400000, // Unique ID based on timestamp (1 day apart)
            date: date,
            mood: mood,
            exercise: exercise,
            sleep: sleep,
            diet: diet,
            portfolio: portfolio,
            job: job,
            social: social,
            alcohol: alcohol,
            sunlight: sunlight,
            weather: getRandomWeather(),
            notes: getRandomNotes()
        });
    }
    
    // Sort entries by date (oldest first)
    randomEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get existing entries from localStorage
    const existingEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    // Combine existing and new entries
    const allEntries = [...existingEntries, ...randomEntries];
    
    // Save to localStorage
    localStorage.setItem('moodEntries', JSON.stringify(allEntries));
    
    // Display confirmation
    console.log(`Added ${randomEntries.length} random mood entries to localStorage.`);
    alert(`Successfully added ${randomEntries.length} random mood entries! Refresh the page to see the visualizations.`);
})(); 