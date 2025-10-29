// Load saved values when popup opens
function loadSavedValues() {
  chrome.storage.sync.get(['water', 'walk', 'eye', 'move'], (settings) => {
    if (settings.water !== undefined) {
      document.getElementById('water').value = settings.water;
    }
    if (settings.walk !== undefined) {
      document.getElementById('walk').value = settings.walk;
    }
    if (settings.eye !== undefined) {
      document.getElementById('eye').value = settings.eye;
    }
    if (settings.move !== undefined) {
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

// Load values and theme when popup opens
loadSavedValues();
loadTheme();

// Theme toggle button
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Save button click handler
document.getElementById('save').addEventListener('click', () => {
  const settings = {
    water: parseInt(document.getElementById('water').value),
    walk: parseInt(document.getElementById('walk').value),
    eye: parseInt(document.getElementById('eye').value),
    move: parseInt(document.getElementById('move').value)
  };

  chrome.storage.sync.set(settings, () => {
    chrome.runtime.sendMessage({ action: 'updateAlarms' });
    document.getElementById('status').textContent = 'Reminders Saved!';
    setTimeout(() => { document.getElementById('status').textContent = ''; }, 2000);
  });
});
