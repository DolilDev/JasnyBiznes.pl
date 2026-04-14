const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('navbar__mobile--open');
  hamburger.classList.toggle('navbar__hamburger--open', open);
  hamburger.setAttribute('aria-expanded', open);
});
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('navbar__mobile--open');
    hamburger.classList.remove('navbar__hamburger--open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
  } else {
    navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
  }
});

const form = document.getElementById('contact-form');

if (form) {
  const fltField = document.getElementById('field-flt');
  if (fltField) fltField.value = Math.floor(Date.now() / 1000);

  (function() {
    const track    = document.getElementById('hours-track');
    const fill     = document.getElementById('hours-fill');
    const thumbF   = document.getElementById('hours-thumb-from');
    const thumbT   = document.getElementById('hours-thumb-to');
    const valF     = document.getElementById('hours-val-from');
    const valT     = document.getElementById('hours-val-to');
    const hidF     = document.getElementById('field-hours-from');
    const hidT     = document.getElementById('field-hours-to');
    if (!track || !thumbF || !thumbT) return;

    const MIN = 8, MAX = 18, STEP = 1;
    let from = 9, to = 14;

    function fmt(h) { return h + ':00'; }

    function pct(val) { return (val - MIN) / (MAX - MIN) * 100; }

    function render() {
      thumbF.style.left = pct(from) + '%';
      thumbT.style.left = pct(to)   + '%';
      fill.style.left   = pct(from) + '%';
      fill.style.width  = (pct(to) - pct(from)) + '%';
      valF.textContent  = fmt(from);
      valT.textContent  = fmt(to);
      if (hidF) hidF.value = fmt(from);
      if (hidT) hidT.value = fmt(to);
    }

    function posToVal(clientX) {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(MIN + ratio * (MAX - MIN));
    }

    function startDrag(thumb, e) {
      e.preventDefault();
      thumb.classList.add('dragging');
      const isFrom = thumb === thumbF;

      function onMove(ev) {
        const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
        let val = posToVal(cx);
        if (isFrom) { from = Math.max(MIN, Math.min(val, to - STEP)); }
        else         { to   = Math.min(MAX, Math.max(val, from + STEP)); }
        render();
      }

      function onEnd() {
        thumb.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend',  onEnd);
      }

      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup',   onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }

    thumbF.addEventListener('mousedown',  e => startDrag(thumbF, e));
    thumbF.addEventListener('touchstart', e => startDrag(thumbF, e), { passive: false });
    thumbT.addEventListener('mousedown',  e => startDrag(thumbT, e));
    thumbT.addEventListener('touchstart', e => startDrag(thumbT, e), { passive: false });

    render();
  })();

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
    const btn = document.getElementById('submit-btn');
    if (!btn) return;

    const r  = btn.getBoundingClientRect();
    const ox = ((r.left + r.width  / 2) / window.innerWidth  * 100).toFixed(2) + '%';
    const oy = ((r.top  + r.height / 2) / window.innerHeight * 100).toFixed(2) + '%';

    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      'position:fixed;inset:0;z-index:9998;pointer-events:none;';

    const circle = document.createElement('div');
    circle.style.cssText = [
      'position:absolute;inset:0;',
      'background:#0059b5;',
      'transform-origin:' + ox + ' ' + oy + ';',
      'transform:scale(0);border-radius:50%;',
      'transition:transform 0.7s cubic-bezier(0.4,0,0.2,1),border-radius 0.7s ease;',
    ].join('');

    const inner = document.createElement('div');
    inner.style.cssText = [
      'position:absolute;inset:0;',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;',
      'color:#fff;text-align:center;padding:1.5rem;box-sizing:border-box;',
      'opacity:0;transform:translateY(16px);',
      'transition:opacity 0.4s ease 0.4s,transform 0.4s ease 0.4s;',
    ].join('');
    inner.innerHTML =
      '<div style="font-size:2.5rem;line-height:1;margin-bottom:0.5rem;">&#10003;</div>' +
      '<div style="font-size:1.25rem;font-weight:900;letter-spacing:-0.02em;margin-bottom:0.35rem;line-height:1.3;">Wiadomo&#347;&#263; wys&#322;ana!</div>' +
      '<div style="font-size:0.9rem;opacity:0.85;">Skontaktujemy si&#281; wkr&#243;tce &#128640;</div>';

    wrapper.appendChild(circle);
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      circle.style.transform    = 'scale(3)';
      circle.style.borderRadius = '0';

      setTimeout(() => {
        inner.style.opacity   = '1';
        inner.style.transform = 'translateY(0)';
      }, 400);

      setTimeout(() => {
        wrapper.style.transition = 'opacity 0.5s ease';
        wrapper.style.opacity    = '0';
        setTimeout(() => {
          wrapper.remove();
          form.reset();
          btn.disabled    = false;
          btn.textContent = 'Wyślij wiadomość';
          const flt = document.getElementById('field-flt');
          if (flt) flt.value = Math.floor(Date.now() / 1000);
        }, 500);
      }, 3000);
    }));
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

    const termsChk = document.getElementById('field-terms');
    const termsErr = document.getElementById('error-terms');
    if (termsChk && termsErr) {
      if (!termsChk.checked) {
        termsErr.textContent = 'Musisz zaakceptować regulamin i politykę prywatności.';
        termsChk.classList.add('input--error');
        hasErrors = true;
      } else {
        termsErr.textContent = '';
        termsChk.classList.remove('input--error');
      }
    }
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

