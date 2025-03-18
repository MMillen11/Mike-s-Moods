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
    const viewCorrelationMatrixBtn = document.getElementById('view-correlation-matrix');
    
    // Set default date to today
    const today = new Date();
    // Format date properly without timezone issues 
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
    viewCorrelationMatrixBtn.addEventListener('click', () => renderVisualization('correlation-matrix'));
    
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
        
        // Get date from form and ensure it's correctly formatted
        const dateValue = formData.get('date');
        let formattedDate = dateValue;
        
        // If there's any timezone issue, reformat the date properly
        if (dateValue) {
            const dateParts = dateValue.split('-');
            if (dateParts.length === 3) {
                // Create a date using year, month-1 (0-indexed), day
                const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            }
        }
        
        const entryData = {
            id: Date.now(), // Unique ID based on timestamp
            date: formattedDate,
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
            case 'correlation-matrix':
                renderCorrelationMatrix();
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
        const sortedEntries = [...moodEntries].sort((a, b) => {
            // Ensure proper date comparison by parsing date strings manually
            const partsA = a.date.split("-");
            const partsB = b.date.split("-");
            
            if (partsA.length !== 3 || partsB.length !== 3) {
                return 0; // If invalid date format, no change in order
            }
            
            // Create dates using year, month, day
            const dateA = new Date(
                parseInt(partsA[0]),
                parseInt(partsA[1]) - 1,
                parseInt(partsA[2])
            );
            
            const dateB = new Date(
                parseInt(partsB[0]),
                parseInt(partsB[1]) - 1,
                parseInt(partsB[2])
            );
            
            return dateB - dateA; // Descending order (newest first)
        });
        
        sortedEntries.forEach(entry => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(entry.date);
            // Fix timezone issue - ensure the date from the string is interpreted correctly
            const dateParts = entry.date.split("-");
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;  // JS months are 0-indexed
            const day = parseInt(dateParts[2]);
            const localDate = new Date(year, month, day);
            const formattedDate = `${localDate.getMonth() + 1}/${localDate.getDate()}/${localDate.getFullYear()}`;
            
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
            <h3>Comprehensive Metrics Over Time</h3>
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
            // Ensure proper date comparison by parsing the date strings manually
            const partsA = a.date.split("-");
            const partsB = b.date.split("-");
            
            if (partsA.length !== 3 || partsB.length !== 3) {
                return 0; // If invalid date format, no change in order
            }
            
            // Create dates using year, month, day
            const dateA = new Date(
                parseInt(partsA[0]),
                parseInt(partsA[1]) - 1,
                parseInt(partsA[2])
            );
            
            const dateB = new Date(
                parseInt(partsB[0]),
                parseInt(partsB[1]) - 1,
                parseInt(partsB[2])
            );
            
            return dateA - dateB;
        });
        
        // Check if we have an entry for today
        const today = new Date();
        const todayFormatted = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
        const hasEntryForToday = moodEntries.some(entry => {
            // Fix timezone issue by manually creating the date from parts
            const dateParts = entry.date.split("-");
            if (dateParts.length !== 3) return false;
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;  // JS months are 0-indexed
            const day = parseInt(dateParts[2]);
            const entryDate = new Date(year, month, day);
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
            // Fix timezone issue by manually creating the date from parts
            const dateParts = entry.date.split("-");
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;  // JS months are 0-indexed
            const day = parseInt(dateParts[2]);
            const entryDate = new Date(year, month, day);
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
            { key: 'mood', name: 'Mood', color: '#ff9800', visible: true },         // Orange
            { key: 'exercise', name: 'Exercise', color: '#4caf50', visible: false }, // Green
            { key: 'sleep', name: 'Sleep', color: '#9c27b0', visible: false },      // Purple
            { key: 'diet', name: 'Diet', color: '#8bc34a', visible: false },        // Light Green
            { key: 'portfolio', name: 'Portfolio', color: '#2196f3', visible: false }, // Blue
            { key: 'job', name: 'Job', color: '#607d8b', visible: false },          // Blue Gray
            { key: 'social', name: 'Social', color: '#e91e63', visible: false },    // Pink
            { key: 'alcohol', name: 'Alcohol', color: '#795548', visible: false },  // Brown
            { key: 'sunlight', name: 'Sunlight', color: '#ffc107', visible: false } // Yellow
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
                        text: 'Metrics Over Time (90-Day View)',
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
                            text: 'Metrics'
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
        
        // Add the Deep Dive button
        const deepDiveContainer = document.createElement('div');
        deepDiveContainer.style.textAlign = 'center';
        deepDiveContainer.style.marginTop = '30px';

        const deepDiveButton = document.createElement('button');
        deepDiveButton.className = 'deep-dive-button';
        deepDiveButton.innerHTML = '🧠 Deep Dive Analysis';
        deepDiveButton.addEventListener('click', handleDeepDiveClick);

        deepDiveContainer.appendChild(deepDiveButton);
        chartContainer.appendChild(deepDiveContainer);
    }
    
    // Render correlations chart using Chart.js
    function renderCorrelationsChart() {
        // Create container for the weather-mood chart
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-container';
        
        // Create header for the weather-mood chart
        chartDiv.innerHTML = `
            <h3>Weather Conditions</h3>
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

    // Render correlation matrix chart
    function renderCorrelationMatrix() {
        // Create container for the correlation matrix
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'chart-container';
        
        // Create header for the correlation matrix
        matrixContainer.innerHTML = `
            <h3>Correlation Matrix</h3>
            <p class="chart-description">Relationship strength between different metrics (higher values indicate stronger correlations)</p>
            <div class="correlation-matrix-container" style="margin: 20px auto; overflow-x: auto;">
                <div id="correlation-matrix-table"></div>
            </div>
        `;
        chartsContainer.appendChild(matrixContainer);
        
        // Define variables to include in the correlation matrix
        const variables = [
            { key: 'mood', name: 'Mood' },
            { key: 'exercise', name: 'Exercise' },
            { key: 'sleep', name: 'Sleep' },
            { key: 'diet', name: 'Diet' },
            { key: 'portfolio', name: 'Portfolio' },
            { key: 'job', name: 'Job' },
            { key: 'social', name: 'Social' },
            { key: 'alcohol', name: 'Alcohol' },
            { key: 'sunlight', name: 'Sunlight' }
        ];
        
        // Only proceed if we have enough entries for meaningful correlations
        if (moodEntries.length < 5) {
            matrixContainer.querySelector('.correlation-matrix-container').innerHTML = `
                <p style="text-align: center; padding: 20px;">
                    Not enough data for meaningful correlations. Add at least 5 entries to see the correlation matrix.
                </p>
            `;
            return;
        }
        
        // Calculate correlation matrix
        const correlationMatrix = [];
        const variableNames = variables.map(v => v.name);
        
        // Calculate correlation for each variable pair
        for (let i = 0; i < variables.length; i++) {
            correlationMatrix[i] = [];
            for (let j = 0; j < variables.length; j++) {
                if (i === j) {
                    // Diagonal elements (correlation with self) are always 1
                    correlationMatrix[i][j] = 1;
                } else {
                    const correlation = calculateCorrelation(
                        moodEntries.map(entry => entry[variables[i].key]),
                        moodEntries.map(entry => entry[variables[j].key])
                    );
                    correlationMatrix[i][j] = parseFloat(correlation.toFixed(2));
                }
            }
        }
        
        // Create a table to display the correlation matrix
        const tableContainer = document.getElementById('correlation-matrix-table');
        const table = document.createElement('table');
        table.className = 'correlation-table';
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.textAlign = 'center';
        table.style.fontSize = '14px';
        
        // Create header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Empty cell in the top-left corner
        const cornerCell = document.createElement('th');
        cornerCell.style.backgroundColor = '#f5f7fa';
        cornerCell.style.border = '1px solid #ddd';
        cornerCell.style.padding = '10px';
        headerRow.appendChild(cornerCell);
        
        // Add column headers
        variableNames.forEach(name => {
            const th = document.createElement('th');
            th.textContent = name;
            th.style.backgroundColor = '#f5f7fa';
            th.style.border = '1px solid #ddd';
            th.style.padding = '10px';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Add rows with data
        for (let i = 0; i < correlationMatrix.length; i++) {
            const row = document.createElement('tr');
            
            // Add row header (variable name)
            const th = document.createElement('th');
            th.textContent = variableNames[i];
            th.style.backgroundColor = '#f5f7fa';
            th.style.border = '1px solid #ddd';
            th.style.padding = '10px';
            th.style.textAlign = 'left';
            row.appendChild(th);
            
            // Add correlation values
            for (let j = 0; j < correlationMatrix[i].length; j++) {
                const td = document.createElement('td');
                td.textContent = correlationMatrix[i][j].toFixed(2);
                td.style.border = '1px solid #ddd';
                td.style.padding = '10px';
                
                // Color based on correlation value
                let cellColor;
                const value = correlationMatrix[i][j];
                
                if (i === j) {
                    // Diagonal (self-correlation) is always 1
                    cellColor = '#f5f7fa';
                } else if (value < -0.5) {
                    cellColor = 'rgba(220, 53, 69, 0.8)'; // Strong negative - red
                } else if (value < -0.3) {
                    cellColor = 'rgba(220, 53, 69, 0.5)'; // Moderate negative - lighter red
                } else if (value < -0.1) {
                    cellColor = 'rgba(220, 53, 69, 0.3)'; // Weak negative - very light red
                } else if (value < 0.1) {
                    cellColor = 'rgba(255, 193, 7, 0.3)'; // Very weak/neutral - very light yellow
                } else if (value < 0.3) {
                    cellColor = 'rgba(40, 167, 69, 0.3)'; // Weak positive - very light green
                } else if (value < 0.5) {
                    cellColor = 'rgba(40, 167, 69, 0.5)'; // Moderate positive - lighter green
                } else {
                    cellColor = 'rgba(40, 167, 69, 0.8)'; // Strong positive - green
                }
                
                td.style.backgroundColor = cellColor;
                
                // Make text color appropriate for background
                if (value < -0.5 || value > 0.5) {
                    td.style.color = 'white'; // White text on dark backgrounds
                } else {
                    td.style.color = 'black'; // Black text on light backgrounds
                }
                
                row.appendChild(td);
            }
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
        // Add a legend explaining correlation values
        const legendContainer = document.createElement('div');
        legendContainer.style.display = 'flex';
        legendContainer.style.flexWrap = 'wrap';
        legendContainer.style.justifyContent = 'center';
        legendContainer.style.marginTop = '20px';
        legendContainer.style.gap = '10px';
        
        const legendItems = [
            { color: 'rgba(220, 53, 69, 0.8)', label: 'Strong Negative (< -0.5)' },
            { color: 'rgba(220, 53, 69, 0.5)', label: 'Moderate Negative (-0.5 to -0.3)' },
            { color: 'rgba(220, 53, 69, 0.3)', label: 'Weak Negative (-0.3 to -0.1)' },
            { color: 'rgba(255, 193, 7, 0.3)', label: 'Very Weak/Neutral (-0.1 to 0.1)' },
            { color: 'rgba(40, 167, 69, 0.3)', label: 'Weak Positive (0.1 to 0.3)' },
            { color: 'rgba(40, 167, 69, 0.5)', label: 'Moderate Positive (0.3 to 0.5)' },
            { color: 'rgba(40, 167, 69, 0.8)', label: 'Strong Positive (> 0.5)' }
        ];
        
        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.marginBottom = '5px';
            
            const colorBox = document.createElement('div');
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.backgroundColor = item.color;
            colorBox.style.marginRight = '5px';
            colorBox.style.border = '1px solid #ddd';
            
            const label = document.createElement('span');
            label.textContent = item.label;
            label.style.fontSize = '12px';
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        });
        
        // Add explanation text
        const explanationText = document.createElement('p');
        explanationText.style.textAlign = 'center';
        explanationText.style.marginTop = '20px';
        explanationText.style.fontSize = '14px';
        explanationText.innerHTML = `
            <strong>How to interpret:</strong> Values close to 1 indicate a strong positive correlation (as one metric increases, the other tends to increase).
            Values close to -1 indicate a strong negative correlation (as one metric increases, the other tends to decrease).
            Values close to 0 indicate little to no correlation between the metrics.
        `;
        
        matrixContainer.querySelector('.correlation-matrix-container').appendChild(legendContainer);
        matrixContainer.querySelector('.correlation-matrix-container').appendChild(explanationText);
        
        // Add info about strongest correlations
        const strongestCorrelations = findStrongestCorrelations(correlationMatrix, variableNames);
        if (strongestCorrelations.positive.length > 0 || strongestCorrelations.negative.length > 0) {
            const insightsDiv = document.createElement('div');
            insightsDiv.style.marginTop = '30px';
            insightsDiv.style.padding = '15px';
            insightsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            insightsDiv.style.borderRadius = '5px';
            insightsDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            
            let insightsHTML = '<h4 style="margin-top: 0;">Key Insights</h4>';
            
            if (strongestCorrelations.positive.length > 0) {
                insightsHTML += '<p><strong>Strongest positive correlations:</strong></p><ul>';
                strongestCorrelations.positive.forEach(corr => {
                    insightsHTML += `<li>${corr.var1} ↔ ${corr.var2}: ${corr.value.toFixed(2)}</li>`;
                });
                insightsHTML += '</ul>';
            }
            
            if (strongestCorrelations.negative.length > 0) {
                insightsHTML += '<p><strong>Strongest negative correlations:</strong></p><ul>';
                strongestCorrelations.negative.forEach(corr => {
                    insightsHTML += `<li>${corr.var1} ↔ ${corr.var2}: ${corr.value.toFixed(2)}</li>`;
                });
                insightsHTML += '</ul>';
            }
            
            insightsDiv.innerHTML = insightsHTML;
            matrixContainer.querySelector('.correlation-matrix-container').appendChild(insightsDiv);
        }
    }
    
    // Helper function to find the strongest correlations
    function findStrongestCorrelations(matrix, varNames) {
        const positiveCorrelations = [];
        const negativeCorrelations = [];
        
        // Examine each unique pair
        for (let i = 0; i < matrix.length; i++) {
            for (let j = i + 1; j < matrix[i].length; j++) {
                const value = matrix[i][j];
                const pair = {
                    var1: varNames[i],
                    var2: varNames[j],
                    value: value
                };
                
                if (value >= 0.5) {
                    positiveCorrelations.push(pair);
                } else if (value <= -0.5) {
                    negativeCorrelations.push(pair);
                }
            }
        }
        
        // Sort by absolute value (strongest first)
        positiveCorrelations.sort((a, b) => b.value - a.value);
        negativeCorrelations.sort((a, b) => a.value - b.value);
        
        // Limit to top 3 of each
        return {
            positive: positiveCorrelations.slice(0, 3),
            negative: negativeCorrelations.slice(0, 3)
        };
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
    color: black;
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