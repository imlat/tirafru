/* ==================== BIRTHDAY SURPRISE SITE - SCRIPT.JS ==================== */
/* Handles all interactivity, animations, and user interactions */

/* ========== SECTION 1: UTILITIES & HELPERS ========== */
const qs = s => document.querySelector(s);

/* ========== SECTION 2: LOADING ANIMATION ========== */
window.addEventListener('load', () => {
  setTimeout(() => {
    qs('#loading').style.display = 'none';
  }, 900);
});

/* ========== SECTION 3: WELCOME OVERLAY & TYPING EFFECT ========== */
// DOM elements for welcome overlay
const welcome = qs('#welcome');
const guestPlaceholder = qs('#guestPlaceholder');

/**
 * Typing text effect - types out text character by character
 * @param {Element} el - Target element
 * @param {string} text - Text to type
 * @param {number} speed - Speed in milliseconds between characters
 */
function typeText(el, text, speed = 28) {
  el.textContent = '';
  let i = 0;
  const id = setInterval(() => {
    el.textContent += text[i++] || '';
    if (i > text.length) clearInterval(id);
  }, speed);
}

/**
 * Auto-close welcome overlay after showing
 */
setTimeout(() => {
  welcome.style.display = 'none';
}, 4000); // Show for 4 seconds then auto-proceed

/**
 * Allow clicking on overlay to close and proceed immediately
 */
welcome.addEventListener('click', () => {
  welcome.style.display = 'none';
});

/* ========== SECTION 4: PARTICLE CANVAS - FLOATING HEARTS, STARS & PETALS ========== */
const canvas = qs('#particles');
const ctx = canvas.getContext('2d');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const compactViewportQuery = window.matchMedia('(max-width: 768px)');
const lowPowerMode = () => compactViewportQuery.matches || reducedMotionQuery.matches || (navigator.deviceMemory && navigator.deviceMemory <= 4);
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
let particleFrame = 0;
let particleScrollTimer;
let particlesPaused = lowPowerMode();

const topLeftPic = qs('#top-left-pic');
if (topLeftPic) {
  const tlCtx = topLeftPic.getContext('2d');
  const img = new Image();
  img.src = 'fspv.webp';
  img.onload = () => {
    tlCtx.clearRect(0, 0, topLeftPic.width, topLeftPic.height);
    tlCtx.drawImage(img, 0, 0, topLeftPic.width, topLeftPic.height);
  };
  img.onerror = () => {
    tlCtx.clearRect(0, 0, topLeftPic.width, topLeftPic.height);
    tlCtx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    tlCtx.fillRect(0, 0, topLeftPic.width, topLeftPic.height);
  };
}

// Resize canvas on window resize
window.addEventListener('resize', () => {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}, { passive: true });

// Particle array storage
const particles = [];

const canvasTone = {
  bgStops: ['rgba(184, 255, 212, 0.04)', 'rgba(216, 255, 238, 0.06)', 'rgba(198, 246, 206, 0.04)'],
  heart: ['rgba(198, 255, 220, 0.95)', 'rgba(163, 242, 189, 0.95)'],
  star: ['rgba(255, 226, 160, 0.94)', 'rgba(255, 199, 104, 0.88)'],
  petal: ['rgba(226, 255, 231, 0.96)', 'rgba(255, 246, 196, 0.9)']
};

// Helper: random number generator
const rand = (min, max) => Math.random() * (max - min) + min;

/**
 * Particle class - represents a floating heart, star, or petal
 */
class Particle {
  constructor(x, y, vx, vy, size, type) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.life = rand(140, 360);
    this.age = 0;
    this.type = type;
  }

  step() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.002; // gravity
    this.age++;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.type === 'heart') {
      ctx.fillStyle = canvasTone.heart[0];
      ctx.shadowColor = 'rgba(90, 167, 118, 0.25)';
      ctx.shadowBlur = 8;
      drawHeart(ctx, 0, 0, this.size);
    } else if (this.type === 'star') {
      ctx.fillStyle = canvasTone.star[0];
      ctx.shadowColor = 'rgba(221, 176, 73, 0.22)';
      ctx.shadowBlur = 10;
      drawStar(ctx, 0, 0, this.size);
    } else {
      ctx.fillStyle = canvasTone.petal[0];
      ctx.shadowColor = 'rgba(164, 209, 124, 0.22)';
      ctx.shadowBlur = 8;
      drawPetal(ctx, 0, 0, this.size);
    }
    ctx.restore();
  }
}