const track = document.getElementById('portfolio-track');
if (track) {
  const origItems = Array.from(track.children);
  origItems.forEach(el => track.appendChild(el.cloneNode(true)));
  origItems.forEach(el => track.appendChild(el.cloneNode(true)));

  let x = 0;
  const GAP = 32;

  function marqueeStep() {
    x -= 0.5;
    const groupW = origItems.reduce((sum, el) => sum + el.offsetWidth + GAP, 0);
    if (x <= -groupW) x = 0;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(marqueeStep);
  }
  marqueeStep();
}

const teamSlider = document.getElementById('team-slider');
const teamDots   = document.getElementById('team-dots');
const teamCards  = teamSlider ? Array.from(teamSlider.children) : [];

if (teamSlider && teamDots && teamCards.length > 1) {
  let teamCur = 0;
  let autoTimer = null;

  const isMobile = () => window.innerWidth < 768;

  let _teamCardW = 0;
  function sizeCards() {
    if (isMobile()) {
      const w = teamSlider.parentElement.offsetWidth;
      teamCards.forEach(c => c.style.minWidth = w + 'px');
      _teamCardW = w;
    } else {
      teamCards.forEach(c => c.style.minWidth = '');
      _teamCardW = teamCards[0] ? teamCards[0].offsetWidth : 0;
    }
  }

  function teamBuildDots() {
    teamDots.innerHTML = '';
    if (!isMobile()) return;
    teamCards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === teamCur ? ' dot--active' : '');
      d.setAttribute('aria-label', `Pokaż członka zespołu ${i + 1}`);
      d.addEventListener('click', () => teamGo(i, true));
      teamDots.appendChild(d);
    });
  }

  function teamGo(idx, userAction = false) {
    teamCur = ((idx % teamCards.length) + teamCards.length) % teamCards.length;
    const cardW = _teamCardW + 32;
    teamSlider.style.transform = isMobile()
      ? `translateX(-${teamCur * cardW}px)`
      : '';
    teamDots.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('dot--active', i === teamCur)
    );
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
(function() {
  const slider   = document.getElementById('testimonials-slider');
  const dotsWrap = document.getElementById('testimonials-dots');
  const btnPrev  = document.getElementById('prev-testi');
  const btnNext  = document.getElementById('next-testi');
  const cards    = Array.from(document.querySelectorAll('.testimonial'));
  if (!slider || !cards.length) return;

  let cur = 0;

  const perView = () => window.innerWidth >= 768 ? 2 : 1;
  const maxIdx  = () => Math.max(0, cards.length - perView());

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === cur ? ' dot--active' : '');
      btn.setAttribute('aria-label', `Opinia ${i + 1}`);
      btn.addEventListener('click', () => go(i));
      dotsWrap.appendChild(btn);
    }
  }

  let _testiCardW = 0, _testiGap = 32;
  function cacheTestiDims() {
    if (cards[0]) _testiCardW = cards[0].offsetWidth;
    _testiGap = parseFloat(getComputedStyle(slider).gap) || 32;
  }
  function go(idx) {
    const total = maxIdx() + 1;
    cur = ((idx % total) + total) % total;
    slider.style.transform = `translateX(-${cur * (_testiCardW + _testiGap)}px)`;
    dotsWrap?.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('dot--active', i === cur)
    );
  }

  btnPrev?.addEventListener('click', () => go(cur - 1));
  btnNext?.addEventListener('click', () => go(cur + 1));

  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? cur + 1 : cur - 1);
  });

  window.addEventListener('resize', () => { cacheTestiDims(); buildDots(); go(cur); });
  cacheTestiDims();
  buildDots();
  go(0);
})();

