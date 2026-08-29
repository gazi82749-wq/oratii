// Tiny base64 audio snippets for interactive sounds
const Sounds = {
  // A subtle marker tap / paper tap sound
  click: 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
};

export const playSound = (type = 'click') => {
  try {
    const audio = new Audio(Sounds[type]);
    audio.volume = 0.2; // Keep it subtle
    audio.play().catch(() => {
      // Ignore autoplay block errors
    });
  } catch (err) {
    // Ignore errors on environments where Audio is not defined
  }
};
