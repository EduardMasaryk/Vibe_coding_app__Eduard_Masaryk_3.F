// Conversion data for each category
const conversionData = {
    temperature: {
        name: '🌡️ Teplota',
        units: ['°C', '°F', 'K'],
        // Base unit: Celsius
        toBase: {
            '°C': (val) => val,
            '°F': (val) => (val - 32) * 5/9,
            'K': (val) => val - 273.15
        },
        fromBase: {
            '°C': (val) => val,
            '°F': (val) => val * 9/5 + 32,
            'K': (val) => val + 273.15
        }
    },
    distance: {
        name: '📏 Vzdialenosť',
        units: ['mm', 'cm', 'm', 'km', 'palce', 'stopy', 'míle'],
        // Base unit: meter
        toBase: {
            'mm': (val) => val / 1000,
            'cm': (val) => val / 100,
            'm': (val) => val,
            'km': (val) => val * 1000,
            'palce': (val) => val * 0.0254,
            'stopy': (val) => val * 0.3048,
            'míle': (val) => val * 1609.34
        },
        fromBase: {
            'mm': (val) => val * 1000,
            'cm': (val) => val * 100,
            'm': (val) => val,
            'km': (val) => val / 1000,
            'palce': (val) => val / 0.0254,
            'stopy': (val) => val / 0.3048,
            'míle': (val) => val / 1609.34
        }
    },
    weight: {
        name: '⚖️ Hmotnosť',
        units: ['mg', 'g', 'kg', 't', 'unce', 'libry'],
        // Base unit: kilogram
        toBase: {
            'mg': (val) => val / 1000000,
            'g': (val) => val / 1000,
            'kg': (val) => val,
            't': (val) => val * 1000,
            'unce': (val) => val * 0.0283495,
            'libry': (val) => val * 0.453592
        },
        fromBase: {
            'mg': (val) => val * 1000000,
            'g': (val) => val * 1000,
            'kg': (val) => val,
            't': (val) => val / 1000,
            'unce': (val) => val / 0.0283495,
            'libry': (val) => val / 0.453592
        }
    },
    speed: {
        name: '🚗 Rýchlosť',
        units: ['m/s', 'km/h', 'mph', 'uzly'],
        // Base unit: m/s
        toBase: {
            'm/s': (val) => val,
            'km/h': (val) => val / 3.6,
            'mph': (val) => val * 0.44704,
            'uzly': (val) => val * 0.51444
        },
        fromBase: {
            'm/s': (val) => val,
            'km/h': (val) => val * 3.6,
            'mph': (val) => val / 0.44704,
            'uzly': (val) => val / 0.51444
        }
    }
};

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const inputValue = document.getElementById('inputValue');
const fromUnitSelect = document.getElementById('fromUnit');
const toUnitSelect = document.getElementById('toUnit');
const swapButton = document.getElementById('swapButton');
const resultValue = document.getElementById('resultValue');
const tableBody = document.getElementById('tableBody');
const errorMessage = document.getElementById('errorMessage');

// State
let currentCategory = 'temperature';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    populateUnits();
    attachEventListeners();
    updateConversion();
});

// Initialize tab navigation
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            populateUnits();
            updateConversion();
            inputValue.focus();
        });
    });
}

// Populate unit dropdowns
function populateUnits() {
    const units = conversionData[currentCategory].units;
    
    // Clear existing options
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';
    
    // Populate options
    units.forEach((unit, index) => {
        const option1 = document.createElement('option');
        option1.value = unit;
        option1.textContent = unit;
        fromUnitSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = unit;
        option2.textContent = unit;
        toUnitSelect.appendChild(option2);
        
        // Set default selections
        if (index === 0) fromUnitSelect.value = unit;
        if (index === 1 && units.length > 1) {
            toUnitSelect.value = unit;
        } else if (units.length === 1) {
            toUnitSelect.value = unit;
        }
    });
}