const navLinks     = document.querySelectorAll('.navbar__link, .navbar__mobile-link');
const indicator    = document.getElementById('navbar-indicator');
const navLinksWrap = document.getElementById('navbar-links');

const navIds = new Set(
  Array.from(navLinks).map(l => l.getAttribute('href').replace('#', ''))
);

function moveIndicator(link) {
  if (!indicator || !navLinksWrap || !link) return;
  if (window.innerWidth < 768) return;
  const wrapRect = navLinksWrap.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  indicator.style.left  = (linkRect.left - wrapRect.left) + 'px';
  indicator.style.width = linkRect.width + 'px';
  indicator.classList.add('navbar__indicator--visible');
}

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
const robotWidget = document.getElementById('robot-widget');
const robotBubble = document.getElementById('robot-bubble');
const robotCta    = document.getElementById('robot-cta');
const kontaktSection = document.getElementById('kontakt');

if (robotWidget && kontaktSection) {
  setTimeout(() => {
    robotWidget.classList.add('robot-widget--visible');

    setTimeout(() => {
      robotBubble.classList.add('robot-bubble--visible');
    }, 2000);
  }, 3000);

  robotCta?.addEventListener('click', (e) => {
    e.preventDefault();
    kontaktSection.scrollIntoView({ behavior: 'smooth' });
  });

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

const termsField = document.getElementById('field-terms');
const termsError = document.getElementById('error-terms');
if (termsField && termsError) {
  termsField.addEventListener('change', () => {
    if (!termsField.checked) {
      termsError.textContent = 'Musisz zaakceptować regulamin i politykę prywatności.';
      termsField.classList.add('input--error');
    } else {
      termsError.textContent = '';
      termsField.classList.remove('input--error');
    }
  });
}

(function() {
  const STORAGE_KEY = 'jb_cookie_consent';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  function getConsent() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch(e) { return null; } }
  function saveConsent(analytics, prefs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ v:1, analytics, prefs, date: Date.now() })); } catch(e) {}
    banner.classList.remove('cookie-banner--visible');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
  }
  if (getConsent()) return;
  setTimeout(() => {
    banner.classList.add('cookie-banner--visible');
    banner.querySelector('button:not([disabled])')?.focus();
  }, 1000);
  const analyticsToggle = document.getElementById('cookie-analytics');
  const prefsToggle     = document.getElementById('cookie-prefs');
  document.getElementById('cookie-accept-all')?.addEventListener('click', () => saveConsent(true, true));
  document.getElementById('cookie-save')?.addEventListener('click', () =>
    saveConsent(analyticsToggle?.checked ?? false, prefsToggle?.checked ?? false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && banner.classList.contains('cookie-banner--visible')) saveConsent(false, false);
  });
})();