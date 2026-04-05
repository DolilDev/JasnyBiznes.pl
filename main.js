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


// ── Portfolio marquee (prawa → lewa, nieskończona pętla) ──────────────────
const track = document.getElementById('portfolio-track');
if (track) {
  const origItems = Array.from(track.children);
  // Klonuj 2× żeby pętla była wystarczająco długa
  origItems.forEach(el => track.appendChild(el.cloneNode(true)));
  origItems.forEach(el => track.appendChild(el.cloneNode(true)));

  let x = 0;
  const GAP = 32; // gap: 2rem w CSS

  function marqueeStep() {
    x -= 0.5;
    // Łączna szerokość jednej oryginalnej grupy elementów
    const groupW = origItems.reduce((sum, el) => sum + el.offsetWidth + GAP, 0);
    if (x <= -groupW) x = 0;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(marqueeStep);
  }
  marqueeStep();
}

// ── Slider opinii ─────────────────────────────────────────────────────────
const slider   = document.getElementById('testimonials-slider');
const dotsWrap = document.getElementById('testimonials-dots');
const btnPrev  = document.getElementById('prev-testi');
const btnNext  = document.getElementById('next-testi');
const cards    = Array.from(document.querySelectorAll('.testimonial'));

if (slider && dotsWrap && cards.length) {
  let cur = 0;
  const GAP_TESTI = 32; // gap: 2rem w CSS
  const perView   = () => window.innerWidth >= 768 ? 2 : 1;
  const maxIdx    = () => cards.length - perView();

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === cur ? ' dot--active' : '');
      btn.addEventListener('click', () => go(i));
      dotsWrap.appendChild(btn);
    }
  }

  function go(idx) {
    const total = maxIdx() + 1;
    cur = ((idx % total) + total) % total; // zapętlenie w obie strony
    const cardW = cards[0].offsetWidth + GAP_TESTI;
    slider.style.transform = `translateX(-${cur * cardW}px)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('dot--active', i === cur)
    );
  }

  btnPrev?.addEventListener('click', () => go(cur - 1));
  btnNext?.addEventListener('click', () => go(cur + 1));
  window.addEventListener('resize', () => { buildDots(); go(cur); });

  buildDots();
  go(0);
}