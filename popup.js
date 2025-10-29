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
