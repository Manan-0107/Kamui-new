// ---------- Nav background on scroll ----------
const nav = document.getElementById('siteNav');
const onScroll = () => {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile menu toggle ----------
const menuToggle = document.getElementById('menuToggle');
const links = document.querySelector('nav.links');
if (menuToggle && links) {
  menuToggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.cssText = open
      ? ''
      : 'display:flex; position:fixed; inset:70px 0 auto 0; flex-direction:column; gap:0; background:#0a0f18; padding:10px 30px 30px; border-bottom:1px solid rgba(232,185,79,0.14); z-index:99;';
    if (!open) {
      links.querySelectorAll('a').forEach(a => a.style.padding = '14px 0');
    }
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.removeAttribute('style');
  }));
}

// ---------- Scroll reveal ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

// ---------- Ember particle canvas (Hero) ----------
const canvas = document.getElementById('ember-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: h + Math.random() * 100,
      r: 0.6 + Math.random() * 2,
      speed: 0.25 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
      alpha: 0.15 + Math.random() * 0.5,
      hue: Math.random() > 0.6 ? '232,185,79' : '213,110,58'
    };
  }

  function initParticles() {
    const count = Math.min(90, Math.floor((w * h) / 14000));
    particles = Array.from({ length: count }, makeParticle);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
      ctx.fill();
    });
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) Object.assign(p, makeParticle(), { y: h + 10 });
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
    if (reduceMotion) drawStatic();
  });

  resize();
  initParticles();
  if (reduceMotion) {
    drawStatic();
  } else {
    tick();
  }
}

// ---------- Watch page: genre filter ----------
const filterBar = document.getElementById('filterBar');
if (filterBar) {
  const chips = filterBar.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.watch-card');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const genre = chip.dataset.genre;
      cards.forEach(card => {
        const match = genre === 'all' || card.dataset.genre === genre;
        card.classList.toggle('hidden', !match);
      });
    });
  });
}

// ---------- Watch page: title modal ----------
const modalOverlay = document.getElementById('modalOverlay');
if (modalOverlay) {
  const modalArt = document.getElementById('modalArt');
  const modalGenre = document.getElementById('modalGenre');
  const modalTitle = document.getElementById('modalTitle');
  const modalSynopsis = document.getElementById('modalSynopsis');
  const modalEps = document.getElementById('modalEps');
  const modalClose = document.getElementById('modalClose');
  const modalPlay = document.getElementById('modalPlay');

  function openModal(card) {
    if (!card) return;
    const artSvg = card.querySelector('.art');
    modalArt.innerHTML = artSvg ? artSvg.outerHTML : '';
    modalGenre.textContent = card.dataset.genreLabel || '';
    modalTitle.textContent = card.dataset.title || '';
    modalSynopsis.textContent = card.dataset.synopsis || '';
    modalEps.textContent = card.dataset.eps || '';
    modalOverlay.classList.add('open');
    if (modalPlay) {
      modalPlay.textContent = 'Play episode 1';
      modalPlay.disabled = false;
    }
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  document.querySelectorAll('.watch-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  if (modalPlay) {
    modalPlay.addEventListener('click', () => {
      modalPlay.textContent = '▶ Now streaming in 4K HDR...';
      modalPlay.disabled = true;
      setTimeout(() => {
        if (modalPlay) {
          modalPlay.textContent = 'Play episode 1';
          modalPlay.disabled = false;
        }
      }, 3000);
    });
  }

  // Open directly to a title if the page was linked with #slug
  const checkHash = () => {
    const hashId = window.location.hash.replace('#', '');
    if (hashId) {
      const target = document.getElementById(hashId);
      if (target) {
        setTimeout(() => openModal(target), 200);
        target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
  };

  checkHash();
  window.addEventListener('hashchange', checkHash);
}
