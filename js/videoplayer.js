/**
 * videoplayer.js — Lecteur video premium Alexdev
 * Features : play/pause, progress+scrub+tooltip, buffer,
 *            volume, speed, fullscreen, keyboard, spinner
 */
(function initVideoPlayer() {
  'use strict';

  const video        = document.getElementById('portfolio-video');
  const frame        = document.getElementById('vp-frame');
  const overlay      = document.getElementById('vp-overlay');
  const bigBtn       = document.getElementById('vp-big-btn');
  const btnPlay      = document.getElementById('vp-btn-play');
  const btnMute      = document.getElementById('vp-btn-mute');
  const btnFS        = document.getElementById('vp-btn-fs');
  const volSlider    = document.getElementById('vp-vol');
  const progressWrap = document.getElementById('vp-progress-wrap');
  const progressFill = document.getElementById('vp-progress-fill');
  const progressBuf  = document.getElementById('vp-progress-buf');
  const progressThumb= document.getElementById('vp-progress-thumb');
  const tooltip      = document.getElementById('vp-tooltip');
  const timeEl       = document.getElementById('vp-time');
  const speedBtn     = document.getElementById('vp-speed');
  const spinner      = document.getElementById('vp-spinner');

  if (!video || !frame) return;

  /* ── Icons ─────────────────────────────────────────── */
  const SVG = {
    play : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
    vol  : '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
    mute : '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>',
    fsOn : '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    fsOff: '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
  };

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  let speedIdx = 2;
  let scrubbing = false;

  /* ── Format time ──────────────────────────────────── */
  function fmt(s) {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  }

  /* ── Play / Pause ─────────────────────────────────── */
  function togglePlay() {
    video.paused ? video.play() : video.pause();
  }

  video.addEventListener('play', () => {
    frame.classList.add('playing');
    overlay.classList.add('hidden');
    if (btnPlay) btnPlay.innerHTML = SVG.pause;
  });

  video.addEventListener('pause', () => {
    frame.classList.remove('playing');
    overlay.classList.remove('hidden');
    if (btnPlay) btnPlay.innerHTML = SVG.play;
  });

  video.addEventListener('ended', () => {
    frame.classList.remove('playing');
    overlay.classList.remove('hidden');
    if (btnPlay) btnPlay.innerHTML = SVG.play;
    // reset progress
    updateProgress();
  });

  bigBtn?.addEventListener('click', togglePlay);
  btnPlay?.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
  frame.addEventListener('click', e => {
    if (e.target === frame || e.target === video) togglePlay();
  });

  /* ── Progress ─────────────────────────────────────── */
  function updateProgress() {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (progressFill)  progressFill.style.width = pct + '%';
    if (progressThumb) progressThumb.style.left  = pct + '%';
    if (timeEl) {
      timeEl.innerHTML = '<span class="vp-cur">' + fmt(video.currentTime) + '</span>'
        + '<span class="vp-sep">/</span>' + fmt(video.duration);
    }
  }

  video.addEventListener('timeupdate', updateProgress);

  video.addEventListener('progress', () => {
    if (!video.duration || !progressBuf) return;
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= video.currentTime &&
          video.currentTime <= video.buffered.end(i)) {
        progressBuf.style.width = (video.buffered.end(i) / video.duration * 100) + '%';
        break;
      }
    }
  });

  function scrubTo(clientX) {
    if (!progressWrap) return;
    const rect  = progressWrap.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * (video.duration || 0);
  }

  progressWrap?.addEventListener('mousedown', e => { scrubbing = true; scrubTo(e.clientX); });
  window.addEventListener('mousemove', e => {
    if (scrubbing) scrubTo(e.clientX);
    if (tooltip && progressWrap?.matches(':hover')) {
      const rect  = progressWrap.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      tooltip.textContent = fmt(ratio * (video.duration || 0));
      tooltip.style.left  = (ratio * 100) + '%';
    }
  });
  window.addEventListener('mouseup', () => { scrubbing = false; });

  /* ── Volume ───────────────────────────────────────── */
  function updateMuteIcon() {
    if (btnMute) btnMute.innerHTML = (video.muted || video.volume === 0) ? SVG.mute : SVG.vol;
  }

  btnMute?.addEventListener('click', () => { video.muted = !video.muted; updateMuteIcon(); });

  volSlider?.addEventListener('input', () => {
    video.volume  = parseFloat(volSlider.value);
    video.muted   = video.volume === 0;
    updateMuteIcon();
  });

  /* ── Speed ────────────────────────────────────────── */
  speedBtn?.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    video.playbackRate = speeds[speedIdx];
    speedBtn.textContent = speeds[speedIdx] + 'x';
  });

  /* ── Fullscreen ───────────────────────────────────── */
  function toggleFS() {
    document.fullscreenElement ? document.exitFullscreen() : frame.requestFullscreen?.();
  }

  btnFS?.addEventListener('click', toggleFS);
  document.addEventListener('fullscreenchange', () => {
    if (btnFS) btnFS.innerHTML = document.fullscreenElement ? SVG.fsOff : SVG.fsOn;
  });

  /* ── Keyboard ─────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (['INPUT','TEXTAREA','BUTTON','SELECT'].includes(tag)) return;
    switch (e.key) {
      case ' ':
      case 'k':  e.preventDefault(); togglePlay(); break;
      case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(video.duration||0, video.currentTime + 5); break;
      case 'ArrowLeft':  e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); break;
      case 'm':  video.muted = !video.muted; updateMuteIcon(); break;
      case 'f':  toggleFS(); break;
    }
  });

  /* ── Spinner ──────────────────────────────────────── */
  video.addEventListener('waiting', () => spinner?.classList.add('active'));
  video.addEventListener('canplay', () => spinner?.classList.remove('active'));

  /* ── Init icons ───────────────────────────────────── */
  if (btnPlay)  btnPlay.innerHTML  = SVG.play;
  if (btnMute)  btnMute.innerHTML  = SVG.vol;
  if (btnFS)    btnFS.innerHTML    = SVG.fsOn;
  if (volSlider) volSlider.value   = '1';

  /* ── Fiverr CTA buttons ───────────────────────────── */
  const fiverrUrl = 'https://fr.fiverr.com/s/2K2ewv8';
  const fiverrBtns = ['btn-starter','btn-pro','btn-elite','btn-fiverr-main','btn-fiverr-cta','btn-fiverr-about'];
  fiverrBtns.forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      window.open(fiverrUrl, '_blank', 'noopener,noreferrer');
    });
  });

})();