/**
 * Draw heart shape
 */
function drawHeart(ctx, x, y, s) {
  ctx.beginPath();
  const r = s / 2;
  ctx.moveTo(x, y);
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 8);
  ctx.scale(1, 1);
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-r, -r * 0.8, -r * 1.4, r / 2, 0, r * 1.4);
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(r, -r * 0.8, r * 1.4, r / 2, 0, r * 1.4);
  ctx.fill();
}

/**
 * Draw star shape
 */
function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + 72 * i) / 180 * Math.PI) * r, -Math.sin((18 + 72 * i) / 180 * Math.PI) * r);
    ctx.lineTo(Math.cos((54 + 72 * i) / 180 * Math.PI) * r / 2, -Math.sin((54 + 72 * i) / 180 * Math.PI) * r / 2);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw sakura petal shape
 */
function drawPetal(ctx, x, y, s) {
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.6, s, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Spawn new particles from top of canvas
 */
function spawn() {
  const x = rand(0, W);
  const y = -20;
  const t = Math.random();
  const type = t < 0.45 ? 'heart' : t < 0.8 ? 'petal' : 'star';
  const p = new Particle(x, y, rand(-0.25, 0.25), rand(0.2, 0.9), rand(6, 18), type);
  particles.push(p);
  // Keep this decorative layer deliberately light on desktop.
  if (particles.length > 48) particles.shift();
}

/**
 * Main animation loop for particles
 */
function loop(ts) {
  // Mobile devices skip this decorative canvas, which otherwise repaints
  // beneath every scroll gesture.
  if (particlesPaused || document.hidden) {
    requestAnimationFrame(loop);
    return;
  }
  // 30fps remains smooth for ambient decoration and frees the main thread.
  if (++particleFrame % 2) {
    requestAnimationFrame(loop);
    return;
  }
  ctx.clearRect(0, 0, W, H);

  // Spawn new particles
  if (Math.random() < 0.28) spawn();

  // Update and draw all particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.step();
    p.draw(ctx);
    if (p.y > H + 40 || p.age > p.life) particles.splice(i, 1);
  }

  requestAnimationFrame(loop);
}

// Start particle animation loop
requestAnimationFrame(loop);

function updateParticleMode() {
  particlesPaused = lowPowerMode();
  if (particlesPaused) {
    particles.length = 0;
    ctx.clearRect(0, 0, W, H);
  }
}
compactViewportQuery.addEventListener('change', updateParticleMode);
reducedMotionQuery.addEventListener('change', updateParticleMode);
document.addEventListener('visibilitychange', updateParticleMode);
window.addEventListener('scroll', () => {
  if (lowPowerMode()) return;
  particlesPaused = true;
  clearTimeout(particleScrollTimer);
  particleScrollTimer = setTimeout(() => { particlesPaused = false; }, 140);
}, { passive: true });

/* ========== SECTION 5: LETTER / MESSAGE REVEAL ON SCROLL ========== */
const letter = qs('#letter');
const io = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  },
  { threshold: 0.18 }
);
io.observe(letter);

/* ========== SECTION 6: GALLERY & LIGHTBOX ========== */
const lightbox = qs('#lightbox');
const lightboxImg = qs('#lightboxImg');
const lightboxMeta = qs('#lightboxMeta');
const closeLightbox = qs('#closeLightbox');

/**
 * Gallery click handler - opens image in lightbox
 */
qs('#gallery').addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  const img = card.querySelector('img');
  // If there is no image (e.g. placeholder), do nothing
  if (!img) return;
  const caption = card.querySelector('.caption')?.textContent || '';
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || caption;
  lightboxMeta.textContent = caption;
  lightbox.classList.add('show');
});

