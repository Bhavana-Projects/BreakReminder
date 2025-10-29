// Validate input to ensure non-zero and non-negative values
function validateInput(input) {
  let value = parseInt(input.value);
  
  // If value is NaN, zero, negative, or empty, set to 1 (minimum allowed)
  if (isNaN(value) || value <= 0 || value === '' || value === null) {
    input.value = 1;
    value = 1;
  }
  
  return value;
}

// Add input validation to all number inputs
function setupInputValidation() {
  const inputs = ['water', 'walk', 'eye', 'move'];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    
    // Validate on blur (when user leaves the field)
    input.addEventListener('blur', () => {
      validateInput(input);
    });
    
    // Prevent negative values on keydown
    input.addEventListener('keydown', (e) => {
      // Allow: backspace, delete, tab, escape, enter, decimal point
      if ([46, 8, 9, 27, 13, 190].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true) ||
          // Allow: home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
      }
      // Ensure that it is a number and stop the keypress if it's minus or not a number
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 189) {
        e.preventDefault();
      }
      // Prevent minus sign
      if (e.keyCode === 189 || e.key === '-') {
        e.preventDefault();
      }
    });
    
    // Prevent pasting negative values or zero
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      const pastedValue = parseInt(pastedText);
      
      if (!isNaN(pastedValue) && pastedValue > 0) {
        input.value = pastedValue;
      } else {
        input.value = 1;
      }
    });
    
    // Validate on input change
    input.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      if (isNaN(value) || value <= 0) {
        // Temporarily allow empty or invalid to let user type
        if (e.target.value === '' || e.target.value === '-') {
          return; // Let them continue typing
        }
        // If it's already a bad value, set to 1
        if (value <= 0) {
          e.target.value = '';
        }
      }
    });
  });
}

// Load saved values when popup opens
function loadSavedValues() {
  chrome.storage.sync.get(['water', 'walk', 'eye', 'move'], (settings) => {
    if (settings.water !== undefined && settings.water > 0) {
      document.getElementById('water').value = settings.water;
    }
    if (settings.walk !== undefined && settings.walk > 0) {
      document.getElementById('walk').value = settings.walk;
    }
    if (settings.eye !== undefined && settings.eye > 0) {
      document.getElementById('eye').value = settings.eye;
    }
    if (settings.move !== undefined && settings.move > 0) {
      document.getElementById('move').value = settings.move;
    }
  });
}

// Theme toggle functionality
function loadTheme() {
  chrome.storage.sync.get(['theme'], (result) => {
    const theme = result.theme || 'dark';
    applyTheme(theme);
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  const themeIcon = document.getElementById('themeIcon');
  
  if (theme === 'light') {
    root.classList.add('light-theme');
    themeIcon.textContent = '☀️';
  } else {
    root.classList.remove('light-theme');
    themeIcon.textContent = '🌙';
  }
}

function toggleTheme() {
  chrome.storage.sync.get(['theme'], (result) => {
    const currentTheme = result.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    chrome.storage.sync.set({ theme: newTheme }, () => {
      applyTheme(newTheme);
    });
  });
}

// Theme toggle button
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Save button click handler
document.getElementById('save').addEventListener('click', () => {
  // Validate all inputs before saving
  const waterInput = document.getElementById('water');
  const walkInput = document.getElementById('walk');
  const eyeInput = document.getElementById('eye');
  const moveInput = document.getElementById('move');
  
  const water = validateInput(waterInput);
  const walk = validateInput(walkInput);
  const eye = validateInput(eyeInput);
  const move = validateInput(moveInput);
  
  const settings = {
    water: water,
    walk: walk,
    eye: eye,
    move: move
  };

  chrome.storage.sync.set(settings, () => {
    chrome.runtime.sendMessage({ action: 'updateAlarms' });
    document.getElementById('status').textContent = 'Reminders Saved!';
    setTimeout(() => { document.getElementById('status').textContent = ''; }, 2000);
  });
});

// Load values and theme when popup opens, and setup validation
loadSavedValues();
loadTheme();
setupInputValidation();
