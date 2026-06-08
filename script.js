let display = document.getElementById('display');
let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;
let currentLanguage = 'en';
let isDarkMode = false;

// Screen Navigation
function navigateTo(screen) {
    playBeep();
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show target screen
    if (screen === 'home') {
        document.getElementById('homeScreen').classList.add('active');
    } else if (screen === 'calculator') {
        document.getElementById('calculatorScreen').classList.add('active');
    } else if (screen === 'chess') {
        document.getElementById('chessScreen').classList.add('active');
        initChessBoard();
    }
}

// Load theme preference from localStorage
function loadThemePreference() {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
        isDarkMode = JSON.parse(saved);
        if (isDarkMode) {
            enableDarkMode();
        }
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDarkMode = true;
            enableDarkMode();
        }
    }
}

function toggleTheme() {
    playBeep();
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    if (isDarkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    updateThemeButton();
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    updateThemeButton();
}

function updateThemeButton() {
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not available');
    }
}

function playBeep() {
    playSound(800, 0.1); // Standard beep
}

function playOperatorSound() {
    playSound(600, 0.15); // Lower beep for operators
}

function playClearSound() {
    playSound(400, 0.2); // Lower, longer beep for clear
}

// Calculator Functions
function updateDisplay() {
    display.value = currentInput;
}

function appendNumber(num) {
    playBeep();
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else if (num === '.' && currentInput.includes('.')) {
            return;
        } else {
            currentInput += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    playOperatorSound();
    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
}

function calculate() {
    playBeep();
    if (operator === null || previousInput === '') {
        return;
    }

    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                playSound(300, 0.3); // Error sound
                showAlert('cannotDivideByZero');
                clearDisplay();
                return;
            }
            result = prev / current;
            break;
        case '%':
            result = prev % current;
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = null;
    previousInput = '';
    shouldResetDisplay = true;
    updateDisplay();
}

function clearDisplay() {
    playClearSound();
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    playBeep();
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function setLanguage(lang) {
    playBeep();
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update button labels
    updateButtonLabels();
}

function updateButtonLabels() {
    const clearBtn = document.querySelector('[data-label="clear"]');
    const deleteBtn = document.querySelector('[data-label="delete"]');
    
    if (clearBtn) {
        clearBtn.textContent = translations[currentLanguage].clear;
    }
    if (deleteBtn) {
        deleteBtn.textContent = translations[currentLanguage].delete;
    }
}

function showAlert(messageKey) {
    alert(translations[currentLanguage][messageKey]);
}

// Keyboard support for calculator
document.addEventListener('keydown', function(event) {
    const activeScreen = document.querySelector('.screen.active');
    
    if (activeScreen && activeScreen.id === 'calculatorScreen') {
        if (event.key >= '0' && event.key <= '9') {
            appendNumber(event.key);
        } else if (event.key === '.') {
            appendNumber('.');
        } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
            appendOperator(event.key === '/' ? '÷' : event.key === '*' ? '×' : event.key);
        } else if (event.key === 'Enter' || event.key === '=') {
            calculate();
        } else if (event.key === 'Backspace') {
            deleteLast();
        } else if (event.key === 'Escape') {
            clearDisplay();
        }
    }
});

// Initialize display and theme
updateDisplay();
loadThemePreference();

// Show home screen on load
document.addEventListener('DOMContentLoaded', function() {
    navigateTo('home');
});
