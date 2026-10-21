// 電話點擊追蹤：保留既有 GA4 與 Google Ads 事件及撥號備援。
function gtag_report_conversion(url, link) {
  if (window.QileContact) return window.QileContact.phone(url, link);
  var destination = typeof(url) !== 'undefined' ? url : '';
  var didNavigate = false;

  function navigate() {
    if (didNavigate || !destination) {
      return;
    }

    didNavigate = true;
    window.location = destination;
  }

  var fallbackTimer = setTimeout(navigate, 300);

  if (typeof gtag === 'function') {
    gtag('event', 'click_phone', {
      'event_category': 'Contact',
      'event_label': 'Phone Call'
    });
    gtag('event', 'conversion', {
        'send_to': 'AW-18055428591/sD1tCIH-5K4cEO_zv6FD',
        'value': 1.0,
        'currency': 'TWD',
        'event_callback': function () {
          clearTimeout(fallbackTimer);
          navigate();
        }
    });
  } else {
    navigate();
  }

  return false;
}

document.addEventListener("DOMContentLoaded", function() {
  const faders = document.querySelectorAll('.fade-up');
  const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });

  function initCompare(container) {
    const afterWrap = container.querySelector('.img-after-wrap');
    const divider = container.querySelector('.compare-divider');
    if (!container || !afterWrap || !divider) return;

    let dragging = false;

    function setPos(pct) {
      const boundedPct = Math.max(0, Math.min(100, pct));
      afterWrap.style.width = boundedPct + '%';
      divider.style.left = boundedPct + '%';
      divider.setAttribute('aria-valuenow', Math.round(boundedPct));
    }

    function setPosFromPointer(clientX) {
      const rect = container.getBoundingClientRect();
      setPos(((clientX - rect.left) / rect.width) * 100);
    }

    divider.addEventListener('pointerdown', (e) => {
      dragging = true;
      divider.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    divider.addEventListener('pointermove', (e) => {
      if (dragging) setPosFromPointer(e.clientX);
    });
    ['pointerup', 'pointercancel'].forEach(eventName => {
      divider.addEventListener(eventName, () => {
        dragging = false;
      });
    });
    divider.addEventListener('keydown', (e) => {
      const current = Number(divider.getAttribute('aria-valuenow'));
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPos(current - 5);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPos(current + 5);
      }
    });

    setPos(50);
  }

  document.querySelectorAll('[data-compare]').forEach(initCompare);

  const track = document.getElementById('carouselTrack');
  if (track) {
    const dots = document.querySelectorAll('.carousel-dot');
    const total = 4;
    let current = 0;
    let autoTimer;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 4000);
    }

    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      goTo(current - 1);
      startAuto();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      goTo(current + 1);
      startAuto();
    });
    dots.forEach(dot => dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
      startAuto();
    }));

    startAuto();
  }

  const navbar = document.getElementById('navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  function closeMobileNav() {
    if (!navbar || !navToggle) return;
    navbar.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      } else {
        navbar.style.boxShadow = 'var(--shadow-sm)';
      }
    });
  }

  if (navbar && navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          closeMobileNav();
        }
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeMobileNav();
      }
    });
  }

  // 所有電話入口共用同一條追蹤，避免新增按鈕時漏接。
  if (!window.QileContact) document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    if (link.hasAttribute('onclick')) return;
    link.addEventListener('click', event => {
      event.preventDefault();
      gtag_report_conversion(link.getAttribute('href'));
    });
  });

  // --- LINE 諮詢浮動按鈕 ---
  // 官方帳號開好後，把下面這行換成帳號的基本 ID（@ 開頭）。
  // 還是預設值時按鈕不會出現，避免線上出現連不到的連結。
  const LINE_OA_ID = '@548mfdmm';

  const linePageQuestions = {
    'bathroom.html': '我想詢問浴室翻修',
    'renovation.html': '我想詢問房屋翻修',
    'masonry.html': '我想詢問泥作工程',
    'building.html': '我想詢問建築修繕',
    'flooring.html': '我想詢問地板工程'
  };

  if (/^@[A-Za-z0-9._-]+$/.test(LINE_OA_ID) && LINE_OA_ID !== '@REPLACE_WITH_OA_ID') {
    const lastSegment = window.location.pathname.split('/').filter(Boolean).pop() || '';
    const currentPage = lastSegment.endsWith('.html') ? lastSegment : 'index.html';
    const question = linePageQuestions[currentPage] || '';
    const encodedId = encodeURIComponent(LINE_OA_ID);
    const lineHref = question
      ? `https://line.me/R/oaMessage/${encodedId}/?${encodeURIComponent(question)}`
      : `https://line.me/R/ti/p/${encodedId}`;

    const lineFab = document.createElement('a');
    lineFab.className = 'line-fab';
    lineFab.setAttribute('data-line-contact', '');
    lineFab.href = lineHref;
    lineFab.target = '_blank';
    lineFab.rel = 'noopener';
    lineFab.setAttribute('aria-label', '用 LINE 詢問');
    lineFab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 3C6.5 3 2 6.6 2 11c0 2.5 1.4 4.7 3.6 6.2V21l3.3-1.8c1 .2 2 .4 3.1.4 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/>' +
      '</svg><span>LINE 諮詢</span>';
    document.body.appendChild(lineFab);

    // 聯絡區已有 LINE 按鈕時收起浮動入口，避免遮擋手機版操作。
    const contactActions = document.querySelectorAll('.contact-actions');
    const visibleContacts = new Set();
    const contactObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visibleContacts.add(entry.target); else visibleContacts.delete(entry.target); });
      lineFab.classList.toggle('is-hidden', visibleContacts.size > 0);
    });
    contactActions.forEach(element => contactObserver.observe(element));

    if (!window.QileContact) document.querySelectorAll('a[data-line-contact]').forEach(link => {
      link.href = lineHref;
      link.addEventListener('click', () => {
        if (typeof gtag === 'function') {
          gtag('event', 'line_contact_click', {
            event_category: 'Contact',
            event_label: currentPage
          });
        }
      });
    });

  }
  if (window.QileContact) window.QileContact.init();
});
