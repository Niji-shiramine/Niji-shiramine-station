/**
 * router.js — Hash-based SPA router for GitHub Pages
 * URLハッシュ (#departure, #timetable …) に応じて
 * pages/*.html を fetch して #shell-main に注入する
 */

const PAGES = {
  ''           : 'pages/departure.html',
  'departure'  : 'pages/departure.html',
  'timetable'  : 'pages/timetable.html',
  'linemap'    : 'pages/linemap.html',
  'accessible' : 'pages/accessible.html',
  'around'     : 'pages/around.html',
  'pass'       : 'pages/pass.html',
  'lost'       : 'pages/lost.html',
};

const main = document.getElementById('shell-main');

async function loadPage(hash) {
  const key  = (hash || '').replace(/^#/, '');
  const url  = PAGES[key] ?? PAGES[''];

  // ローディング表示
  main.innerHTML = `
    <div class="page-loading">
      <div class="spinner"></div>
      <span>読み込み中…</span>
    </div>`;

  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const html = await res.text();
    main.innerHTML = html;
  } catch (e) {
    main.innerHTML = `
      <div class="placeholder-page">
        <i class="ti ti-alert-circle"></i>
        <p>ページを読み込めませんでした（${e.message}）</p>
      </div>`;
  }

  // アクティブタブ更新
  document.querySelectorAll('.navtab a').forEach(a => {
    const aKey = (a.getAttribute('href') || '').replace(/^#/, '');
    const match = key === '' ? aKey === 'departure' : aKey === key;
    a.classList.toggle('active', match);
  });

  // 時計（発着ページのみ）
  if (key === '' || key === 'departure') startClock();
}

function startClock() {
  const tick = () => {
    const el = document.getElementById('live-clock');
    if (!el) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    el.textContent = `${h}:${m} 現在`;
  };
  tick();
  clearInterval(window._clockTimer);
  window._clockTimer = setInterval(tick, 30000);
}

// 初期ロード & ハッシュ変更
window.addEventListener('hashchange', () => loadPage(location.hash));
loadPage(location.hash);
