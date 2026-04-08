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
