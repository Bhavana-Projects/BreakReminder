const reminders = {
  water: { 
    title: "💧 Water Break", 
    message: "Time to drink some water!",
    ringtone: 'loud_alarm_sound.mp3'
  },
  walk: { 
    title: "🚶 Walk Break", 
    message: "Stretch your legs — take a short walk!",
    ringtone: 'loud_alarm_extended.mp3'
  },
  eye: { 
    title: "👀 Eye Rest", 
    message: "Look away from your screen for 20 seconds!",
    ringtone: 'loud_alarm_sound.mp3'
  },
  move: { 
    title: "🧘 Move Break", 
    message: "Do some light stretching or move around!",
    ringtone: 'loud_alarm_extended.mp3'
  }
};

// Ensure offscreen document is created on startup
let offscreenDocumentReady = false;

async function ensureOffscreenDocument() {
  try {
    const hasDocument = await chrome.offscreen.hasDocument();
    
    if (!hasDocument) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Playing alarm sound for health reminders'
      });
      // Wait for document to load
      await new Promise(resolve => setTimeout(resolve, 300));
      offscreenDocumentReady = true;
    } else {
      offscreenDocumentReady = true;
    }
  } catch (error) {
    console.error('Error creating offscreen document:', error);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('[Background] Received message:', msg);
  
  if (msg.action === 'updateAlarms') {
    console.log('[Background] Updating alarms...');
    createAlarms();
  }
  
  if (msg.type === 'audio-ended') {
    console.log('[Background] Audio playback ended');
    // Optionally close offscreen document after audio ends (or keep it open for reuse)
    // chrome.offscreen.closeDocument();
  }
  
  if (msg.type === 'offscreen-ready') {
    console.log('[Background] ✓ Offscreen document is ready');
    offscreenDocumentReady = true;
    sendResponse({ received: true });
    return true;
  }
  
  return true; // Keep message channel open for async response
});

// Initialize offscreen document on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({ water: 30, walk: 60, eye: 20, move: 45 });
  await ensureOffscreenDocument();
  createAlarms();
});

// Also ensure it's ready on startup
chrome.runtime.onStartup.addListener(async () => {
  await ensureOffscreenDocument();
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
    // Play alarm sound with reminder-specific ringtone
    playAlarmSound(reminder.ringtone);
  }
});

// Function to play alarm sound using offscreen document
async function playAlarmSound(ringtoneFile = 'loud_alarm_sound.mp3') {
  try {
    console.log('[Background] Attempting to play alarm sound:', ringtoneFile);
    
    // Always ensure offscreen document exists before sending message
    await ensureOffscreenDocument();
    
    // Wait a bit more to ensure document is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Send message to offscreen document to play sound
    const message = {
      type: 'play-alarm',
      file: ringtoneFile
    };
    
    console.log('[Background] Sending message to offscreen:', message);
    
    try {
      const response = await chrome.runtime.sendMessage(message);
      console.log('[Background] Message sent, response:', response);
    } catch (err) {
      console.error('[Background] Error sending message to offscreen:', err);
      // Retry after ensuring document exists
      await ensureOffscreenDocument();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const retryResponse = await chrome.runtime.sendMessage(message);
        console.log('[Background] Retry successful, response:', retryResponse);
      } catch (retryErr) {
        console.error('[Background] Retry failed:', retryErr);
      }
    }
  } catch (error) {
    console.error('[Background] Error in playAlarmSound:', error);
  }
}
