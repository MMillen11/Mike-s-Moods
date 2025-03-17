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
        
        // Generate sleep and sunlight values first - these will strongly influence mood
        const sleep = getRandomInt(1, 10);
        const sunlight = getRandomInt(1, 10);
        
        // Generate other variables with normal distribution
        const exercise = getRandomInt(1, 10);
        const diet = getRandomInt(1, 10);
        const portfolio = getRandomInt(1, 10);
        const job = getRandomInt(1, 10);
        const social = getRandomInt(1, 10);
        const alcohol = getRandomInt(1, 10); // Remember: 10 = no alcohol, 1 = high consumption
        
        // Calculate mood with stronger correlation to sleep and sunlight
        // Sleep and sunlight have 2x the weight of other factors
        const sleepWeight = 0.35; // 35% influence
        const sunlightWeight = 0.35; // 35% influence
        const otherWeight = 0.30 / 5; // 30% divided among 5 other factors
        
        let moodBase = (
            sleep * sleepWeight + 
            sunlight * sunlightWeight + 
            exercise * otherWeight + 
            diet * otherWeight + 
            portfolio * otherWeight + 
            job * otherWeight + 
            social * otherWeight
        );
        
        // Add a small random factor (but smaller than before to maintain correlation)
        let mood = Math.min(10, Math.max(1, Math.round(moodBase + getRandomInt(-1, 1))));
        
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
            weather: getRandomWeather()
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