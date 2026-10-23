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

const yearNode = document.querySelector('#year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const profileImage = document.querySelector('.profile-photo img');
if (profileImage) {
  profileImage.addEventListener('error', () => {
    profileImage.hidden = true;
  });

  // The photo is black-and-white; hover shows colour via CSS, and a click or tap keeps it in colour.
  profileImage.addEventListener('click', () => {
    profileImage.parentElement.classList.toggle('is-color');
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
}
