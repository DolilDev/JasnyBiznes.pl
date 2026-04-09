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

// ── Formularz kontaktowy: walidacja + wysyłka AJAX do contact.php ─────────────
const form = document.getElementById('contact-form');

if (form) {

  // --- Reguły walidacji ---
  function validateName(val) {
    return /^[\p{L}]{3,}\s[\p{L}]{3,}$/u.test(val.trim())
      ? null
      : 'Podaj imię i nazwisko (min. 3 litery, spacja, min. 3 litery).';
  }
  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
      ? null
      : 'Podaj poprawny adres e-mail (np. jan@firma.pl).';
  }
  function validatePhone(val) {
    const digits = val.replace(/[\s\-\+]/g, '').replace(/^48/, '');
    return /^\d{9}$/.test(digits)
      ? null
      : 'Numer telefonu musi mieć dokładnie 9 cyfr.';
  }
  function validateMessage(val) {
    return val.trim().length >= 30
      ? null
      : `Wiadomość jest za krótka (${val.trim().length}/30 znaków).`;
  }

  const rules = {
    'field-name':    validateName,
    'field-email':   validateEmail,
    'field-phone':   validatePhone,
    'field-message': validateMessage,
  };

  function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    const errId = 'error-' + fieldId.replace('field-', '');
    const err   = document.getElementById(errId);
    if (!field || !err) return;
    if (msg) {
      err.textContent = msg;
      field.classList.add('contact-form__input--error');
    } else {
      err.textContent = '';
      field.classList.remove('contact-form__input--error');
    }
  }

  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => showError(id, rules[id](el.value)));
    el.addEventListener('input', () => {
      if (el.classList.contains('contact-form__input--error')) {
        showError(id, rules[id](el.value));
      }
    });
  });

  function animateSuccess() {
    const btn     = document.getElementById('submit-btn');
    const section = document.getElementById('kontakt');
    if (!btn || !section) return;

    const btnRect  = btn.getBoundingClientRect();
    const secRect  = section.getBoundingClientRect();

    const scaleX = secRect.width  / btnRect.width;
    const scaleY = secRect.height / btnRect.height;
    const scale  = Math.max(scaleX, scaleY) * 1.05;

    const btnCenterX = btnRect.left + btnRect.width  / 2;
    const btnCenterY = btnRect.top  + btnRect.height / 2;
    const secCenterX = secRect.left + secRect.width  / 2;
    const secCenterY = secRect.top  + secRect.height / 2;
    const dx = secCenterX - btnCenterX;
    const dy = secCenterY - btnCenterY;

    btn.style.transition = 'transform 0.7s cubic-bezier(0.4,0,0.2,1), border-radius 0.7s ease';
    btn.style.transformOrigin = '50% 50%';
    btn.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    btn.style.borderRadius = '0';
    btn.style.zIndex = '100';
    btn.style.position = 'relative';

    setTimeout(() => {
      btn.innerHTML = `
        <span style="font-size:clamp(1.5rem,4vw,3rem);font-weight:900;letter-spacing:-0.03em;display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
          <span style="font-size:1.2em">✓</span>
          Wiadomość wysłana!
          <span style="font-size:0.45em;font-weight:400;opacity:0.85;">Skontaktujemy się wkrótce 🚀</span>
        </span>`;
    }, 350);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let hasErrors = false;
    Object.keys(rules).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const msg = rules[id](el.value);
      showError(id, msg);
      if (msg) hasErrors = true;
    });
    if (hasErrors) return;

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Wysyłanie…';

    try {
      const res  = await fetch('contact.php', {
        method: 'POST',
        body: new FormData(form),
      });
      const data = await res.json();

      if (data.ok) {
        animateSuccess();
      } else {
        if (data.errors) {
          Object.entries(data.errors).forEach(([key, msg]) => {
            showError('field-' + key, msg);
          });
        }
        btn.disabled = false;
        btn.textContent = 'Wyślij wiadomość';
        if (data.error && !data.errors) alert(data.error);
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Wyślij wiadomość';
      alert('Problem z połączeniem. Sprawdź internet i spróbuj ponownie.');
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

// ── Slider zespołu (tylko mobile, autoplay 12s, reset timera po interakcji) ──
const teamSlider = document.getElementById('team-slider');
const teamDots   = document.getElementById('team-dots');
const teamCards  = teamSlider ? Array.from(teamSlider.children) : [];

if (teamSlider && teamDots && teamCards.length > 1) {
  let teamCur = 0;
  let autoTimer = null;

  // Tylko na mobile
  const isMobile = () => window.innerWidth < 768;

  // Ustaw szerokość każdej karty na 100% wrappera — tylko na mobile
  function sizeCards() {
    if (isMobile()) {
      const w = teamSlider.parentElement.offsetWidth;
      teamCards.forEach(c => c.style.minWidth = w + 'px');
    } else {
      teamCards.forEach(c => c.style.minWidth = '');
    }
  }

  function teamBuildDots() {
    teamDots.innerHTML = '';
    if (!isMobile()) return;
    teamCards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === teamCur ? ' dot--active' : '');
      d.addEventListener('click', () => teamGo(i, true));
      teamDots.appendChild(d);
    });
  }

  function teamGo(idx, userAction = false) {
    teamCur = ((idx % teamCards.length) + teamCards.length) % teamCards.length;
    const cardW = teamCards[0].offsetWidth + 32; // gap 2rem
    teamSlider.style.transform = isMobile()
      ? `translateX(-${teamCur * cardW}px)`
      : '';
    teamDots.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('dot--active', i === teamCur)
    );
    // Reset timera — nieważne czy user kliknął czy autoplay
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = setTimeout(() => teamGo(teamCur + 1), 12000);
  }

  sizeCards();
  teamBuildDots();
  teamGo(0);

  window.addEventListener('resize', () => {
    sizeCards();
    teamBuildDots();
    teamGo(teamCur);
  });
}
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

