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

  function initCompare(containerId, afterWrapId, dividerId) {
    const container = document.getElementById(containerId);
    const afterWrap = document.getElementById(afterWrapId);
    const divider = document.getElementById(dividerId);
    if (!container || !afterWrap || !divider) return;

    let dragging = false;

    function setPos(clientX) {
      const rect = container.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      afterWrap.style.width = pct + '%';
      divider.style.left = pct + '%';
    }

    divider.addEventListener('mousedown', (e) => {
      dragging = true;
      e.preventDefault();
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
    });
    document.addEventListener('mousemove', (e) => {
      if (dragging) setPos(e.clientX);
    });

    divider.addEventListener('touchstart', (e) => {
      dragging = true;
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchend', () => {
      dragging = false;
    });
    document.addEventListener('touchmove', (e) => {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });

    if (container.offsetWidth > 0) {
      setPos(container.getBoundingClientRect().left + (container.offsetWidth * 0.5));
    }
  }

  initCompare('compare1', 'compare1-after', 'compare1-div');
  initCompare('compare2', 'compare2-after', 'compare2-div');
  initCompare('compare3', 'compare3-after', 'compare3-div');

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

  const serviceConfig = {
    bathroom: {
      serviceValue: '水電工程',
      titleText: '索取浴室翻修報價單'
    },
    renovation: {
      serviceValue: '統包工程',
      titleText: '老屋翻修免費丈量申請'
    },
    masonry: {
      serviceValue: '泥作工程',
      titleText: '泥作工程報價申請'
    },
    kitchen: {
      serviceValue: '水電工程',
      titleText: '廚房翻修改裝報價申請'
    },
    flooring: {
      serviceValue: '地板工程',
      titleText: '地板工程免費丈量申請'
    },
    building: {
      serviceValue: '自地自建',
      titleText: '自地自建諮詢申請'
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  const activeService = serviceParam ? serviceConfig[serviceParam] : null;
  const formPanelTitle = document.querySelector('.contact-form-panel h3');
  const serviceSelect = document.getElementById('serviceType');

  function applyServiceSelection() {
    if (!activeService || !formPanelTitle || !serviceSelect) return;

    formPanelTitle.innerText = activeService.titleText;
    Array.from(serviceSelect.options).forEach(option => {
      option.selected = option.value === activeService.serviceValue;
    });
  }

  applyServiceSelection();

  const scriptURL = 'https://script.google.com/macros/s/AKfycbyQPgPIlQkk0r9BNcXdv_9uGmWtnw1nz_REKKUUriwK1Yb0Yt5AbzgH7N6o4dzpNq0F/exec';
  const form = document.querySelector('#contactForm');
  if (form) {
    const submitBtn = form.querySelector('.submit-btn');
    const defaultSubmitText = submitBtn ? submitBtn.innerText : '送出諮詢';

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!submitBtn) return;

      submitBtn.disabled = true;
      submitBtn.innerText = '送出中...';

      const params = new URLSearchParams();
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const lineId = document.getElementById('lineId')?.value.trim() || '';
      const serviceType = document.getElementById('serviceType').value;
      const location = document.getElementById('location').value;
      const message = document.getElementById('message').value.trim();
      const normalizedMessage = lineId
        ? `${message}${message ? '\n\n' : ''}LINE ID：${lineId}`
        : message;

      params.append('name', name);
      params.append('phone', phone);
      params.append('lineId', lineId);
      params.append('serviceType', serviceType);
      params.append('location', location);
      params.append('message', normalizedMessage);
      params.append('sourceUrl', window.location.href);
      params.append('userAgent', navigator.userAgent);

      try {
        const response = await fetch(`${scriptURL}?${params.toString()}`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
          headers: {
            Accept: 'text/plain'
          }
        });

        const responseText = (await response.text()).trim();
        if (!response.ok || !/success/i.test(responseText)) {
          throw new Error(responseText || `Unexpected response: ${response.status}`);
        }

        submitBtn.disabled = false;
        submitBtn.innerText = defaultSubmitText;

        if (typeof gtag === 'function') {
          gtag('event', 'generate_lead', {
            event_category: 'Contact',
            event_label: 'Submit Form'
          });
        }

        alert('感謝您的詢問！表單已成功送出，我們會在 24 小時內與您聯繫。');
        form.reset();
        applyServiceSelection();
      } catch (error) {
        submitBtn.disabled = false;
        submitBtn.innerText = '再次送出';
        console.error('Form submit error:', error);
        alert('表單送出失敗，請稍後再試，或直接撥打 0900-019-725 聯繫我們。');
      }
    });
  }
});