/**
 * Close lightbox
 */
function closeLB() {
  lightbox.classList.remove('show');
  lightboxImg.src = '';
}

closeLightbox.addEventListener('click', closeLB);

/**
 * Click outside lightbox to close
 */
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLB();
});

/* ========== BIRTHDAY CELEBRATION ========== */
// Remove the countdown UI without changing the page markup or styles.
qs('#birthdayCountdown')?.remove();

const birthdayExperience = qs('#birthdayExperience');
const celebrationSky = qs('#celebrationSky');
const premiumCake = qs('#premiumCake');
const premiumCutButton = qs('#premiumCutButton');
const cakeKnifePremium = qs('#cakeKnifePremium');
const cakeCrumbsPremium = qs('#cakeCrumbsPremium');
const congratsCard = qs('#congratsCard');
const closeCongrats = qs('#closeCongrats');
const BIRTHDAY_EXPERIENCE_STORAGE_KEY = 'birthday-cake-experience-shown-v1';

function hasSeenBirthdayExperience() {
  try {
    return localStorage.getItem(BIRTHDAY_EXPERIENCE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markBirthdayExperienceSeen() {
  try {
    localStorage.setItem(BIRTHDAY_EXPERIENCE_STORAGE_KEY, 'true');
  } catch {
    // If storage is unavailable, show the experience on future visits too.
  }
}

function showBirthdayExperience() {
  if (hasSeenBirthdayExperience()) return;
  markBirthdayExperienceSeen();
  birthdayExperience.classList.add('is-visible');
  birthdayExperience.setAttribute('aria-hidden', 'false');
  startBirthdayArrivalAudio();
  createCelebrationParticles(120);
}

function createCelebrationParticles(amount = 90) {
  const icons = ['✦', '✧', '♥', '★', '🎈', '🎊', '•'];
  const colors = ['#ff6b8f', '#ffd166', '#7dd3fc', '#c4b5fd', '#f9a8d4'];
  const particleAmount = compactViewportQuery.matches ? Math.min(amount, 42) : amount;
  for (let i = 0; i < particleAmount; i++) {
    const particle = document.createElement('i');
    particle.className = 'celebration-particle';
    particle.textContent = icons[i % icons.length];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.color = colors[i % colors.length];
    particle.style.setProperty('--drift', `${(Math.random() - .5) * 220}px`);
    particle.style.setProperty('--delay', `${Math.random() * .8}s`);
    particle.style.setProperty('--duration', `${2.8 + Math.random() * 2.4}s`);
    celebrationSky.appendChild(particle);
    setTimeout(() => particle.remove(), 6200);
  }
}
function scatterCakeCrumbs() {
  for (let i = 0; i < 20; i++) {
    const crumb = document.createElement('b');
    crumb.style.setProperty('--x', `${(Math.random() - .5) * 180}px`);
    crumb.style.setProperty('--y', `${30 + Math.random() * 110}px`);
    crumb.style.setProperty('--delay', `${Math.random() * .12}s`);
    cakeCrumbsPremium.appendChild(crumb);
    setTimeout(() => crumb.remove(), 1100);
  }
}
let cakeCuts = 0;
let cakeCutAnimating = false;
function cutPremiumCake() {
  if (cakeCutAnimating || cakeCuts >= 3) return;
  cakeCutAnimating = true;
  cakeCuts += 1;
  premiumCutButton.disabled = true;
  cakeKnifePremium.classList.remove('is-cutting');
  void cakeKnifePremium.offsetWidth;
  cakeKnifePremium.classList.add('is-cutting');
  premiumCake.classList.remove('is-being-cut');
  void premiumCake.offsetWidth;
  premiumCake.classList.add('is-being-cut');
  scatterCakeCrumbs();

  if (cakeCuts < 3) {
    premiumCutButton.textContent = `🎂 Cut Again (${cakeCuts}/3)`;
    setTimeout(() => {
      premiumCutButton.disabled = false;
      cakeCutAnimating = false;
    }, 850);
    return;
  }

  premiumCutButton.textContent = 'Cake is ready! ✨';
  setTimeout(() => { premiumCake.classList.add('is-cut'); createCelebrationParticles(45); }, 540);
  setTimeout(() => {
    congratsCard.classList.add('is-visible');
    congratsCard.setAttribute('aria-hidden', 'false');
    createCelebrationParticles(70);
    cakeCutAnimating = false;
  }, 1800);
}
premiumCutButton.addEventListener('click', cutPremiumCake);
closeCongrats.addEventListener('click', () => {
  congratsCard.classList.remove('is-visible');
  congratsCard.setAttribute('aria-hidden', 'true');
  birthdayExperience.classList.remove('is-visible');
  birthdayExperience.setAttribute('aria-hidden', 'true');
  startCakeEndingAudio();
});

window.addEventListener('load', () => {
  setTimeout(showBirthdayExperience, 500);
}, { once: true });
/* ========== SECTION 9: SURPRISE MODAL & CONFETTI ========== */
/* Surprise modal elements (queried dynamically) */
const surprise = qs('#surprise');
let surpriseBtn = qs('#surpriseBtn');
let closeSurprise = qs('#closeSurprise');
let surpriseTypingTimer = null;

function openSurpriseHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  try {
    const s = qs('#surprise');
    if (!s) { console.warn('Surprise element not found'); return; }
    if (s.classList.contains('show')) return;
    s.classList.add('show');
    if (typeof startConfetti === 'function') startConfetti();
    showSurpriseMessage();
  } catch (err) {
    console.error('openSurpriseHandler error', err);
  }
}

function closeSurpriseHandler(e) {
  if (e && e.preventDefault) e.preventDefault();
  try {
    const s = qs('#surprise');
    if (!s) { console.warn('Surprise element not found'); return; }
    s.classList.remove('show');
    if (typeof stopConfetti === 'function') stopConfetti();
    if (surpriseTypingTimer) {
      clearTimeout(surpriseTypingTimer);
      surpriseTypingTimer = null;
    }
  } catch (err) {
    console.error('closeSurpriseHandler error', err);
  }
}

function closeSurpriseByButton() {
  closeSurpriseHandler({ preventDefault() {} });
}

function showSurpriseMessage(message = '🌻nnootthhiinngg here,marakha😁') {
  const finalMsgEl = qs('#finalMsg');
  if (!finalMsgEl) return;
  finalMsgEl.textContent = '';
  finalMsgEl.classList.remove('animate');
  if (surpriseTypingTimer) {
    clearTimeout(surpriseTypingTimer);
  }
  surpriseTypingTimer = setTimeout(() => {
    typeText(finalMsgEl, message, 22);
    finalMsgEl.classList.add('animate');
    surpriseTypingTimer = null;
  }, 220);
}

function bindSurpriseHandlers() {
  surpriseBtn = qs('#surpriseBtn');
  closeSurprise = qs('#closeSurprise');
  const surpriseModal = qs('#surprise');

  if (surpriseBtn) {
    surpriseBtn.removeEventListener('click', openSurpriseHandler);
    surpriseBtn.addEventListener('click', openSurpriseHandler);
  }

  if (closeSurprise) {
    closeSurprise.removeEventListener('click', closeSurpriseHandler);
    closeSurprise.addEventListener('click', closeSurpriseHandler);
  }

  if (surpriseModal) {
    surpriseModal.removeEventListener('click', handleSurpriseBackdropClick);
    surpriseModal.addEventListener('click', handleSurpriseBackdropClick);
  }
}

function handleSurpriseBackdropClick(e) {
  if (e.target.id === 'surprise') {
    closeSurpriseHandler(e);
  }
}

bindSurpriseHandlers();
// Expose functions to `window` as a robust fallback for inline handlers
// Provide globally-named fallbacks that won't conflict with element IDs
window.openSurpriseModal = openSurpriseHandler;
window.closeSurpriseModal = closeSurpriseHandler;

/* ========== SECTION 8: CONFETTI ANIMATION ========== */
let confettiCanvas, confCtx, confInterval;

/**
 * Start confetti animation
 */
function startConfetti() {
  if (confettiCanvas) return; // Already running
  confettiCanvas = document.createElement('canvas');
  confettiCanvas.style.position = 'fixed';
  confettiCanvas.style.inset = '0';
  confettiCanvas.style.pointerEvents = 'none';
  confettiCanvas.style.zIndex = 1100;
  document.body.appendChild(confettiCanvas);

  confCtx = confettiCanvas.getContext('2d');
  confettiCanvas.width = innerWidth;
  confettiCanvas.height = innerHeight;

  const confs = [];
  for (let i = 0; i < 120; i++) {
    confs.push({
      x: Math.random() * innerWidth,
      y: Math.random() * -innerHeight,
      vy: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 8 + 4,
      color: ['#88c96f', '#d7f6df', '#c5df8f', '#f9fff5'][Math.floor(Math.random() * 4)]
    });
  }

  confInterval = setInterval(() => {
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let c of confs) {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.02;
      confCtx.fillStyle = c.color;
      confCtx.fillRect(c.x, c.y, c.size, c.size * 0.6);
      if (c.y > innerHeight + 20) {
        c.y = -20;
        c.x = Math.random() * innerWidth;
      }
    }
  }, 16);
}

/**
 * Stop confetti animation
 */
function stopConfetti() {
  if (confettiCanvas) {
    clearInterval(confInterval);
    confettiCanvas.remove();
    confettiCanvas = null;
  }
}

/* ========== SECTION 9: AMBIENT MUSIC - SONG + FALLBACK ========== */
const song = qs('#birthdaySong');
if (song) song.loop = true;

/* Birthday effect audio: background music resumes from its paused position. */
const arrivalSound = new Audio('acc1.mp3');
const cakeClosedSound = new Audio('cccbk00.mp3');
const endingSound = new Audio('acen2.mp3');
[arrivalSound, cakeClosedSound, endingSound].forEach(audio => { audio.preload = 'auto'; });
let birthdayAudioSequenceActive = false;
let pendingBirthdayEffect = null;
function stopEffect(audio) { audio.pause(); audio.currentTime = 0; }
function playEffect(audio) {
  stopEffect(audio);
  return audio.play().then(() => {
    pendingBirthdayEffect = null;
  }).catch(() => {
    // Browsers can block sound started on page load; retry on the first interaction.
    pendingBirthdayEffect = audio;
  });
}
function retryBirthdayEffect() {
  if (!pendingBirthdayEffect) return;
  const audio = pendingBirthdayEffect;
  audio.play().then(() => {
    pendingBirthdayEffect = null;
  }).catch(() => {});
}
document.addEventListener('pointerdown', retryBirthdayEffect, { once: true, passive: true });
document.addEventListener('keydown', retryBirthdayEffect, { once: true });
function pauseBackgroundForBirthday() {
  if (!song) return;
  song.pause(); // Keep currentTime so thpbk.mp3 resumes where it stopped.
  playing = false;
  if (playBtn) { playBtn.textContent = 'Play Song ♫'; playBtn.setAttribute('aria-pressed', 'false'); }
}
function resumeBackgroundAfterBirthday() {
  if (!song) return;
  song.play().then(() => {
    playing = true;
    if (playBtn) { playBtn.textContent = 'Pause ♫'; playBtn.setAttribute('aria-pressed', 'true'); }
  }).catch(() => showAudioPrompt());
}
function startBirthdayArrivalAudio() {
  birthdayAudioSequenceActive = true;
  pauseBackgroundForBirthday();
  stopEffect(cakeClosedSound); stopEffect(endingSound);
  playEffect(arrivalSound);
}
arrivalSound.addEventListener('ended', () => {
  if (!birthdayAudioSequenceActive) return;
  startCakeCuttingAudio();
});

function startCakeCuttingAudio() {
  if (!birthdayAudioSequenceActive) return;
  stopEffect(arrivalSound);
  stopEffect(endingSound);
  cakeClosedSound.loop = true;
  playEffect(cakeClosedSound);
}
function startCakeEndingAudio() {
  if (!birthdayAudioSequenceActive) return;
  stopEffect(arrivalSound);
  cakeClosedSound.loop = false;
  stopEffect(cakeClosedSound);
  playEffect(endingSound);
}
endingSound.addEventListener('ended', () => {
  if (!birthdayAudioSequenceActive) return;
  birthdayAudioSequenceActive = false;
  resumeBackgroundAfterBirthday();
});
const songPicker = qs('#songPicker');
const trackLabel = qs('.track-label');
const changeSongBtn = qs('#changeSong');
let audioCtx, master, osc1, osc2, gainNode, playing = false;
const playBtn = qs('#playPause');
let songChosen = !!(song && song.src);
if (songChosen && trackLabel) {
  trackLabel.textContent = 'Song: the..gg';
}

/**
 * Initialize Web Audio API context and oscillators
 */
function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value = 0.0;
  master.connect(audioCtx.destination);

  // Two detuned oscillators for a gentle pad sound
  osc1 = audioCtx.createOscillator();
  osc2 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.value = 220;
  osc2.frequency.value = 220 * 1.007; // slight detuning

  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.0;

  // Gentle LFO (low frequency oscillator) to breathe
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.18;
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(master);

  osc1.start();
  osc2.start();
  lfo.start();
}

