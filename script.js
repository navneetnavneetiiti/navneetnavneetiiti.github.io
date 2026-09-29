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
