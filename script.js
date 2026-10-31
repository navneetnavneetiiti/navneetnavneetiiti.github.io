const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Desktop ≡ menu (Teaching, Contact, CV); at ≤1180px CSS lists these links in the Menu panel instead.
const navMore = document.querySelector('.nav-more');
const navMoreToggle = document.querySelector('.nav-more-toggle');
if (navMore && navMoreToggle) {
  const setMoreOpen = (open) => {
    navMore.classList.toggle('is-open', open);
    navMoreToggle.setAttribute('aria-expanded', String(open));
  };
  navMoreToggle.addEventListener('click', () => setMoreOpen(!navMore.classList.contains('is-open')));
  navMore.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMoreOpen(false)));
  document.addEventListener('click', (event) => {
    if (!navMore.contains(event.target)) setMoreOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMore.classList.contains('is-open')) {
      setMoreOpen(false);
      navMoreToggle.focus();
    }
  });
}

// Header: slims down once the page is scrolled, and marks the nav link of the section in view.
const siteHeader = document.querySelector('.site-header');
if (siteHeader && siteNav) {
  const navLinks = [...siteNav.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id], footer[id]')];
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    // two thresholds, so the header does not flicker while scrolling around one point
    if (y > 60) siteHeader.classList.add('is-scrolled');
    else if (y < 10) siteHeader.classList.remove('is-scrolled');

    let current = null;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = section.id;
    });
    // the footer is short, so at the very bottom it is the one being read
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1].id;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

// Night mode: the inline <head> script applies a saved choice before the page paints; the button flips it.
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  const root = document.documentElement;
  const syncToggle = () => {
    const isDark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.title = isDark ? 'Switch to day mode' : 'Switch to night mode';
  };
  syncToggle();

  themeToggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (error) {
      // storage blocked (e.g. private browsing): the switch still works, it just isn't remembered
    }
    syncToggle();
  });
}

