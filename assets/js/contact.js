/* 詢問入口共用邏輯；本機預覽在載入任何 Google tag 前隔離。 */
(function () {
  'use strict';
  if (window.QileContact) return;
  const preview = location.protocol === 'file:' || /^(localhost|127\.\d+\.\d+\.\d+|\[?::1\]?)$/i.test(location.hostname);
  const events = [], navigations = [], bound = new WeakSet();
  const idKeys = ['campaign_id', 'ad_group_id', 'creative_id'];
  const query = new URLSearchParams(location.search);
  const validId = value => typeof value === 'string' && /^[1-9][0-9]{0,19}$/.test(value);
  const knownPages = ['index.html', 'masonry.html', 'bathroom.html', 'renovation.html', 'building.html', 'flooring.html'];
  const segment = location.pathname.split('/').pop() || 'index.html';
  const page = knownPages.includes(segment) ? segment : 'unknown';
  const isBuilding = page === 'building.html';
  const buildingStoreKey = 'qile-homebuilding-source-v1';
  // 正式群組與新版廣告尚未讀回；只有日後核准的真實對照可填入。
  const homebuildingAdRoutes = [
  {
    "ad_intent": "self_build",
    "campaign_id": "23724366917",
    "ad_group_id": "195800854475",
    "creative_id": "829698920602"
  },
  {
    "ad_intent": "new_home",
    "campaign_id": "23724366917",
    "ad_group_id": "208335420184",
    "creative_id": "829698920605"
  }
];
  const sourceKeys = ['ad_intent', ...idKeys];
  const intents = ['self_build', 'new_home'];
  const buildingQuestions = {
    self_build:'我想詢問自地自建。地區：＿＿；土地：＿＿；圖說：＿＿；建照：＿＿。',
    new_home:'我想詢問新建房屋施工。地區：＿＿；土地：＿＿；圖說：＿＿；建照：＿＿。',
    homebuilding:'我想詢問建屋。地區：＿＿；目前進度：＿＿。'
  };
  const questions = {'masonry.html':'我想詢問泥作工程','bathroom.html':'我想詢問浴室翻修','renovation.html':'我想詢問房屋翻修','building.html':buildingQuestions.homebuilding,'flooring.html':'我想詢問地板工程'};
  function taiwanDate() {
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    return ['year','month','day'].map(type => parts.find(part => part.type === type).value).join('-');
  }
  function unmatched(status, origin) {
    return {ad_intent:'unknown',source_status:status,source_context:origin};
  }
  function classifyBuilding(candidate, invalid, origin) {
    if (invalid) return unmatched('conflict', origin);
    if (sourceKeys.some(key => !Object.prototype.hasOwnProperty.call(candidate,key))) return unmatched('partial', origin);
    const match = homebuildingAdRoutes.find(row => sourceKeys.every(key => row[key] === candidate[key]));
    if (match) return Object.assign(Object.fromEntries(sourceKeys.map(key => [key,match[key]])), {source_status:'matched',source_context:origin});
    const group = homebuildingAdRoutes.find(row => row.ad_group_id === candidate.ad_group_id);
    const creative = homebuildingAdRoutes.find(row => row.creative_id === candidate.creative_id);
    const crossed = [group,creative].some(row => row && (row.campaign_id !== candidate.campaign_id || row.ad_intent !== candidate.ad_intent)) ||
      (group && creative && group.ad_group_id !== creative.ad_group_id);
    return unmatched(crossed ? 'conflict' : 'unknown', origin);
  }
  function clearBuildingSource() {
    try { sessionStorage.removeItem(buildingStoreKey); } catch (_) { /* 不可儲存仍可聯絡。 */ }
  }
  function readBuildingSource() {
    const today = taiwanDate();
    if (sourceKeys.some(key => query.has(key))) {
      clearBuildingSource();
      const candidate = {};
      let invalid = query.getAll('service_interest').includes('brickwork');
      sourceKeys.forEach(key => {
        if (!query.has(key)) return;
        const value = query.get(key);
        if (query.getAll(key).length !== 1 || !(key === 'ad_intent' ? intents.includes(value) : validId(value))) invalid = true;
        else candidate[key] = value;
      });
      const result = classifyBuilding(candidate, invalid, 'url');
      if (result.source_status === 'matched') {
        try { sessionStorage.setItem(buildingStoreKey, JSON.stringify({version:1,date:today,source:candidate})); } catch (_) { /* 當頁來源仍有效。 */ }
      }
      return result;
    }
    try {
      const stored = JSON.parse(sessionStorage.getItem(buildingStoreKey) || 'null');
      if (stored && stored.version === 1 && stored.date === today && stored.source && typeof stored.source === 'object') {
        const candidate = {};
        sourceKeys.forEach(key => { if (Object.prototype.hasOwnProperty.call(stored.source,key)) candidate[key] = stored.source[key]; });
        const valid = intents.includes(candidate.ad_intent) && idKeys.every(key => validId(candidate[key]));
        const result = classifyBuilding(candidate, !valid, 'session_context');
        if (result.source_status === 'matched') return result;
      }
    } catch (_) { /* 損壞或不可用的保存資料不能補成已知來源。 */ }
    clearBuildingSource();
    return unmatched('unknown','none');
  }
  let source = {};
  if (isBuilding) source = readBuildingSource();
  else if (!query.has('ad_intent')) {
    // 舊流程保留；任何建屋標記都不能寫入或借用舊三ID來源。
    const storageKey = 'qile-contact-source-v1';
    if (idKeys.some(key => query.has(key))) {
      idKeys.forEach(key => {
        if (query.getAll(key).length === 1 && validId(query.get(key))) source[key] = query.get(key);
      });
      try { sessionStorage.setItem(storageKey, JSON.stringify(source)); } catch (_) { /* 儲存不可用不阻礙聯絡。 */ }
    } else {
      try {
        const stored = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
        idKeys.forEach(key => { if (stored && validId(stored[key])) source[key] = stored[key]; });
      } catch (_) { /* 只保留當頁可驗證資料。 */ }
    }
  }
  function buildingInterest(link) {
    const interest = link && link.dataset.serviceInterest;
    return Object.prototype.hasOwnProperty.call(buildingQuestions,interest) ? interest : 'homebuilding';
  }
  function buildingMessage(link) {
    const message = buildingQuestions[buildingInterest(link)];
    if (source.source_status !== 'matched') return message;
    return message + '\n' + (source.ad_intent === 'self_build' ? 'HB-SB' : 'HB-NH');
  }
  function context(link, method) {
    const brick = link && link.dataset.serviceInterest === 'brickwork';
    let placement = link && link.dataset.ctaLocation;
    if (!['hero','floating','contact_section','footer'].includes(placement)) {
      placement = link && link.closest('.line-fab') ? 'floating' : link && link.closest('header') ? 'hero' : link && link.closest('footer') ? 'footer' : 'contact_section';
    }
    return Object.assign({}, source, {
      service_interest: isBuilding ? buildingInterest(link) : brick ? 'brickwork' : page === 'masonry.html' ? 'masonry' : page === 'unknown' ? 'unknown' : 'other',
      contact_method: method, cta_location: placement,
      landing_variant: isBuilding ? 'building_hub' : brick ? 'brickwork_section' : page === 'masonry.html' ? 'existing_masonry' : page === 'index.html' ? 'home' : 'unknown'
    });
  }
  function emit(name, params) {
    if (preview) {
      events.push({name, params: Object.fromEntries(Object.entries(params).filter(([,v]) => typeof v !== 'function'))});
      return true;
    }
    try {
      if (typeof window.gtag !== 'function') return false;
      window.gtag('event', name, params);
      return true;
    } catch (_) { return false; }
  }
  function mockNavigation(destination, method) {
    navigations.push({method, destination});
    const status = document.getElementById('contact-preview-status');
    if (status) status.textContent = method === 'phone' ? '已示範電話詢問；未撥號、未傳送追蹤。' : '已示範 LINE 詢問；未開啟 LINE、未傳送追蹤。';
  }
  function phone(destination, link) {
    if (!/^tel:0900019725$/.test(destination)) return false;
    const params = context(link, 'phone');
    let navigated = false;
    const navigate = () => {
      if (navigated) return;
      navigated = true;
      if (preview) mockNavigation(destination, 'phone');
      else window.location.href = destination;
    };
    const timer = setTimeout(navigate, 300);
    emit('click_phone', Object.assign({event_category:'Contact', event_label:'Phone Call'}, params));
    const accepted = emit('conversion', Object.assign({}, params, {
      send_to:'AW-18055428591/sD1tCIH-5K4cEO_zv6FD',value:1.0,currency:'TWD',
      event_callback:() => { clearTimeout(timer); navigate(); }
    }));
    if (preview || !accepted) { clearTimeout(timer); navigate(); }
    return false;
  }
  function lineHref(link) {
    const question = isBuilding ? buildingMessage(link) : link.dataset.serviceInterest === 'brickwork' ? '我想詢問砌磚工程' : questions[page] || '';
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return mobile && question ? 'https://line.me/R/oaMessage/%40548mfdmm/?' + encodeURIComponent(question) : 'https://line.me/R/ti/p/%40548mfdmm';
  }
  function init() {
    if (isBuilding) document.querySelectorAll('[data-building-message]').forEach(node => { node.textContent = buildingMessage(node); });
    if (preview && !document.getElementById('contact-preview')) {
      document.body.classList.add('qile-preview');
      const panel = document.createElement('aside'); panel.id = 'contact-preview';
      panel.innerHTML = '<strong>本機預覽・聯絡按鈕僅示範</strong><span id="contact-preview-status" role="status" aria-live="polite">未連接廣告或分析平台</span>';
      document.body.appendChild(panel);
    }
    document.querySelectorAll('a[href^="tel:"], a[data-line-contact]').forEach(link => {
      if (bound.has(link)) return;
      bound.add(link);
      const method = link.hasAttribute('data-line-contact') ? 'line' : 'phone';
      const destination = method === 'line' ? lineHref(link) : link.getAttribute('href');
      // 新來源使用唯一 listener；舊頁的 inline 入口在這個共用路徑接管。
      link.removeAttribute('onclick');
      link.href = destination;
      if (preview) {
        link.dataset.previewDestination = destination;
        link.href = '#contact-preview';
        link.removeAttribute('target');
      }
      link.addEventListener('click', event => {
        if (method === 'phone') { event.preventDefault(); phone(destination, link); }
        else {
          if (preview) event.preventDefault();
          emit('line_contact_click', Object.assign({event_category:'Contact',event_label:page}, context(link,'line')));
          if (preview) mockNavigation(destination, 'line');
        }
      });
      if (preview) link.addEventListener('auxclick', event => event.preventDefault());
    });
    // 直接開檔沒有預覽伺服器的全頁隔離；未改動的舊服務頁僅提供示範導航。
    if (preview && location.protocol === 'file:') {
      document.querySelectorAll('a[href]').forEach(link => {
        const target = new URL(link.getAttribute('href'), location.href);
        const filename = target.pathname.split('/').pop();
        if (target.protocol !== 'file:' || ['masonry.html','index.html','building.html'].includes(filename)) return;
        link.href = '#contact-preview';
        link.removeAttribute('target');
        link.addEventListener('click', event => {
          event.preventDefault();
          document.getElementById('contact-preview-status').textContent = '其他服務頁請從本機預覽網址開啟。';
        });
        link.addEventListener('auxclick', event => event.preventDefault());
      });
    }
    const copy = document.getElementById('copy-brick-message');
    if (copy && !bound.has(copy)) {
      bound.add(copy);
      copy.addEventListener('click', async () => {
        const text = document.getElementById('brick-message').textContent.trim();
        try { await navigator.clipboard.writeText(text); copy.textContent = '已複製詢問範本'; }
        catch (_) {
          const range = document.createRange(); range.selectNodeContents(document.getElementById('brick-message'));
          const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
          copy.textContent = '已選取範本，請複製文字';
        }
      });
    }
  }
  window.QileContact = {preview, events, navigations, init, phone, lineHref};
  if (!preview) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    // 頁面量測不帶任意 query 或 fragment；不改寫瀏覽器 URL 或 GCLID。
    let referrer = '';
    try { const ref = new URL(document.referrer); referrer = ref.origin + ref.pathname; } catch (_) { /* 無來源。 */ }
    window.gtag('set', {page_location:location.origin + location.pathname,page_referrer:referrer});
    window.gtag('js', new Date());
    window.gtag('config','G-RPTY6TW3ZX');
    window.gtag('config','AW-18055428591');
    const script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18055428591'; document.head.appendChild(script);
  }
})();