/**
 * Start music playback
 */
function startMusic() {
  if (song) {
    song.play().catch(() => {});
    playing = true;
    playBtn.textContent = 'Pause ♫';
    playBtn.setAttribute('aria-pressed', 'true');
    return;
  }

  if (!audioCtx) initAudio();
  master.gain.cancelScheduledValues(audioCtx.currentTime);
  master.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 1.2);
  playing = true;
  playBtn.textContent = 'Pause ♫';
}

/**
 * Pause music playback
 */
function pauseMusic() {
  if (song) {
    song.pause();
    playing = false;
    playBtn.textContent = 'Play Song ♫';
    playBtn.setAttribute('aria-pressed', 'false');
    return;
  }

  if (!audioCtx) return;
  master.gain.cancelScheduledValues(audioCtx.currentTime);
  master.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.8);
  playing = false;
  playBtn.textContent = 'Play Song ♫';
}

/**
 * Play/Pause button handler
 */
playBtn.addEventListener('click', () => {
  // First tap: show song picker if no song chosen yet
  if (!songChosen) {
    if (songPicker) {
      const showing = songPicker.classList.toggle('show');
      songPicker.setAttribute('aria-hidden', String(!showing));
    }
    return;
  }

  // If a song was chosen, toggle play/pause
  if (song) {
    if (!playing) {
      song.play().catch(() => {});
      playing = true;
      playBtn.textContent = 'Pause ♫';
      playBtn.setAttribute('aria-pressed', 'true');
    } else {
      song.pause();
      playing = false;
      playBtn.textContent = 'Play Song ♫';
      playBtn.setAttribute('aria-pressed', 'false');
    }
    return;
  }

  if (!audioCtx) {
    initAudio();
  }
  if (!playing) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    startMusic();
  } else {
    pauseMusic();
  }
});

