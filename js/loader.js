/**
 * ============================================================
 * loader.js — 3D Logo Loading Screen
 * ============================================================
 */

(function initLoader() {
  document.body.style.overflow = 'hidden'; // disable scrolling while loading

  window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    const bar = document.getElementById('loader-progress-bar');
    const pctLabel = document.getElementById('loader-percentage');
    
    if (!loader || !bar || !pctLabel) return;

    let progress = 0;
    
    // Simulate loading progress
    const interval = setInterval(() => {
      // Random increment between 2 and 15
      progress += Math.random() * 13 + 2;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Final updates
        bar.style.width = '100%';
        pctLabel.textContent = '100%';
        
        // Add a slight delay before fading out to show 100%
        setTimeout(() => {
          loader.classList.add('is-hidden');
          document.body.style.overflow = ''; // restore scrolling
          
          // Optionally remove from DOM after transition
          setTimeout(() => {
            loader.remove();
          }, 800);
        }, 500);
      } else {
        bar.style.width = `${progress}%`;
        pctLabel.textContent = `${Math.floor(progress)}%`;
      }
    }, 40); // speed of updates
  });
})();
