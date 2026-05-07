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

  // ── Before/After 比較器 ──
  function initCompare(containerId, afterWrapId, dividerId) {
    const container = document.getElementById(containerId);
    const afterWrap  = document.getElementById(afterWrapId);
    const divider    = document.getElementById(dividerId);
    if (!container) return;

    let dragging = false;

    function setPos(clientX) {
      const rect = container.getBoundingClientRect();
      let pct = (clientX - rect.left) / rect.width * 100;
      pct = Math.max(0, Math.min(100, pct));
      afterWrap.style.width  = pct + '%';
      divider.style.left     = pct + '%';
    }

    // Mouse
    divider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
    document.addEventListener('mouseup',  () => { dragging = false; });
    document.addEventListener('mousemove', (e) => { if (dragging) setPos(e.clientX); });

    // Touch
    divider.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });
    document.addEventListener('touchend',  () => { dragging = false; });
    document.addEventListener('touchmove', (e) => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });

    // 初始位置 50%
    if (container.offsetWidth > 0) {
      setPos(container.getBoundingClientRect().left + container.offsetWidth * 0.5);
    }
  }

  initCompare('compare1', 'compare1-after', 'compare1-div');
  initCompare('compare2', 'compare2-after', 'compare2-div');
  initCompare('compare3', 'compare3-after', 'compare3-div');

  // ── 北區透天翻修 輪播 ──
  const track  = document.getElementById('carouselTrack');
  if (track) {
    const dots   = document.querySelectorAll('.carousel-dot');
    const total  = 4;
    let current  = 0;
    let autoTimer;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(autoTimer); goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(autoTimer); goTo(current + 1); startAuto(); });
    dots.forEach(dot => dot.addEventListener('click', () => { clearInterval(autoTimer); goTo(+dot.dataset.index); startAuto(); }));

    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 4000); }
    startAuto();
  }
  
  // 導覽列滾動陰影變化
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      } else {
        navbar.style.boxShadow = 'var(--shadow-sm)';
      }
    });
  }

  // --- 表單提交邏輯 ---
  const scriptURL = 'https://script.google.com/macros/s/AKfycbyTq-1qMHHH5nVSUkodOmv7Nl_v51DH50LtdcK_6k3JM0H3V8_cQNd6NdquhXuZHwXa9g/exec';
  const form = document.querySelector('#contactForm');
  if (form) {
    const submitBtn = form.querySelector('.submit-btn');

    form.addEventListener('submit', e => {
      e.preventDefault();
      
      // 防止重複送出
      submitBtn.disabled = true;
      submitBtn.innerText = '送出中...';

      // 整理資料 (對應 GAS 腳本中的參數名)
      const formData = new FormData();
      formData.append('name', document.getElementById('name').value);
      formData.append('phone', document.getElementById('phone').value);
      formData.append('serviceType', document.getElementById('serviceType').value);
      formData.append('location', document.getElementById('location').value);
      formData.append('message', document.getElementById('message').value);

      fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => {
          submitBtn.disabled = false;
          submitBtn.innerText = '送出諮詢';
          
          if (response.ok) {
            // 觸發 GA4 表單送出事件 (確保伺服器成功接收才打點)
            if (typeof gtag === 'function') {
              gtag('event', 'generate_lead', {
                'event_category': 'Contact',
                'event_label': 'Submit Form'
              });
            }
          }

          alert('感謝您的詢問！我們已收到您的資訊，將儘速與您聯繫。');
          form.reset();
        })
        .catch(error => {
          submitBtn.disabled = false;
          submitBtn.innerText = '再次送出';
          console.error('Error!', error.message);
          alert('傳送發生錯誤，請稍後再試，或直接撥打電話聯繫，謝謝！');
        });
    });
  }
});
