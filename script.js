// ============ Sidebar mobile toggle ============
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebar-backdrop');
const menuToggle = document.getElementById('menu-toggle');

function closeSidebar() {
  sidebar.classList.remove('open');
  backdrop.classList.remove('visible');
}

function openSidebar() {
  sidebar.classList.add('open');
  backdrop.classList.add('visible');
}

menuToggle.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) closeSidebar();
  else openSidebar();
});

backdrop.addEventListener('click', closeSidebar);

// Close sidebar when a nav item is clicked on mobile
document.querySelectorAll('.nav-item').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// ============ Active nav highlighting ============
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

const navMap = {};
navItems.forEach((item) => {
  navMap[item.dataset.target] = item;
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navItems.forEach((n) => n.classList.remove('active'));
        const active = navMap[entry.target.id];
        if (active) active.classList.add('active');
      }
    });
  },
  {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0,
  }
);

pages.forEach((p) => sectionObserver.observe(p));

if (navMap.home) navMap.home.classList.add('active');

// ============ Reveal on scroll ============
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ============ Lucide icons ============
if (window.lucide && typeof window.lucide.createIcons === 'function') {
  window.lucide.createIcons();
}

// ============ Belt Progression System ============
const BELT_KEY = 'ifmsa-belt-progress';
const BELTS = [
  { level: 0, name: 'Faixa Branca', step: null },
  { level: 1, name: 'Faixa Azul',   step: 'Screening' },
  { level: 2, name: 'Faixa Roxa',   step: 'Extração de Dados' },
  { level: 3, name: 'Faixa Preta',  step: 'Análise Estatística' },
];

function loadProgress() {
  const raw = parseInt(localStorage.getItem(BELT_KEY) || '0', 10);
  return Math.max(0, Math.min(3, isNaN(raw) ? 0 : raw));
}

function saveProgress(level) {
  localStorage.setItem(BELT_KEY, String(level));
}

function renderBeltBar(level) {
  const bar = document.getElementById('belt-bar');
  const nameEl = document.getElementById('belt-name');
  if (!bar) return;
  bar.dataset.level = String(level);
  nameEl.textContent = BELTS[level].name;
}

