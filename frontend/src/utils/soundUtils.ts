/**
 * Utility functions for playing sounds in the application
 */

/**
 * Play a sound with fallbacks for browser autoplay policies
 * @param soundPath Path to the sound file
 * @returns Promise that resolves when sound plays or rejects on failure
 */
export const playSound = (soundPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create audio element
      const audio = new Audio(soundPath);
      
      // Set properties
      audio.volume = 1.0;
      
      // Play with promise handling for modern browsers
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Sound played: ${soundPath}`);
            resolve();
          })
          .catch(err => {
            console.warn(`Autoplay prevented for ${soundPath}:`, err);
            reject(err);
          });
      } else {
        // Older browsers without promise support
        audio.onplaying = () => resolve();
        audio.onerror = (e) => reject(e);
      }
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Play notification sound with user interaction workaround
 * @param soundPath Path to the sound file
 */
export const playNotificationSound = (soundPath: string): void => {
  // Try immediate play
  playSound(soundPath).catch(() => {
    // Set up event listeners for user interaction
    const userInteractionEvents = ['click', 'touchstart', 'keydown'];
    
    const handleUserInteraction = () => {
      playSound(soundPath).catch(console.error);
      
      // Remove all listeners after first interaction
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
    
    // Add listeners
    userInteractionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
    
    // Auto-cleanup after 1 minute
    setTimeout(() => {
      userInteractionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    }, 60000);
  });
};
