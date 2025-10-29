// Offscreen document for playing alarm sounds
console.log('Offscreen document loaded, setting up message listener');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Received message in offscreen:', msg);
  if (msg.type === 'play-alarm') {
    playSound(msg.file);
    sendResponse({ success: true }); // Confirm message received
  }
  return true; // Keep message channel open for async response
});

function playSound(filename) {
  try {
    console.log('[Offscreen] Attempting to play sound:', filename);
    // Use chrome.runtime.getURL for proper extension path resolution
    const audioPath = chrome.runtime.getURL(`Ringtones/${filename}`);
    console.log('[Offscreen] Audio path:', audioPath);
    
    const audio = new Audio(audioPath);
    audio.volume = 1.0; // Set volume to maximum (0.0 to 1.0)
    
    // Comprehensive error handling
    audio.onerror = (err) => {
      console.error('[Offscreen] Audio error event:', err);
      console.error('[Offscreen] Audio error code:', audio.error?.code);
      console.error('[Offscreen] Audio error message:', audio.error?.message);
      console.error('[Offscreen] Audio path was:', audioPath);
    };
    
    audio.onabort = () => {
      console.error('[Offscreen] Audio playback aborted');
    };
    
    audio.onstalled = () => {
      console.warn('[Offscreen] Audio playback stalled');
    };
    
    audio.onloadeddata = () => {
      console.log('[Offscreen] Audio loaded successfully, volume:', audio.volume);
      console.log('[Offscreen] Audio duration:', audio.duration);
    };
    
    audio.oncanplay = () => {
      console.log('[Offscreen] Audio can start playing');
    };
    
    audio.oncanplaythrough = () => {
      console.log('[Offscreen] Audio can play through without buffering');
    };
    
    // Play audio
    const playAudio = async () => {
      try {
        console.log('[Offscreen] Attempting to play...');
        await audio.play();
        console.log('[Offscreen] ✓ Audio playing successfully at volume:', audio.volume);
        console.log('[Offscreen] Audio duration:', audio.duration, 'seconds');
      } catch (playErr) {
        console.error('[Offscreen] ✗ Error playing audio:', playErr);
        console.error('[Offscreen] Error name:', playErr.name);
        console.error('[Offscreen] Error message:', playErr.message);
        
        // If playback was blocked, try again after user interaction is simulated
        if (playErr.name === 'NotAllowedError' || playErr.name === 'NotSupportedError') {
          console.log('[Offscreen] Retrying playback after delay...');
          setTimeout(async () => {
            try {
              await audio.play();
              console.log('[Offscreen] ✓ Retry successful');
            } catch (retryErr) {
              console.error('[Offscreen] ✗ Retry failed:', retryErr);
            }
          }, 200);
        }
      }
    };
    
    // Handle different ready states
    if (audio.readyState >= 2) {
      // Audio data is loaded enough to play
      console.log('[Offscreen] Audio ready, playing immediately');
      playAudio();
    } else {
      // Wait for audio to load
      console.log('[Offscreen] Waiting for audio to load, current readyState:', audio.readyState);
      audio.oncanplaythrough = () => {
        console.log('[Offscreen] Audio can play through, starting playback');
        playAudio();
      };
      audio.load(); // Explicitly load the audio
    }
    
    // Send confirmation when audio ends
    audio.onended = () => {
      console.log('[Offscreen] Audio playback ended');
      chrome.runtime.sendMessage({ type: 'audio-ended' }).catch(e => {
        console.error('[Offscreen] Error sending audio-ended message:', e);
      });
    };
    
    audio.onplay = () => {
      console.log('[Offscreen] ✓ Audio playback started');
    };
    
    audio.onpause = () => {
      console.log('[Offscreen] Audio paused');
    };
    
    audio.onwaiting = () => {
      console.log('[Offscreen] Audio waiting for data');
    };
    
  } catch (error) {
    console.error('[Offscreen] ✗ Error in playSound function:', error);
    console.error('[Offscreen] Error stack:', error.stack);
  }
}

// Send ready signal to background script
chrome.runtime.sendMessage({ type: 'offscreen-ready' }).catch(() => {
  // Background script might not be listening for this, that's okay
});

