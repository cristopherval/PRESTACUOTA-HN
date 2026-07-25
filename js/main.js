// ============================================================
// PrestaCuota HN — interacciones de la landing
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Carrusel infinito de planes (deslizable, solo en celular) ----------
  const mqCarousel = window.matchMedia('(max-width: 1023px)');

  document.querySelectorAll('[data-carousel]').forEach((track) => {
    const originals = Array.from(track.children);
    const count = originals.length;
    if (count < 2) return;

    // Clonar el set completo antes y después → efecto infinito en ambos sentidos
    const cloneCard = (el) => {
      const c = el.cloneNode(true);
      c.classList.add('carousel-clone');
      c.classList.remove('reveal', 'visible');
      c.removeAttribute('data-reveal');
      c.removeAttribute('data-delay');
      c.style.opacity = '1';
      c.style.transform = 'none';
      c.setAttribute('aria-hidden', 'true');
      return c;
    };
    originals.forEach((el) => track.appendChild(cloneCard(el)));        // set posterior
    originals.slice().reverse().forEach((el) => track.insertBefore(cloneCard(el), track.firstChild)); // set anterior

    // Controles: flechas + puntos (solo visibles en celular vía .lg\:hidden)
    const nav = document.createElement('div');
    nav.className = 'carousel-nav lg:hidden';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel-arrow';
    prev.setAttribute('aria-label', 'Anterior');
    prev.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>';
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel-arrow';
    next.setAttribute('aria-label', 'Siguiente');
    next.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'carousel-dots';
    const dots = originals.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Ir al elemento ' + (i + 1));
      dotsWrap.appendChild(d);
      return d;
    });
    nav.append(prev, dotsWrap, next);
    track.after(nav);

    let setWidth = 0;
    let cardStep = 0;

    const measure = () => {
      const a = track.children[0].getBoundingClientRect();
      const b = track.children[1].getBoundingClientRect();
      cardStep = Math.round(b.left - a.left) || Math.round(a.width);
      setWidth = cardStep * count;
    };

    const center = () => {
      measure();
      if (setWidth) track.scrollLeft = setWidth; // inicio del set del medio (originales)
      updateDots();
    };

    const updateDots = () => {
      if (!setWidth) return;
      const rel = ((track.scrollLeft % setWidth) + setWidth) % setWidth;
      const idx = Math.round(rel / cardStep) % count;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    let idleTimer = null;
    track.addEventListener('scroll', () => {
      updateDots();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!setWidth) return;
        // Reposición invisible para el bucle infinito (sin animación)
        if (track.scrollLeft < setWidth * 0.5) {
          track.scrollLeft += setWidth;
        } else if (track.scrollLeft > setWidth * 1.5) {
          track.scrollLeft -= setWidth;
        }
      }, 130);
    }, { passive: true });

    prev.addEventListener('click', () => track.scrollBy({ left: -cardStep, behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: cardStep, behavior: 'smooth' }));
    dots.forEach((d, i) => d.addEventListener('click', () => {
      track.scrollTo({ left: setWidth + i * cardStep, behavior: 'smooth' });
    }));

    const sync = () => { if (mqCarousel.matches) requestAnimationFrame(center); };
    sync();
    window.addEventListener('resize', () => requestAnimationFrame(sync));
    window.addEventListener('load', () => { if (mqCarousel.matches) center(); });
  });

  // ---------- Marquee de opiniones (se mueven solas horizontalmente) ----------
  document.querySelectorAll('[data-marquee]').forEach((viewport) => {
    const trackEl = viewport.querySelector('.marquee-track');
    if (!trackEl) return;
    const originals = Array.from(trackEl.children);
    if (originals.length < 2) return;

    // Duplicar el set para que el bucle (translateX -50%) sea perfecto
    originals.forEach((el) => {
      const c = el.cloneNode(true);
      c.classList.remove('reveal', 'visible');
      c.removeAttribute('data-reveal');
      c.removeAttribute('data-delay');
      c.style.opacity = '1';
      c.style.transform = 'none';
      c.setAttribute('aria-hidden', 'true');
      trackEl.appendChild(c);
    });

    // Velocidad constante (~55 px/seg) según el ancho de un set
    const setSpeed = () => {
      const setWidth = trackEl.scrollWidth / 2;
      const duration = Math.max(18, Math.round(setWidth / 55));
      trackEl.style.setProperty('--marquee-duration', duration + 's');
    };
    setSpeed();
    window.addEventListener('load', setSpeed);
    let mResize = null;
    window.addEventListener('resize', () => {
      clearTimeout(mResize);
      mResize = setTimeout(setSpeed, 200);
    });
  });

  // ---------- Menú móvil ----------
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  const closeMenu = () => {
    mobileMenu.classList.add('hidden');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    if (isOpen) {
      closeMenu();
    } else {
      mobileMenu.classList.remove('hidden');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
    }
  });

  // Cerrar el menú al tocar un enlace
  document.querySelectorAll('.mobile-link, #mobile-menu a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // ---------- Sombra del header + botón flotante al hacer scroll ----------
  const header = document.getElementById('header');
  const floatingCta = document.getElementById('floating-cta');
  const onScroll = () => {
    const y = window.scrollY;
    if (y > 10) {
      header.classList.add('shadow-lg', 'shadow-black/20');
    } else {
      header.classList.remove('shadow-lg', 'shadow-black/20');
    }
    // Mostrar el botón flotante al pasar el hero (~600px)
    if (floatingCta) {
      floatingCta.classList.toggle('visible', y > 600);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Acordeón del FAQ (uno abierto a la vez) ----------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cerrar todos
      faqItems.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      // Abrir el que se tocó (si estaba cerrado)
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---------- Aparición al hacer scroll ----------
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;

          // Efecto escalonado: los hijos .reveal directos de un [data-stagger]
          // se revelan en cascada uno tras otro.
          const delayAttr = el.getAttribute('data-delay');
          if (delayAttr) {
            el.style.setProperty('--reveal-delay', delayAttr + 'ms');
          }

          el.classList.add('visible');
          observer.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Asignar delays automáticos a grupos escalonados
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      const step = parseInt(group.getAttribute('data-stagger'), 10) || 90;
      group.querySelectorAll(':scope > .reveal').forEach((child, i) => {
        if (!child.hasAttribute('data-delay')) {
          child.setAttribute('data-delay', String(i * step));
        }
      });
    });

    reveals.forEach((el) => observer.observe(el));
  } else {
    // Navegadores viejos: mostrar todo de una vez
    reveals.forEach((el) => el.classList.add('visible'));
  }

});