// Song selection buttons: set src and play
if (songPicker) {
  songPicker.querySelectorAll('.song-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const src = btn.dataset.src;
      const label = btn.textContent || 'Custom Track';
      if (song && src) {
        song.src = src;
        try { song.load(); } catch (err) {}
        song.play().catch(() => {});
        // mark this option as selected and clear others (class + inline style fallback)
        songPicker.querySelectorAll('.song-option').forEach(b => {
          b.classList.remove('selected');
          b.style.color = ''; // remove inline color from others
        });
        btn.classList.add('selected');
        btn.style.color = '#0f3426'; // inline fallback to ensure color change
        playing = true;
        songChosen = true;
        playBtn.textContent = 'Pause ♫';
        playBtn.setAttribute('aria-pressed', 'true');
        songPicker.classList.remove('show');
        songPicker.setAttribute('aria-hidden', 'true');
        if (trackLabel) trackLabel.textContent = 'Song: ' + label;
      }
    });
  });
}

if (changeSongBtn && songPicker) {
  changeSongBtn.addEventListener('click', () => {
    const showing = songPicker.classList.toggle('show');
    songPicker.setAttribute('aria-hidden', String(!showing));
  });
}

/* ========== SECTION 10: ACCESSIBILITY & KEYBOARD SHORTCUTS ========== */
/* ========== AUTOPLAY ATTEMPT + USER-GESTURE FALLBACK ========== */
/**
 * Try to autoplay the `song` audio element. If the browser blocks autoplay,
 * register a one-time user-gesture listener (click/keydown/touch) to start playback.
 */