const yearNode = document.querySelector('#year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const profileImage = document.querySelector('.profile-photo img');
if (profileImage) {
  profileImage.addEventListener('error', () => {
    profileImage.hidden = true;
  });
}

const collabSection = document.querySelector('.talk-section');
if (collabSection) {
  let lastPointerType = 'mouse';

  const setActiveCountry = (country) => {
    collabSection.classList.toggle('has-active', Boolean(country));
    collabSection.querySelectorAll('[data-country]').forEach((node) => {
      node.classList.toggle('is-active', node.dataset.country === country);
    });
  };

  const countryNode = (node) => (node && node.closest ? node.closest('[data-country]') : null);

  // Inline the map so its countries can respond to hover; the <img> stays as a fallback.
  const mapImage = collabSection.querySelector('.collab-map-img');
  if (mapImage && window.fetch) {
    fetch(mapImage.getAttribute('src'))
      .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
      .then((markup) => {
        const holder = document.createElement('div');
        holder.innerHTML = markup;
        const svg = holder.querySelector('svg');
        if (svg) mapImage.replaceWith(svg);
      })
      .catch(() => {});
  }

  collabSection.addEventListener('pointerdown', (event) => {
    lastPointerType = event.pointerType;
  });

  collabSection.addEventListener('pointerover', (event) => {
    if (event.pointerType === 'touch') return;
    const node = countryNode(event.target);
    if (node) setActiveCountry(node.dataset.country);
  });

  collabSection.addEventListener('pointerout', (event) => {
    if (event.pointerType === 'touch') return;
    if (countryNode(event.target) && !countryNode(event.relatedTarget)) setActiveCountry(null);
  });

  collabSection.addEventListener('click', (event) => {
    if (lastPointerType !== 'touch' || event.target.closest('a')) return;
    const node = countryNode(event.target);
    setActiveCountry(node && !node.classList.contains('is-active') ? node.dataset.country : null);
  });

  collabSection.addEventListener('focusin', (event) => {
    const node = countryNode(event.target);
    if (node) setActiveCountry(node.dataset.country);
  });

  collabSection.addEventListener('focusout', (event) => {
    if (!countryNode(event.relatedTarget)) setActiveCountry(null);
  });
}

// Experience timeline: mouse hover shows the institute logo via CSS; touch has no hover, so a tap toggles it.
const timeline = document.querySelector('.cv-timeline');
if (timeline) {
  let lastPointerType = 'mouse';

  timeline.addEventListener('pointerdown', (event) => {
    lastPointerType = event.pointerType;
  });

  timeline.addEventListener('click', (event) => {
    if (lastPointerType !== 'touch' || event.target.closest('a')) return;
    const item = event.target.closest('.cv-item');
    timeline.querySelectorAll('.cv-item').forEach((node) => {
      node.classList.toggle('is-active', node === item && !node.classList.contains('is-active'));
    });
  });
}

const lightbox = document.querySelector('.lightbox');
const galleryItems = [...document.querySelectorAll('.gal-item')];
if (lightbox && galleryItems.length && typeof lightbox.showModal === 'function') {
  const photo = lightbox.querySelector('.lightbox-stage img');
  const title = lightbox.querySelector('.lightbox-title');
  const meta = lightbox.querySelector('.lightbox-meta');
  const count = lightbox.querySelector('.lightbox-count');
  const text = lightbox.querySelector('.lightbox-text');
  let current = 0;

  const show = (index) => {
    current = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[current];
    photo.src = item.querySelector('.gal-link').href;
    photo.alt = item.querySelector('img').alt;
    title.textContent = item.querySelector('.gal-title').textContent;
    meta.textContent = item.querySelector('.gal-meta').textContent;
    count.textContent = `${current + 1} / ${galleryItems.length}`;
    text.innerHTML = item.querySelector('.gal-full').innerHTML;
  };

  galleryItems.forEach((item, index) => {
    item.querySelector('.gal-link').addEventListener('click', (event) => {
      event.preventDefault();
      show(index);
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
  // a click on the dimmed backdrop lands on the dialog element itself
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  // touch: swipe the photo left for the next one, right for the previous (CSS hands horizontal pans to us)
  const stage = lightbox.querySelector('.lightbox-stage');
  let swipeStart = null;
  stage.addEventListener('pointerdown', (event) => {
    swipeStart = event.pointerType === 'mouse' || event.target.closest('button') ? null : { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointerup', (event) => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? current + 1 : current - 1);
  });
  stage.addEventListener('pointercancel', () => { swipeStart = null; });
}

// Gallery: CSS shows 3 full rows (12 photos, or 6 at two columns) until "Show all"; the lightbox still steps through every photo.
const galleryGrid = document.querySelector('.gallery-grid');
const galleryMore = document.querySelector('.gallery-more');
if (galleryGrid && galleryMore) {
  const moreButton = galleryMore.querySelector('button');
  const twoColumns = window.matchMedia('(max-width: 975px)');
  const total = galleryGrid.querySelectorAll('.gal-item').length;
  const update = () => {
    const collapsed = galleryGrid.classList.contains('is-collapsed');
    galleryMore.hidden = total <= (twoColumns.matches ? 6 : 12);
    moreButton.textContent = collapsed ? `Show all ${total} photos` : 'Show fewer photos';
    moreButton.setAttribute('aria-expanded', String(!collapsed));
  };

  galleryGrid.classList.add('is-collapsed');
  update();
  twoColumns.addEventListener('change', update);
  moreButton.addEventListener('click', () => {
    galleryGrid.classList.toggle('is-collapsed');
    update();
    // after collapsing, keep the button where the reader is instead of leaving them far below the gallery
    if (galleryGrid.classList.contains('is-collapsed')) galleryMore.scrollIntoView({ block: 'center' });
  });
}

// upcoming talks drop off the page the day after they end; the card goes once none are left
const upcomingCard = document.querySelector('.upcoming-card');
if (upcomingCard) {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's time zone
  upcomingCard.querySelectorAll('.upcoming-item').forEach((item) => {
    if (item.dataset.until < today) item.remove();
  });
  if (!upcomingCard.querySelector('.upcoming-item')) upcomingCard.remove();
}

// Featured publications: the track scroll-snaps, so swiping just works; the arrows (wrapping round) and dots move it.
const featured = document.querySelector('.featured-card');
if (featured) {
  const track = featured.querySelector('.featured-track');
  const slideCount = track.children.length;
  const dots = [...featured.querySelectorAll('.featured-dots button')];
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (index) => {
    track.scrollTo({ left: ((index + slideCount) % slideCount) * track.clientWidth, behavior });
  };

  featured.querySelector('.featured-prev').addEventListener('click', () => go(current() - 1));
  featured.querySelector('.featured-next').addEventListener('click', () => go(current() + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => go(index)));
  track.addEventListener('scroll', () => {
    const index = current();
    dots.forEach((dot, n) => dot.setAttribute('aria-current', String(n === index)));
  }, { passive: true });
}
