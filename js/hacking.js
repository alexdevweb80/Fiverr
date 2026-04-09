/**
 * ============================================================
 * hacking.js — Matrix rain canvas + terminal line effects
 * Appears on: hero banner & about profile image
 * ============================================================
 */

/* ── Utility: create Matrix Rain on a canvas ─────── */
function createMatrixRain(canvasId, color = '#00ff41') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const chars  = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF</>{}[]|\\;:\'".?!@#$%^&*()';

  let cols, drops, fontSize;

  function resize() {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
    fontSize = 12;
    cols     = Math.floor(canvas.width / fontSize);
    drops    = Array(cols).fill(1).map(() => Math.floor(Math.random() * -50));
  }

  resize();

  // Debounced resize observer
  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement);

  function draw() {
    // Semi-transparent black fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px "Courier New", monospace';

    for (let i = 0; i < drops.length; i++) {
      // Head char: brighter
      const isHead = drops[i] > 0 && drops[i] * fontSize < canvas.height;
      ctx.fillStyle = isHead ? '#ffffff' : color;
      ctx.shadowBlur  = isHead ? 12 : 4;
      ctx.shadowColor = color;

      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      // Reset drop randomly at bottom or early
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = Math.floor(Math.random() * -20);
      }
      drops[i]++;
    }
  }

  let rafId;
  function loop() {
    draw();
    rafId = requestAnimationFrame(loop);
  }

  // Only run when visible (IntersectionObserver)
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { if (!rafId) loop(); }
      else { cancelAnimationFrame(rafId); rafId = null; }
    });
  }, { threshold: 0.05 });

  io.observe(canvas);
}


/* ── Hero: Matrix Rain Canvas ────────────────────── */
(function initHeroMatrix() {
  createMatrixRain('matrix-hero-canvas', '#00ff41');
})();


/* ── Hero: Floating Terminal Lines ───────────────── */
(function initTerminalLines() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const cmds = [
    '> Scanning ports... [200/65535]',
    '> SSH bruteforce: 10.0.0.1',
    '> PAYLOAD INJECTED: XSS_0x4f2',
    '> nmap -sV -p 1-1000 target.io',
    '> [✓] Firewall bypassed',
    '> encrypting channel... AES-256',
    '> git push origin exploit/0day',
    '> ./run.sh --stealth --persist',
    '> SYSTEM ACCESS: GRANTED',
    '> Downloading payload... 100%',
    '> sqlmap -u "http://target/id=1"',
    '> [!] Root shell obtained',
    '> Erasing logs... done.',
  ];

  function spawnLine() {
    const hack = document.querySelector('.hero-hack-wrap');
    if (!hack) return;

    const el   = document.createElement('div');
    el.className = 'hack-terminal-line';
    el.textContent = cmds[Math.floor(Math.random() * cmds.length)];

    const topPct = 10 + Math.random() * 75;
    const dur    = 6 + Math.random() * 8;

    el.style.top              = topPct + '%';
    el.style.animationDuration = dur + 's';

    hack.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 200);
  }

  // Spawn lines at intervals
  spawnLine();
  setInterval(spawnLine, 1800);
})();


/* ── About Profile: Matrix Rain Canvas ───────────── */
(function initProfileMatrix() {
  createMatrixRain('matrix-profile-canvas', '#00ff41');
})();


/* ── About Profile: Cycling Status Text ──────────── */
(function initHackStatus() {
  const el = document.querySelector('.hack-status');
  if (!el) return;

  const messages = [
    '> IDENTITY: VERIFIED ✓',
    '> ACCESS_LVL: FULL_ROOT',
    '> DEV_STACK: LOADED',
    '> FIVERR: TOP_RATED ★★★★★',
    '> DEPLOY: READY',
  ];

  let i = 0;
  function cycle() {
    el.textContent = messages[i % messages.length];
    i++;
  }

  cycle();
  setInterval(cycle, 5000);
})();
