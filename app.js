(() => {
  const root = document.documentElement;

  const themeToggle = document.querySelector('.theme-toggle');
  const themeLabel = document.querySelector('.theme-label');
  const themeIcon = document.querySelector('.theme-icon');
  try {
    const savedTheme = window.localStorage.getItem('darshan-portfolio-theme');
    if (savedTheme === 'dark') root.dataset.theme = 'dark';
  } catch (_) {
    // The page still works when browser storage is unavailable.
  }
  const updateThemeButton = () => {
    const isDark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    themeLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
    themeIcon.textContent = isDark ? '☼' : '◐';
  };
  updateThemeButton();
  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    updateThemeButton();
    try { window.localStorage.setItem('darshan-portfolio-theme', root.dataset.theme); } catch (_) { /* optional preference */ }
  });

  const heroPhoto = document.querySelector('.hero-photo-image');
  const heroPhotoCount = document.querySelector('.hero-photo-count b');
  const heroPhotoCaption = document.querySelector('.hero-photo-caption');
  const heroPhotos = [
    { src: 'images/photo-1.jpg', alt: 'Darshan Thube at his graduation, holding his certificate', caption: 'Graduation day', position: 'center 37%' },
    { src: 'images/photo-2.png', alt: 'Darshan and teammates working together in a shared workspace', caption: 'Building with the team', position: 'left center' },
    { src: 'images/photo-3.jpeg', alt: 'Darshan with his teammates at the AI Agent Hackathon', caption: 'AI Agent Hackathon', position: '70% center' },
    { src: 'images/photo-4.jpeg', alt: 'Darshan and fellow finalists receiving competition certificates', caption: 'Competition day', position: 'left center' },
  ];
  let activeHeroPhoto = 0;
  const setHeroPhoto = (offset) => {
    activeHeroPhoto = (activeHeroPhoto + offset + heroPhotos.length) % heroPhotos.length;
    const photo = heroPhotos[activeHeroPhoto];
    heroPhoto.classList.add('is-changing');
    heroPhotoCount.textContent = String(activeHeroPhoto + 1).padStart(2, '0');
    heroPhotoCaption.textContent = photo.caption;
    const preload = new Image();
    preload.onload = () => {
      heroPhoto.src = photo.src;
      heroPhoto.alt = photo.alt;
      heroPhoto.style.objectPosition = photo.position;
      window.requestAnimationFrame(() => heroPhoto.classList.remove('is-changing'));
    };
    preload.onerror = () => heroPhoto.classList.remove('is-changing');
    preload.src = photo.src;
  };
  document.querySelector('.hero-photo-prev').addEventListener('click', () => setHeroPhoto(-1));
  document.querySelector('.hero-photo-next').addEventListener('click', () => setHeroPhoto(1));

  const track = document.querySelector('.project-track');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const railCount = document.querySelector('.rail-count b');
  const progress = document.querySelector('.rail-progress span');
  let activeProject = 0;
  const setProject = (index, scroll = false) => {
    activeProject = (index + cards.length) % cards.length;
    railCount.textContent = String(activeProject + 1).padStart(2, '0');
    progress.style.width = `${((activeProject + 1) / cards.length) * 100}%`;
    if (scroll) {
      track.scrollTo({ left: cards[activeProject].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
    }
  };
  document.querySelector('.project-prev').addEventListener('click', () => setProject(activeProject - 1, true));
  document.querySelector('.project-next').addEventListener('click', () => setProject(activeProject + 1, true));
  track.addEventListener('keydown', (event) => {
    if (event.target.matches('input, button, a')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); setProject(activeProject + 1, true); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); setProject(activeProject - 1, true); }
  });
  let railFrame = 0;
  track.addEventListener('scroll', () => {
    window.cancelAnimationFrame(railFrame);
    railFrame = window.requestAnimationFrame(() => {
      const trackStart = track.getBoundingClientRect().left;
      let nearest = 0;
      let nearestDistance = Infinity;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackStart);
        if (distance < nearestDistance) { nearest = index; nearestDistance = distance; }
      });
      setProject(nearest);
    });
  }, { passive: true });

  const scanRange = document.querySelector('#scan-range');
  const scanStage = document.querySelector('.scan-stage');
  const scanDivider = document.querySelector('.scan-divider');
  const syncScan = () => {
    const split = `${scanRange.value}%`;
    scanStage.style.setProperty('--split', split);
    scanDivider.style.left = split;
  };
  scanRange.addEventListener('input', syncScan);
  syncScan();

  const careButton = document.querySelector('[data-care-action]');
  const careAccess = document.querySelector('.care-access');
  careButton.addEventListener('click', () => {
    const enabled = careButton.getAttribute('aria-pressed') !== 'true';
    careButton.setAttribute('aria-pressed', String(enabled));
    careButton.innerHTML = enabled ? 'Revoke sample access <span>↗</span>' : 'Simulate approved access <span>→</span>';
    careAccess.querySelector('.mini-heading b').textContent = enabled ? 'New approval' : 'Recent access';
    careAccess.querySelector('p span').textContent = enabled ? 'Demo clinician' : 'Dr. Mehta';
    careAccess.querySelector('p small').textContent = enabled ? 'Read-only · just now' : 'Vitals · Today';
    careAccess.querySelector('p i').textContent = enabled ? 'Granted' : 'Approved';
  });

  const runButton = document.querySelector('[data-run-test]');
  const output = document.querySelector('.test-output');
  const runSample = () => {
    output.dataset.state = 'done';
    output.querySelector('[data-metric="requests"]').textContent = '50';
    output.querySelector('[data-metric="errors"]').textContent = '0';
    output.querySelector('[data-metric="latency"]').textContent = '214 ms';
    output.querySelector('.output-state').textContent = 'SAMPLE';
    output.querySelector('.output-message').textContent = 'Generated preview only. No request was sent to JMeter.';
    runButton.textContent = 'Run again ↗';
  };
  runButton.addEventListener('click', runSample);
  document.querySelector('.prompt-box input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') runSample();
  });

  const sectionLinks = Array.from(document.querySelectorAll('.dock-nav a'));
  const sections = sectionLinks.map((link) => document.getElementById(link.dataset.section));
  const dockNav = document.querySelector('.dock-nav');
  const syncDockNav = () => {
    const readingLine = window.innerHeight * .42;
    let activeSection = sections[0];
    sections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= readingLine) activeSection = section;
      if (bounds.top <= readingLine && bounds.bottom > readingLine) activeSection = section;
    });
    sectionLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.section === activeSection.id);
    });
    const activeLink = sectionLinks.find((link) => link.dataset.section === activeSection.id);
    if (activeLink) {
      const navBounds = dockNav.getBoundingClientRect();
      const linkBounds = activeLink.getBoundingClientRect();
      dockNav.style.setProperty('--active-left', `${linkBounds.left - navBounds.left - dockNav.clientLeft}px`);
      dockNav.style.setProperty('--active-width', `${linkBounds.width}px`);
      dockNav.style.setProperty('--active-height', `${linkBounds.height}px`);
    }
  };
  let dockFrame = 0;
  const queueDockSync = () => {
    window.cancelAnimationFrame(dockFrame);
    dockFrame = window.requestAnimationFrame(syncDockNav);
  };
  window.addEventListener('scroll', queueDockSync, { passive: true });
  window.addEventListener('resize', queueDockSync);
  syncDockNav();
})();
