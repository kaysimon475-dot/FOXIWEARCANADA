// Hover sound for main navbar logo
(function () {
  const SOUND_SRC = 'assets/sfx/logo-hover.mp3';

  function setup() {
    const logo = document.getElementById('navbarLogo');
    if (!logo) return;

    // Create audio element
    const audio = new Audio(SOUND_SRC);
    audio.preload = 'auto';
    audio.volume = 0.35;

    // Browsers block autoplay until user interacts; this primes audio on first click
    const prime = () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {
        // ignore
      });
      window.removeEventListener('pointerdown', prime, { capture: true });
      window.removeEventListener('keydown', prime, { capture: true });
    };

    window.addEventListener('pointerdown', prime, { capture: true, once: true });
    window.addEventListener('keydown', prime, { capture: true, once: true });

    let lastPlay = 0;
    const COOLDOWN_MS = 180;

    logo.addEventListener('mouseenter', () => {
      const now = Date.now();
      if (now - lastPlay < COOLDOWN_MS) return;
      lastPlay = now;

      try {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // If blocked, ignore; will work after user interacts.
        });
      } catch {
        // ignore
      }
    });

    // Optional: prevent jumping to top since href="#"
    logo.addEventListener('click', (e) => {
      e.preventDefault();
    });
  }

  document.addEventListener('DOMContentLoaded', setup);
})();
