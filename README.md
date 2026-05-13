# JasnyBiznes.pl – Agencja Marketingowa Nowej Generacji

Oficjalne repozytorium strony firmowej agencji interaktywnej **JasnyBiznes.pl**. Projekt reprezentuje nowoczesne podejście do budowy stron biznesowych, łącząc minimalistyczny design z zaawansowaną optymalizacją techniczną, wysoką wydajnością oraz dbałością o standardy prywatności i bezpieczeństwa.

## 🚀 Kluczowe Funkcje i Optymalizacje
* **Performance Excellence:** Strona zoptymalizowana pod kątem wskaźników Core Web Vitals, z wykorzystaniem techniki `preload` dla fontów oraz asynchronicznego ładowania skryptów.
* **Zaawansowane SEO:** Pełna implementacja protokołu Open Graph (OG) oraz Twitter Cards, precyzyjne opisy meta oraz semantyczna struktura HTML5 wspierająca indeksowanie.
* **Interaktywny Lead Generation:** Autorski formularz kontaktowy z zaawansowanym systemem wyboru preferowanych godzin kontaktu (Custom Range Slider) oraz walidacją danych w czasie rzeczywistym.
* **Security & Server Hardening:** Skonfigurowany plik `.htaccess` wymuszający politykę HSTS, zabezpieczenia przeciwko XSS oraz Clickjackingowi, a także optymalizację pamięci podręcznej (Caching) i kompresję Gzip.
* **Privacy Compliance:** Kompleksowy system zarządzania zgodami na pliki cookie (Cookie Consent Banner) z podziałem na ciasteczka niezbędne, analityczne i preferencyjne.

## 📂 Struktura Projektu
```
JasnyBiznes/
├── index.html          # Główna strona agencji z sekcjami usług i portfolio
├── informacje.html     # Dokumentacja prawna: Polityka Prywatności, Cookies i Regulamin
├── contact.php         # Backendowa obsługa formularza: wysyłka maili i walidacja
├── main.js             # Główna logika: obsługa menu, sliderów godzin i zgód cookies
├── styles.css          # Zoptymalizowane arkusze stylów (Mobile-First Design)
├── .htaccess           # Zaawansowana konfiguracja bezpieczeństwa i wydajności serwera
├── img/                # Zoptymalizowane zasoby wizualne
└── fonts/              # Zoptymalizowane zasoby typograficzne (Inter, Manrope)

```

## 🛠️ Stos technologiczny

* **Frontend:** HTML5, CSS3 (Modern Layouts), Vanilla JavaScript (ES6+).
* **Backend:** PHP (Mail API, systemy anty-spamowe).
* **Security:** Apache Configuration (.htaccess headers).
* **Analityka:** Integracja z Google Analytics 4 (GA4) przy zachowaniu standardów RODO.

## 💡 Rozwiązania Techniczne

1. **Bezpieczna komunikacja:** Skrypt `contact.php` wykorzystuje nagłówki bezpieczeństwa i walidację po stronie serwera, co minimalizuje ryzyko nadużyć.
2. **User Experience (UX):** Zastosowanie autorskich komponentów UI (np. hamburger menu, interaktywne przełączniki w banerze cookies) zapewnia płynną nawigację na każdym urządzeniu.
3. **Optymalizacja Serwera:** Wykorzystanie dyrektywy `Cache-Control: immutable` dla zasobów statycznych drastycznie skraca czas powtórnego ładowania strony.

---

**Projekt:** [JasnyBiznes.pl](https://jasnybiznes.pl)
**Technologie:** HTML | CSS | JS | PHP | SEO
