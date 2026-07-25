// ============================================================
// PrestaCuota HN — interacciones de la landing
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

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

  // ---------- Sombra del header al hacer scroll ----------
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 10) {
      header.classList.add('shadow-lg', 'shadow-black/20');
    } else {
      header.classList.remove('shadow-lg', 'shadow-black/20');
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