function attemptAutoplay() {
  if (!song) return;
  // Try muted autoplay first (many browsers allow muted autoplay)
  try {
    song.autoplay = true;
    song.playsInline = true;
    song.muted = true; // start muted to increase autoplay success
  } catch (err) {}

  song.play().then(() => {
    // Playback started (muted). Try to unmute shortly after.
    setTimeout(() => {
      try {
        song.muted = false;
        // try resume audible playback; some browsers still block unmute without gesture
        song.play().then(() => {
          playing = true;
          if (playBtn) {
            playBtn.textContent = 'Pause ♫';
            playBtn.setAttribute('aria-pressed', 'true');
          }
        }).catch(() => {
          // Unmute/play blocked — show prompt to enable audio
          showAudioPrompt();
        });
      } catch (e) {
        showAudioPrompt();
      }
    }, 300);
  }).catch(() => {
    // Autoplay blocked entirely — show prompt to enable audio
    showAudioPrompt();
  });
}

function showAudioPrompt() {
  let prompt = document.querySelector('.audio-prompt');
  if (!prompt) {
    prompt = document.createElement('div');
    prompt.className = 'audio-prompt';
    prompt.innerHTML = '<span>Enable background audio</span><button id="enableAudioBtn">Enable</button>';
    document.body.appendChild(prompt);
    const btn = document.getElementById('enableAudioBtn');
    btn.addEventListener('click', () => {
      // try to play and unmute on user gesture
      song.muted = false;
      song.play().then(() => {
        playing = true;
        if (playBtn) {
          playBtn.textContent = 'Pause ♫';
          playBtn.setAttribute('aria-pressed', 'true');
        }
        prompt.classList.remove('show');
      }).catch(() => {
        // ignore
      });
    });
  }
  prompt.classList.add('show');
}