// ── Aktywny link w navbarze przy przewijaniu ──────────────────────────────
const navLinks     = document.querySelectorAll('.navbar__link, .navbar__mobile-link');
const indicator    = document.getElementById('navbar-indicator');
const navLinksWrap = document.getElementById('navbar-links');

const navIds = new Set(
  Array.from(navLinks).map(l => l.getAttribute('href').replace('#', ''))
);

// Przesuń wskaźnik pod wskazany link desktopowy
function moveIndicator(link) {
  if (!indicator || !navLinksWrap || !link) return;
  if (window.innerWidth < 768) return;
  const wrapRect = navLinksWrap.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  indicator.style.left  = (linkRect.left - wrapRect.left) + 'px';
  indicator.style.width = linkRect.width + 'px';
  indicator.classList.add('navbar__indicator--visible');
}

// Ustaw aktywny link i przesuń wskaźnik
function setActiveLink(id) {
  navLinks.forEach(l => l.classList.remove('active'));
  let targetDesktop = null;
  navLinks.forEach(l => {
    if (l.getAttribute('href') === `#${id}`) {
      l.classList.add('active');
      if (l.classList.contains('navbar__link')) targetDesktop = l;
    }
  });
  moveIndicator(targetDesktop);
}

// Przelicz wskaźnik po resize
window.addEventListener('resize', () => {
  const activeLink = document.querySelector('.navbar__link.active');
  moveIndicator(activeLink);
});

const sections = document.querySelectorAll('section[id], header[id]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    if (navIds.has(id)) {
      setActiveLink(id);
    } else {
      navLinks.forEach(l => l.classList.remove('active'));
      if (indicator) indicator.classList.remove('navbar__indicator--visible');
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => observer.observe(s));
// ── Robot pomocnik ────────────────────────────────────────────
const robotWidget = document.getElementById('robot-widget');
const robotBubble = document.getElementById('robot-bubble');
const robotCta    = document.getElementById('robot-cta');
const kontaktSection = document.getElementById('kontakt');

if (robotWidget && kontaktSection) {
  // Pojawia się po 3 sekundach od wejścia na stronę
  setTimeout(() => {
    robotWidget.classList.add('robot-widget--visible');

    // Dymek pojawia się 2 sekundy po robocie
    setTimeout(() => {
      robotBubble.classList.add('robot-bubble--visible');
    }, 2000);
  }, 3000);

  // Kliknięcie CTA — płynne przewinięcie do formularza
  robotCta?.addEventListener('click', (e) => {
    e.preventDefault();
    kontaktSection.scrollIntoView({ behavior: 'smooth' });
  });

  // Ukryj robota gdy użytkownik jest w sekcji kontakt
  const robotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        robotWidget.classList.add('robot-widget--hidden');
      } else {
        robotWidget.classList.remove('robot-widget--hidden');
      }
    });
  }, { threshold: 0.3 });

  robotObserver.observe(kontaktSection);
}
