/* ============================================================
   main.js — logika JavaScript
   ============================================================ */

// Hamburger menu (mobile)
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('navbar__mobile--open');
  hamburger.classList.toggle('navbar__hamburger--open', open);
  hamburger.setAttribute('aria-expanded', open);
});
// Zamknij po kliknięciu linka
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('navbar__mobile--open');
    hamburger.classList.remove('navbar__hamburger--open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// Navbar: dodaj cień po przewinięciu
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
  } else {
    navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
  }
});

// Formularz kontaktowy: prosty feedback po wysłaniu
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"], .btn');
    if (btn) {
      btn.textContent = 'Wysłano! ✓';
      btn.disabled = true;
      btn.style.backgroundColor = '#16a34a';
      setTimeout(() => {
        btn.textContent = 'Wyślij wiadomość';
        btn.disabled = false;
        btn.style.backgroundColor = '';
        form.reset();
      }, 3000);
    }
  });
}
