const reminders = {
  water: { title: "💧 Water Break", message: "Time to drink some water!" },
  walk: { title: "🚶 Walk Break", message: "Stretch your legs — take a short walk!" },
  eye: { title: "👀 Eye Rest", message: "Look away from your screen for 20 seconds!" },
  move: { title: "🧘 Move Break", message: "Do some light stretching or move around!" }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ water: 30, walk: 60, eye: 20, move: 45 });
  createAlarms();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'updateAlarms') createAlarms();
});

function createAlarms() {
  chrome.alarms.clearAll(() => {
    chrome.storage.sync.get(['water', 'walk', 'eye', 'move'], (settings) => {
      Object.keys(settings).forEach(type => {
        chrome.alarms.create(type, { delayInMinutes: settings[type], periodInMinutes: settings[type] });
      });
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  const reminder = reminders[alarm.name];
  if (reminder) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: reminder.title,
      message: reminder.message,
      priority: 2
    });
  }
});
