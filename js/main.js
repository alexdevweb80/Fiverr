/**
 * ============================================================
 * main.js — Core interactions & animations
 * Futuristic Fiverr Portfolio
 * ============================================================
 */

/* ── 1. Navbar scroll behaviour ───────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute(
        'aria-expanded',
        navLinks.classList.contains('open').toString()
      );
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }
})();


/* ── 2. Scroll-reveal (IntersectionObserver) ──────── */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ── 3. Skill bar animated fill ───────────────────── */
(function initSkillBars() {
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const fill = e.target.querySelector('.skill-fill');
          const pct = fill?.dataset.pct;
          if (fill && pct) fill.style.width = pct + '%';
          skillObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.skill-item').forEach(el => skillObserver.observe(el));
})();


/* ── 4. Stars generator ───────────────────────────── */
(function initStars() {
  const layer = document.querySelector('.stars-layer');
  if (!layer) return;

  const count = 120;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 0.5;
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      opacity: ${Math.random() * 0.5 + 0.1};
      --dur: ${(Math.random() * 4 + 2).toFixed(1)}s;
      --delay: ${(Math.random() * 5).toFixed(1)}s;
    `;
    fragment.appendChild(star);
  }

  layer.appendChild(fragment);
})();


/* ── 5. Canvas particle system ────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const PARTICLE_COUNT = 55;
  const particles = [];

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = canvas.height + Math.random() * 100;
      this.vx    = (Math.random() - 0.5) * 0.4;
      this.vy    = -(Math.random() * 0.8 + 0.2);
      this.size  = Math.random() * 2 + 0.5;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.4 + 0.1;
      // Alternate cyan / violet
      this.color = Math.random() > 0.5 ? '0, 229, 255' : '123, 92, 250';
      this.life  = 0;
      this.maxLife = Math.random() * 200 + 150;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      const half = this.maxLife / 2;
      this.alpha = this.life < half
        ? (this.life / half) * this.maxAlpha
        : ((this.maxLife - this.life) / half) * this.maxAlpha;

      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = `rgba(${this.color}, 0.5)`;
      ctx.fillStyle   = `rgba(${this.color}, 1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle();
    p.life = Math.floor(Math.random() * p.maxLife); // stagger start
    particles.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ── 6. Card 3D tilt effect ───────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.pricing-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotY =  ((x - cx) / cx) * 6;
      const rotX = -((y - cy) / cy) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      const isFeatured = card.classList.contains('card-featured');
      card.style.transform = isFeatured
        ? 'scale(1.04)'
        : 'translateY(0) rotateX(0) rotateY(0)';
    });
  });
})();


/* ── 7. Typewriter effect for hero subtitle ───────── */
(function initTypewriter() {
  const el = document.getElementById('hero-typewriter');
  if (!el) return;

  const phrases = [
    'Sites Web Modernes & Performants',
    'Applications Mobile Réactives',
    'Bases de données MySQL & Firebase',
    'Solutions PHP Back-end robustes',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  function tick() {
    const current = phrases[phraseIdx];

    if (!deleting && charIdx < current.length) {
      el.textContent = current.slice(0, ++charIdx);
      setTimeout(tick, 65);
    } else if (!deleting && !paused) {
      paused = true;
      setTimeout(() => { deleting = true; paused = false; tick(); }, 2000);
    } else if (deleting && charIdx > 0) {
      el.textContent = current.slice(0, --charIdx);
      setTimeout(tick, 32);
    } else {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(tick, 400);
    }
  }

  tick();
})();


/* ── 8. Fiverr CTA smooth alert ──────────────────── */
(function initFiverrLink() {
  const btn = document.getElementById('btn-fiverr-main');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const url = 'https://fr.fiverr.com/s/2K2ewv8';
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();


/* ── 9. Smooth scroll for anchor links ────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
