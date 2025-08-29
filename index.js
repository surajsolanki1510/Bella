    // --------- Animations and interaction logic ---------
    window.addEventListener('load', () => {
      // Entrance animation for header
      const tl = gsap.timeline();
      tl.from('.brand', { y: 40, opacity: 0, duration: 1.1, ease: 'power4.out' })
        .from('.subtitle', { y: 16, opacity: 0, duration: .8 }, '-=0.7')
        .from('.cta', { scale: .6, opacity: 0, duration: .6, ease: 'back.out(1.7)' }, '-=0.4');

      // Cards: gentle pop on scroll
      gsap.utils.toArray('.card').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 90%' },
          y: 30, opacity: 0, scale: 0.98, duration: .8, ease:'power3.out', delay: i * 0.06
        });
      });

      // Card hover micro-animations
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.02, boxShadow: '0 20px 60px rgba(0,0,0,.5)', duration: .22, ease:'power1.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, boxShadow: '0 8px 24px rgba(0,0,0,.25)', duration: .28, ease:'power1.out' });
        });
      });

      // Acquire elements for the Poem modal
      const poemModal = document.getElementById('poemModal');
      const poemTitle = document.getElementById('poemTitle');
      const poemText = document.getElementById('poemText');
      const poemMeta = document.getElementById('poemMeta');

      // 'read-more' and whole-card click handling to show modal
      const readButtons = document.querySelectorAll('.read-more');
      readButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest('.card');
          openPoem(card);
        });
      });

      // Also allow clicking the card itself on mobile to toggle poem-short or open modal (double behaviour handled)
      cards.forEach(card => {
        // toggle small overlay on tap (mobile) or open modal on double-click/long-press
        let tapped = false;
        card.addEventListener('click', (e) => {
          // small screens: show poem-short persistently; on bigger screens, open modal for deeper reading
          if (window.innerWidth <= 700) {
            card.classList.toggle('show-poem');
            // also animate the short poem in/out
            if (card.classList.contains('show-poem')) {
              gsap.fromTo(card.querySelector('.poem-short'), { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: .28, ease: 'power2.out' });
            } else {
              gsap.to(card.querySelector('.poem-short'), { y: -6, opacity: 0, duration: .18, ease: 'power2.in' });
            }
            return;
          }
          // On desktop: gentle delay to check for double tap
          if (!tapped) {
            tapped = true;
            setTimeout(()=> tapped = false, 300);
          } else {
            // double-click detected -> open modal
            openPoem(card);
            tapped = false;
          }
        });

        // keyboard accessibility: Enter opens modal
        card.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            openPoem(card);
            ev.preventDefault();
          }
        });
      });

      // openPoem: populate modal and animate in
      function openPoem(card) {
        const full = card.getAttribute('data-poem-full') || 'A little story of us.';
        const title = card.getAttribute('data-title') || 'Our Moment';
        poemTitle.textContent = title;
        // preserve newlines
        poemText.textContent = full;
        poemMeta.textContent = '— Suraj';
        poemModal.classList.add('show');
        poemModal.setAttribute('aria-hidden', 'false');

        // animate modal content
        gsap.fromTo('.poem-card', { y: 20, scale: .98, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .36, ease: 'back.out(1.2)' });
        // subtle heartburst
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, scalar: 0.6 });
      }

      // Close modal when clicking outside or pressing ESC
      poemModal.addEventListener('click', (e) => {
        if (e.target === poemModal) closePoem();
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePoem();
      });
      function closePoem() {
        poemModal.classList.remove('show');
        poemModal.setAttribute('aria-hidden', 'true');
        gsap.to('.poem-card', { scale: .98, opacity: 0, duration: .22, ease: 'power1.in' });
      }

      // Carousel auto-scroll left-right (gentle loop)
      const car = document.getElementById('carousel');
      let carDir = 1;
      function autoScroll() {
        if (!car) return;
        const maxScroll = car.scrollWidth - car.clientWidth;
        if (maxScroll <= 0) return;
        const next = car.scrollLeft + (carDir * 1.3); // small pixel shift
        if (next < 0) carDir = 1;
        if (next > maxScroll) carDir = -1;
        gsap.to(car, { scrollTo: { x: car.scrollLeft + (carDir * 240) }, duration: 6, ease: 'sine.inOut', onComplete: () => {
          // delay then continue
          setTimeout(autoScroll, 1200);
        }});
      }
      // start after small delay
      setTimeout(autoScroll, 1400);

      // floating hearts generator (improved visuals)
      const heartsContainer = document.getElementById('hearts');
      function makeHeart() {
        const h = document.createElement('div');
        h.className = 'floating';
        const size = 12 + Math.random() * 36;
        h.style.position = 'absolute';
        h.style.width = h.style.height = `${size}px`;
        h.style.left = Math.random() * 100 + 'vw';
        h.style.top = (65 + Math.random() * 30) + 'vh';
        h.style.pointerEvents = 'none';
        // create a heart using CSS via inner div
        h.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" style="filter:drop-shadow(0 6px 18px rgba(0,0,0,.25));"><path d=\"M12 21s-6-4.35-9-7.35C-0.3 12.6-0.3 8.4 2.4 6.3 4.5 4.65 7.5 5.1 9 7.05 10.5 5.1 13.5 4.65 15.6 6.3c2.7 2.1 2.7 6.3-.6 7.35C18 16.65 12 21 12 21z\" fill=\"rgba(255,120,150,0.95)\"/></svg>';
        document.body.appendChild(h);
        gsap.to(h, {
          y: - (220 + Math.random() * 260),
          x: gsap.utils.random(-80, 80),
          rotation: gsap.utils.random(-30, 30),
          opacity: 0,
          duration: 6 + Math.random() * 5,
          ease: 'power1.out',
          onComplete: () => h.remove()
        });
      }
      // lower frequency for performance
      setInterval(makeHeart, 420);

      // Proposal button confetti & pulse
      const btn = document.getElementById('sayYes');
      btn.addEventListener('click', () => {
        try {
          confetti({ particleCount: 220, spread: 110, origin: { y: 0.6 } });
          confetti({ particleCount: 140, angle: 60, spread: 70, origin: { x: 0 } });
          confetti({ particleCount: 140, angle: 120, spread: 70, origin: { x: 1 } });
        } catch(e) { console.warn('confetti failed', e); }
        btn.textContent = 'Yay! You said YES 💖';
        gsap.fromTo(btn, { scale: 1 }, { scale: 1.06, duration: .14, yoyo: true, repeat: 4, ease: 'power1.inOut' });
      });

      // small responsive improvements: reduce animations on low-power devices
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        gsap.globalTimeline.timeScale(3); // slow/disable intense animation
      }
    });
// Add inside your Accept button JS
document.getElementById("accept-btn").addEventListener("click", function () {
  // Existing code (proposal success handling)

  // 1. Celebration text
  const text = document.createElement("div");
  text.classList.add("celebration-text");
  text.innerText = "Forever starts now 💍";
  document.body.appendChild(text);

  // 2. Confetti burst
  for (let i = 0; i < 100; i++) {
    let confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor =
      ["#ff4d6d", "#ffcc00", "#4dd2ff", "#66ff99"][Math.floor(Math.random() * 4)];
    confetti.style.animationDuration = (2 + Math.random() * 3) + "s";
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 5000);
  }
});
