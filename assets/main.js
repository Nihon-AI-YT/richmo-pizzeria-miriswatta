// ============================================
// RICHMO PIZZERIA — shared interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- nav scroll state ---------- */
  const nav = document.querySelector('.site-nav');
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------- mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links){
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ---------- active link ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* stagger index setting for children */
  document.querySelectorAll('.stagger').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
      child.classList.add('reveal');
      io.observe(child);
    });
  });

  /* ---------- ember particle canvas ---------- */
  const canvas = document.getElementById('embers');
  if (canvas){
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function makeParticle(){
      return {
        x: Math.random() * w,
        y: h + 20 + Math.random() * 100,
        r: 1 + Math.random() * 2.4,
        speed: 0.3 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.6,
        life: 0,
        maxLife: 400 + Math.random() * 400,
        flicker: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.5 ? '196,64,31' : '232,184,88'
      };
    }

    const COUNT = reduced ? 0 : (window.innerWidth < 700 ? 22 : 42);
    for (let i=0;i<COUNT;i++){
      const p = makeParticle();
      p.y = Math.random() * h;
      particles.push(p);
    }

    function tick(){
      if (!reduced){
        ctx.clearRect(0,0,w,h);
        particles.forEach(p => {
          p.y -= p.speed;
          p.x += p.drift + Math.sin(p.flicker) * 0.3;
          p.flicker += 0.03;
          p.life++;
          const lifeRatio = p.life / p.maxLife;
          const alpha = lifeRatio < 0.15 ? lifeRatio/0.15 : (1 - Math.max(0,(lifeRatio-0.6)/0.4));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${p.hue},${Math.max(0,alpha*0.85)})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${p.hue},0.8)`;
          ctx.fill();
          if (p.life > p.maxLife || p.y < -20){
            Object.assign(p, makeParticle());
          }
        });
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- magnetic hover for menu cards (subtle) ---------- */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- number/stat count-up ---------- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    let started = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started){
          started = true;
          const dur = 1400;
          const t0 = performance.now();
          function step(t){
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1-p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ---------- reservation form (contact page) ---------- */
  const form = document.getElementById('reserve-form');
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Firing up the oven…';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.textContent = 'Request sent ✓';
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2600);
      }, 1000);
    });
  }

});