function renderStepButtons(level) {
  const buttons = document.querySelectorAll('.step-complete');
  buttons.forEach((btn) => {
    const step = parseInt(btn.dataset.step, 10); // 1, 2, or 3
    btn.classList.remove('completed', 'locked');

    if (step <= level) {
      // already completed
      btn.classList.add('completed');
      const beltName = BELTS[step].name;
      btn.innerHTML = `
        <span class="step-complete-icon"><i data-lucide="check"></i></span>
        <span class="step-complete-body">
          <strong>Etapa concluída</strong>
          <span><em>${beltName}</em> conquistada</span>
        </span>
      `;
    } else if (step === level + 1) {
      // next available
      const nextBelt = BELTS[step].name;
      btn.innerHTML = `
        <span class="step-complete-icon"><i data-lucide="circle"></i></span>
        <span class="step-complete-body">
          <strong>Marcar como concluído</strong>
          <span>Você vai subir para <em>${nextBelt}</em></span>
        </span>
        <span class="step-complete-arrow"><i data-lucide="arrow-right"></i></span>
      `;
    } else {
      // locked
      btn.classList.add('locked');
      btn.innerHTML = `
        <span class="step-complete-icon"><i data-lucide="lock"></i></span>
        <span class="step-complete-body">
          <strong>Complete a etapa anterior primeiro</strong>
          <span>Volte quando tiver concluído a etapa ${step - 1}</span>
        </span>
      `;
    }
  });

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 1800);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function runCeremony(fromLevel, toLevel) {
  const bar = document.getElementById('belt-bar');
  const beltVisual = bar ? bar.querySelector('.belt-visual') : null;
  const ceremony = document.getElementById('ceremony');
  const eyebrow = document.getElementById('ceremony-eyebrow');
  const title = document.getElementById('ceremony-title');
  const sub = document.getElementById('ceremony-sub');
  const dotsHost = document.getElementById('ceremony-dots-host');
  if (!bar || !beltVisual || !ceremony) return;

  const newBelt = BELTS[toLevel];
  const isFinal = toLevel === 3;

  if (isFinal) {
    eyebrow.textContent = 'Parabéns';
    title.textContent = 'Faixa Preta';
    sub.innerHTML = 'Você agora é, <strong>finalmente</strong>, um <strong>Faixa Preta</strong>.<br>Dominou as três etapas fundamentais da meta-análise.';
  } else {
    eyebrow.textContent = 'Promoção';
    title.textContent = newBelt.name;
    sub.textContent = `Você completou a etapa de ${newBelt.step}.`;
  }

  ceremony.classList.toggle('final', isFinal);
  // Start dots at the OLD level, then animate to new
  if (dotsHost) dotsHost.dataset.level = String(fromLevel);

  if (prefersReducedMotion) {
    renderBeltBar(toLevel);
    renderStepButtons(toLevel);
    saveProgress(toLevel);
    showToast(`✓ ${newBelt.name} conquistada`);
    return;
  }

  // Scrollbar compensation
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = scrollbarWidth + 'px';
  }
  document.body.classList.add('ceremony-lock');

  // Clone ONLY the belt visual (body + knot + tails), not the whole bar
  const rect = beltVisual.getBoundingClientRect();
  const clone = beltVisual.cloneNode(true);
  clone.removeAttribute('id');
  clone.classList.add('ceremony-belt');
  // Seed the clone with the current (old) level so it starts with the old color
  clone.dataset.level = String(fromLevel);
  clone.style.top = rect.top + 'px';
  clone.style.left = rect.left + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.transform = 'translate(0, 0) scale(1)';
  clone.style.opacity = '1';
  clone.style.willChange = 'transform, opacity';
  document.body.appendChild(clone);

  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  const cloneCenterX = rect.left + rect.width / 2;
  const cloneCenterY = rect.top + rect.height / 2;
  const dx = viewportCenterX - cloneCenterX;
  const dy = viewportCenterY - cloneCenterY;
  const targetScale = isFinal ? 2.5 : 2.2;
  const maxScale = Math.min(targetScale, (window.innerWidth - 80) / rect.width);

  // Force layout so the initial state is committed before we animate
  clone.getBoundingClientRect();

  requestAnimationFrame(() => {
    ceremony.classList.add('active');

    // Grow to center
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(${maxScale})`;
    });

    // Promote belt color mid-flight on the clone AND on the dots host
    setTimeout(() => {
      clone.dataset.level = String(toLevel);
      if (dotsHost) dotsHost.dataset.level = String(toLevel);
    }, 650);

    // Ring pulse
    setTimeout(() => {
      const ring = document.createElement('div');
      ring.className = 'ceremony-ring pulse';
      ring.style.borderColor = toLevel === 1 ? '#2563EB'
                              : toLevel === 2 ? '#7C3AED'
                              : '#18181B';
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 1100);

      if (isFinal) {
        setTimeout(() => {
          const ring2 = document.createElement('div');
          ring2.className = 'ceremony-ring pulse';
          ring2.style.borderColor = '#18181B';
          ring2.style.opacity = '0.6';
          document.body.appendChild(ring2);
          setTimeout(() => ring2.remove(), 1100);
        }, 240);
      }
    }, 850);

    // Show text
    setTimeout(() => {
      ceremony.classList.add('show-text');
    }, 900);

    // Update the REAL bar silently (behind the overlay); its own CSS
    // transitions will fire so when the overlay fades, the color is
    // already there.
    setTimeout(() => {
      renderBeltBar(toLevel);
      renderStepButtons(toLevel);
      saveProgress(toLevel);
    }, 1400);

    const holdExtra = isFinal ? 900 : 0;

    // Fade out text
    setTimeout(() => {
      ceremony.classList.remove('show-text');
    }, 2100 + holdExtra);

    // Fade out the clone IN PLACE (no flight back) + overlay together
    setTimeout(() => {
      clone.style.transition = 'opacity 480ms ease, transform 480ms ease';
      clone.style.opacity = '0';
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(${maxScale * 0.96})`;
      ceremony.classList.remove('active');
    }, 2300 + holdExtra);

    // Cleanup
    setTimeout(() => {
      clone.remove();
      ceremony.classList.remove('final');
      document.body.classList.remove('ceremony-lock');
      document.body.style.paddingRight = '';
    }, 2850 + holdExtra);
  });
}

function handleStepClick(event) {
  const btn = event.currentTarget;
  if (btn.classList.contains('completed') || btn.classList.contains('locked')) return;
  const step = parseInt(btn.dataset.step, 10);
  const currentLevel = loadProgress();
  if (step !== currentLevel + 1) return; // out of order guard
  runCeremony(currentLevel, step);
}

function initBelts() {
  const level = loadProgress();
  renderBeltBar(level);
  renderStepButtons(level);
  document.querySelectorAll('.step-complete').forEach((btn) => {
    btn.addEventListener('click', handleStepClick);
  });
}

initBelts();
