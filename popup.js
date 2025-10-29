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

// Load values when popup opens
loadSavedValues();

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
