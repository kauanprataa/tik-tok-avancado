/* TikTok Avançado · área de membros
   Login, progresso, vídeos e materiais vêm do Supabase (projeto tiktok-avancado).
   A trava de 7 dias vale no servidor: a função pode_ver_aula decide quem abre cada arquivo. */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const CFG = window.TTA_CONFIG || {};

  function fatal(msg) {
    const sp = $('#splash'); if (sp) sp.hidden = true;
    const g = $('#gate'); if (!g) return;
    $('#gateTitle').textContent = 'Não foi possível abrir a área';
    $('#gateText').textContent = msg;
    $('#gateOut').hidden = true;
    $('#gateRetry').onclick = () => location.reload();
    g.hidden = false;
  }
  if (!window.supabase || !window.supabase.createClient || !CFG.supabaseUrl) {
    fatal('Confira sua internet e recarregue a página.');
    return;
  }
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  /* ===== regras (iguais às do banco) ===== */
  const BUCKET = 'conteudo';
  const RELEASE = { free: ['1-1', '1-2'], days: 7 };
  const FREE = new Set(RELEASE.free);
  const DAY = 86400000;
  const MAX_MB = 50;

  /* ===== grade do curso ===== */
  const MODULES = [
    { n: 1, title: 'Fundamentos do TikTok Shop', tag: 'Comece do zero', sub: 'Conhecendo o mercado e preparando sua estrutura.', lessons: [
      ['Bem-vindo ao TikTok Shop: como funciona o mercado'],
      ['Entendendo o modelo de afiliados e como ganhar comissões', 'Um guia prático para sair da teoria e saber o que fazer no TikTok Shop: escolher produtos, planejar vídeos, publicar, analisar e melhorar.'],
      ['Criando e preparando sua conta'],
      ['Regras, requisitos e configurações importantes']
    ] },
    { n: 2, title: 'Produtos e estratégia de vendas', tag: 'Encontre produtos vencedores', sub: 'Aprendendo a identificar oportunidades comerciais.', lessons: [
      ['Como encontrar produtos com potencial de venda'],
      ['Como analisar comissões, preços e avaliações'],
      ['Como identificar produtos virais e tendências'],
      ['Como escolher seus primeiros produtos para divulgar']
    ] },
    { n: 3, title: 'Criação de conteúdo', tag: 'Vídeos que despertam desejo', sub: 'Aprendendo a transformar produtos em conteúdos.', lessons: [
      ['Como criar vídeos que chamam atenção'],
      ['Os melhores ganchos para prender o público'],
      ['Como demonstrar produtos e despertar desejo de compra'],
      ['Como criar vídeos utilizando inteligência artificial']
    ] },
    { n: 4, title: 'Estratégias de vendas', tag: 'Transforme conteúdo em vendas', sub: 'Estratégias para melhorar o desempenho dos conteúdos.', lessons: [
      ['Como estruturar vídeos com foco em conversão'],
      ['Como utilizar tendências a favor das vendas'],
      ['Como trabalhar com volume e consistência de publicação'],
      ['Como aumentar suas oportunidades de comissão']
    ] },
    { n: 5, title: 'Análise e escala', tag: 'Cresça com estratégia', sub: 'Aprendendo a analisar resultados e otimizar a operação.', lessons: [
      ['Como analisar métricas e identificar oportunidades'],
      ['Como identificar vídeos e produtos que convertem'],
      ['Como melhorar conteúdos que não estão vendendo'],
      ['Como escalar sua operação de afiliado']
    ] },
    { n: 6, title: 'Projeto 30 dias', tag: 'Da estratégia à execução', sub: 'Colocando tudo em prática para buscar seus primeiros resultados.', lessons: [
      ['Organizando sua rotina de trabalho'],
      ['Montando seu planejamento de produtos e conteúdos'],
      ['Plano de ação para buscar R$ 4 mil em faturamento'],
      ['Como manter a consistência e continuar crescendo']
    ] }
  ];
  const NOTICES = [
    { tag: 'Comece aqui', cls: 'acc', title: 'Assista às 2 primeiras aulas', text: 'Elas já estão liberadas. O guia da aula 02 tem as atividades para você fazer antes de publicar.' }
  ];
  const ART = [
    '--px:18%;--py:12%;--qx:95%;--qy:90%;--tint:var(--accent-deep);--ang:90deg',
    '--px:85%;--py:18%;--qx:5%;--qy:95%;--tint:var(--cyan);--ang:0deg',
    '--px:30%;--py:80%;--qx:90%;--qy:5%;--tint:var(--accent-2);--ang:45deg',
    '--px:72%;--py:10%;--qx:10%;--qy:70%;--tint:var(--accent-deep);--ang:90deg',
    '--px:50%;--py:40%;--qx:100%;--qy:100%;--tint:var(--cyan);--ang:135deg',
    '--px:10%;--py:55%;--qx:90%;--qy:20%;--tint:var(--accent-2);--ang:0deg'
  ];
  const ICON = {
    check: '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .6.7 1 1.2.6l7.2-4.8a.7.7 0 0 0 0-1.2L6.2 2.6C5.7 2.2 5 2.6 5 3.2z" fill="currentColor"/></svg>',
    lock: '<svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="2" fill="currentColor"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    next: '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5l4.5 4.5L6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    prev: '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ===== utilidades ===== */
  const pad = n => String(n).padStart(2, '0');
  const clock = s => { s = Math.max(0, Math.round(s || 0)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
  const hm = s => { const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? `${h}h ${pad(m)}min` : `${m} min`; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lid = (m, i) => m + '-' + i;
  const fmtBytes = b => !b ? '' : b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
  const fmtDate = t => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const extOf = p => ((String(p).split('/').pop().split('.').pop()) || '').toLowerCase();

  const ALL = [];
  MODULES.forEach(m => m.lessons.forEach((l, i) => ALL.push({ m: m.n, i: i + 1, num: ALL.length + 1, id: lid(m.n, i + 1), title: l[0], desc: l[1] || '' })));
  const getMod = n => MODULES.find(m => m.n === n);
  const getLesson = id => ALL.find(l => l.id === id);
  const modLessons = m => ALL.filter(l => l.m === m.n);
  const ASSETS = window.TTA_ASSETS || '';
  const capa = n => `${ASSETS}capas/modulo-${n}.svg`;

  /* ===== estado (vem do Supabase) ===== */
  const S = { user: null, admin: false, preview: false, previewStart: 0, mat: null, prog: {}, videos: {}, mats: [], all: [] };

  const isDone = id => !!(S.prog[id] && S.prog[id].concluida);
  const posOf = id => (S.prog[id] && !S.prog[id].concluida && S.prog[id].posicao) || 0;
  const staff = () => S.admin && !S.preview;
  const startTime = () => S.preview ? S.previewStart : (S.mat ? new Date(S.mat.inicio).getTime() : Date.now());
  const unlockAt = () => startTime() + RELEASE.days * DAY;
  const daysLeft = () => staff() ? 0 : Math.max(0, Math.ceil((unlockAt() - Date.now()) / DAY));
  const isLocked = l => !staff() && !FREE.has(l.id) && daysLeft() > 0;
  const modLocked = m => modLessons(m).every(isLocked);
  const lockedCount = () => ALL.filter(isLocked).length;
  const relDate = () => new Date(unlockAt()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const inDays = () => daysLeft() === 1 ? '1 dia' : daysLeft() + ' dias';
  const durOf = id => (S.videos[id] && S.videos[id].duracao_seg) || 0;
  const durText = id => durOf(id) ? clock(durOf(id)) : '';
  const modSec = m => modLessons(m).reduce((a, l) => a + durOf(l.id), 0);
  const allDur = list => list.every(l => durOf(l.id));
  const modMeta = m => `${m.lessons.length} aulas` + (allDur(modLessons(m)) ? ` · ${hm(modSec(m))}` : '');
  const courseMeta = () => `${MODULES.length} módulos · ${ALL.length} aulas` + (allDur(ALL) ? ` · ${hm(ALL.reduce((a, l) => a + durOf(l.id), 0))}` : '');
  const visibleMats = () => S.mats.filter(f => { const l = getLesson(f.aula_id); return l && !isLocked(l); });
  const matsOf = l => visibleMats().filter(f => f.aula_id === l.id);

  function modProg(m) { const d = modLessons(m).filter(l => isDone(l.id)).length, t = m.lessons.length; return { d, t, pct: Math.round(d / t * 100) }; }
  function firstOpen() { return ALL.find(l => !isLocked(l) && !isDone(l.id)) || null; }
  function current() {
    const open = Object.values(S.prog)
      .filter(r => !r.concluida && getLesson(r.aula_id) && !isLocked(getLesson(r.aula_id)))
      .sort((a, b) => String(b.atualizado_em).localeCompare(String(a.atualizado_em)));
    return open.length ? getLesson(open[0].aula_id) : firstOpen();
  }
  function nextAfter(id) { const k = ALL.findIndex(l => l.id === id); return ALL.slice(k + 1).find(l => !isLocked(l)) || null; }
  function prevBefore(id) { const k = ALL.findIndex(l => l.id === id); return k > 0 ? ALL[k - 1] : null; }
  function stats() {
    const done = ALL.filter(l => isDone(l.id));
    let sec = done.reduce((a, l) => a + durOf(l.id), 0);
    ALL.forEach(l => { if (!isDone(l.id) && posOf(l.id)) sec += durOf(l.id) * posOf(l.id) / 100; });
    return { done: done.length, total: ALL.length, pct: Math.round(done.length / ALL.length * 100), sec, modsDone: MODULES.filter(m => modProg(m).d === m.lessons.length).length };
  }
  function displayName() {
    const meta = (S.user && S.user.user_metadata) || {};
    return (S.mat && S.mat.nome) || meta.nome || '';
  }

  /* ===== dados ===== */
  async function loadAll() {
    const [adm, mat, prog, cont] = await Promise.all([
      sb.rpc('sou_admin'),
      sb.from('matriculas').select('*').maybeSingle(),
      sb.from('progresso').select('aula_id, concluida, posicao, nota, atualizado_em'),
      sb.from('conteudos').select('*').order('criado_em')
    ]);
    const err = adm.error || mat.error || prog.error || cont.error;
    if (err) throw err;
    S.admin = adm.data === true;
    S.mat = mat.data || null;
    S.prog = {};
    (prog.data || []).forEach(r => { S.prog[r.aula_id] = r; });
    setContent(cont.data || []);
  }
  function setContent(rows) {
    S.all = rows; S.videos = {}; S.mats = [];
    rows.forEach(r => { if (r.tipo === 'video') S.videos[r.aula_id] = r; else S.mats.push(r); });
  }
  async function reloadContent() {
    const { data, error } = await sb.from('conteudos').select('*').order('criado_em');
    if (error) throw error;
    setContent(data || []);
  }

  /* progresso: grava em lote, sem travar a tela */
  const pending = new Set(); let saveTimer = null;
  function setProg(id, patch, now) {
    S.prog[id] = Object.assign({ aula_id: id, concluida: false, posicao: 0, nota: null }, S.prog[id], patch, { atualizado_em: new Date().toISOString() });
    pending.add(id);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, now ? 0 : 1500);
  }
  async function flush() {
    if (!pending.size || !S.user) return;
    const ids = [...pending]; pending.clear();
    const rows = ids.map(id => ({ user_id: S.user.id, aula_id: id, concluida: !!S.prog[id].concluida, posicao: Math.max(0, Math.min(100, S.prog[id].posicao | 0)), nota: S.prog[id].nota || null, atualizado_em: S.prog[id].atualizado_em }));
    const { error } = await sb.from('progresso').upsert(rows, { onConflict: 'user_id,aula_id' });
    if (error) { ids.forEach(id => pending.add(id)); toast('Não foi possível salvar seu progresso. Confira sua internet.'); }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  /* links protegidos (valem por algumas horas) */
  async function signed(path, opts) {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, opts && opts.download ? 3600 : 14400, opts);
    if (error) throw error;
    return data.signedUrl;
  }
  function hydrateFiles(root) {
    (root || document).querySelectorAll('a[data-path]:not([href])').forEach(a => {
      const path = a.dataset.path, name = a.dataset.dl;
      signed(path, name ? { download: name } : undefined)
        .then(url => { a.href = url; a.removeAttribute('aria-disabled'); })
        .catch(() => { a.textContent = 'Indisponível'; });
    });
  }

  /* ===== peças ===== */
  function ring(p) {
    const r = 50, C = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${p}% do curso concluído">
      <circle class="ring-bg" cx="60" cy="60" r="${r}" fill="none" stroke-width="10"/>
      ${p > 0 ? `<circle cx="60" cy="60" r="${r}" fill="none" stroke="url(#rg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - p / 100)).toFixed(1)}" transform="rotate(-90 60 60)"/>` : ''}
      <text class="ring-n" x="60" y="62" text-anchor="middle">${p}%</text>
      <text class="ring-l" x="60" y="80" text-anchor="middle">concluído</text></svg>`;
  }
  function modPill(m, short) {
    const p = modProg(m);
    if (modLocked(m)) return `<span class="pill warn">${ICON.lock} ${short ? 'Em' : 'Libera em'} ${inDays()}</span>`;
    if (p.d === p.t) return `<span class="pill pos">${ICON.check} Concluído</span>`;
    if (p.d > 0) return `<span class="pill acc">${p.pct}%</span>`;
    return `<span class="pill">Novo</span>`;
  }
  function poster(m) {
    const p = modProg(m);
    return `<a class="poster${modLocked(m) ? ' locked' : ''}" href="#modulo-${m.n}" style="${ART[m.n - 1]}" aria-label="Módulo ${pad(m.n)}: ${esc(m.title)}">
      <span class="poster-art" aria-hidden="true"></span>
      <img class="poster-img" src="${capa(m.n)}" alt="" aria-hidden="true">
      <span class="poster-shade" aria-hidden="true"></span>
      <span class="num" aria-hidden="true">${pad(m.n)}</span>${modPill(m, true)}
      <span class="poster-body">
        <span class="eyebrow">Módulo ${pad(m.n)}</span>
        <h3>${esc(m.title)}</h3>
        <span class="pmeta">${modMeta(m)}</span>
        <span class="pbar"><span style="width:${p.pct}%"></span></span>
      </span></a>`;
  }
  function lrow(l, opts) {
    opts = opts || {};
    const done = isDone(l.id), locked = isLocked(l);
    const cur = opts.active ? opts.active === l.id : (!done && current() && current().id === l.id);
    const cls = ['lrow', done && 'done', cur && 'current', locked && 'locked'].filter(Boolean).join(' ');
    const icon = locked ? ICON.lock : done ? ICON.check : cur ? ICON.play : '';
    let meta = '';
    if (locked) meta = `Libera em ${inDays()} · dia ${relDate()}`;
    else if (done) meta = 'Concluída';
    else if (posOf(l.id) > 0) meta = `Em andamento · ${posOf(l.id)}%`;
    else if (cur && !opts.active) meta = 'Próxima aula';
    const inner = `<span class="lcheck">${icon}</span>
      <span class="ltext"><b>${pad(l.num)}. ${esc(l.title)}</b>${meta ? `<small>${meta}</small>` : ''}${opts.desc && l.desc ? `<p>${esc(l.desc)}</p>` : ''}</span>
      <span class="ldur">${locked ? '' : durText(l.id)}</span>`;
    return locked
      ? `<div class="${cls}" aria-disabled="true">${inner}</div>`
      : `<a class="${cls}" href="#aula-${l.id}"${opts.active === l.id ? ' aria-current="page"' : ''}>${inner}</a>`;
  }
  function files(list, emptyText) {
    if (!list.length) return `<p class="empty">${esc(emptyText || 'Nenhum material por aqui ainda.')}</p>`;
    return '<div class="files">' + list.map(f => {
      const ext = extOf(f.caminho), l = getLesson(f.aula_id);
      const cls = /xls|csv/.test(ext) ? 'sheet' : /doc|ppt|zip/.test(ext) ? 'tpl' : '';
      const dl = `${f.nome}.${ext}`;
      return `<div class="file"><span class="ficon ${cls}" aria-hidden="true">${esc(ext.toUpperCase().slice(0, 4))}</span>
        <span class="finfo"><b>${esc(f.nome)}</b><span>${esc(ext.toUpperCase())}${f.tamanho ? ' · ' + fmtBytes(f.tamanho) : ''}${l ? ` · Aula ${pad(l.num)}` : ''}</span></span>
        <span class="factions"><a class="btn-sm" data-path="${esc(f.caminho)}" target="_blank" rel="noopener" aria-disabled="true">Abrir</a><a class="btn-sm" data-path="${esc(f.caminho)}" data-dl="${esc(dl)}" aria-disabled="true">Baixar</a></span></div>`;
    }).join('') + '</div>';
  }

  /* ===== telas ===== */
  function renderHome() {
    const s = stats(), c = current(), first = displayName().split(' ')[0];
    let hero;
    if (c) {
      const m = getMod(c.m), pct = posOf(c.id), started = pct > 0;
      hero = `<div class="hero-main has-img"><img class="hero-img" src="${capa(c.m)}" alt="" aria-hidden="true"><span class="hero-num" aria-hidden="true">${pad(c.m)}</span>
        <span class="eyebrow">${started ? 'Continue de onde parou' : 'Sua próxima aula'}</span>
        <h2>${esc(c.title)}</h2>
        <p class="hero-meta">Módulo ${pad(c.m)} · ${esc(m.title)} · Aula ${pad(c.num)}</p>
        <div class="bar-row"><div class="pbar"><span style="width:${pct}%"></span></div>
          <span class="bar-label">${started ? `${pct}% assistido${durOf(c.id) ? ` · faltam ${clock(durOf(c.id) * (1 - pct / 100))}` : ''}` : `Ainda não iniciada${durOf(c.id) ? ' · ' + durText(c.id) : ''}`}</span></div>
        <div class="actions"><a class="btn-primary" href="#aula-${c.id}">${ICON.play} ${started ? 'Continuar aula' : 'Começar aula'}</a>
          <a class="btn-ghost" href="#modulo-${c.m}">Ver módulo</a></div></div>`;
    } else {
      const wait = daysLeft() > 0;
      hero = `<div class="hero-main"><span class="eyebrow">Tudo em dia</span><h2>${wait ? 'Você concluiu as aulas liberadas' : 'Você concluiu o curso'}</h2>
        <p class="hero-meta">${wait ? `As próximas ${lockedCount()} aulas liberam em ${inDays()}, dia ${relDate()}.` : 'Parabéns por chegar até aqui.'}</p>
        <div class="actions"><a class="btn-primary" href="#modulo-1">Rever aulas</a><a class="btn-ghost" href="#materiais">Ver materiais</a></div></div>`;
    }
    const cm = c && getMod(c.m), cp = cm && modProg(cm);
    const lc = lockedCount();
    const milestone = lc ? `${FREE.size} aulas liberadas agora. As outras ${lc} liberam em ${inDays()}, dia ${relDate()}.`
      : cm ? (cp.t - cp.d === 1 ? `Falta 1 aula para fechar o Módulo ${pad(cm.n)}.` : `Faltam ${cp.t - cp.d} aulas para fechar o Módulo ${pad(cm.n)}.`) : 'Todas as aulas concluídas.';
    const notices = NOTICES.concat(lc ? [{ tag: 'Em breve', cls: 'warn', title: `${lc} aulas liberam em ${inDays()}`, text: `O restante do curso abre dia ${relDate()}, ${RELEASE.days} dias depois da sua entrada.` }] : []);
    const left = s.total - s.done;
    $('#view').innerHTML = `
      <div class="greet-row"><div class="greet"><h1>${first ? `Olá, ${esc(first)}` : 'Olá!'}</h1><p>${c ? `Bom te ver por aqui. Você está no Módulo ${pad(c.m)}.` : 'Bom te ver por aqui.'}</p></div>
        <button class="btn-refund" type="button" data-act="refund">REEMBOLSO</button></div>
      <section class="hero" aria-label="Seu progresso">${hero}
        <div class="hero-side">${ring(s.pct)}<div class="side-stats"><span class="eyebrow">Progresso do curso</span>
          <b class="side-big">${s.done} de ${s.total} aulas</b><p>${milestone}</p></div></div>
      </section>
      <section class="strip" aria-label="Resumo">
        <div class="chip c-pur"><div class="k">Aulas concluídas</div><div class="v">${s.done}</div><div class="sub">de ${s.total} aulas do curso</div></div>
        <div class="chip c-cya"><div class="k">Tempo assistido</div><div class="v">${hm(s.sec)}</div><div class="sub">somando os vídeos que você viu</div></div>
        ${lc ? `<div class="chip c-grn"><div class="k">Próxima liberação</div><div class="v">em ${inDays()}</div><div class="sub">${lc} aulas liberam dia ${relDate()}</div></div>`
          : `<div class="chip c-grn"><div class="k">Módulos completos</div><div class="v">${s.modsDone} de ${MODULES.length}</div><div class="sub">curso completo liberado</div></div>`}
        <div class="chip c-yel"><div class="k">Para concluir</div><div class="v">${left ? (left === 1 ? '1 aula' : left + ' aulas') : 'Concluído'}</div><div class="sub">${left ? 'até terminar o curso' : 'parabéns, você terminou o curso'}</div></div>
      </section>
      <div class="sec-head"><h2>Módulos</h2><span class="hint">${courseMeta()}</span></div>
      <section class="rail" aria-label="Módulos do curso">${MODULES.map(poster).join('')}</section>
      <div class="grid2">
        <section class="panel"><div class="panel-head"><h3>Avisos</h3><span class="hint">do produtor</span></div>
          ${notices.map(n => `<div class="notice"><span class="pill ${n.cls}">${n.tag}</span><div><b>${esc(n.title)}</b><p>${esc(n.text)}</p></div></div>`).join('')}</section>
        <section class="panel"><div class="panel-head"><h3>Materiais recentes</h3><a class="hint" href="#materiais">Ver todos</a></div>
          ${files(visibleMats().slice(-3).reverse(), 'Os materiais das aulas aparecem aqui.')}</section>
      </div>`;
    hydrateFiles($('#view'));
  }

  function renderModules() {
    $('#view').innerHTML = `
      <div class="greet"><h1>Módulos</h1><p>${courseMeta()}</p></div>
      ${MODULES.map(m => { const p = modProg(m); return `
        <section class="panel mod">${poster(m)}
          <div class="mod-body">
            <div class="mod-head"><div><span class="eyebrow">Módulo ${pad(m.n)}</span><h2><a href="#modulo-${m.n}">${esc(m.title)}</a></h2><p class="hint"><b class="tagline">${esc(m.tag)}</b> · ${esc(m.sub)}</p></div>
              <span class="mod-count">${modLocked(m) ? `Libera em ${inDays()} · ${relDate()}` : `${p.d}/${p.t} aulas`}</span></div>
            <div class="pbar"><span style="width:${p.pct}%"></span></div>
            <div class="lessons">${modLessons(m).map(l => lrow(l)).join('')}</div>
          </div></section>`; }).join('')}`;
  }

  function renderModule(n) {
    const m = getMod(n); if (!m) return renderHome();
    const p = modProg(m), ls = modLessons(m);
    const start = ls.find(l => !isLocked(l) && !isDone(l.id)) || ls.find(l => !isLocked(l)) || ls[0];
    const mats = visibleMats().filter(f => getLesson(f.aula_id).m === n);
    $('#view').innerHTML = `
      <nav class="crumbs" aria-label="Você está em"><a href="#modulos">Módulos</a><span aria-hidden="true">/</span><span>Módulo ${pad(n)}</span></nav>
      <section class="mod-hero" style="${ART[n - 1]}"><span class="poster-art" aria-hidden="true"></span><img class="mod-hero-img" src="${capa(n)}" alt="" aria-hidden="true">
        <div class="mod-hero-body"><span class="eyebrow">Módulo ${pad(n)} · ${modMeta(m)}</span>
          <h1>${esc(m.title)}</h1><p><b class="tagline">${esc(m.tag)}</b> · ${esc(m.sub)}</p>
          ${modLocked(m) ? `<span class="pill warn">${ICON.lock} Libera em ${inDays()}, dia ${relDate()}</span>` : `
          <div class="bar-row"><div class="pbar"><span style="width:${p.pct}%"></span></div><span class="bar-label">${p.d} de ${p.t} aulas concluídas</span></div>
          <div class="actions"><a class="btn-primary" href="#aula-${start.id}">${ICON.play} ${p.d === 0 ? 'Começar módulo' : p.d === p.t ? 'Rever módulo' : 'Continuar módulo'}</a></div>`}
        </div></section>
      <div class="grid-mod">
        <section class="panel"><div class="panel-head"><h3>Aulas</h3><span class="hint">${p.d} de ${p.t} concluídas</span></div>
          <div class="lessons">${ls.map(l => lrow(l, { desc: true })).join('')}</div></section>
        <section class="panel"><div class="panel-head"><h3>Materiais do módulo</h3></div>${files(mats, modLocked(m) ? `Os materiais aparecem quando o módulo liberar.` : 'Este módulo ainda não tem material de apoio.')}</section>
      </div>`;
    hydrateFiles($('#view'));
  }

  let lessonTab = 'desc', videoToken = 0;
  function renderLesson(n, i) {
    const l = getLesson(lid(n, i)); if (!l) return renderHome();
    if (isLocked(l)) { location.replace('#modulo-' + n); return; }
    if (!isDone(l.id)) setProg(l.id, {});
    const m = getMod(n), done = isDone(l.id), nx = nextAfter(l.id), pv = prevBefore(l.id), vid = S.videos[l.id];
    const mp = modProg(m), nextMod = MODULES.find(x => x.n === n + 1);
    $('#view').innerHTML = `
      <nav class="crumbs" aria-label="Você está em"><a href="#modulos">Módulos</a><span aria-hidden="true">/</span><a href="#modulo-${n}">Módulo ${pad(n)}</a><span aria-hidden="true">/</span><span>Aula ${pad(l.num)}</span></nav>
      <div class="lesson-grid">
        <div class="lesson-main">
          ${vid ? `<div class="player has-video"><video id="vid" controls playsinline preload="metadata" controlslist="nodownload" aria-label="Vídeo da aula ${esc(l.title)}"></video><div class="player-msg" id="vidMsg">Carregando o vídeo…</div></div>` : `
          <div class="player" style="${ART[n - 1]}">
            <span class="poster-art" aria-hidden="true"></span>
            <span class="pill player-tag">Vídeo em breve</span>
            <div class="player-soon"><img src="${capa(n)}" alt="" aria-hidden="true"><b>O vídeo desta aula ainda não foi publicado</b><span>Assim que entrar, ele aparece aqui.</span></div>
            <div class="player-title" aria-hidden="true">${esc(l.title)}</div>
          </div>`}
          <div class="lesson-head">
            <div><span class="eyebrow">Módulo ${pad(n)} · Aula ${pad(l.num)}</span><h1>${esc(l.title)}</h1></div>
            <div class="actions">
              <button class="btn-ghost" type="button" data-act="done" data-id="${l.id}" aria-pressed="${done}">${done ? ICON.check + ' Concluída' : 'Marcar como concluída'}</button>
              ${nx ? `<a class="${done ? 'btn-primary' : 'btn-ghost'}" href="#aula-${nx.id}">Próxima aula ${ICON.next}</a>` : lockedCount() ? `<span class="btn-ghost" aria-disabled="true">${ICON.lock} Próxima aula em ${inDays()}</span>` : ''}
            </div>
          </div>
          <div class="seg" role="tablist" aria-label="Conteúdo da aula">
            <button type="button" role="tab" id="t-desc" data-ltab="desc" aria-selected="${lessonTab === 'desc'}" aria-controls="tabBody">Descrição</button>
            <button type="button" role="tab" id="t-mat" data-ltab="mat" aria-selected="${lessonTab === 'mat'}" aria-controls="tabBody">Materiais${matsOf(l).length ? ` (${matsOf(l).length})` : ''}</button>
            <button type="button" role="tab" id="t-notes" data-ltab="notes" aria-selected="${lessonTab === 'notes'}" aria-controls="tabBody">Anotações</button>
          </div>
          <section class="panel tab-body" id="tabBody" role="tabpanel" data-lesson="${l.id}"></section>
          ${pv ? `<div><a class="btn-ghost" href="#aula-${pv.id}">${ICON.prev} Aula anterior</a></div>` : ''}
        </div>
        <aside class="panel lesson-side" aria-label="Aulas do módulo">
          <div class="side-head"><span class="eyebrow">Módulo ${pad(n)}</span><b>${esc(m.title)}</b>
            <div class="pbar"><span style="width:${mp.pct}%"></span></div><span class="hint">${mp.d} de ${mp.t} aulas concluídas</span></div>
          <div class="lessons">${modLessons(m).map(x => lrow(x, { active: l.id })).join('')}</div>
          ${nextMod ? `<div class="side-next">Próximo módulo<a href="#modulo-${nextMod.n}">${pad(nextMod.n)} · ${esc(nextMod.title)}</a></div>` : ''}
        </aside>
      </div>`;
    renderTab(l);
    if (vid) loadVideo(l, vid);
  }
  async function loadVideo(l, vid) {
    const token = ++videoToken;
    const v = $('#vid'), msg = $('#vidMsg');
    try {
      const url = await signed(vid.caminho);
      if (token !== videoToken || !v) return;
      let lastSaved = posOf(l.id);
      v.addEventListener('loadedmetadata', () => {
        if (msg) msg.hidden = true;
        const p = posOf(l.id);
        if (p && p < 95) v.currentTime = v.duration * p / 100;
      });
      v.addEventListener('timeupdate', () => {
        if (!v.duration || isDone(l.id)) return;
        const p = Math.min(99, Math.floor(v.currentTime / v.duration * 100));
        if (p > 0 && Math.abs(p - lastSaved) >= 3) { lastSaved = p; setProg(l.id, { posicao: p }); }
      });
      v.addEventListener('pause', () => flush());
      v.addEventListener('ended', () => { if (!isDone(l.id)) toggleDone(l.id); });
      v.addEventListener('error', () => { if (msg) { msg.hidden = false; msg.textContent = 'Não foi possível tocar o vídeo. Recarregue a página e tente de novo.'; } });
      v.src = url;
    } catch (e) {
      if (msg) msg.textContent = 'Não foi possível carregar o vídeo. Recarregue a página e tente de novo.';
    }
  }
  function renderTab(l) {
    const box = $('#tabBody'); if (!box) return;
    if (lessonTab === 'mat') {
      box.innerHTML = files(matsOf(l), 'Esta aula não tem material de apoio.');
      hydrateFiles(box);
    } else if (lessonTab === 'notes') {
      box.innerHTML = `<label class="eyebrow" for="notes">Suas anotações desta aula</label>
        <textarea id="notes" style="margin-top:10px" placeholder="Ex.: produtos para comparar, ideias de gancho, dúvidas para a próxima aula">${esc((S.prog[l.id] && S.prog[l.id].nota) || '')}</textarea>
        <p class="note-foot" id="noteFoot">Ficam salvas na sua conta.</p>`;
    } else {
      const m = getMod(l.m);
      box.innerHTML = `<p class="lead">${esc(l.desc || `${m.tag}: ${m.sub.charAt(0).toLowerCase()}${m.sub.slice(1)}`)}</p>
        <div class="facts">${durOf(l.id) ? `<div><div class="k">Duração</div><div class="v">${durText(l.id)}</div></div>` : ''}
          <div><div class="k">Módulo</div><div class="v">${pad(m.n)} · ${esc(m.title)}</div></div>
          <div><div class="k">Materiais</div><div class="v">${matsOf(l).length}</div></div></div>`;
    }
  }

  let matFilter = 'Todos';
  function renderMaterials() {
    const all = visibleMats();
    const types = ['Todos', ...new Set(all.map(f => extOf(f.caminho).toUpperCase()))];
    if (!types.includes(matFilter)) matFilter = 'Todos';
    const list = all.filter(f => matFilter === 'Todos' || extOf(f.caminho).toUpperCase() === matFilter);
    $('#view').innerHTML = `
      <div class="greet"><h1>Materiais</h1><p>Guias e materiais de apoio das aulas.</p></div>
      <div class="seg" role="group" aria-label="Filtrar por tipo"${types.length > 2 ? '' : ' hidden'}>${types.map(t => `<button type="button" data-filter="${t}" aria-pressed="${t === matFilter}">${t}</button>`).join('')}</div>
      <section class="panel">${files(list, lockedCount() ? `Novos materiais aparecem quando as aulas liberarem, em ${inDays()}.` : 'Nenhum material por aqui ainda.')}</section>`;
    hydrateFiles($('#view'));
  }

  /* ===== painel do admin ===== */
  let adminTab = 'alunos', alunos = null, lastCred = null;
  const busy = {};
  async function callAdmin(body) {
    const { data, error } = await sb.functions.invoke('admin-alunos', { body });
    if (error) {
      let msg = 'Não foi possível concluir. Tente de novo.';
      try { const j = await error.context.json(); if (j && j.erro) msg = j.erro; } catch (e) { /* sem corpo */ }
      throw new Error(msg);
    }
    if (data && data.erro) throw new Error(data.erro);
    return data;
  }
  function credMessage(c) {
    const link = location.origin + location.pathname;
    return `Olá${c.nome ? ', ' + c.nome.split(' ')[0] : ''}! Seu acesso ao TikTok Avançado está liberado.\n\nEntre em: ${link}\nE-mail: ${c.email}\nSenha: ${c.senha}\n\nDepois de entrar, você pode trocar a senha no menu da sua conta (no canto de cima).`;
  }
  function renderAdmin() {
    if (!S.admin) { location.replace('#inicio'); return; }
    $('#view').innerHTML = `
      <div class="greet"><h1>Painel do admin</h1><p>Libere o acesso dos alunos e envie os vídeos e materiais de cada aula.</p></div>
      <div class="seg" role="tablist" aria-label="Seções do admin">
        <button type="button" role="tab" data-atab="alunos" aria-selected="${adminTab === 'alunos'}">Alunos</button>
        <button type="button" role="tab" data-atab="conteudo" aria-selected="${adminTab === 'conteudo'}">Vídeos e materiais</button>
        <button type="button" role="tab" data-atab="reembolsos" aria-selected="${adminTab === 'reembolsos'}">Reembolsos</button>
      </div>
      <div id="adminBody" class="admin-grid"></div>`;
    renderAdminBody();
  }
  function renderAdminBody() {
    const box = $('#adminBody'); if (!box) return;
    if (adminTab === 'conteudo') return renderConteudo(box);
    if (adminTab === 'reembolsos') return renderReembolsos(box);
    box.innerHTML = `
      <section class="panel"><div class="panel-head"><h3>Liberar acesso</h3><span class="hint">gera uma senha na hora</span></div>
        <form class="form-row" id="addForm" novalidate>
          <div class="field"><label for="aNome">Nome do aluno</label><input id="aNome" type="text" autocomplete="off" placeholder="Ex.: Maria Souza"></div>
          <div class="field"><label for="aEmail">E-mail do aluno</label><input id="aEmail" type="email" autocomplete="off" placeholder="aluno@email.com"></div>
          <button class="btn-primary" type="submit" id="addBtn">Liberar acesso</button>
        </form>
        <div class="msg" id="addMsg" role="status" aria-live="polite"></div>
        <div id="credBox">${lastCred ? credHtml(lastCred) : ''}</div>
      </section>
      <section class="panel"><div class="panel-head"><h3>Alunos</h3><span class="hint" id="alCount"></span></div>
        <div id="alList"><p class="empty">Carregando alunos…</p></div>
      </section>`;
    if (alunos) drawAlunos(); else loadAlunos();
  }
  function credHtml(c) {
    return `<div class="cred"><b>${c.titulo}</b><pre id="credText">${esc(credMessage(c))}</pre>
      <div class="actions"><button class="btn-sm pri" type="button" data-act="copy">Copiar mensagem</button><span class="hint">Mande essa mensagem para o aluno pelo WhatsApp ou e-mail.</span></div></div>`;
  }
  async function loadAlunos() {
    try { const d = await callAdmin({ acao: 'listar' }); alunos = d.alunos || []; drawAlunos(); }
    catch (e) { const el = $('#alList'); if (el) el.innerHTML = `<p class="empty">${esc(e.message)}</p>`; }
  }
  function drawAlunos() {
    const el = $('#alList'); if (!el) return;
    $('#alCount').textContent = alunos.length === 1 ? '1 aluno' : `${alunos.length} alunos`;
    if (!alunos.length) { el.innerHTML = '<p class="empty">Nenhum aluno ainda. Libere o primeiro acesso aqui em cima.</p>'; return; }
    el.innerHTML = `<div class="table-wrap"><table class="alunos"><thead><tr><th>Aluno</th><th>Entrou em</th><th>Curso completo</th><th>Status</th><th></th></tr></thead><tbody>
      ${alunos.map(a => { const full = new Date(a.inicio).getTime() + RELEASE.days * DAY; return `<tr>
        <td><b>${esc(a.nome || 'Sem nome')}</b><small>${esc(a.email)}</small></td>
        <td class="num">${fmtDate(a.inicio)}</td>
        <td class="num">${Date.now() >= full ? 'Liberado' : fmtDate(full)}</td>
        <td>${a.ativo ? '<span class="pill pos">Ativo</span>' : '<span class="pill warn">Pausado</span>'}</td>
        <td><div class="row-actions"><button class="btn-sm" type="button" data-act="senha" data-uid="${a.user_id}">Nova senha</button>
          <button class="btn-sm${a.ativo ? ' danger' : ''}" type="button" data-act="ativo" data-uid="${a.user_id}" data-on="${a.ativo ? '0' : '1'}">${a.ativo ? 'Pausar acesso' : 'Reativar'}</button></div></td></tr>`; }).join('')}
      </tbody></table></div>`;
  }
  async function addAluno(e) {
    e.preventDefault();
    const nome = $('#aNome').value.trim(), email = $('#aEmail').value.trim(), msg = $('#addMsg'), btn = $('#addBtn');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = 'msg err'; msg.textContent = 'Digite um e-mail válido.'; $('#aEmail').focus(); return; }
    btn.disabled = true; msg.className = 'msg'; msg.textContent = 'Liberando acesso…';
    try {
      const d = await callAdmin({ acao: 'criar', nome, email });
      lastCred = { titulo: d.jaExistia ? `Acesso reativado para ${d.email}, com senha nova` : `Acesso liberado para ${d.email}`, nome: d.nome || nome, email: d.email, senha: d.senha };
      msg.textContent = ''; $('#aNome').value = ''; $('#aEmail').value = '';
      $('#credBox').innerHTML = credHtml(lastCred);
      alunos = null; loadAlunos();
    } catch (err) { msg.className = 'msg err'; msg.textContent = err.message; }
    finally { btn.disabled = false; }
  }
  async function novaSenha(uid, btn) {
    btn.disabled = true;
    try {
      const d = await callAdmin({ acao: 'senha', user_id: uid });
      lastCred = { titulo: `Nova senha criada para ${d.email}`, nome: d.nome, email: d.email, senha: d.senha };
      $('#credBox').innerHTML = credHtml(lastCred);
      $('#credBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) { toast(err.message); }
    finally { btn.disabled = false; }
  }
  async function setAtivo(uid, on, btn) {
    btn.disabled = true;
    try { await callAdmin({ acao: 'ativo', user_id: uid, ativo: on }); const a = alunos.find(x => x.user_id === uid); if (a) a.ativo = on; drawAlunos(); toast(on ? 'Acesso reativado.' : 'Acesso pausado. O aluno não abre mais os vídeos e materiais.'); }
    catch (err) { toast(err.message); btn.disabled = false; }
  }

  function renderConteudo(box) {
    box.innerHTML = `
      <section class="panel"><p class="admin-note">Envie os vídeos em <b>MP4</b>, com até ${MAX_MB} MB cada (limite do plano grátis do Supabase). Os arquivos ficam protegidos: o aluno só consegue abrir quando a aula estiver liberada para ele. Ao trocar o vídeo de uma aula, o anterior é apagado.</p></section>
      ${MODULES.map(m => `<section class="panel"><div class="panel-head"><h3>Módulo ${pad(m.n)} · ${esc(m.title)}</h3><span class="hint">${modLessons(m).filter(l => S.videos[l.id]).length} de ${m.lessons.length} com vídeo</span></div>
        ${modLessons(m).map(l => contentRow(l)).join('')}</section>`).join('')}`;
  }
  function contentRow(l) {
    const v = S.videos[l.id], mats = S.mats.filter(f => f.aula_id === l.id), b = busy[l.id];
    const items = (v ? `<span class="citem vid">${ICON.play}<span>${esc(v.nome)}${v.duracao_seg ? ' · ' + clock(v.duracao_seg) : ''}</span><button type="button" data-act="rm" data-cid="${v.id}" aria-label="Remover o vídeo ${esc(v.nome)}">✕</button></span>` : '')
      + mats.map(f => `<span class="citem"><span>${esc(f.nome)}.${esc(extOf(f.caminho))}</span><button type="button" data-act="rm" data-cid="${f.id}" aria-label="Remover ${esc(f.nome)}">✕</button></span>`).join('');
    return `<div class="crow" id="crow-${l.id}"><div><b>${pad(l.num)}. ${esc(l.title)}</b>
        <div class="citems">${items || '<span class="cempty">Sem vídeo e sem material</span>'}${b ? `<span class="cbusy">${esc(b)}</span>` : ''}</div></div>
      <div class="row-actions"><button class="btn-sm${v ? '' : ' pri'}" type="button" data-act="upv" data-aula="${l.id}"${b ? ' disabled' : ''}>${v ? 'Trocar vídeo' : 'Enviar vídeo'}</button>
        <button class="btn-sm" type="button" data-act="upm" data-aula="${l.id}"${b ? ' disabled' : ''}>Adicionar material</button></div></div>`;
  }
  function refreshRow(id) { const el = document.getElementById('crow-' + id); if (el) el.outerHTML = contentRow(getLesson(id)); }
  function pickFile(aula, tipo) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = tipo === 'video' ? 'video/mp4,video/webm,.mp4,.m4v,.webm' : '.pdf,.xlsx,.xls,.csv,.docx,.doc,.pptx,.zip,.png,.jpg,.jpeg';
    inp.addEventListener('change', () => { if (inp.files && inp.files[0]) uploadFile(aula, tipo, inp.files[0]); });
    inp.click();
  }
  function readDuration(file) {
    return new Promise(resolve => {
      const v = document.createElement('video'); const url = URL.createObjectURL(file);
      const done = d => { URL.revokeObjectURL(url); resolve(d); };
      v.preload = 'metadata';
      v.onloadedmetadata = () => done(isFinite(v.duration) ? v.duration : null);
      v.onerror = () => done(null);
      setTimeout(() => done(null), 10000);
      v.src = url;
    });
  }
  const slug = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').slice(-80);
  const niceName = name => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || 'Material';
  async function uploadFile(aula, tipo, file) {
    const l = getLesson(aula);
    if (file.size > MAX_MB * 1048576) { toast(`Esse arquivo tem ${fmtBytes(file.size)}. O limite é ${MAX_MB} MB por arquivo.`); return; }
    if (tipo === 'video' && !/\.(mp4|m4v|webm)$/i.test(file.name)) { toast('Envie o vídeo em MP4. Arquivos .mov do iPhone podem não tocar em todos os navegadores.'); return; }
    busy[aula] = `Enviando ${tipo === 'video' ? 'vídeo' : 'material'} (${fmtBytes(file.size)})…`; refreshRow(aula);
    try {
      const dur = tipo === 'video' ? await readDuration(file) : null;
      if (tipo === 'video' && dur === null) toast('Não consegui ler a duração do vídeo. Ele será enviado mesmo assim.');
      const path = `${aula}/${tipo}-${Date.now()}-${slug(file.name)}`;
      const up = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, cacheControl: '3600', upsert: false });
      if (up.error) throw up.error;
      const ins = await sb.from('conteudos').insert({ aula_id: aula, tipo, nome: niceName(file.name), caminho: path, tamanho: file.size, duracao_seg: dur ? Math.round(dur) : null });
      if (ins.error) { await sb.storage.from(BUCKET).remove([path]); throw ins.error; }
      if (tipo === 'video') {
        const old = S.all.filter(r => r.aula_id === aula && r.tipo === 'video');
        if (old.length) {
          await sb.storage.from(BUCKET).remove(old.map(r => r.caminho));
          await sb.from('conteudos').delete().in('id', old.map(r => r.id));
        }
      }
      await reloadContent();
      toast(`${tipo === 'video' ? 'Vídeo enviado' : 'Material adicionado'} na aula ${pad(l.num)}.`);
    } catch (e) {
      const m = String((e && e.message) || '');
      toast(/size|large|exceed/i.test(m) ? `Arquivo grande demais. O limite é ${MAX_MB} MB.` : 'Não foi possível enviar o arquivo. Confira sua internet e tente de novo.');
    } finally { delete busy[aula]; refreshRow(aula); }
  }
  async function removeContent(cid) {
    const r = S.all.find(x => x.id === cid); if (!r) return;
    if (!window.confirm(`Remover "${r.nome}" da aula ${pad(getLesson(r.aula_id).num)}? Os alunos deixam de ver esse arquivo.`)) return;
    busy[r.aula_id] = 'Removendo…'; refreshRow(r.aula_id);
    try {
      const a = await sb.storage.from(BUCKET).remove([r.caminho]); if (a.error) throw a.error;
      const b = await sb.from('conteudos').delete().eq('id', cid); if (b.error) throw b.error;
      await reloadContent(); toast('Arquivo removido.');
    } catch (e) { toast('Não foi possível remover agora. Tente de novo.'); }
    finally { delete busy[r.aula_id]; refreshRow(r.aula_id); }
  }

  /* pedidos de reembolso (admin) */
  let refunds = null;
  async function renderReembolsos(box) {
    box.innerHTML = `<section class="panel"><div class="panel-head"><h3>Pedidos de reembolso</h3><span class="hint" id="rfCount"></span></div><div id="rfList"><p class="empty">Carregando pedidos…</p></div></section>`;
    const { data, error } = await sb.from('reembolsos').select('*').order('criado_em', { ascending: false });
    if (!$('#rfList')) return;
    if (error) { $('#rfList').innerHTML = '<p class="empty">Não foi possível carregar os pedidos. Tente de novo.</p>'; return; }
    refunds = data || [];
    drawRefunds();
  }
  function drawRefunds() {
    const el = $('#rfList'); if (!el) return;
    const pend = refunds.filter(r => r.status === 'pendente').length;
    $('#rfCount').textContent = pend === 1 ? '1 pendente' : `${pend} pendentes`;
    if (!refunds.length) { el.innerHTML = '<p class="empty">Nenhum pedido de reembolso até agora.</p>'; return; }
    el.innerHTML = `<div class="table-wrap"><table class="alunos"><thead><tr><th>Aluno</th><th>Pedido em</th><th>Motivo</th><th>Status</th><th></th></tr></thead><tbody>
      ${refunds.map(r => `<tr>
        <td><b>${esc(r.nome || 'Sem nome')}</b><small>${esc(r.email || '')}</small></td>
        <td class="num">${fmtDate(r.criado_em)}</td>
        <td class="motivo">${esc(r.motivo)}</td>
        <td>${r.status === 'pendente' ? '<span class="pill warn">Pendente</span>' : '<span class="pill pos">Resolvido</span>'}</td>
        <td><div class="row-actions">${r.status === 'pendente' ? `<button class="btn-sm" type="button" data-act="resolver" data-rid="${r.id}">Marcar como resolvido</button>` : ''}</div></td></tr>`).join('')}
      </tbody></table></div>
      <p class="admin-note" style="margin-top:12px">Depois de devolver o dinheiro na plataforma de pagamento, pause o acesso do aluno na aba Alunos.</p>`;
  }
  async function resolveRefund(id, btn) {
    btn.disabled = true;
    const { error } = await sb.from('reembolsos').update({ status: 'resolvido' }).eq('id', id);
    if (error) { toast('Não foi possível atualizar. Tente de novo.'); btn.disabled = false; return; }
    const r = refunds && refunds.find(x => x.id === id); if (r) r.status = 'resolvido';
    drawRefunds(); toast('Pedido marcado como resolvido.');
  }

  /* botão REEMBOLSO (aluno) */
  async function openRefund() {
    closeMenu();
    $('#rfMsg').className = 'msg'; $('#rfMsg').textContent = '';
    $('#rfMotivo').value = '';
    $('#rfForm').hidden = false; $('#rfDone').hidden = true;
    $('#rfDialog').hidden = false; $('#rfMotivo').focus();
    const { data } = await sb.from('reembolsos').select('criado_em, status').eq('user_id', S.user.id).eq('status', 'pendente').order('criado_em', { ascending: false }).limit(1);
    if (data && data.length && !$('#rfDialog').hidden) refundDone(`Você já pediu reembolso no dia ${fmtDate(data[0].criado_em)}. O suporte vai falar com você pelo e-mail ${S.user.email}.`);
  }
  function refundDone(text) { $('#rfForm').hidden = true; $('#rfDoneText').textContent = text; $('#rfDone').hidden = false; $('#rfClose').focus(); }
  function closeRefund() { $('#rfDialog').hidden = true; }

  /* ===== navegação ===== */
  function chrome() {
    const s = stats();
    $('#chipPct').textContent = s.pct + '% concluído';
    $('#chipSub').textContent = `${s.done} de ${s.total} aulas`;
    const name = displayName() || (S.user && S.user.email) || '';
    const parts = name.trim().split(/\s+/);
    $('#avatarBtn').textContent = ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    $('#menuName').textContent = displayName() || 'Minha conta';
    $('#menuMail').textContent = (S.user && S.user.email) || '';
    $('#adminTab').hidden = !S.admin;
    $('#previewBtn').hidden = !S.admin || S.preview;
    $('#previewBar').hidden = !S.preview;
  }
  function route(keepScroll) {
    if (!S.user) return;
    closeMenu();
    const h = (location.hash || '#inicio').slice(1);
    let mm, tab = 'inicio';
    if (h === 'modulos') { renderModules(); tab = 'modulos'; }
    else if (h === 'materiais') { renderMaterials(); tab = 'materiais'; }
    else if (h === 'admin') { renderAdmin(); tab = 'admin'; }
    else if ((mm = h.match(/^modulo-(\d+)$/))) { renderModule(+mm[1]); tab = 'modulos'; }
    else if ((mm = h.match(/^aula-(\d+)-(\d+)$/))) { renderLesson(+mm[1], +mm[2]); tab = 'modulos'; }
    else renderHome();
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    chrome();
    if (!keepScroll) window.scrollTo(0, 0);
  }
  function show(which) {
    ['#splash', '#gate', '#login'].forEach(id => { $(id).hidden = id !== which; });
    const app = which === 'app';
    $('#topnav').hidden = !app; $('#view').hidden = !app;
    if (!app) $('#previewBar').hidden = true;
  }
  function gate(title, text) {
    $('#gateTitle').textContent = title; $('#gateText').textContent = text;
    show('#gate');
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 4200);
  }
  function closeMenu() { $('#menu').hidden = true; $('#avatarBtn').setAttribute('aria-expanded', 'false'); }
  function toggleDone(id) {
    const was = isDone(id);
    setProg(id, { concluida: !was, posicao: 0 }, true);
    if (was) toast('Aula marcada como não concluída.');
    else {
      const nx = nextAfter(id);
      toast(nx ? `Aula concluída. Próxima: ${nx.title}.` : lockedCount() ? `Aula concluída. As próximas aulas liberam em ${inDays()}, dia ${relDate()}.` : 'Aula concluída. Você terminou o curso.');
    }
    route(true);
  }

  /* ===== eventos ===== */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act],[data-ltab],[data-filter],[data-atab]');
    if (t) {
      const act = t.dataset.act;
      if (act === 'done') toggleDone(t.dataset.id);
      else if (act === 'refund') openRefund();
      else if (act === 'resolver') resolveRefund(t.dataset.rid, t);
      else if (act === 'copy') {
        const text = $('#credText') ? $('#credText').textContent : '';
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Mensagem copiada.'), () => toast('Não deu para copiar. Selecione o texto e copie.'));
      }
      else if (act === 'senha') novaSenha(t.dataset.uid, t);
      else if (act === 'ativo') setAtivo(t.dataset.uid, t.dataset.on === '1', t);
      else if (act === 'upv') pickFile(t.dataset.aula, 'video');
      else if (act === 'upm') pickFile(t.dataset.aula, 'material');
      else if (act === 'rm') removeContent(t.dataset.cid);
      else if (t.dataset.ltab) {
        lessonTab = t.dataset.ltab;
        document.querySelectorAll('[data-ltab]').forEach(b => b.setAttribute('aria-selected', String(b === t)));
        renderTab(getLesson($('#tabBody').dataset.lesson));
      }
      else if (t.dataset.filter) { matFilter = t.dataset.filter; renderMaterials(); }
      else if (t.dataset.atab) { adminTab = t.dataset.atab; renderAdmin(); }
      return;
    }
    if (!e.target.closest('.nav-right')) closeMenu();
  });
  document.addEventListener('submit', e => { if (e.target.id === 'addForm') addAluno(e); });
  document.addEventListener('input', e => {
    if (e.target.id === 'notes') {
      setProg($('#tabBody').dataset.lesson, { nota: e.target.value });
      $('#noteFoot').textContent = 'Salvando na sua conta…';
      clearTimeout(e.target._t); e.target._t = setTimeout(() => { const f = $('#noteFoot'); if (f) f.textContent = 'Salvo na sua conta.'; }, 1800);
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closePw(); closeRefund(); } });

  $('#avatarBtn').addEventListener('click', () => {
    const open = $('#menu').hidden; $('#menu').hidden = !open;
    $('#avatarBtn').setAttribute('aria-expanded', String(open));
  });
  $('#logoutBtn').addEventListener('click', async () => { await flush(); await sb.auth.signOut(); });
  $('#gateOut').addEventListener('click', () => sb.auth.signOut());
  $('#gateRetry').addEventListener('click', () => boot());
  $('#previewBtn').addEventListener('click', () => { S.preview = true; S.previewStart = Date.now(); location.hash = 'inicio'; route(); });
  $('#previewOff').addEventListener('click', () => { S.preview = false; route(); });
  $('#forgotBtn').addEventListener('click', () => {
    const msg = $('#loginMsg'); msg.className = 'msg ok';
    msg.textContent = 'Peça uma nova senha ao suporte do curso. Ela é criada na hora.';
  });
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#email').value.trim(), password = $('#senha').value, msg = $('#loginMsg'), btn = $('#loginBtn');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = 'msg err'; msg.textContent = 'Digite um e-mail válido, por exemplo voce@email.com.'; $('#email').focus(); return; }
    if (!password) { msg.className = 'msg err'; msg.textContent = 'Digite sua senha.'; $('#senha').focus(); return; }
    btn.disabled = true; msg.className = 'msg'; msg.textContent = 'Entrando…';
    const { error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false;
    if (error) {
      msg.className = 'msg err';
      msg.textContent = /invalid login/i.test(error.message) ? 'E-mail ou senha incorretos.' : /not confirmed/i.test(error.message) ? 'Seu e-mail ainda não foi confirmado. Fale com o suporte.' : 'Não foi possível entrar agora. Tente de novo em instantes.';
      return;
    }
    msg.textContent = ''; $('#senha').value = '';
    boot();
  });

  /* pedido de reembolso */
  $('#rfCancel').addEventListener('click', closeRefund);
  $('#rfClose').addEventListener('click', closeRefund);
  $('#rfForm').addEventListener('submit', async e => {
    e.preventDefault();
    const motivo = $('#rfMotivo').value.trim(), msg = $('#rfMsg'), btn = $('#rfSend');
    if (motivo.length < 5) { msg.className = 'msg err'; msg.textContent = 'Escreva o motivo em poucas palavras.'; $('#rfMotivo').focus(); return; }
    btn.disabled = true; msg.className = 'msg'; msg.textContent = 'Enviando pedido…';
    const { error } = await sb.from('reembolsos').insert({ motivo: motivo.slice(0, 2000) });
    btn.disabled = false;
    if (error) { msg.className = 'msg err'; msg.textContent = 'Não foi possível enviar agora. Confira sua internet e tente de novo.'; return; }
    refunds = null;
    refundDone(`Pedido enviado. O suporte vai falar com você pelo e-mail ${S.user.email}.`);
  });

  /* trocar senha */
  function openPw() { closeMenu(); $('#pwMsg').textContent = ''; $('#pw1').value = ''; $('#pw2').value = ''; $('#pwDialog').hidden = false; $('#pw1').focus(); }
  function closePw() { $('#pwDialog').hidden = true; }
  $('#pwBtn').addEventListener('click', openPw);
  $('#pwCancel').addEventListener('click', closePw);
  $('#pwForm').addEventListener('submit', async e => {
    e.preventDefault();
    const a = $('#pw1').value, b = $('#pw2').value, msg = $('#pwMsg');
    if (a.length < 8) { msg.className = 'msg err'; msg.textContent = 'A senha precisa ter pelo menos 8 caracteres.'; return; }
    if (a !== b) { msg.className = 'msg err'; msg.textContent = 'As duas senhas não são iguais.'; return; }
    $('#pwSave').disabled = true;
    const { error } = await sb.auth.updateUser({ password: a });
    $('#pwSave').disabled = false;
    if (error) { msg.className = 'msg err'; msg.textContent = /different/i.test(error.message) ? 'A nova senha precisa ser diferente da atual.' : 'Não foi possível trocar a senha agora. Tente de novo.'; return; }
    closePw(); toast('Senha trocada. Use a nova senha no próximo login.');
  });

  /* ===== início ===== */
  async function boot() {
    show('#splash');
    const { data } = await sb.auth.getSession();
    const session = data && data.session;
    if (!session) { S.user = null; show('#login'); return; }
    S.user = session.user;
    try { await loadAll(); }
    catch (e) { gate('Não foi possível carregar sua área', 'Confira sua internet e tente de novo.'); return; }
    if (!S.admin && !S.mat) { gate('Sua conta ainda não tem acesso', 'Se você já comprou o curso, fale com o suporte para liberar seu acesso.'); return; }
    if (!S.admin && !S.mat.ativo) { gate('Seu acesso está pausado', 'Fale com o suporte do curso para reativar seu acesso.'); return; }
    show('app');
    route();
  }
  sb.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') { S.user = null; S.admin = false; S.preview = false; alunos = null; lastCred = null; show('#login'); }
  });
  window.addEventListener('hashchange', () => route());
  boot();
})();
