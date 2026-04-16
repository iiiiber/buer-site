#!/usr/bin/env node
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) { console.error("MISSING GITHUB_TOKEN"); process.exit(1); }
const fs = require('fs');
const https = require('https');
const BUER_SITE = '/root/.openclaw/workspace-jinhua/buer-site';
const CONTENT_DIR = BUER_SITE + '/content';
const GITHUB_API = 'https://api.github.com/repos/jijianduizhang-ship-it/buer-site/contents';

const httpsReq = (opts, body) => new Promise((res, rej) => {
  const r = https.request(opts, resp => {
    let d = '';
    resp.on('data', c => d += c);
    resp.on('end', () => {
      try { res({ s: resp.statusCode, d: JSON.parse(d || '{}') }); }
      catch { res({ s: resp.statusCode, d: {} }); }
    });
  });
  r.on('error', rej);
  if (body) r.write(typeof body === 'string' ? body : JSON.stringify(body));
  r.end();
});

const getSHA = async (p) => {
  try {
    const r = await httpsReq({
      hostname: 'api.github.com',
      path: GITHUB_API + '/' + p,
      headers: { 'Authorization': 'token ' + GITHUB_TOKEN, 'User-Agent': 'gen', 'Accept': 'application/vnd.github.v3+json' }
    });
    return r.d.sha || null;
  } catch { return null; }
};

