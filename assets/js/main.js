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
  const submissionDialog = document.querySelector('#submissionNotice');
  const submissionDialogClose = submissionDialog?.querySelector('.submission-dialog-close');

  function openSubmissionDialog() {
    if (!submissionDialog || typeof submissionDialog.showModal !== 'function') return;
    submissionDialog.showModal();
  }

  if (submissionDialog && submissionDialogClose) {
    submissionDialogClose.addEventListener('click', () => submissionDialog.close());
    submissionDialog.addEventListener('click', event => {
      if (event.target === submissionDialog) submissionDialog.close();
    });
  }

  const form = document.querySelector('#contactForm');
  if (form) {
    const submitBtn = form.querySelector('.submit-btn');
    const defaultSubmitText = submitBtn ? submitBtn.innerText : '送出諮詢';

    // 表單資料是接在網址後面送出的，Google 對整串網址有長度上限；
    // 超過就會被擋下並變成送出失敗，這裡留安全餘裕先擋下來。
    const maxRequestUrlLength = 9500;

    const nameField = document.getElementById('name');
    const phoneField = document.getElementById('phone');
    const messageField = document.getElementById('message');
    const requiredFields = [
      { el: nameField, label: '姓名' },
      { el: phoneField, label: '聯絡電話' }
    ];

    // 使用者重新輸入時清掉前一次的提示，否則原生驗證訊息會一直卡著
    [nameField, phoneField, messageField].forEach(el => {
      if (el) el.addEventListener('input', () => el.setCustomValidity(''));
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!submitBtn) return;

      // 只打空白的必填欄位會通過瀏覽器的 required 檢查，這裡補上實際內容檢查
      let hasBlankRequired = false;
      requiredFields.forEach(({ el, label }) => {
        if (!el) return;
        const isBlank = !el.value.trim();
        el.setCustomValidity(isBlank ? `請填寫${label}` : '');
        if (isBlank) hasBlankRequired = true;
      });

      if (hasBlankRequired) {
        form.reportValidity();
        return;
      }

      const params = new URLSearchParams();
      const name = nameField.value.trim();
      const phone = phoneField.value.trim();
      const lineId = document.getElementById('lineId')?.value.trim() || '';
      const serviceType = document.getElementById('serviceType').value;
      const location = document.getElementById('location').value;
      const message = messageField ? messageField.value.trim() : '';
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

      const requestUrl = `${scriptURL}?${params.toString()}`;

      // 網址過長時 Google 會回一個不帶跨網域標頭的錯誤頁，
      // 瀏覽器會直接判定連線失敗，所以在送出前先改成可讀的提示
      if (requestUrl.length > maxRequestUrlLength && messageField) {
        messageField.setCustomValidity('內容太長了，請精簡後再送出，或直接撥打 0900-019-725 跟我們說。');
        form.reportValidity();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = '送出中...';

      try {
        const response = await fetch(requestUrl, {
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

        form.reset();
        applyServiceSelection();
        openSubmissionDialog();
      } catch (error) {
        submitBtn.disabled = false;
        submitBtn.innerText = '再次送出';
        console.error('Form submit error:', error);
        alert('表單送出失敗，請稍後再試，或直接撥打 0900-019-725 聯繫我們。');
      }
    });
  }

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
    lineFab.href = lineHref;
    lineFab.target = '_blank';
    lineFab.rel = 'noopener';
    lineFab.setAttribute('aria-label', '用 LINE 詢問');
    lineFab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 3C6.5 3 2 6.6 2 11c0 2.5 1.4 4.7 3.6 6.2V21l3.3-1.8c1 .2 2 .4 3.1.4 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/>' +
      '</svg><span>LINE 諮詢</span>';
    document.body.appendChild(lineFab);

    lineFab.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'line_contact_click', {
          event_category: 'Contact',
          event_label: currentPage
        });
      }
    });

    // 客人已經在填表單時先收起來，避免蓋住送出鈕
    const contactFormEl = document.querySelector('#contactForm');
    if (contactFormEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(entry => {
          lineFab.classList.toggle('is-hidden', entry.isIntersecting);
        });
      }, { threshold: 0.15 }).observe(contactFormEl);
    }
  }
});
