(() => {
  'use strict';

  const PAGES = {
    arrival:       { file: 'pages/arrival.html',       label: '発着案内' },
    timetable:     { file: 'pages/timetable.html',     label: '時刻表' },
    linemap:       { file: 'pages/linemap.html',       label: '路線図' },
    accessibility: { file: 'pages/accessibility.html', label: 'バリアフリー' },
    around:        { file: 'pages/around.html',        label: '駅周辺' },
    commute:       { file: 'pages/commute.html',       label: '定期券' },
    lost:          { file: 'pages/lost.html',          label: '忘れ物' },
  };

  const nav     = document.getElementById('site-nav');
  const content = document.getElementById('content');
  const clock   = document.getElementById('clock');
  let currentPage = null;
  const cache = {};

  // ── ナビボタン生成 ──────────────────────────────
  Object.entries(PAGES).forEach(([key, { label }]) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.dataset.page = key;
    btn.addEventListener('click', () => navigateTo(key));
    nav.appendChild(btn);
  });

  // ── ページ読み込み ───────────────────────────────
  async function navigateTo(key) {
    if (key === currentPage) return;
    currentPage = key;

    // アクティブタブ更新
    nav.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.page === key);
    });

    // キャッシュがあれば即表示
    if (cache[key]) { render(cache[key]); return; }

    // ローディング表示
    content.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>読み込み中…</span>
      </div>`;

    try {
      const res = await fetch(PAGES[key].file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      cache[key] = html;
      render(html);
    } catch (e) {
      content.innerHTML = `
        <div class="stub">
          <div class="stub-icon">⚠️</div>
          <h2>ページを読み込めませんでした</h2>
          <p>${e.message}</p>
        </div>`;
    }
  }

  function render(html) {
    content.innerHTML = html;
    // ページ内スクリプトを実行
    content.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script');
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
    content.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ── 時計 ───────────────────────────────────────
  function updateClock() {
    if (!clock) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = `${h}:${m} 現在`;
  }
  updateClock();
  setInterval(updateClock, 30_000);

  // ── 初期ページ ─────────────────────────────────
  navigateTo('arrival');
})();