// Attach event listeners
function attachEventListeners() {
    inputValue.addEventListener('input', handleInput);
    fromUnitSelect.addEventListener('change', updateConversion);
    toUnitSelect.addEventListener('change', updateConversion);
    swapButton.addEventListener('click', swapUnits);
}

// Handle input validation
function handleInput(e) {
    const value = e.target.value.trim();
    
    // Reset error message
    errorMessage.textContent = '';
    inputValue.classList.remove('error');
    
    // Validate input
    if (value === '' || value === '-') {
        resultValue.textContent = '0';
        updateTable();
        return;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
        errorMessage.textContent = 'Zadaj platné číslo';
        inputValue.classList.add('error');
        resultValue.textContent = '0';
        updateTable();
        return;
    }
    
    // For temperature, validate range for Celsius and Kelvin
    if (currentCategory === 'temperature') {
        const fromUnit = fromUnitSelect.value;
        if ((fromUnit === 'K' && numValue < 0) || 
            (fromUnit === '°C' && numValue < -273.15)) {
            errorMessage.textContent = 'Fyzikálne nemožná hodnota';
            inputValue.classList.add('error');
            return;
        }
    }
    
    updateConversion();
}

// Update conversion and display result
function updateConversion() {
    const inputVal = parseFloat(inputValue.value);
    
    if (isNaN(inputVal) || inputValue.value.trim() === '') {
        resultValue.textContent = '0';
        updateTable();
        return;
    }
    
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    const categoryData = conversionData[currentCategory];
    
    // Convert to base unit, then to target unit
    const baseValue = categoryData.toBase[fromUnit](inputVal);
    const result = categoryData.fromBase[toUnit](baseValue);
    
    // Format result
    const formattedResult = formatNumber(result);
    resultValue.textContent = `${formattedResult} ${toUnit}`;
    
    // Update table
    updateTable();
}

// Format number to readable format
function formatNumber(num) {
    if (num === 0) return '0';
    
    // Use exponential notation for very small or very large numbers
    if (Math.abs(num) < 0.0001 || Math.abs(num) > 1e6) {
        return num.toExponential(6);
    }
    
    // Round to reasonable decimal places
    if (Math.abs(num) >= 1) {
        return parseFloat(num.toFixed(6)).toString();
    } else {
        return parseFloat(num.toFixed(8)).toString();
    }
}

// Swap units
function swapUnits() {
    const temp = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = temp;
    updateConversion();
    swapButton.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        swapButton.style.transform = 'rotate(0deg)';
    }, 300);
}

// Update results table with all conversions
function updateTable() {
    tableBody.innerHTML = '';
    
    const inputVal = parseFloat(inputValue.value);
    
    if (isNaN(inputVal) || inputValue.value.trim() === '') {
        // Show empty table with all units
        const units = conversionData[currentCategory].units;
        units.forEach(unit => {
            const row = createTableRow(unit, 0, true);
            tableBody.appendChild(row);
        });
        return;
    }
    
    const fromUnit = fromUnitSelect.value;
    const categoryData = conversionData[currentCategory];
    const units = categoryData.units;
    
    // Convert from current unit to all other units
    const baseValue = categoryData.toBase[fromUnit](inputVal);
    
    units.forEach(unit => {
        const convertedValue = categoryData.fromBase[unit](baseValue);
        const row = createTableRow(unit, convertedValue);
        tableBody.appendChild(row);
    });
}

// Create table row
function createTableRow(unit, value, isEmpty = false) {
    const row = document.createElement('tr');
    
    const unitCell = document.createElement('td');
    unitCell.textContent = unit;
    
    const valueCell = document.createElement('td');
    if (isEmpty) {
        valueCell.textContent = '—';
    } else {
        const formattedValue = formatNumber(value);
        valueCell.textContent = formattedValue;
    }
    
    row.appendChild(unitCell);
    row.appendChild(valueCell);
    
    return row;
}

// Add smooth transition to swap button
swapButton.style.transition = 'transform 0.3s ease';
