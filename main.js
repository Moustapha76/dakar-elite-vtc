/* =========================================================
   DAKAR ELITE VTC – JavaScript
   ========================================================= */

(function () {
  'use strict';

  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    backToTop.classList.toggle('visible', y > 400);

    // Active nav link highlight
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });

  /* ─── BACK TO TOP ─── */
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ─── MOBILE MENU ─── */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on nav link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ─── HERO SCROLL HINT ─── */
  const heroScroll = document.querySelector('.hero-scroll');
  if (heroScroll) {
    heroScroll.addEventListener('click', () => {
      const trustBar = document.querySelector('.trust-bar');
      if (trustBar) trustBar.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ─── AOS (Animate On Scroll) ─── */
  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    elements.forEach(el => observer.observe(el));
  }
  initAOS();

  /* ─── TESTIMONIALS SLIDER ─── */
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('sliderDots');

  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.testimonial-card');
    let cardsVisible = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    let current = 0;
    let maxIndex = Math.max(0, cards.length - cardsVisible);
    let autoplayInterval;

    // Create dots
    function buildDots() {
      dotsContainer.innerHTML = '';
      const dotCount = Math.ceil(cards.length / cardsVisible);
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i * cardsVisible));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.dot');
      const activeIndex = Math.round(current / cardsVisible);
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    }

    function goTo(index) {
      cardsVisible = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      maxIndex = Math.max(0, cards.length - cardsVisible);
      current = Math.max(0, Math.min(index, maxIndex));
      const cardWidth = cards[0].getBoundingClientRect().width + 24;
      track.style.transform = `translateX(-${current * cardWidth}px)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

    function autoplay() {
      if (current >= maxIndex) goTo(0);
      else goTo(current + 1);
    }

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(autoplay, 5000);
    }

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
        resetAutoplay();
      }
    });

    buildDots();
    updateDots();
    autoplayInterval = setInterval(autoplay, 5000);

    window.addEventListener('resize', () => {
      buildDots();
      goTo(0);
    });
  }

  /* ─── BOOKING FORM ─── */
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const submitBtn = document.getElementById('submitBtn');

  // Set minimum date to today
  const pickupDate = document.getElementById('pickupDate');
  if (pickupDate) {
    const today = new Date().toISOString().split('T')[0];
    pickupDate.min = today;
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const required = bookingForm.querySelectorAll('[required]');
      let valid = true;

      required.forEach(field => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      const emailField = document.getElementById('email');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('error');
        valid = false;
      }

      if (!valid) {
        const firstError = bookingForm.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours…';

      try {
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          bookingForm.style.display = 'none';
          bookingSuccess.style.display = 'block';
          bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error('Erreur lors de la réservation');
        }
      } catch (err) {
        alert("Une erreur est survenue. Veuillez nous contacter par WhatsApp.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Réessayer';
      }
    });

    bookingForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  }

  /* ─── LOAD DYNAMIC SETTINGS ─── */
  async function syncSettings() {
    try {
      const res = await fetch('/api/settings');
      const s = await res.json();

      // Update phone links
      if (s.phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(a => a.href = `tel:${s.phone.replace(/\s/g, '')}`);
        document.querySelectorAll('.phone-text').forEach(el => el.textContent = s.phone);
      }
      // Update whatsapp links
      if (s.whatsapp_link) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => a.href = s.whatsapp_link);
      }
      // Update counters
      if (s.clients_count) {
        const clientStat = document.querySelector('.stat-number');
        if (clientStat && clientStat.textContent.includes('300')) {
          clientStat.innerHTML = `${s.clients_count}<span class="gold-text">+</span>`;
        }
      }
    } catch (e) { }
  }
  syncSettings();

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el, target, suffix = '') {
    const duration = 2000;
    const start = performance.now();
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        requestAnimationFrame(function step(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(easeOut * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        });
      }
    }, { threshold: 0.5 });
    observer.observe(el);
  }

  // Animate stat numbers in hero
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(el => {
    const text = el.textContent.trim();
    if (text.startsWith('500')) animateCounter(el.querySelector ? el : el, 500, '+');
  });

  /* ─── SMOOTH PARALLAX HERO ─── */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = `scale(1) translateY(${y * 0.3}px)`;
      }
    }, { passive: true });
  }

  console.log('%c✦ Dakar Elite VTC ✦', 'color: #C9A227; font-size: 1.2rem; font-weight: bold;');
  console.log('%cSite développé avec passion.', 'color: #999;');

})();
