// Backfill script to generate 60 days of test metric entries with specific correlations
(function() {
    // Function to generate a random integer between min and max (inclusive)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Function to generate sequential dates for the last 60 days
    function generatePastDates(days) {
        const dates = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            // Format as YYYY-MM-DD without timezone issues
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            dates.push(formattedDate);
        }
        
        return dates;
    }
    
    // Function to generate a random weather condition
    function getRandomWeather() {
        const weatherConditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
        return weatherConditions[getRandomInt(0, weatherConditions.length - 1)];
    }
    
    // Generate sequential dates for the past 60 days
    const dates = generatePastDates(60);
    
    // Generate entries with specific correlations
    const randomEntries = [];
    
    for (let i = 0; i < 60; i++) {
        const date = dates[i];
        
        // Create base values with some randomness
        // Start with sleep as our primary variable that will drive other correlations
        const sleep = getRandomInt(1, 10);
        
        // 1. Strong positive correlation between sleep and exercise
        // Exercise is heavily influenced by sleep quality but with some randomness
        const exerciseBase = sleep * 0.8 + getRandomInt(0, 3);
        const exercise = Math.min(10, Math.max(1, Math.round(exerciseBase)));
        
        // 2. Strong positive correlation between sleep and mood
        // Mood is heavily influenced by sleep quality but with some randomness
        const moodBase = sleep * 0.7 + getRandomInt(1, 4);
        const mood = Math.min(10, Math.max(1, Math.round(moodBase)));
        
        // 3. Strong negative correlation between alcohol and sleep
        // Higher alcohol should correspond to lower sleep quality
        // First, decide randomly if this is a "drinking day"
        const drinkingDay = Math.random() < 0.4; // 40% of days are drinking days
        
        // If it's a drinking day, alcohol is higher and has more influence on sleep
        let alcohol;
        if (drinkingDay) {
            // On drinking days, alcohol is higher (5-10 range)
            alcohol = getRandomInt(5, 10);
            
            // For drinking days, we need to adjust sleep down slightly to maintain 
            // the negative correlation (but not too much to preserve the original sleep value)
            if (sleep > 5) {
                randomEntries[i-1] = { ...randomEntries[i-1], sleep: Math.max(1, sleep - getRandomInt(1, 3)) };
            }
        } else {
            // On non-drinking days, alcohol is lower (1-4 range)
            alcohol = getRandomInt(1, 4);
        }
        
        // 4. Strong negative correlation between alcohol and diet
        // Higher alcohol should correspond to lower diet quality
        const dietBase = drinkingDay ? 
            10 - alcohol * 0.7 + getRandomInt(-1, 2) : // Drinking affects diet negatively 
            getRandomInt(5, 10); // Better diet on non-drinking days
        const diet = Math.min(10, Math.max(1, Math.round(dietBase)));
        
        // Other variables with less specific correlations
        const portfolio = getRandomInt(3, 8);
        const job = getRandomInt(3, 8);
        const social = drinkingDay ? 
            getRandomInt(6, 10) : // More social on drinking days
            getRandomInt(2, 8);   // Variable sociability on non-drinking days
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
            weather: getRandomWeather()
        });
    }
    
    // Get existing entries from localStorage
    const existingEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    // Combine existing and new entries, but avoid duplicates based on date
    const existingDates = new Set(existingEntries.map(entry => entry.date));
    const uniqueNewEntries = randomEntries.filter(entry => !existingDates.has(entry.date));
    
    const allEntries = [...existingEntries, ...uniqueNewEntries];
    
    // Save to localStorage
    localStorage.setItem('moodEntries', JSON.stringify(allEntries));
    
    // Display confirmation
    console.log(`Added ${uniqueNewEntries.length} test metric entries to localStorage.`);
    alert(`Successfully added ${uniqueNewEntries.length} test metric entries with specific correlations! Refresh the page to see the visualizations.`);
})(); 