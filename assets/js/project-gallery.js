// 首頁縮圖使用逐案挑選的代表性前後照片，不等同於完整相簿的排序。
const projectCases = [
  { slug: 'east-district-new-home', name: '東區新屋裝潢', description: '全室裝潢統包工程', before: 5, after: 6, thumbnail: { before: 2, after: 1 } },
  { slug: 'hair-salon', name: '美髮商空', description: '商業空間裝修工程', before: 1, after: 3, thumbnail: { before: 1, after: 3 } },
  { slug: 'thai-tea-shop', name: '泰奶商空', description: '商業空間裝修工程', before: 3, after: 3, thumbnail: { before: 1, after: 1 } },
  { slug: 'xinying-new-home', name: '新營區新成屋裝潢', description: '新成屋室內裝潢工程', before: 7, after: 12, thumbnail: { before: 1, after: 1 } },
  { slug: 'duplex-build', name: '雙透天自地自建', description: '自地自建工程', before: 5, after: 5, thumbnail: { before: 1, after: 1 } },
  { slug: 'tile-renovation', name: '地磚翻新案場', description: '地磚翻新工程', before: 4, after: 4, thumbnail: { before: 1, after: 1 } },
  { slug: 'century-house-structure', name: '百年老屋翻新結構補強', description: '老屋結構補強與翻新工程', before: 10, after: 9, thumbnail: { before: 1, after: 6 } },
  { slug: 'rende-floor-leveling', name: '仁德區地板整平工程', description: '地板整平工程', before: 10, after: 3, thumbnail: { before: 1, after: 1 } },
  { slug: 'renhe-bathroom-balcony', name: '仁和路浴室陽台翻修', description: '浴室與陽台翻修工程', before: 7, after: 5, thumbnail: { before: 4, after: 4 } },
  { slug: 'guantian-bathroom', name: '官田浴室翻修工程', description: '浴室翻修工程', before: 3, after: 5, thumbnail: { before: 1, after: 5 } },
  { slug: 'east-district-elevator', name: '東區增建加裝電梯', description: '增建與電梯加裝工程', before: 7, after: 4, thumbnail: { before: 2, after: 2 } },
  { slug: 'datong-bathroom-floor', name: '大同路浴室及房間地板更新', description: '衛浴與房間地板翻修工程', before: 5, after: 5, thumbnail: { before: 5, after: 5 } },
  { slug: 'yongkang-floor-damp', name: '永康地坪及壁癌工程', description: '地坪與壁癌修繕工程', before: 7, after: 6, thumbnail: { before: 4, after: 4 } }
];

function projectImagePath(project, stage, number) {
  return `assets/project-gallery/${project.slug}/${stage}/${String(number).padStart(2, '0')}.jpg`;
}

function projectImages(project, stage) {
  return Array.from({ length: project[stage] }, (_, index) => ({
    src: projectImagePath(project, stage, index + 1),
    stage,
    stageLabel: stage === 'before' ? '施工前' : '施工後',
    number: index + 1
  }));
}

function renderProjectCard(project, index) {
  const thumbnail = project.thumbnail || { before: 1, after: 1 };
  const beforeImage = projectImagePath(project, 'before', thumbnail.before);
  const afterImage = projectImagePath(project, 'after', thumbnail.after);
  const allImages = [...projectImages(project, 'before'), ...projectImages(project, 'after')];
  const delay = (index % 3) * 0.1;
  const galleryImages = allImages.map(image => `
    <figure class="case-photo">
      <img src="${image.src}" alt="${project.name} ${image.stageLabel} 第 ${image.number} 張" loading="lazy" decoding="async">
      <figcaption>${image.stageLabel} · 第 ${image.number} 張</figcaption>
    </figure>
  `).join('');

  return `
    <article class="portfolio-item fade-up" style="transition-delay: ${delay}s;">
      <div class="compare-wrapper">
        <div class="compare-container" data-compare>
          <img class="img-before" src="${afterImage}" alt="${project.name} 施工後">
          <div class="img-after-wrap">
            <img src="${beforeImage}" alt="${project.name} 施工前">
          </div>
          <div class="compare-divider" role="slider" tabindex="0" aria-label="${project.name} 施工前後比較" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
            <div class="compare-handle" aria-hidden="true">⇔</div>
          </div>
        </div>
        <div class="compare-labels">
          <span class="label-before">施工前</span>
          <span class="label-after">施工後</span>
        </div>
      </div>
      <div class="portfolio-info">
        <h3>${project.name}</h3>
        <p>${project.description}</p>
      </div>
      <details class="case-gallery">
        <summary class="case-gallery-summary">
          <span class="case-gallery-copy">
            <span class="case-gallery-title">完整工程相簿</span>
            <span class="case-gallery-subtitle">查看施工前後紀錄</span>
          </span>
          <span class="case-gallery-meta">
            <span class="case-photo-count">${allImages.length} 張照片</span>
            <span class="case-gallery-toggle" aria-hidden="true"></span>
          </span>
        </summary>
        <div class="case-photo-grid">${galleryImages}</div>
      </details>
    </article>
  `;
}

const portfolioCases = document.getElementById('portfolioCases');

if (portfolioCases) {
  portfolioCases.innerHTML = projectCases.map(renderProjectCard).join('');
}
