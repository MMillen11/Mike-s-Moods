// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const moodForm = document.getElementById('mood-form');
    const dateInput = document.getElementById('date');
    const visualizationSection = document.getElementById('data-visualization');
    const chartsContainer = document.getElementById('charts-container');
    
    // Visualization control buttons
    const viewAllDataBtn = document.getElementById('view-all-data');
    const viewMoodTrendsBtn = document.getElementById('view-mood-trends');
    const viewCorrelationsBtn = document.getElementById('view-correlations');
    
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    dateInput.value = formattedDate;
    
    // Initialize mood entries array from localStorage or empty array if none exists
    let moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    // Define mood colors for charts - now using a gradient for 1-10 scale
    const moodColors = [
        '#d0021b', // 1 - Very negative (red)
        '#f5a623', // 2
        '#f8e71c', // 3
        '#b8e986', // 4
        '#7ed321', // 5 - Neutral (green)
        '#4a90e2', // 6
        '#50e3c2', // 7
        '#9013fe', // 8
        '#bd10e0', // 9
        '#4a90e2'  // 10 - Very positive (blue)
    ];
    
    // Function to get color based on mood rating (1-10)
    function getMoodColor(moodRating) {
        const index = Math.min(Math.max(parseInt(moodRating) - 1, 0), 9);
        return moodColors[index];
    }
    
    // Weather API configuration
    const WEATHER_API_KEY = '9d7cde1f6d07ec55650544be1631307e'; // Free OpenWeatherMap API key
    const CITY = 'Pittsburgh,US';
    
    // Weather background mapping
    const weatherBackgrounds = {
        'Clear': {
            day: 'linear-gradient(to bottom, #4a90e2, #87ceeb)',
            night: 'linear-gradient(to bottom, #1a1a2e, #16213e)'
        },
        'Clouds': {
            day: 'linear-gradient(to bottom, #8e9eab, #eef2f3)',
            night: 'linear-gradient(to bottom, #2c3e50, #4a5f72)'
        },
        'Rain': {
            day: 'linear-gradient(to bottom, #616161, #9bc5c3)',
            night: 'linear-gradient(to bottom, #1f1c2c, #4a5f72)'
        },
        'Drizzle': {
            day: 'linear-gradient(to bottom, #808080, #a6c0fe)',
            night: 'linear-gradient(to bottom, #2c3e50, #3f5973)'
        },
        'Thunderstorm': {
            day: 'linear-gradient(to bottom, #373b44, #4286f4)',
            night: 'linear-gradient(to bottom, #0f0c29, #302b63)'
        },
        'Snow': {
            day: 'linear-gradient(to bottom, #e6dada, #ffffff)',
            night: 'linear-gradient(to bottom, #7f7fd5, #91eae4)'
        },
        'Mist': {
            day: 'linear-gradient(to bottom, #b8c6db, #f5f7fa)',
            night: 'linear-gradient(to bottom, #4b6cb7, #182848)'
        },
        'Fog': {
            day: 'linear-gradient(to bottom, #b8c6db, #f5f7fa)',
            night: 'linear-gradient(to bottom, #4b6cb7, #182848)'
        },
        'default': {
            day: 'linear-gradient(to bottom, #f5f7fa, #c3cfe2)',
            night: 'linear-gradient(to bottom, #2c3e50, #4a5f72)'
        }
    };
    
    // Setup slider value displays
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueDisplay = slider.previousElementSibling.querySelector('.slider-value');
        valueDisplay.textContent = slider.value;
        
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
        });
    });
    
    // Event Listeners
    moodForm.addEventListener('submit', handleFormSubmit);
    viewAllDataBtn.addEventListener('click', () => renderVisualization('all-data'));
    viewMoodTrendsBtn.addEventListener('click', () => renderVisualization('mood-trends'));
    viewCorrelationsBtn.addEventListener('click', () => renderVisualization('correlations'));
    
    // Check if we have entries to show visualizations
    if (moodEntries.length > 0) {
        visualizationSection.classList.remove('hidden');
        renderVisualization('mood-trends'); // Default to Comprehensive Chart
    }
    
    // Fetch weather data and update background
    fetchWeatherData();
    
    // Function to fetch weather data from OpenWeatherMap API
    function fetchWeatherData() {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${WEATHER_API_KEY}&units=imperial`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Weather data not available');
                }
                return response.json();
            })
            .then(data => {
                updateWeatherBackground(data);
                updateWeatherInfo(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }
    
    // Function to update the background based on weather
    function updateWeatherBackground(weatherData) {
        const weatherMain = weatherData.weather[0].main;
        const weatherDescription = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;
        const isNight = weatherIcon.includes('n');
        const timeOfDay = isNight ? 'night' : 'day';
        
        // Get the appropriate background gradient
        let backgroundGradient;
        if (weatherBackgrounds[weatherMain]) {
            backgroundGradient = weatherBackgrounds[weatherMain][timeOfDay];
        } else {
            backgroundGradient = weatherBackgrounds['default'][timeOfDay];
        }
        
        // Apply the background to the body
        document.body.style.background = backgroundGradient;
        document.body.style.backgroundAttachment = 'fixed';
        
        // Add a subtle weather effect overlay
        let weatherEffectHTML = '';
        
        if (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm') {
            weatherEffectHTML = '<div class="weather-effect rain"></div>';
        } else if (weatherMain === 'Snow') {
            weatherEffectHTML = '<div class="weather-effect snow"></div>';
        } else if (weatherMain === 'Clouds' && (weatherDescription.includes('overcast') || weatherDescription.includes('broken'))) {
            weatherEffectHTML = '<div class="weather-effect clouds"></div>';
        }
        
        // Add the weather effect to the body if not already present
        if (weatherEffectHTML && !document.querySelector('.weather-effect')) {
            document.body.insertAdjacentHTML('afterbegin', weatherEffectHTML);
        }
    }
    
    // Function to display current weather information
    function updateWeatherInfo(weatherData) {
        const weatherInfoContainer = document.createElement('div');
        weatherInfoContainer.className = 'weather-info';
        
        const temp = Math.round(weatherData.main.temp);
        const weatherMain = weatherData.weather[0].main;
        const weatherDescription = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;
        
        weatherInfoContainer.innerHTML = `
            <div class="weather-info-content">
                <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${weatherDescription}">
                <div class="weather-details">
                    <div class="weather-location">Pittsburgh, PA</div>
                    <div class="weather-temp">${temp}°F</div>
                    <div class="weather-desc">${weatherDescription}</div>
                </div>
            </div>
        `;
        
        // Remove any existing weather info
        const existingWeatherInfo = document.querySelector('.weather-info');
        if (existingWeatherInfo) {
            existingWeatherInfo.remove();
        }
        
        // Add the weather info below the weather dropdown
        const weatherNote = document.querySelector('.weather-note');
        if (weatherNote) {
            weatherNote.after(weatherInfoContainer);
            
            // Update styles for the weather info when placed in the form
            weatherInfoContainer.style.position = 'static';
            weatherInfoContainer.style.margin = '10px 0';
            weatherInfoContainer.style.width = '100%';
            weatherInfoContainer.style.boxSizing = 'border-box';
        }
        
        // Update the weather dropdown in the form to match current weather
        const weatherSelect = document.getElementById('weather');
        if (weatherSelect) {
            let selectedOption = 'sunny'; // Default
            
            if (weatherMain === 'Clear') selectedOption = 'sunny';
            else if (weatherMain === 'Clouds') selectedOption = 'cloudy';
            else if (weatherMain === 'Rain' || weatherMain === 'Drizzle') selectedOption = 'rainy';
            else if (weatherMain === 'Snow') selectedOption = 'snowy';
            else if (weatherMain === 'Thunderstorm') selectedOption = 'stormy';
            
            // Set the default value for the weather dropdown
            if (weatherSelect.value === '') {
                weatherSelect.value = selectedOption;
            }
        }
    }
    
    // Form submission handler
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(moodForm);
        const entryData = {
            id: Date.now(), // Unique ID based on timestamp
            date: formData.get('date'),
            mood: parseInt(formData.get('mood')),
            exercise: parseInt(formData.get('exercise')),
            sleep: parseInt(formData.get('sleep')),
            diet: parseInt(formData.get('diet')),
            portfolio: parseInt(formData.get('portfolio')),
            job: parseInt(formData.get('job')),
            social: parseInt(formData.get('social')),
            alcohol: parseInt(formData.get('alcohol')), // Now 1 = 0 drinks, 10 = 10+ drinks
            sunlight: parseInt(formData.get('sunlight')),
            weather: formData.get('weather')
        };
        
        // Save entry to array and localStorage
        moodEntries.push(entryData);
        localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
        
        // Show success message
        alert('Mood entry saved successfully!');
        
        // Reset form
        moodForm.reset();
        dateInput.value = formattedDate;
        
        // Reset slider displays
        sliders.forEach(slider => {
            const valueDisplay = slider.previousElementSibling.querySelector('.slider-value');
            valueDisplay.textContent = slider.value;
        });
        
        // Show visualization section if it was hidden
        visualizationSection.classList.remove('hidden');
        
        // Update visualizations - now showing Comprehensive Chart by default
        renderVisualization('mood-trends');
        
        // Send data to backend
        sendDataToBackend(entryData);
    }
    
    // Function to send data to backend
    function sendDataToBackend(data) {
        fetch('/api/mood-entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error sending data to server:', error);
            // We still keep the data in localStorage for offline functionality
        });
    }
    
    // Function to render different visualizations
    function renderVisualization(type) {
        // Clear previous charts
        chartsContainer.innerHTML = '';
        
        if (moodEntries.length === 0) {
            chartsContainer.innerHTML = '<p>No mood entries yet. Add some entries to see visualizations.</p>';
            return;
        }
        
        // Add a clear data button at the top of the visualization section
        const clearDataContainer = document.createElement('div');
        clearDataContainer.className = 'clear-data-container';
        clearDataContainer.style.textAlign = 'right';
        clearDataContainer.style.marginBottom = '15px';
        
        const clearDataBtn = document.createElement('button');
        clearDataBtn.textContent = 'Clear All Data';
        clearDataBtn.className = 'btn-danger';
        clearDataBtn.style.padding = '8px 15px';
        clearDataBtn.style.backgroundColor = '#dc3545';
        clearDataBtn.style.color = 'white';
        clearDataBtn.style.border = 'none';
        clearDataBtn.style.borderRadius = '4px';
        clearDataBtn.style.cursor = 'pointer';
        clearDataBtn.style.transition = 'background-color 0.3s';
        
        clearDataBtn.addEventListener('mouseover', () => {
            clearDataBtn.style.backgroundColor = '#bd2130';
        });
        
        clearDataBtn.addEventListener('mouseout', () => {
            clearDataBtn.style.backgroundColor = '#dc3545';
        });
        
        clearDataBtn.addEventListener('click', clearAllData);
        clearDataContainer.appendChild(clearDataBtn);
        chartsContainer.appendChild(clearDataContainer);
        
        switch (type) {
            case 'all-data':
                renderAllDataTable();
                break;
            case 'mood-trends':
                renderComprehensiveChart();
                break;
            case 'correlations':
                renderCorrelationsChart();
                break;
            default:
                renderComprehensiveChart(); // Default to Comprehensive Chart
        }
    }
    
    // Render a table with all mood entries
    function renderAllDataTable() {
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = [
            'Date', 'Mood', 'Exercise', 'Sleep', 'Diet', 'Portfolio', 
            'Job', 'Social', 'Alcohol', 'Sunlight', 'Weather', 'Actions'
        ];
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Sort entries by date (newest first)
        const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedEntries.forEach(entry => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(entry.date);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            
            // Add cells for each property
            const cells = [
                formattedDate,
                entry.mood, // Numeric mood value
                entry.exercise,
                entry.sleep,
                entry.diet,
                entry.portfolio,
                entry.job,
                entry.social,
                entry.alcohol,
                entry.sunlight,
                entry.weather.charAt(0).toUpperCase() + entry.weather.slice(1) // Capitalize weather
            ];
            
            cells.forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                row.appendChild(td);
            });
            
            // Add delete button
            const actionsTd = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'btn-delete';
            deleteBtn.addEventListener('click', () => deleteEntry(entry.id));
            actionsTd.appendChild(deleteBtn);
            row.appendChild(actionsTd);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        chartsContainer.appendChild(table);
    }
    
    // Function to delete an entry
    function deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            moodEntries = moodEntries.filter(entry => entry.id !== id);
            localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
            
            // Update visualization - now showing Comprehensive Chart instead of All Data
            renderVisualization('mood-trends');
            
            // Hide visualization section if no entries left
            if (moodEntries.length === 0) {
                visualizationSection.classList.add('hidden');
            }
            
            // Send delete request to backend
            fetch(`/api/mood-entries/${id}`, {
                method: 'DELETE'
            }).catch(error => {
                console.error('Error deleting entry from server:', error);
            });
        }
    }
    
    // Render comprehensive chart showing mood and all variables over time
    function renderComprehensiveChart() {
        // Create container for the chart
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
            <h3>Comprehensive Mood and Variables Over Time</h3>
            <div style="position: relative; height: 600px;">
                <canvas id="comprehensive-chart"></canvas>
            </div>
            <div class="chart-legend" style="margin-top: 20px; text-align: center;">
                <div style="margin-bottom: 10px;"><strong>Toggle Variables:</strong></div>
                <div id="custom-legend" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;"></div>
            </div>
        `;
        chartsContainer.appendChild(chartContainer);
        
        // Prepare data for the chart
        const sortedEntries = [...moodEntries].sort((a, b) => {
            // Ensure proper date comparison by converting strings to Date objects
            return new Date(a.date) - new Date(b.date);
        });
        
        // Check if we have an entry for today
        const today = new Date();
        const todayFormatted = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
        const hasEntryForToday = moodEntries.some(entry => {
            const entryDate = new Date(entry.date);
            const entryFormatted = `${entryDate.getMonth() + 1}/${entryDate.getDate()}/${entryDate.getFullYear()}`;
            return entryFormatted === todayFormatted;
        });
        
        console.log('Has entry for today:', hasEntryForToday, 'Today:', todayFormatted);
        
        // Limit to last 90 days if needed
        const limitedEntries = sortedEntries.length > 90 ? sortedEntries.slice(-90) : sortedEntries;
        
        // Group entries by date
        const dateGroups = {};
        
        limitedEntries.forEach(entry => {
            // Ensure we're working with a proper Date object
            const entryDate = new Date(entry.date);
            const formattedDate = `${entryDate.getMonth() + 1}/${entryDate.getDate()}/${entryDate.getFullYear()}`;
            
            if (!dateGroups[formattedDate]) {
                dateGroups[formattedDate] = [];
            }
            
            dateGroups[formattedDate].push(entry);
        });
        
        // Calculate average values for each date
        const dates = Object.keys(dateGroups).sort((a, b) => {
            // Parse dates in MM/DD/YYYY format
            const [monthA, dayA, yearA] = a.split('/').map(Number);
            const [monthB, dayB, yearB] = b.split('/').map(Number);
            
            // Create Date objects with the correct parts
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            
            return dateA - dateB;
        });
        
        console.log('Dates for chart:', dates);
        
        // Define all variables to track
        const variables = [
            { key: 'mood', name: 'Mood', color: '#FF5733', visible: true },
            { key: 'exercise', name: 'Exercise', color: '#33FF57', visible: false },
            { key: 'sleep', name: 'Sleep', color: '#3357FF', visible: false },
            { key: 'diet', name: 'Diet', color: '#FF33F5', visible: false },
            { key: 'portfolio', name: 'Portfolio', color: '#33FFF5', visible: false },
            { key: 'job', name: 'Job', color: '#F5FF33', visible: false },
            { key: 'social', name: 'Social', color: '#FF8C33', visible: false },
            { key: 'alcohol', name: 'Alcohol', color: '#8C33FF', visible: false },
            { key: 'sunlight', name: 'Sunlight', color: '#33FFCB', visible: false }
        ];
        
        // Calculate data for each variable
        const datasets = variables.map(variable => {
            const data = dates.map(date => {
                const entries = dateGroups[date];
                const sum = entries.reduce((total, entry) => total + entry[variable.key], 0);
                return sum / entries.length;
            });
            
            return {
                label: variable.name,
                data: data,
                borderColor: variable.color,
                backgroundColor: variable.color + '20', // Add transparency
                borderWidth: variable.key === 'mood' ? 3 : 2,
                tension: 0.4,
                fill: false,
                pointRadius: variable.key === 'mood' ? 4 : 3,
                pointHoverRadius: variable.key === 'mood' ? 6 : 5,
                hidden: !variable.visible
            };
        });
        
        console.log('Chart datasets:', datasets.map(d => ({ label: d.label, dataPoints: d.data.length })));
        
        // Create the chart
        const ctx = document.getElementById('comprehensive-chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Mood and Variables Over Time (90-Day View)',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(1)}`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Rating (1-10)'
                        },
                        min: 0,
                        max: 11,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        // Create custom legend with toggle functionality
        const legendContainer = document.getElementById('custom-legend');
        
        variables.forEach((variable, index) => {
            const legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.cursor = 'pointer';
            legendItem.style.padding = '5px 10px';
            legendItem.style.border = '1px solid #ddd';
            legendItem.style.borderRadius = '5px';
            legendItem.style.backgroundColor = variable.visible ? '#f5f5f5' : 'white';
            
            const colorBox = document.createElement('span');
            colorBox.style.display = 'inline-block';
            colorBox.style.width = '12px';
            colorBox.style.height = '12px';
            colorBox.style.backgroundColor = variable.color;
            colorBox.style.marginRight = '5px';
            
            const labelText = document.createElement('span');
            labelText.textContent = variable.name;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(labelText);
            
            legendItem.addEventListener('click', () => {
                // Toggle visibility
                const datasetIndex = index;
                const isDataShown = chart.isDatasetVisible(datasetIndex);
                
                if (isDataShown) {
                    chart.hide(datasetIndex);
                    legendItem.style.backgroundColor = 'white';
                } else {
                    chart.show(datasetIndex);
                    legendItem.style.backgroundColor = '#f5f5f5';
                }
            });
            
            legendContainer.appendChild(legendItem);
        });
    }
    
    // Render correlations chart using Chart.js
    function renderCorrelationsChart() {
        // Create container for the weather-mood chart
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-container';
        
        // Create header for the weather-mood chart
        chartDiv.innerHTML = `
            <h3>Weather and Mood Relationship</h3>
            <p class="chart-description">How different weather conditions affect your mood levels</p>
            <div class="weather-mood-container">
                <canvas id="weather-mood-chart"></canvas>
            </div>
        `;
        chartsContainer.appendChild(chartDiv);
        
        // Define weather types and labels
        const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
        const labels = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Stormy'];
        
        // Define custom colors for each weather type
        const weatherColors = {
            'sunny': '#FFD700',  // Yellow
            'cloudy': '#A9A9A9', // Gray
            'rainy': '#4682B4',  // Blue
            'snowy': '#ADD8E6',  // Light Blue
            'stormy': '#8A2BE2'  // Purple
        };
        
        // Calculate average mood for each weather type
        const weatherMoodData = [];
        const weatherCounts = [];
        
        weatherTypes.forEach(weatherType => {
            const entriesWithWeather = moodEntries.filter(entry => entry.weather === weatherType);
            weatherCounts.push(entriesWithWeather.length);
            
            if (entriesWithWeather.length === 0) {
                weatherMoodData.push(null); // No entries for this weather type
            } else {
                const totalMood = entriesWithWeather.reduce((sum, entry) => sum + entry.mood, 0);
                weatherMoodData.push(totalMood / entriesWithWeather.length);
            }
        });
        
        // Check if we have any real data
        const hasRealData = weatherMoodData.some(value => value !== null);
        
        // If no real data, use sample data
        const finalData = hasRealData 
            ? weatherMoodData.map(value => value === null ? 0 : value) 
            : [7.5, 6.2, 5.0, 4.8, 3.5];
        
        // Create the chart
        const ctx = document.getElementById('weather-mood-chart').getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Mood',
                    data: finalData,
                    backgroundColor: weatherTypes.map(type => weatherColors[type]),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label + ' Weather';
                            },
                            label: function(context) {
                                const weatherType = weatherTypes[context.dataIndex];
                                const count = weatherCounts[context.dataIndex];
                                
                                if (hasRealData && count > 0) {
                                    return [
                                        `Average Mood: ${context.raw.toFixed(1)}`,
                                        `Entries: ${count}`
                                    ];
                                } else {
                                    return 'Sample Data (No entries yet)';
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Average Mood Level (1-10)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Weather Condition'
                        }
                    }
                }
            }
        });
        
        // Add a note if using sample data or a summary if using real data
        if (!hasRealData) {
            const note = document.createElement('p');
            note.style.textAlign = 'center';
            note.style.fontSize = '12px';
            note.style.color = '#666';
            note.style.marginTop = '10px';
            note.textContent = 'Sample data shown. Add entries with different weather conditions to see your personal patterns.';
            chartDiv.querySelector('.weather-mood-container').appendChild(note);
        } else {
            // Add a summary of the data
            const summary = document.createElement('p');
            summary.className = 'weather-summary-text';
            summary.style.textAlign = 'center';
            summary.style.fontSize = '14px';
            summary.style.marginTop = '15px';
            
            // Find the weather with the highest average mood
            let highestMoodWeather = '';
            let highestMoodValue = 0;
            
            weatherTypes.forEach((type, index) => {
                if (weatherCounts[index] > 0 && finalData[index] > highestMoodValue) {
                    highestMoodValue = finalData[index];
                    highestMoodWeather = labels[index];
                }
            });
            
            if (highestMoodWeather) {
                summary.textContent = `Your mood tends to be highest during ${highestMoodWeather} weather (${highestMoodValue.toFixed(1)}/10).`;
                chartDiv.querySelector('.weather-mood-container').appendChild(summary);
            }
        }
    }
    
    // Function to clear all mood entries
    function clearAllData() {
        if (confirm('Are you sure you want to delete ALL mood entries? This cannot be undone.')) {
            // Clear the mood entries array
            moodEntries = [];
            
            // Update localStorage
            localStorage.removeItem('moodEntries');
            
            // Hide visualization section
            visualizationSection.classList.add('hidden');
            
            // Show confirmation message
            alert('All mood entries have been deleted.');
            
            // Send delete request to backend (if applicable)
            fetch('/api/mood-entries', {
                method: 'DELETE'
            }).catch(error => {
                console.error('Error deleting all entries from server:', error);
                // This is non-critical, so we don't need to show an error to the user
            });
        }
    }
});

// Add some CSS for the tables and chart placeholders
document.head.insertAdjacentHTML('beforeend', `
<style>
.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.data-table th, .data-table td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
}

