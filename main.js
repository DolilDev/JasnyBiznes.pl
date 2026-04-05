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


// Portfolio
const track = document.getElementById('portfolio-track');
const marquee = document.getElementById('portfolio-marquee');

if (track && marquee) {
  // 1. Sklonuj zawartość, aby zapewnić ciągłość
  const items = Array.from(track.children);
  
  // Klonujemy elementy dwa razy, aby mieć pewność, że nie braknie obrazu
  items.forEach(item => {
    const clone1 = item.cloneNode(true);
    const clone2 = item.cloneNode(true);
    track.appendChild(clone1);
    track.appendChild(clone2);
  });

  // 2. Logika płynnego przesuwania
  let scrollPos = 0;
  const speed = 0.4; // Zmień tę liczbę, aby przyspieszyć/spowolnić (np. 0.5 lub 2)

  function animate() {
    scrollPos -= speed;
    
    // Jeśli przesunęliśmy się o szerokość jednej pełnej grupy (oryginału), 
    // resetujemy pozycję do 0 (niezauważalnie dla oka)
    // Wewnątrz funkcji animate w main.js:
    const gap = 32; // 2rem = 32px
    const firstGroupWidth = items.length * (items[0].offsetWidth + gap);
    
    if (Math.abs(scrollPos) >= firstGroupWidth) {
      scrollPos = 0;
    }
    
    track.style.transform = `translateX(${scrollPos}px)`;
    requestAnimationFrame(animate);
  }

  // Uruchom animację
  animate();
}
// Obsługa slidera opinii
const testiSlider = document.getElementById('testimonials-slider');
const dotsContainer = document.getElementById('testimonials-dots');
const btnPrev = document.getElementById('prev-testi');
const btnNext = document.getElementById('next-testi');
const testimonials = document.querySelectorAll('.testimonial');

if (testiSlider && dotsContainer) {
  // 1. Generuj kropki na podstawie liczby opinii
  testimonials.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    if (idx === 0) dot.classList.add('dot--active');
    dot.addEventListener('click', () => {
      testiSlider.scrollTo({
        left: testimonials[idx].offsetLeft - testiSlider.offsetLeft,
        behavior: 'smooth'
      });
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.dot');

  // 2. Aktualizuj aktywną kropkę podczas scrollowania
  testiSlider.addEventListener('scroll', () => {
    const scrollLeft = testiSlider.scrollLeft;
    const width = testiSlider.offsetWidth;
    
    // Obliczamy indeks (zaokrąglamy, żeby kropka "skoczyła" w połowie drogi)
    const activeIndex = Math.round(scrollLeft / width);
    
    dots.forEach((dot, idx) => {
      dot.classList.toggle('dot--active', idx === activeIndex);
    });
  });

  // 3. Obsługa strzałek (zostaje podobna, ale lepiej użyć offsetu)
  btnNext.addEventListener('click', () => {
    testiSlider.scrollBy({ left: testiSlider.offsetWidth, behavior: 'smooth' });
  });

  btnPrev.addEventListener('click', () => {
    testiSlider.scrollBy({ left: -testiSlider.offsetWidth, behavior: 'smooth' });
  });
}