const pushFile = async (p, c, m) => {
  const sha = await getSHA(p);
  const b = { message: m, content: Buffer.from(c).toString('base64'), ...(sha ? { sha } : {}) };
  const r = await httpsReq({
    hostname: 'api.github.com', path: GITHUB_API + '/' + p, method: 'PUT',
    headers: { 'Authorization': 'token ' + GITHUB_TOKEN, 'User-Agent': 'gen', 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' }
  }, b);
  return r;
};

const NAV_SCRIPT = `<script>(function(){var p=location.pathname.replace(/\\/$/,"");document.querySelectorAll(".nav-link").forEach(function(e){var h=e.getAttribute("href").replace(/\\/$/,"");var m=h===p||(p.startsWith(h)&&h!=="/")||(h==="/diary"&&p.startsWith("/diary"))||(h==="/documents"&&p.startsWith("/documents"))||(h==="/skills"&&p.startsWith("/skills"));if(m){e.classList.add("active")}else{e.classList.remove("active")}})})();</script>`;

function buildPage(title, desc, bodyContent) {
  const css = fs.readFileSync(BUER_SITE + '/styles.css', 'utf8');
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '|不二</title><meta name="description" content="' + desc + '"><link rel="canonical" href="https://buer.imoons.cn/"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css"><style>' + css + '</style></head><body class="min-h-screen grid-bg relative overflow-x-hidden"><div class="fixed inset-0 overflow-hidden pointer-events-none" style="z-index:0"><div class="orb w-[500px] h-[500px] bg-cyan-500/20 top-[-100px] left-[-100px]"></div><div class="orb w-[400px] h-[400px] bg-violet-500/15 bottom-[-80px] right-[-80px]"></div><div class="orb w-[300px] h-[300px] bg-cyan-400/10 top-[40%] left-[50%] -translate-x-1/2"></div></div><header class="fixed top-0 left-0 right-0 z-50 header-glass" style="border-bottom: 1px solid rgba(139,92,246,0.08);"><div class="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between"><a href="/" class="flex items-center gap-3"><img src="/logo.svg" alt="不二" class="w-10 h-10 rounded-xl"></a><nav class="desktop-nav flex items-center gap-4 ml-auto"><a href="/" class="nav-link text-gray-400 font-medium text-base">首页</a><a href="/diary" class="nav-link text-gray-400 font-medium text-base">日记</a><a href="/documents" class="nav-link text-gray-400 font-medium text-base">文档</a><a href="/skills" class="nav-link text-gray-400 font-medium text-base">技能</a><a href="/about" class="nav-link text-gray-400 font-medium text-base">关于</a>' + NAV_SCRIPT + '</nav></div></header><main class="relative z-10 pt-28 pb-20"><div class="max-w-3xl mx-auto px-6">' + bodyContent + '</div></main><footer class="relative z-10 border-t border-white/4 py-10"><div class="max-w-6xl mx-auto px-6"><div class="flex items-center gap-3"><img src="/logo.svg" alt="不" class="w-8 h-8 rounded-lg"><span class="text-gray-500 text-sm">© 2026 buer.imoons.cn</span></div></div></footer></body></html>';
}

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function genDiary(item) {
  const T = esc(item.title || '');
  const D = esc(item.excerpt || '');
  const content = (item.content || item.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const tags = (item.tags || []).map(t => '<span class="tag-pill text-xs px-3 py-1 rounded-full text-violet-soft">' + esc(t) + '</span>').join('');
  const article = '<article class="glass-card rounded-2xl p-8 md:p-10 mb-8"><div class="corner-tl"></div><div class="corner-br"></div><div class="flex flex-wrap gap-2 mb-6"><span class="tag-pill text-xs px-3 py-1 rounded-full text-cyan-primary">' + esc(item.date) + '</span>' + tags + '</div><h1 class="text-3xl font-bold text-white mb-6 leading-snug">' + T + '</h1><div class="divider-line mb-8"></div><div class="article-content"><p>' + content + '</p></div></article><div class="text-center"><a href="/diary" class="btn-primary inline-flex items-center gap-2 px-7 py-3 text-dark-950 font-semibold rounded-xl text-sm">← 返回日记列表</a></div>';
  return buildPage(T, D, article);
}

function genDoc(item) {
  const T = esc(item.title || '');
  const D = esc(item.excerpt || '');
  const content = (item.content || item.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const feishuLink = item.feishuUrl ? '<div class="mt-8 pt-6 border-t border-white/5"><a href="' + esc(item.feishuUrl) + '" target="_blank" class="inline-flex items-center gap-2 text-cyan-primary hover:text-cyan-300 text-sm">📎 查看飞书原文 →</a></div>' : '';
  const article = '<article class="glass-card rounded-2xl p-8 md:p-10 mb-8"><div class="corner-tl"></div><div class="corner-br"></div><div class="flex flex-wrap gap-2 mb-6"><span class="tag-pill text-xs px-3 py-1 rounded-full text-cyan-primary">' + esc(item.date) + '</span><span class="tag-pill text-xs px-3 py-1 rounded-full text-violet-soft">' + esc(item.category || '文档') + '</span></div><h1 class="text-3xl font-bold text-white mb-6 leading-snug">' + T + '</h1><div class="divider-line mb-8"></div><div class="article-content"><p>' + content + '</p></div>' + feishuLink + '</article><div class="text-center"><a href="/documents" class="btn-primary inline-flex items-center gap-2 px-7 py-3 text-dark-950 font-semibold rounded-xl text-sm">← 返回文档列表</a></div>';
  return buildPage(T, D, article);
}

async function main() {
  console.log('=== generate-pages running ===');
  let totalOk = 0, totalErr = 0;

  const dPath = CONTENT_DIR + '/diary.json';
  if (fs.existsSync(dPath)) {
    const dData = JSON.parse(fs.readFileSync(dPath, 'utf8'));
    const dDir = BUER_SITE + '/diary';
    if (!fs.existsSync(dDir)) fs.mkdirSync(dDir, { recursive: true });
    for (const item of (dData.diary || [])) {
      const id = item.id || item.date;
      const html = genDiary(item);
      fs.writeFileSync(dDir + '/' + id + '.html', html);
      const r = await pushFile('diary/' + id + '.html', html, '更新日记:' + item.title);
      if (r.s === 200 || r.s === 201) { console.log('OK diary/' + id + '.html'); totalOk++; }
      else { console.log('ERR diary/' + id + '.html ' + r.s + ':', JSON.stringify(r.d).slice(0, 80)); totalErr++; }
    }
  }

  const docPath = CONTENT_DIR + '/documents.json';
  if (fs.existsSync(docPath)) {
    const docData = JSON.parse(fs.readFileSync(docPath, 'utf8'));
    const docDir = BUER_SITE + '/documents';
    if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
    for (const item of (docData.documents || [])) {
      const id = item.id || item.title;
      const html = genDoc(item);
      fs.writeFileSync(docDir + '/' + id + '.html', html);
      const r = await pushFile('documents/' + id + '.html', html, '更新文档:' + item.title);
      if (r.s === 200 || r.s === 201) { console.log('OK documents/' + id + '.html'); totalOk++; }
      else { console.log('ERR documents/' + id + '.html ' + r.s + ':', JSON.stringify(r.d).slice(0, 80)); totalErr++; }
    }
  }
  console.log('Done. OK=' + totalOk + ' ERR=' + totalErr);
  if (totalErr > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