// Attempt autoplay shortly after load (gives resources a moment to settle)
window.addEventListener('load', () => {
  setTimeout(attemptAutoplay, 600);
});

/**
 * Escape key closes modals
 */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLB();
    surprise.classList.remove('show');
  }
});

/* ========== SECTION 11: RESPONSIVE NAV / HAMBURGER ========== */
const navToggle = qs('#navToggle');
const navMenu = qs('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('show');
  });

  // Close the menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.classList.contains('show')) return;
    const target = e.target;
    if (target === navMenu || navMenu.contains(target) || target === navToggle) return;
    navMenu.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
  });

  // Close on resize to avoid stale state
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720 && navMenu.classList.contains('show')) {
      navMenu.classList.remove('show');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Enable smooth scrolling
 */
document.documentElement.style.scrollBehavior = 'smooth';

/* ========== FEEDBACK FORM HANDLER ========== */
// IMPORTANT: Replace the string below with your Web3Forms access key.
// Paste your access key between the quotes: const WEB3FORMS_ACCESS_KEY = 'YOUR_KEY_HERE';
const form = document.getElementById("feedbackForm");
const status = document.getElementById("feedbackStatus");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    const formData = new FormData(form);

    const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        status.innerHTML = "✅ Thank you! Your feedback has been sent.";
        status.style.color = "#6dff92";
        form.reset();
    } else {
        status.innerHTML = "❌ Failed to send feedback.";
        status.style.color = "#ff8b8b";
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = "Submit Feedback";
});

/* Page-section entrance choreography. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = document.querySelectorAll('.app > section:not(.hero)');
  if (reducedMotion || !('IntersectionObserver' in window)) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px' });

  sections.forEach((section, index) => {
    section.classList.add('reveal-on-scroll');
    section.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
    revealObserver.observe(section);
  });
})();
