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
        renderVisualization('all-data');
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
        
        // Add the weather info to the header
        document.querySelector('header').appendChild(weatherInfoContainer);
        
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
            alcohol: parseInt(formData.get('alcohol')),
            sunlight: parseInt(formData.get('sunlight')),
            weather: formData.get('weather'),
            notes: formData.get('notes')
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
        
        // Update visualizations
        renderVisualization('all-data');
        
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
                renderAllDataTable();
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
            
            // Update visualization
            renderVisualization('all-data');
            
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
        const sortedEntries = [...moodEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Limit to last 90 days if needed
        const limitedEntries = sortedEntries.length > 90 ? sortedEntries.slice(-90) : sortedEntries;
        
        // Group entries by date
        const dateGroups = {};
        
        limitedEntries.forEach(entry => {
            const date = new Date(entry.date);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            
            if (!dateGroups[formattedDate]) {
                dateGroups[formattedDate] = [];
            }
            
            dateGroups[formattedDate].push(entry);
        });
        
        // Calculate average values for each date
        const dates = Object.keys(dateGroups).sort((a, b) => new Date(a) - new Date(b));
        
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
        // Create containers for the charts
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-container';
        
        // Define the variables to analyze
        const variables = [
            { name: 'Exercise', key: 'exercise' },
            { name: 'Sleep', key: 'sleep' },
            { name: 'Diet', key: 'diet' },
            { name: 'Portfolio', key: 'portfolio' },
            { name: 'Job', key: 'job' },
            { name: 'Social', key: 'social' },
            { name: 'Alcohol', key: 'alcohol' },
            { name: 'Sunlight', key: 'sunlight' }
        ];
        
        // Create a heatmap correlation matrix
        chartDiv.innerHTML = `
            <h3>Variable and Mood Correlations</h3>
            <div class="correlation-charts">
                <div class="correlation-chart full-width">
                    <h4>Correlation Between Variables and Mood</h4>
                    <canvas id="correlation-scatter" width="800" height="400"></canvas>
                </div>
            </div>
            <div class="correlation-charts" id="variable-charts">
                <!-- Individual variable charts will be added here -->
            </div>
        `;
        chartsContainer.appendChild(chartDiv);
        
        // Create scatter plot for all variables vs mood
        const scatterCtx = document.getElementById('correlation-scatter').getContext('2d');
        
        // Prepare datasets for each variable
        const datasets = variables.map(variable => {
            return {
                label: variable.name,
                data: moodEntries.map(entry => ({
                    x: entry[variable.key],
                    y: entry.mood
                })),
                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`,
                pointRadius: 6,
                pointHoverRadius: 8
            };
        });
        
        new Chart(scatterCtx, {
            type: 'scatter',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Variables vs. Mood Rating'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.x}, Mood: ${context.raw.y}`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Variable Rating (1-10)'
                        },
                        min: 0,
                        max: 11,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Mood Rating (1-10)'
                        },
                        min: 0,
                        max: 11,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        
        // Create individual charts for each variable
        const variableChartsContainer = document.getElementById('variable-charts');
        
        // Create scatter plots for each variable vs mood
        variables.forEach(variable => {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'correlation-chart';
            chartContainer.innerHTML = `
                <h4>${variable.name} and Mood</h4>
                <canvas id="${variable.key}-mood-chart" width="400" height="300"></canvas>
            `;
            variableChartsContainer.appendChild(chartContainer);
            
            // Calculate correlation coefficient
            const data = moodEntries.map(entry => ({
                x: entry[variable.key],
                y: entry.mood
            }));
            
            // Create the scatter plot
            const ctx = document.getElementById(`${variable.key}-mood-chart`).getContext('2d');
            new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: variable.name,
                        data: data,
                        backgroundColor: getMoodColor(5),
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: data.map(point => getMoodColor(point.y))
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${variable.name}: ${context.raw.x}, Mood: ${context.raw.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: `${variable.name} Rating`
                            },
                            min: 0,
                            max: 11,
                            ticks: {
                                stepSize: 1
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Mood Rating'
                            },
                            min: 0,
                            max: 11,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        });
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