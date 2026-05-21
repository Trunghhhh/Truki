/* ═══════════════════════════════════════════════════════
   THPT 2026 COUNTDOWN — MAIN APPLICATION LOGIC
   Student: Phùng Đôn Kiên | Kỹ thuật Tự động hóa
   ═══════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────
const EXAM_DATE = new Date('2026-06-11T07:35:00+07:00');  // THPT 2026 — Môn Toán (Khối A1 — Ngày thi đầu tiên)

const AI_MESSAGES = [
  'Ứng viên kỹ sư được phát hiện.',
  'Hệ thống logic ổn định.',
  'Cần tăng cường module Toán.',
  'Xác suất đỗ đại học đang tăng.',
  'Kỹ sư tương lai không bỏ cuộc.',
  'Mỗi giây đều quan trọng.',
  'Đang phân tích hiệu suất học tập...',
  'Module Vật Lí cần được tăng cường.',
  'Tiến độ ôn tập: ĐẠT CHUẨN.',
  'Năng lượng học tập: TỐI ĐA.',
  'Kỹ thuật Tự động hóa — Mục tiêu đã khóa.',
  'Hệ thống xác nhận: PDK-2026-A1 ONLINE.',
];

const QUOTES = [
  'Không ai có thể học thay bạn.',
  'Mỗi giây trôi qua là một cơ hội.',
  'Kỹ sư tương lai không bỏ cuộc.',
  'Mỗi ngày học là một bước tiến tới thành công.',
];

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
let logoClickCount = 0;
let overdriveActive = false;
let currentQuote = 0;
let totalMissionXP = 0;
let totalXP = 4750;
let introComplete = false;
let aiMsgIndex = 0;
let cursorX = 0, cursorY = 0;
const trailDots = [];
const MAX_TRAIL = 18;
const completedMissions = new Set();

// ─────────────────────────────────────────────────────────
// CURSOR TRAIL
// ─────────────────────────────────────────────────────────
function initCursor() {
  const glow = document.getElementById('cursorGlow');
  const container = document.getElementById('cursorTrailContainer');

  // Pre-create trail dots
  for (let i = 0; i < MAX_TRAIL; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    dot.style.opacity = '0';
    container.appendChild(dot);
    trailDots.push({ el: dot, x: 0, y: 0, life: 0 });
  }

  let trailIdx = 0;
  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    glow.style.left = cursorX + 'px';
    glow.style.top  = cursorY + 'px';

    const td = trailDots[trailIdx % MAX_TRAIL];
    td.el.style.left    = cursorX + 'px';
    td.el.style.top     = cursorY + 'px';
    td.el.style.opacity = '0.7';
    td.el.style.width   = '5px';
    td.el.style.height  = '5px';
    td.el.style.transition = 'none';
    setTimeout(() => {
      td.el.style.transition = 'opacity 0.6s, width 0.6s, height 0.6s';
      td.el.style.opacity = '0';
      td.el.style.width = '1px';
      td.el.style.height = '1px';
    }, 30);
    trailIdx++;
  });
}

// ─────────────────────────────────────────────────────────
// BACKGROUND CANVAS — GRID + CIRCUIT + PARTICLES
// ─────────────────────────────────────────────────────────
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Grid
  const GRID = 60;
  // Particles
  const pts = [];
  for (let i = 0; i < 80; i++) {
    pts.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    });
  }

  // Math symbols floating
  const mathSymbols = ['∫', '∑', '∂', 'π', '√', 'λ', 'Δ', '∞', 'α', 'β', 'θ', 'ω', '⊕', '∇'];
  const floatSyms = [];
  for (let i = 0; i < 14; i++) {
    floatSyms.push({
      sym: mathSymbols[i],
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vy: -(Math.random() * 0.2 + 0.05),
      a: Math.random() * 0.12 + 0.04,
      size: Math.random() * 14 + 10,
    });
  }

  // Data rain columns
  const cols = Math.floor(1920 / 22);
  const rain = [];
  for (let i = 0; i < cols; i++) {
    rain.push({
      x: i * 22,
      y: Math.random() * -1000,
      speed: Math.random() * 1.5 + 0.5,
      chars: [],
      len: Math.floor(Math.random() * 8) + 4,
    });
    for (let j = 0; j < 10; j++) {
      rain[i].chars.push(Math.floor(Math.random() * 10).toString());
    }
  }

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── GRID ──
    ctx.save();
    const baseAlpha = overdriveActive ? 0.04 : 0.025;
    const gridColor = overdriveActive ? '255,34,68' : '0,245,255';
    ctx.strokeStyle = `rgba(${gridColor},${baseAlpha})`;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // ── DATA RAIN ──
    ctx.save();
    ctx.font = '11px "Share Tech Mono", monospace';
    for (const col of rain) {
      col.y += col.speed;
      if (col.y > H + col.len * 18) {
        col.y = -col.len * 18;
        col.x = Math.floor(Math.random() * (W / 22)) * 22;
      }
      for (let j = 0; j < col.len; j++) {
        const alpha = (1 - j / col.len) * 0.10;
        if (overdriveActive) {
          ctx.fillStyle = `rgba(255,34,68,${alpha})`;
        } else {
          ctx.fillStyle = j === 0
            ? `rgba(0,245,255,${alpha * 2})`
            : `rgba(0,180,255,${alpha})`;
        }
        if (Math.random() < 0.02) {
          col.chars[j] = Math.floor(Math.random() * 10).toString();
        }
        ctx.fillText(col.chars[j] || '0', col.x, col.y - j * 16);
      }
    }
    ctx.restore();

    // ── FLOATING MATH SYMBOLS ──
    ctx.save();
    for (const s of floatSyms) {
      s.y += s.vy;
      if (s.y < -30) s.y = H + 30;
      ctx.font = `${s.size}px "Rajdhani", sans-serif`;
      ctx.fillStyle = overdriveActive
        ? `rgba(255,34,68,${s.a})`
        : `rgba(0,245,255,${s.a})`;
      ctx.fillText(s.sym, s.x % W, s.y);
    }
    ctx.restore();

    // ── PARTICLES + CONNECTIONS ──
    ctx.save();
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x % W, p.y % H, p.r, 0, Math.PI * 2);
      const pc = overdriveActive ? '255,34,68' : '0,245,255';
      ctx.fillStyle = `rgba(${pc},${p.a * 0.5})`;
      ctx.fill();

      for (const q of pts) {
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${pc},${(1 - dist / 120) * 0.06})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // ── SCAN CIRCLE RADAR ──
    ctx.save();
    const cx = W * 0.5, cy = H * 0.5;
    const angle = (t * 0.008) % (Math.PI * 2);
    const rc = overdriveActive ? '255,34,68' : '0,245,255';
    const grad = ctx.createConicalGradient
      ? undefined
      : null;
    // Simple arc radar fade
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, Math.min(W, H) * 0.38, angle - 0.8, angle);
    ctx.closePath();
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.38);
    rg.addColorStop(0, `rgba(${rc},0)`);
    rg.addColorStop(1, `rgba(${rc},0.04)`);
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.restore();

    t++;
    requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────────────────────────────────
// INTRO CANVAS — Star field + HUD circles
// ─────────────────────────────────────────────────────────
function initIntroCanvas() {
  const canvas = document.getElementById('introCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * 1920, y: Math.random() * 1080,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
    });
  }

  function drawIntro() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    for (const s of stars) {
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(s.x % W, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,255,${s.a * 0.4})`;
      ctx.fill();
    }
    ctx.restore();
    if (!introComplete) requestAnimationFrame(drawIntro);
  }
  drawIntro();
}

// ─────────────────────────────────────────────────────────
// PARTICLES.JS CONFIG
// ─────────────────────────────────────────────────────────
function initParticles() {
  if (typeof particlesJS === 'undefined') return;
  particlesJS('particles-js', {
    particles: {
      number: { value: 55, density: { enable: true, value_area: 900 } },
      color: { value: '#00f5ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.25, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.05 } },
      size: { value: 2, random: true },
      line_linked: { enable: true, distance: 130, color: '#0080ff', opacity: 0.08, width: 0.8 },
      move: { enable: true, speed: 0.7, direction: 'none', random: true, straight: false, bounce: false },
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, resize: true },
      modes: { grab: { distance: 140, line_linked: { opacity: 0.3 } } },
    },
    retina_detect: true,
  });
}

// ─────────────────────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────────────────────
function typeWriter(el, text, speed = 80, cb) {
  let i = 0;
  el.textContent = '';
  function tick() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed + Math.random() * 40);
    } else if (cb) cb();
  }
  tick();
}

// ─────────────────────────────────────────────────────────
// INTRO SEQUENCE
// ─────────────────────────────────────────────────────────
function runIntroSequence() {
  const nameEl     = document.getElementById('introName');
  const subEl      = document.getElementById('introSubtitle');
  const missionEl  = document.getElementById('introMission');
  const btnEl      = document.getElementById('introBtn');

  nameEl.textContent    = '';
  subEl.textContent     = '';
  missionEl.textContent = '';
  btnEl.style.opacity   = '0';

  setTimeout(() => {
    typeWriter(nameEl, 'PHÙNG ĐÔN KIÊN', 100, () => {
      setTimeout(() => {
        typeWriter(subEl, 'Kỹ sư Tự động hóa tương lai', 70, () => {
          setTimeout(() => {
            typeWriter(missionEl, 'MISSION THPT 2026', 90, () => {
              gsap.to(btnEl, { opacity: 1, duration: 0.8, ease: 'power2.out' });
            });
          }, 300);
        });
      }, 400);
    });
  }, 800);
}

// ─────────────────────────────────────────────────────────
// START MAIN SITE
// ─────────────────────────────────────────────────────────
function startMainSite() {
  introComplete = true;
  const intro    = document.getElementById('introScreen');
  const mainSite = document.getElementById('mainSite');

  gsap.to(intro, {
    opacity: 0, duration: 1.2, ease: 'power2.inOut',
    onComplete: () => {
      intro.classList.add('hidden');
      mainSite.classList.remove('hidden');
      mainSite.style.opacity = 0;
      gsap.to(mainSite, { opacity: 1, duration: 1, ease: 'power2.out' });

      // Animate hero
      gsap.from('.hero-name',  { y: 40, opacity: 0, duration: 1,   delay: 0.3, ease: 'power3.out' });
      gsap.from('.hero-title', { y: 20, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' });
      gsap.from('.hero-badges .badge', {
        y: 20, opacity: 0, duration: 0.6, delay: 0.9,
        stagger: 0.1, ease: 'power3.out',
      });

      initParticles();
      startCountdown();
      startNavTime();
      startAIMessages();
      startMiniCountdowns();
      animateSkillBars();
      startQuoteCycle();
    },
  });
}

// ─────────────────────────────────────────────────────────
// COUNTDOWN
// ─────────────────────────────────────────────────────────
function startCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function pad(n) { return String(n).padStart(2, '0'); }

let prevSecs = -1;
let prevMins = -1;
let prevHours = -1;
let prevDays  = -1;

function updateCountdown() {
  const now  = new Date();
  const diff = EXAM_DATE - now;

  if (diff <= 0) {
    // Exam started
    document.getElementById('cdDaysNum').textContent  = '00';
    document.getElementById('cdHoursNum').textContent = '00';
    document.getElementById('cdMinsNum').textContent  = '00';
    document.getElementById('cdSecsNum').textContent  = '00';
    document.getElementById('cdStatusText').textContent = 'KỲ THI ĐÃ BẮT ĐẦU — GOOD LUCK!';
    return;
  }

  const totalSecs  = Math.floor(diff / 1000);
  const secs  = totalSecs % 60;
  const mins  = Math.floor(totalSecs / 60) % 60;
  const hours = Math.floor(totalSecs / 3600) % 24;
  const days  = Math.floor(totalSecs / 86400);

  // Animate flip on change
  if (secs !== prevSecs) {
    flipNumber('cdSecsNum', pad(secs));
    prevSecs = secs;
  }
  if (mins !== prevMins) {
    flipNumber('cdMinsNum', pad(mins));
    prevMins = mins;
    // Seconds bar is 0-60
    const pct = ((60 - secs) / 60) * 100;
    document.getElementById('cdSecsBar').style.width = pct + '%';
  }
  if (hours !== prevHours) {
    flipNumber('cdHoursNum', pad(hours));
    prevHours = hours;
    document.getElementById('cdHoursBar').style.width = ((24 - hours) / 24 * 100) + '%';
  }
  if (days !== prevDays) {
    flipNumber('cdDaysNum', pad(days));
    prevDays = days;
    document.getElementById('cdDaysBar').style.width = Math.min(100, (35 - days) / 35 * 100) + '%';
  }

  // Mins bar
  document.getElementById('cdMinsBar').style.width = ((60 - mins) / 60 * 100) + '%';

  // ── BATTLE MODES ──
  const alertEl  = document.getElementById('specialModeAlert');
  const saText   = document.getElementById('saText');
  const container = document.getElementById('countdownContainer');
  const banner   = document.getElementById('overdriveBanner');
  const bannerSub = banner.querySelector('.overdrive-sub');

  if (diff > 0 && diff <= 86400000) {
    // ══ FINAL BOSS MODE — dưới 24 giờ ══
    alertEl.classList.remove('hidden');
    saText.textContent = '⚔ FINAL BOSS MODE — KỲ THI BẮT ĐẦU TRONG VÀI GIỜ — CHIẾN ĐẤU! ⚔';
    alertEl.style.borderColor = 'var(--neon-red)';
    alertEl.style.background  = 'rgba(255,34,68,0.12)';
    container.style.boxShadow = '0 0 60px rgba(255,34,68,0.35)';
    if (!overdriveActive) {
      overdriveActive = true;
      document.body.classList.add('overdrive');
      banner.classList.remove('hidden');
      banner.querySelector('.overdrive-text').textContent = '⚔ FINAL BOSS MODE ⚔';
      bannerSub.textContent = 'FINAL EXAM INCOMING. MAXIMIZE ALL PARAMETERS. DO NOT STOP.';
    }
  } else if (diff > 0 && days < 7) {
    // ══ CRITICAL MODE — dưới 7 ngày ══
    alertEl.classList.remove('hidden');
    saText.textContent = '🔴 CRITICAL MODE — CÒN ' + days + ' NGÀY — TẬP TRUNG TỐI ĐA!';
    alertEl.style.borderColor = 'rgba(255,100,0,0.6)';
    alertEl.style.background  = 'rgba(255,100,0,0.08)';
    container.style.boxShadow = '0 0 40px rgba(255,100,0,0.3)';
  } else if (diff > 0 && days < 30) {
    // ══ WARNING MODE — dưới 30 ngày ══
    alertEl.classList.remove('hidden');
    saText.textContent = '⚡ WARNING MODE — CÒN ' + days + ' NGÀY — TĂNG TỐC ÔN TẬP NGAY!';
    alertEl.style.borderColor = 'rgba(255,200,0,0.5)';
    alertEl.style.background  = 'rgba(255,200,0,0.06)';
    container.style.boxShadow = '0 0 30px rgba(255,200,0,0.2)';
  } else {
    alertEl.classList.add('hidden');
    container.style.boxShadow = '';
  }
}

function flipNumber(id, val) {
  const el = document.getElementById(id);
  if (el.textContent === val) return;
  el.classList.remove('flip');
  void el.offsetWidth; // reflow
  el.textContent = val;
  el.classList.add('flip');
}

// ─────────────────────────────────────────────────────────
// MINI COUNTDOWNS (schedule cards)
// ─────────────────────────────────────────────────────────
function startMiniCountdowns() {
  function updateMinis() {
    const now = new Date();
    document.querySelectorAll('.scm-val').forEach(el => {
      // Parse YYYY-MM-DDTHH:MM:SS as ICT (UTC+7)
      const raw = el.dataset.target;        // e.g. "2026-06-11T07:35:00"
      const [datePart, timePart] = raw.split('T');
      const [Y, Mo, D] = datePart.split('-').map(Number);
      const [H, Mi, S] = timePart.split(':').map(Number);
      // Build as UTC = local ICT − 7h
      const target = new Date(Date.UTC(Y, Mo - 1, D, H - 7, Mi, S));
      const diff = target - now;
      if (diff <= 0) {
        el.textContent = '✓ ĐÃ QUA';
        el.style.color = 'rgba(0,255,136,0.6)';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.textContent = d > 0 ? `${d}N ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
    });
  }
  updateMinis();
  setInterval(updateMinis, 1000);
}

// ─────────────────────────────────────────────────────────
// NAV TIME
// ─────────────────────────────────────────────────────────
function startNavTime() {
  function updateTime() {
    const now = new Date();
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    document.getElementById('navTime').textContent = `${h}:${m}:${s}`;
  }
  updateTime();
  setInterval(updateTime, 1000);
}

// ─────────────────────────────────────────────────────────
// AI MESSAGES
// ─────────────────────────────────────────────────────────
function startAIMessages() {
  const el = document.getElementById('aiMessage');
  let idx = 0;

  function showNext() {
    gsap.to(el, {
      opacity: 0, x: -20, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        el.textContent = AI_MESSAGES[idx % AI_MESSAGES.length];
        idx++;
        gsap.fromTo(el,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
        );
      },
    });
  }

  setInterval(showNext, 4000);
}

// ─────────────────────────────────────────────────────────
// SKILL BARS — animated on scroll / load
// ─────────────────────────────────────────────────────────
function animateSkillBars() {
  // Use IntersectionObserver to trigger when in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          const pct = bar.style.getPropertyValue('--target');
          bar.style.width = pct;
        });
        // XP bar
        const xpFill = document.getElementById('xpBarFill');
        if (xpFill) {
          setTimeout(() => {
            xpFill.style.transition = 'width 2s cubic-bezier(0.22,1,0.36,1)';
            xpFill.style.width = (totalXP / 10000 * 100) + '%';
          }, 200);
        }
        animateXPCounter();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const statusSection = document.getElementById('status');
  if (statusSection) observer.observe(statusSection);
}

function animateXPCounter() {
  const el = document.getElementById('totalXP');
  let current = 0;
  const increment = Math.ceil(totalXP / 60);
  const timer = setInterval(() => {
    current += increment;
    if (current >= totalXP) {
      current = totalXP;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString('vi-VN');
  }, 25);
}

// ─────────────────────────────────────────────────────────
// MISSIONS
// ─────────────────────────────────────────────────────────
function toggleMission(id, xpGain, focusGain, disciplineGain) {
  const el = document.getElementById(id);
  if (completedMissions.has(id)) return; // no undo

  completedMissions.add(id);
  el.classList.add('completed');
  totalMissionXP += xpGain;
  totalXP += xpGain;

  // Update mission XP display
  document.getElementById('missionXP').textContent = `${totalMissionXP} / 140 XP`;
  document.getElementById('missionXPBar').style.width = (totalMissionXP / 140 * 100) + '%';

  // Show XP popup
  showXPPopup(`+${xpGain} XP`);

  // Update total XP display
  document.getElementById('totalXP').textContent = totalXP.toLocaleString('vi-VN');
  document.getElementById('xpBarFill').style.width = (totalXP / 10000 * 100) + '%';

  // AI reaction
  const el2 = document.getElementById('aiMessage');
  const msgs = [
    `Nhiệm vụ hoàn thành! +${xpGain} XP được ghi nhận.`,
    'Kỷ luật tăng! Hệ thống đã cập nhật chỉ số.',
    'TASK COMPLETE — Tiếp tục chinh phục!',
    `+${xpGain} XP — Tiến độ đang tăng mạnh.`,
  ];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  gsap.to(el2, {
    opacity: 0, duration: 0.3,
    onComplete: () => {
      el2.textContent = msg;
      gsap.to(el2, { opacity: 1, duration: 0.5 });
    },
  });
}

function showXPPopup(text) {
  const popup = document.getElementById('xpPopup');
  const textEl = document.getElementById('xpPopupText');
  textEl.textContent = text;
  popup.classList.remove('hidden');
  popup.style.animation = 'none';
  void popup.offsetWidth;
  popup.style.animation = 'xpPop 1.5s ease-out forwards';
  setTimeout(() => popup.classList.add('hidden'), 1600);
}

// ─────────────────────────────────────────────────────────
// QUOTES
// ─────────────────────────────────────────────────────────
function startQuoteCycle() {
  setQuote(0);
  setInterval(() => {
    currentQuote = (currentQuote + 1) % QUOTES.length;
    setQuote(currentQuote);
  }, 6000);
}

function setQuote(idx) {
  currentQuote = idx;
  const el = document.getElementById('quoteText');
  gsap.to(el, {
    opacity: 0, y: 10, duration: 0.4, ease: 'power2.in',
    onComplete: () => {
      el.textContent = QUOTES[idx];
      gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    },
  });
  document.querySelectorAll('.qd').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

// ─────────────────────────────────────────────────────────
// LOGO CLICK — SECRET OVERDRIVE MODE
// ─────────────────────────────────────────────────────────
function handleLogoClick() {
  logoClickCount++;
  const logo = document.getElementById('navLogo');

  // Flash feedback
  gsap.to(logo, {
    scale: 1.3, duration: 0.1,
    yoyo: true, repeat: 1, ease: 'power2.inOut',
  });

  if (logoClickCount >= 5 && !overdriveActive) {
    activateOverdrive();
  }
}

function activateOverdrive() {
  overdriveActive = true;
  document.body.classList.add('overdrive');
  document.getElementById('overdriveBanner').classList.remove('hidden');

  // Shake countdown
  const cd = document.getElementById('countdownContainer');
  gsap.to(cd, {
    x: 3, duration: 0.05,
    yoyo: true, repeat: 30, ease: 'none',
    onComplete: () => gsap.set(cd, { x: 0 }),
  });

  // AI message
  const aiEl = document.getElementById('aiMessage');
  gsap.to(aiEl, {
    opacity: 0, duration: 0.2,
    onComplete: () => {
      aiEl.textContent = 'FINAL EXAM INCOMING.';
      gsap.to(aiEl, { opacity: 1, duration: 0.3 });
    },
  });
}

// ─────────────────────────────────────────────────────────
// GSAP SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────
function initScrollAnimations() {
  if (typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.schedule-card').forEach((card, i) => {
    gsap.from(card, {
      y: 50, opacity: 0, duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.mission-item').forEach((item, i) => {
    gsap.from(item, {
      x: -40, opacity: 0, duration: 0.6,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 90%' },
    });
  });

  gsap.from('.quote-text', {
    scale: 0.9, opacity: 0, duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.quote-section', start: 'top 70%' },
  });

  gsap.from('.ai-orb', {
    scale: 0.5, opacity: 0, duration: 1,
    ease: 'elastic.out(1, 0.5)',
    scrollTrigger: { trigger: '.ai-section', start: 'top 80%' },
  });
}

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initBgCanvas();
  initIntroCanvas();
  runIntroSequence();
  initScrollAnimations();
});

// Expose globals for inline handlers
window.startMainSite   = startMainSite;
window.toggleMission   = toggleMission;
window.handleLogoClick = handleLogoClick;
window.setQuote        = setQuote;
