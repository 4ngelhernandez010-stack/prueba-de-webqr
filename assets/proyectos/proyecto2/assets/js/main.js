const menuToggle = document.querySelector('[data-menu-toggle]');
const primaryNav = document.querySelector('[data-primary-nav]');

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    primaryNav.classList.toggle('open');
  });
}