.data-table th {
    background-color: #f5f7fa;
    font-weight: 600;
}

.data-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.btn-delete {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
}

.chart-container {
    margin-bottom: 30px;
}

.correlation-charts {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
}

.correlation-chart {
    flex: 1 1 300px;
    margin-bottom: 20px;
}

.correlation-chart.full-width {
    flex: 1 1 100%;
}

.correlation-chart h4 {
    text-align: center;
    margin-bottom: 10px;
}

/* Weather Info Styles */
.weather-info {
    position: absolute;
    top: 20px;
    right: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    z-index: 100;
}

.weather-info-content {
    display: flex;
    align-items: center;
}

.weather-info img {
    width: 50px;
    height: 50px;
}

.weather-details {
    margin-left: 10px;
}

.weather-location {
    font-weight: bold;
    font-size: 14px;
}

.weather-temp {
    font-size: 18px;
    font-weight: bold;
}

.weather-desc {
    font-size: 12px;
    text-transform: capitalize;
}

/* Weather Effects */
.weather-effect {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
}

.rain {
    background-image: url('https://i.imgur.com/N4gAJiL.gif');
    opacity: 0.3;
}

.snow {
    background-image: url('https://i.imgur.com/9YI2jK4.gif');
    opacity: 0.5;
}

.clouds {
    background-image: url('https://i.imgur.com/mHbScrQ.png');
    opacity: 0.3;
    animation: clouds 60s linear infinite;
}

@keyframes clouds {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: 1000px 0;
    }
}

@media (max-width: 768px) {
    .correlation-charts {
        flex-direction: column;
    }
    
    .weather-info {
        position: relative;
        top: 0;
        right: 0;
        margin: 10px auto;
        width: fit-content;
    }
}
</style>
`); 