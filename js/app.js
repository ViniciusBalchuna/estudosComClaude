/* EstudaAí — aplicação de página única (sem dependências). */
(function () {
  'use strict';
  const COURSES = window.COURSES || [];
  const COURSE_TOTAL = 2400;      // pontos por curso concluído
  const LESSONS_SHARE = 1600;     // soma das lições
  const EXAMS_SHARE = 800;        // soma dos exames
  const TITLE_THRESHOLDS = [0, 200, 600, 1200, 1800, 2400];
  const STORE_KEY = 'estudaai_v1';
  const app = document.getElementById('app');

  /* ---------------- utilidades ---------------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const pad = n => String(n).padStart(2, '0');
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const norm = s => String(s).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').replace(/;$/, '');

  /* ---------------- mini Markdown ---------------- */
  function inline(s) {
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => '<code>' + esc(codes[+i]) + '</code>');
  }
  function md(src) {
    if (!src) return '';
    const lines = src.split('\n'); let out = ''; let i = 0;
    const isTableSep = l => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
    const cells = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    while (i < lines.length) {
      let l = lines[i];
      if (/^```/.test(l)) {
        const lang = l.slice(3).trim(); const buf = []; i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out += `<pre><code class="language-${esc(lang || 'plaintext')}">${esc(buf.join('\n'))}</code></pre>`;
        continue;
      }
      if (/^\$\$/.test(l)) {
        const buf = []; const first = l.replace(/^\$\$/, '');
        if (first.trim().endsWith('$$')) { out += `<div class="formula">${inline(first.replace(/\$\$\s*$/, ''))}</div>`; i++; continue; }
        if (first.trim()) buf.push(first); i++;
        while (i < lines.length && !/\$\$\s*$/.test(lines[i])) buf.push(lines[i++]);
        if (i < lines.length) { const last = lines[i].replace(/\$\$\s*$/, ''); if (last.trim()) buf.push(last); i++; }
        out += `<div class="formula">${buf.map(inline).join('<br>')}</div>`;
        continue;
      }
      if (/^#{2,4} /.test(l)) { const n = l.match(/^#+/)[0].length; out += `<h${n}>${inline(l.slice(n + 1))}</h${n}>`; i++; continue; }
      if (/^!> /.test(l)) { const buf = []; while (i < lines.length && /^!> ?/.test(lines[i])) buf.push(lines[i++].replace(/^!> ?/, '')); out += `<div class="tip">${md(buf.join('\n'))}</div>`; continue; }
      if (/^> ?/.test(l)) { const buf = []; while (i < lines.length && /^> ?/.test(lines[i])) buf.push(lines[i++].replace(/^> ?/, '')); out += `<blockquote>${md(buf.join('\n'))}</blockquote>`; continue; }
      if (/^\|/.test(l) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        const head = cells(l); i += 2; let rows = '';
        while (i < lines.length && /^\|/.test(lines[i])) { rows += '<tr>' + cells(lines[i]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'; i++; }
        out += `<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
        continue;
      }
      if (/^\s*[-*] /.test(l)) {
        out += '<ul>';
        while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
          let item = lines[i++].replace(/^\s*[-*] /, '');
          while (i < lines.length && /^ {2,}\S/.test(lines[i]) && !/^\s*[-*] /.test(lines[i])) item += ' ' + lines[i++].trim();
          out += `<li>${inline(item)}</li>`;
        }
        out += '</ul>'; continue;
      }
      if (/^\d+\. /.test(l)) {
        out += '<ol>';
        while (i < lines.length && /^\d+\. /.test(lines[i])) {
          let item = lines[i++].replace(/^\d+\. /, '');
          while (i < lines.length && /^ {2,}\S/.test(lines[i]) && !/^\d+\. /.test(lines[i])) item += ' ' + lines[i++].trim();
          out += `<li>${inline(item)}</li>`;
        }
        out += '</ol>'; continue;
      }
      if (!l.trim()) { i++; continue; }
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(```|#{2,4} |> ?|!> |\$\$|\s*[-*] |\d+\. |\|)/.test(lines[i])) buf.push(lines[i++]);
      if (!buf.length) { buf.push(lines[i++]); }
      out += `<p>${inline(buf.join(' '))}</p>`;
    }
    return out;
  }
  function highlight(el) {
    if (!window.hljs) return;
    $$('pre code', el).forEach(c => { try { window.hljs.highlightElement(c); } catch (e) { /* ignora */ } });
  }

  /* ---------------- estado ---------------- */
  function loadState() {
    try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s && s.profiles) return s; } catch (e) { /* ignora */ }
    return { profiles: {}, current: null, exam: null };
  }
  let state = loadState();
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignora */ } }
  function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  function profile() { return state.current ? state.profiles[state.current] : null; }
  function ensureProfile(name) {
    name = name.trim().slice(0, 30) || 'Estudante';
    if (!state.profiles[name]) state.profiles[name] = { id: uid(), name, created: Date.now(), courses: {} };
    state.current = name; save(); return state.profiles[name];
  }
  function cprog(courseId) {
    const p = profile(); if (!p) return { lessons: {}, exams: {} };
    p.courses[courseId] = p.courses[courseId] || { lessons: {}, exams: {} };
    return p.courses[courseId];
  }

  /* ---------------- pontuação ---------------- */
  const getCourse = id => COURSES.find(c => c.id === id);
  const allLessons = c => c.modules.flatMap(m => m.lessons.map(l => ({ ...l, module: m })));
  function lessonValue(c) { return LESSONS_SHARE / allLessons(c).length; }
  function examValue(c) { return EXAMS_SHARE / c.modules.length; }
  function lessonPoints(c, lessonId, prof) {
    const lp = (prof ? (prof.courses[c.id] || { lessons: {} }) : cprog(c.id)).lessons[lessonId];
    return lp ? lp.points || 0 : 0;
  }
  function coursePoints(c, prof) {
    prof = prof || profile(); if (!prof) return 0;
    const cp = prof.courses[c.id]; if (!cp) return 0;
    let t = 0;
    for (const k in cp.lessons) t += cp.lessons[k].points || 0;
    for (const k in cp.exams) t += cp.exams[k].best || 0;
    return Math.min(COURSE_TOTAL, Math.round(t));
  }
  function titleFor(c, pts) {
    let idx = 0; TITLE_THRESHOLDS.forEach((t, i) => { if (pts >= t) idx = i; });
    return { name: c.titles[idx] || '', idx };
  }
  function lessonDone(c, l) { const lp = cprog(c.id).lessons[l.id]; return !!(lp && lp.done); }
  function moduleDone(c, m) { return m.lessons.every(l => lessonDone(c, l)); }

  /* ---------------- servidor de ranking opcional ---------------- */
  let serverOk = null;
  async function detectServer() {
    if (serverOk !== null) return serverOk;
    if (location.protocol === 'file:') return (serverOk = false);
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
      const r = await fetch('api/ranking', { signal: ctl.signal }); clearTimeout(t);
      serverOk = r.ok && (r.headers.get('content-type') || '').includes('json');
    } catch (e) { serverOk = false; }
    return serverOk;
  }
  async function syncScore() {
    const p = profile(); if (!p || !(await detectServer())) return;
    const scores = {}; COURSES.forEach(c => { scores[c.id] = coursePoints(c, p); });
    try { await fetch('api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, name: p.name, scores }) }); } catch (e) { /* offline */ }
  }

  /* ---------------- roteador ---------------- */
  function examRoute() { return state.exam ? `#/exame/${state.exam.courseId}/${state.exam.moduleId}` : null; }
  function route() {
    const h = location.hash || '#/';
    const er = examRoute();
    const locked = !!er;
    document.getElementById('nav').classList.toggle('locked', locked);
    document.getElementById('exam-banner').classList.toggle('hidden', !locked);
    if (er && h !== er) { location.replace(er); return; }
    window.scrollTo(0, 0);
    const parts = h.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === (parts[0] === 'ranking' ? 'ranking' : parts[0] === 'perfil' ? 'perfil' : 'home')));
    if (!profile()) return askName();
    $('#nav-perfil').textContent = '👤 ' + profile().name;
    if (!parts.length) return viewHome();
    if (parts[0] === 'curso' && getCourse(parts[1])) return viewCourse(getCourse(parts[1]));
    if (parts[0] === 'aula' && getCourse(parts[1])) return viewLesson(getCourse(parts[1]), parts[2]);
    if (parts[0] === 'exame' && getCourse(parts[1])) return viewExam(getCourse(parts[1]), parts[2]);
    if (parts[0] === 'ranking') return viewRanking(parts[1]);
    if (parts[0] === 'perfil') return viewProfile();
    app.innerHTML = '<div class="card"><h2>Página não encontrada</h2><a class="btn" href="#/">Voltar aos cursos</a></div>';
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', e => { if (state.exam) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------------- views ---------------- */
  function askName() {
    app.innerHTML = `
      <div class="hero"><h1>Bem-vindo ao Estuda<b style="color:var(--primary)">Aí</b> 🎓</h1>
      <p>Cursos gratuitos de SQL, Python, APIs REST e Modelos de IA — com prática validada no navegador, aba <b>Descomplica</b>, exames de retenção e ranking.</p></div>
      <div class="card" style="max-width:520px">
        <h2 style="margin-top:0">Como você quer aparecer no ranking?</h2>
        <form id="name-form" class="form-row"><input id="name-in" maxlength="30" placeholder="Seu nome ou apelido" required><button class="btn">Começar</button></form>
        <p class="muted" style="font-size:14px">Seu progresso fica salvo neste navegador.</p>
      </div>`;
    $('#name-form').onsubmit = e => { e.preventDefault(); ensureProfile($('#name-in').value); route(); };
    $('#name-in').focus();
  }

  function viewHome() {
    const p = profile();
    const total = COURSES.reduce((a, c) => a + coursePoints(c, p), 0);
    const nLessons = COURSES.reduce((a, c) => a + allLessons(c).length, 0);
    app.innerHTML = `
      <section class="hero">
        <h1>Aprenda fazendo. De graça.</h1>
        <p>Cada aula tem explicação direta, uma aba <b>🧸 Descomplica</b> (o mesmo assunto explicado como para uma criança) e uma prática no fim — questões de assinalar ou código executado num terminal de verdade, que valida o <b>resultado</b>. No fim de cada módulo, um <b>exame</b> sem volta testa se você realmente aprendeu.</p>
        <div class="stats">
          <div><b>${COURSES.length}</b>cursos</div>
          <div><b>${nLessons}</b>aulas</div>
          <div><b>${total}</b>seus pontos</div>
          <div><b>${COURSE_TOTAL}</b>pontos por curso</div>
        </div>
      </section>
      <div class="grid courses">
        ${COURSES.map(c => {
          const pts = coursePoints(c, p); const t = titleFor(c, pts);
          const done = allLessons(c).filter(l => lessonDone(c, l)).length;
          return `<a class="card course-card" href="#/curso/${c.id}" style="--accent:${c.color}">
            <div class="icon">${c.icon}</div>
            <h3>${esc(c.name)}</h3>
            <p>${esc(c.desc)}</p>
            <span class="title-badge">${esc(t.name)}</span>
            <div class="progress"><span style="width:${(pts / COURSE_TOTAL * 100).toFixed(1)}%"></span></div>
            <div class="meta"><span>${done}/${allLessons(c).length} aulas</span><span>${pts} / ${COURSE_TOTAL} pts</span></div>
          </a>`;
        }).join('')}
      </div>`;
  }

  function viewCourse(c) {
    const pts = coursePoints(c); const t = titleFor(c, pts);
    let n = 0;
    app.innerHTML = `
      <div style="--accent:${c.color}">
      <div class="course-head">
        <div class="icon">${c.icon}</div>
        <div><h1>${esc(c.name)}</h1><p class="muted" style="margin:4px 0 0">${esc(c.desc)}</p></div>
        <div class="score"><b>${pts}</b> / ${COURSE_TOTAL} pts<br><span class="title-badge">${esc(t.name)}</span></div>
      </div>
      <div class="card" style="margin-bottom:20px">
        <b>Títulos deste curso</b>
        <div class="titles-list">${c.titles.map((tt, i) => `<span class="${pts >= TITLE_THRESHOLDS[i] ? 'got' : ''}">${esc(tt)} · ${TITLE_THRESHOLDS[i]}</span>`).join('')}</div>
        <p class="muted" style="font-size:14px;margin-bottom:0">Cada aula vale ${Math.round(lessonValue(c))} pts (acertar de primeira dá a nota cheia) e cada exame de módulo vale ${Math.round(examValue(c))} pts. Curso completo = ${COURSE_TOTAL} pts.</p>
      </div>
      ${c.modules.map((m, mi) => {
        const mdone = moduleDone(c, m); const ex = cprog(c.id).exams[m.id];
        return `<div class="card module">
          <h2>Módulo ${mi + 1} — ${esc(m.title)}</h2>
          <div class="muted">${esc(m.desc || '')}</div>
          <ul class="lesson-list">
            ${m.lessons.map(l => { n++; const d = lessonDone(c, l); return `<li class="${d ? 'done' : ''}"><a href="#/aula/${c.id}/${l.id}"><span class="num">#${pad(n)}</span><span>${esc(l.title)}</span><span class="pts">${d ? '✓ ' : ''}${Math.round(lessonPoints(c, l.id))}/${Math.round(lessonValue(c))}</span></a></li>`; }).join('')}
            <li><div class="exam-row"><span class="num">📝</span><span><b>Exame do módulo</b><br><span class="muted" style="font-size:14px">${ex ? `Melhor nota: ${ex.best}/${Math.round(examValue(c))} pts · ${ex.attempts} tentativa(s)` : mdone ? 'Liberado!' : 'Conclua todas as aulas do módulo para liberar'}</span></span>
              <button class="btn small" data-exam="${m.id}" ${mdone ? '' : 'disabled'}>${ex ? 'Refazer exame' : 'Fazer exame'}</button></div></li>
          </ul>
        </div>`;
      }).join('')}
      </div>`;
    $$('[data-exam]').forEach(b => b.onclick = () => confirmExam(c, c.modules.find(m => m.id === b.dataset.exam)));
  }

  function confirmExam(c, m) {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="card modal" style="--accent:${c.color}">
      <h2 style="margin-top:0">📝 Exame: ${esc(m.title)}</h2>
      <ul class="rules">
        <li>São <b>${m.exam.length} questões</b> novas, diferentes das práticas das aulas.</li>
        <li>Durante o exame as <b>lições ficam bloqueadas</b>: não dá para voltar e consultar.</li>
        <li>Uma questão por vez. Depois de confirmar, <b>não é possível voltar</b> à anterior.</li>
        <li>Se recarregar a página, o exame continua de onde parou.</li>
        <li>Vale até <b>${Math.round(examValue(c))} pts</b>. Se refizer, fica a melhor nota.</li>
      </ul>
      <div class="item-actions"><button class="btn" id="go">Começar agora</button><button class="btn ghost" id="cancel">Ainda não</button></div>
    </div>`;
    document.body.appendChild(bg);
    $('#cancel', bg).onclick = () => bg.remove();
    $('#go', bg).onclick = () => {
      bg.remove();
      const order = shuffle(m.exam.map((_, i) => i));
      const opt = {}; order.forEach(qi => { const q = m.exam[qi]; if (q.type === 'choice') opt[qi] = shuffle(q.options.map((_, i) => i)); });
      state.exam = { courseId: c.id, moduleId: m.id, order, opt, idx: 0, answers: [], startedAt: Date.now() };
      save(); location.hash = examRoute();
    };
  }

  function sidebar(c, cur) {
    let n = 0;
    return `<aside class="card sidebar"><h4>${c.icon} ${esc(c.name)}</h4>
      ${c.modules.map((m, mi) => `<div class="mod-title">Módulo ${mi + 1} · ${esc(m.title)}</div>` + m.lessons.map(l => { n++; return `<a href="#/aula/${c.id}/${l.id}" class="${l.id === cur ? 'cur' : ''} ${lessonDone(c, l) ? 'ok' : ''}">#${pad(n)} ${esc(l.title)}</a>`; }).join('')).join('')}
      <div class="mod-title"></div><a href="#/curso/${c.id}">← Visão geral do curso</a></aside>`;
  }

  function viewLesson(c, lessonId) {
    const list = allLessons(c); const idx = list.findIndex(l => l.id === lessonId);
    if (idx === -1) { location.hash = '#/curso/' + c.id; return; }
    const l = list[idx]; const m = l.module;
    const prev = list[idx - 1], next = list[idx + 1];
    const lp = cprog(c.id).lessons[l.id] || { items: {} };
    const nextIsExam = !next || next.module.id !== m.id;
    app.innerHTML = `
      <div class="lesson-layout" style="--accent:${c.color}">
        ${sidebar(c, l.id)}
        <article class="lesson">
          <div class="crumbs"><a href="#/curso/${c.id}">${esc(c.name)}</a> › ${esc(m.title)}</div>
          <span class="pill">Aula #${pad(idx + 1)}</span> ${l.minutes ? `<span class="pill">⏱ ${esc(l.minutes)} min</span>` : ''} <span class="pill" id="lesson-pts">${Math.round(lp.points || 0)} / ${Math.round(lessonValue(c))} pts</span>
          <h1>${esc(l.title)}</h1>
          ${l.goal ? `<div class="goal"><b>🎯 Nesta aula:</b> ${inline(l.goal)}</div>` : ''}
          <div class="content">${md(l.content)}</div>
          <details class="descomplica"><summary>🧸 Descomplica</summary><div class="easy-body content">${md(l.easy)}</div></details>
          <section class="practice"><h2>🏋️ Pratique</h2><div id="items"></div></section>
          <div class="item-actions" style="margin-top:24px">
            ${prev ? `<a class="btn ghost" href="#/aula/${c.id}/${prev.id}">← Aula anterior</a>` : ''}
            <span style="flex:1"></span>
            ${nextIsExam ? `<a class="btn" href="#/curso/${c.id}">Ir para o exame do módulo →</a>` : ''}
            ${next && !nextIsExam ? `<a class="btn" href="#/aula/${c.id}/${next.id}">Próxima aula →</a>` : ''}
            ${next && nextIsExam ? `<a class="btn ghost" href="#/aula/${c.id}/${next.id}">Próximo módulo →</a>` : ''}
          </div>
        </article>
      </div>`;
    highlight($('.content'));
    highlight($('.easy-body'));
    const box = $('#items');
    l.practice.forEach((it, i) => box.appendChild(renderItem(c, l, it, i)));
  }

  function itemState(c, l, i) {
    const cp = cprog(c.id);
    cp.lessons[l.id] = cp.lessons[l.id] || { items: {}, points: 0, done: false };
    const lp = cp.lessons[l.id];
    lp.items[i] = lp.items[i] || { solved: false, fails: 0, usedSolution: false, points: 0 };
    return { lp, st: lp.items[i] };
  }
  function finalizeItem(c, l, i, factor) {
    const { lp, st } = itemState(c, l, i);
    const value = lessonValue(c) / l.practice.length;
    st.solved = true; st.points = Math.round(value * factor * 10) / 10;
    lp.points = Object.values(lp.items).reduce((a, x) => a + (x.points || 0), 0);
    lp.done = l.practice.every((_, k) => lp.items[k] && lp.items[k].solved);
    if (lp.done) lp.points = Math.round(lp.points);
    save(); syncScore();
    const el = $('#lesson-pts'); if (el) el.textContent = `${Math.round(lp.points)} / ${Math.round(lessonValue(c))} pts`;
    if (lp.done) toast(`Aula concluída! +${Math.round(lp.points)} pts em ${c.name}`);
  }
  function toast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--ok);color:#04210f;font-weight:800;padding:12px 20px;border-radius:12px;z-index:60;box-shadow:var(--shadow)';
    t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
  }

  function renderItem(c, l, it, i) {
    const el = document.createElement('div'); el.className = 'item';
    const { st } = itemState(c, l, i); save();
    if (it.type === 'choice') {
      el.innerHTML = `<div class="q">${md(it.q)}</div>
        <div class="options">${it.options.map((o, k) => `<label><input type="radio" name="q${l.id}-${i}" value="${k}"><span>${inline(o)}</span></label>`).join('')}</div>
        <div class="item-actions"><button class="btn small" data-act="ok">Responder</button><span class="score-note"></span></div>
        <div class="fb"></div>`;
      const showSolved = () => {
        el.classList.add('solved');
        $$('input', el).forEach(x => { x.disabled = true; if (+x.value === it.answer) { x.checked = true; x.parentElement.classList.add('right'); } });
        $('[data-act=ok]', el).disabled = true;
        $('.fb', el).innerHTML = `<div class="feedback ok">✅ Correto! ${it.explain ? md(it.explain) : ''}</div>`;
        $('.score-note', el).textContent = `+${st.points} pts`;
      };
      if (st.solved) showSolved();
      $('[data-act=ok]', el).onclick = () => {
        const sel = $('input:checked', el);
        if (!sel) { $('.fb', el).innerHTML = '<div class="feedback bad">Escolha uma alternativa.</div>'; return; }
        $$('label', el).forEach(x => x.classList.remove('wrong'));
        if (+sel.value === it.answer) { finalizeItem(c, l, i, st.fails ? 0.5 : 1); showSolved(); }
        else { st.fails++; save(); sel.parentElement.classList.add('wrong'); $('.fb', el).innerHTML = '<div class="feedback bad">❌ Não é essa. Releia a explicação (ou abra o Descomplica) e tente de novo — acertando agora você ganha metade dos pontos desta questão.</div>'; }
      };
      return el;
    }
    // código
    const langName = { sql: 'SQL (SQLite)', python: 'Python 3', js: 'JavaScript · API simulada em https://api.loja.exemplo' }[it.lang];
    const savedKey = `${STORE_KEY}:code:${c.id}:${l.id}:${i}`;
    let saved = null; try { saved = localStorage.getItem(savedKey); } catch (e) { /* ignora */ }
    el.innerHTML = `<div class="q">${md(it.prompt)}</div>
      ${it.setup && it.lang === 'sql' ? `<details style="margin-bottom:10px"><summary class="muted" style="cursor:pointer">Ver as tabelas deste exercício</summary><div class="content"><pre><code class="language-sql">${esc(it.setup)}</code></pre></div></details>` : ''}
      <div class="editor-wrap">
        <div class="editor-bar"><span>${langName}</span><span>Ctrl+Enter executa</span></div>
        <textarea class="editor" spellcheck="false">${esc(saved != null ? saved : (it.starter || ''))}</textarea>
        <div class="terminal"><span class="prompt">$</span> <span class="info">pronto. "Executar" só roda; "Verificar" roda e confere o resultado.</span></div>
      </div>
      <div class="item-actions">
        <button class="btn small ghost" data-act="run">▶ Executar</button>
        <button class="btn small" data-act="check">✔ Verificar</button>
        <button class="btn small ghost hidden" data-act="sol">💡 Ver solução</button>
        <button class="btn small ghost" data-act="reset">↺ Reiniciar</button>
        <span class="score-note"></span>
      </div>
      <div class="fb"></div>`;
    const ta = $('textarea', el), term = $('.terminal', el), fb = $('.fb', el);
    highlight(el);
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('[data-act=run]', el).click(); }
    });
    ta.addEventListener('input', () => { try { localStorage.setItem(savedKey, ta.value); } catch (e) { /* ignora */ } });
    const status = s => { term.innerHTML = `<span class="info">${esc(s)}</span>`; };
    const refreshSol = () => { $('[data-act=sol]', el).classList.toggle('hidden', !(st.fails >= 3 && !st.solved)); };
    const markSolved = () => {
      el.classList.add('solved'); $('[data-act=check]', el).disabled = true;
      $('.score-note', el).textContent = `+${st.points} pts` + (st.usedSolution ? ' (com solução)' : '');
      refreshSol();
    };
    if (st.solved) { markSolved(); fb.innerHTML = '<div class="feedback ok">✅ Exercício já resolvido.</div>'; }
    refreshSol();
    const busy = b => $$('button', el).forEach(x => { if (x.dataset.act !== 'check' || !st.solved) x.disabled = b; });
    $('[data-act=run]', el).onclick = async () => {
      busy(true); status('executando…');
      try { term.innerHTML = '<span class="prompt">$ executar</span>\n' + await window.Runners.run(it, ta.value, status); }
      catch (e) { term.innerHTML = `<span class="err">${esc(e.message)}</span>`; }
      busy(false); if (st.solved) $('[data-act=check]', el).disabled = true;
    };
    $('[data-act=check]', el).onclick = async () => {
      busy(true); status('verificando…');
      let r;
      try { r = await window.Runners.check(it, ta.value, status); }
      catch (e) { r = { ok: false, msg: e.message, html: '' }; }
      term.innerHTML = '<span class="prompt">$ verificar</span>\n' + (r.html || '');
      busy(false);
      if (r.ok) {
        finalizeItem(c, l, i, st.usedSolution ? 0.25 : Math.max(0.4, 1 - 0.15 * st.fails));
        fb.innerHTML = `<div class="feedback ok">✅ ${esc(r.msg)}</div>`; markSolved();
      } else {
        st.fails++; save();
        let extra = '';
        if (r.expected && st.fails >= 2) extra = `<div style="margin-top:8px">Resultado esperado:</div><div class="terminal" style="border-radius:8px">${window.Runners.renderTable(r.expected)}</div>`;
        fb.innerHTML = `<div class="feedback bad">❌ ${esc(r.msg)}${it.hint && st.fails >= 1 ? `<div style="margin-top:6px">💡 Dica: ${inline(it.hint)}</div>` : ''}${extra}</div>`;
        refreshSol();
      }
    };
    $('[data-act=sol]', el).onclick = () => {
      if (!confirm('Ver a solução reduz os pontos deste exercício para 25%. Continuar?')) return;
      st.usedSolution = true; save();
      ta.value = it.solution; try { localStorage.setItem(savedKey, ta.value); } catch (e) { /* ignora */ }
      fb.innerHTML = '<div class="feedback bad">Solução carregada no editor. Entenda cada linha e clique em Verificar.</div>';
    };
    $('[data-act=reset]', el).onclick = () => { ta.value = it.starter || ''; try { localStorage.removeItem(savedKey); } catch (e) { /* ignora */ } };
    return el;
  }

  /* ---------------- exame ---------------- */
  function viewExam(c, moduleId) {
    const m = c.modules.find(x => x.id === moduleId);
    const ex = state.exam;
    if (!m || !ex || ex.courseId !== c.id || ex.moduleId !== m.id) {
      const last = cprog(c.id).exams[moduleId];
      if (m && last && last.lastReview) return viewExamResult(c, m, last);
      location.hash = '#/curso/' + c.id; return;
    }
    if (ex.idx >= ex.order.length) return finishExam(c, m);
    const qi = ex.order[ex.idx]; const q = m.exam[qi];
    let body;
    if (q.type === 'choice') body = `<div class="options">${ex.opt[qi].map(k => `<label><input type="radio" name="eq" value="${k}"><span>${inline(q.options[k])}</span></label>`).join('')}</div>`;
    else body = `<input type="text" id="eq-text" autocomplete="off" placeholder="Digite sua resposta">`;
    app.innerHTML = `<div class="exam" style="--accent:${c.color}">
      <div class="crumbs muted">${c.icon} ${esc(c.name)} › Exame: ${esc(m.title)}</div>
      <div class="progress" style="margin:12px 0"><span style="width:${(ex.idx / ex.order.length * 100).toFixed(0)}%"></span></div>
      <div class="card item">
        <div class="q-count">Questão ${ex.idx + 1} de ${ex.order.length}</div>
        <div class="q content">${md(q.q)}</div>
        ${body}
        <div class="item-actions"><button class="btn" id="confirm">Confirmar e avançar →</button><span class="score-note">Sem volta: confira antes de confirmar.</span></div>
        <div class="fb"></div>
      </div></div>`;
    highlight(app);
    const txt = $('#eq-text'); if (txt) { txt.focus(); txt.addEventListener('keydown', e => { if (e.key === 'Enter') $('#confirm').click(); }); }
    $('#confirm').onclick = () => {
      let ans;
      if (q.type === 'choice') { const s = $('input[name=eq]:checked'); if (!s) { $('.fb').innerHTML = '<div class="feedback bad">Escolha uma alternativa.</div>'; return; } ans = +s.value; }
      else { ans = $('#eq-text').value; if (!ans.trim()) { $('.fb').innerHTML = '<div class="feedback bad">Digite uma resposta.</div>'; return; } }
      ex.answers.push({ qi, ans }); ex.idx++; save(); viewExam(c, moduleId);
    };
  }
  function isRight(q, ans) {
    if (q.type === 'choice') return ans === q.answer;
    return q.accept.some(a => norm(a) === norm(ans));
  }
  function finishExam(c, m) {
    const ex = state.exam;
    const review = ex.answers.map(a => ({ qi: a.qi, ans: a.ans, ok: isRight(m.exam[a.qi], a.ans) }));
    const correct = review.filter(r => r.ok).length;
    const pts = Math.round(examValue(c) * correct / m.exam.length);
    const cp = cprog(c.id);
    const prev = cp.exams[m.id] || { best: 0, attempts: 0 };
    cp.exams[m.id] = { best: Math.max(prev.best, pts), attempts: prev.attempts + 1, last: pts, correct, total: m.exam.length, at: Date.now(), lastReview: review };
    state.exam = null; save(); syncScore();
    document.getElementById('nav').classList.remove('locked');
    document.getElementById('exam-banner').classList.add('hidden');
    viewExamResult(c, m, cp.exams[m.id]);
  }
  function viewExamResult(c, m, r) {
    app.innerHTML = `<div class="exam" style="--accent:${c.color}">
      <div class="card" style="text-align:center">
        <div class="muted">${c.icon} ${esc(c.name)} › Exame: ${esc(m.title)}</div>
        <div class="result-big">${r.correct}/${r.total}</div>
        <div>Você fez <b>${r.last} pts</b> neste exame. Melhor nota: <b>${r.best}/${Math.round(examValue(c))}</b>.</div>
        <div style="margin-top:8px"><span class="title-badge">${esc(titleFor(c, coursePoints(c)).name)}</span> · ${coursePoints(c)} / ${COURSE_TOTAL} pts no curso</div>
        <p class="muted">${r.correct === r.total ? 'Perfeito! Conteúdo fixado.' : 'Revise as questões erradas abaixo — errar e entender o porquê é o que mais fixa o conteúdo.'}</p>
        <div class="item-actions" style="justify-content:center"><a class="btn" href="#/curso/${c.id}">Voltar ao curso</a><a class="btn ghost" href="#/ranking/${c.id}">Ver ranking</a></div>
      </div>
      <h2>Revisão</h2>
      ${r.lastReview.map((x, n) => { const q = m.exam[x.qi]; const yours = q.type === 'choice' ? q.options[x.ans] : x.ans; const right = q.type === 'choice' ? q.options[q.answer] : q.accept[0];
        return `<div class="review-item ${x.ok ? 'ok' : 'bad'}"><b>${n + 1}.</b> ${md(q.q)}<div>Sua resposta: ${inline(String(yours))} ${x.ok ? '✅' : '❌'}</div>${x.ok ? '' : `<div>Correta: <b>${inline(String(right))}</b></div>`}${q.explain ? `<div class="muted">${md(q.explain)}</div>` : ''}</div>`; }).join('')}
    </div>`;
    highlight(app);
  }

  /* ---------------- ranking ---------------- */
  async function viewRanking(tab) {
    tab = tab || 'geral';
    app.innerHTML = '<div class="card">Carregando ranking…</div>';
    const online = await detectServer();
    let rows = [];
    if (online) {
      try { const r = await fetch('api/ranking'); rows = (await r.json()).players || []; } catch (e) { rows = []; }
    }
    // jogadores locais (mesmo navegador) entram sempre — atualizados com o estado local
    Object.values(state.profiles).forEach(p => {
      const scores = {}; COURSES.forEach(c => { scores[c.id] = coursePoints(c, p); });
      const i = rows.findIndex(r => r.id === p.id);
      if (i >= 0) rows[i] = { ...rows[i], name: p.name, scores }; else rows.push({ id: p.id, name: p.name, scores, local: true });
    });
    const course = getCourse(tab);
    const scoreOf = r => course ? (r.scores[course.id] || 0) : COURSES.reduce((a, c) => a + (r.scores[c.id] || 0), 0);
    rows.sort((a, b) => scoreOf(b) - scoreOf(a));
    const me = profile();
    const medal = i => ['🥇', '🥈', '🥉'][i] || (i + 1);
    app.innerHTML = `
      <h1>🏆 Ranking</h1>
      <p class="muted">${online ? 'Ranking global (servidor conectado).' : 'Ranking local: perfis deste navegador. Rode <code>node server.js</code> para um ranking compartilhado entre várias pessoas.'}</p>
      <div class="tabs">
        <button data-tab="geral" class="${!course ? 'active' : ''}">Geral</button>
        ${COURSES.map(c => `<button data-tab="${c.id}" class="${course && course.id === c.id ? 'active' : ''}" style="--accent:${c.color}">${c.icon} ${esc(c.name)}</button>`).join('')}
      </div>
      <div class="card" style="--accent:${course ? course.color : 'var(--primary)'}">
        <table class="rank"><thead><tr><th>#</th><th>Estudante</th><th>${course ? 'Título' : 'Títulos'}</th><th style="text-align:right">Pontos</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr class="${me && r.id === me.id ? 'me' : ''}"><td class="pos">${medal(i)}</td><td>${esc(r.name)}${me && r.id === me.id ? ' <span class="pill">você</span>' : ''}</td>
          <td>${course ? `<span class="title-badge">${esc(titleFor(course, scoreOf(r)).name)}</span>` : COURSES.map(c => `<span title="${esc(c.name)}: ${esc(titleFor(c, r.scores[c.id] || 0).name)}">${c.icon} ${esc(titleFor(c, r.scores[c.id] || 0).name)}</span>`).join('<br>')}</td>
          <td style="text-align:right;font-weight:800">${scoreOf(r)}${course ? ' / ' + COURSE_TOTAL : ' / ' + COURSE_TOTAL * COURSES.length}</td></tr>`).join('') || '<tr><td colspan="4">Ninguém pontuou ainda.</td></tr>'}
        </tbody></table>
      </div>
      <div class="card" style="margin-top:18px"><b>Como funcionam os títulos</b>
        <p class="muted" style="margin:6px 0 0">Em cada curso: ${TITLE_THRESHOLDS.map((t, i) => `${t} pts → ${i}º título`).join(' · ')}. O último título só vem com os ${COURSE_TOTAL} pts (todas as aulas e exames perfeitos).</p></div>`;
    $$('[data-tab]').forEach(b => b.onclick = () => { location.hash = '#/ranking/' + b.dataset.tab; });
  }

  /* ---------------- perfil ---------------- */
  function viewProfile() {
    const p = profile();
    app.innerHTML = `<h1>👤 Perfil</h1>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
        <div class="card"><h3 style="margin-top:0">${esc(p.name)}</h3>
          ${COURSES.map(c => { const pts = coursePoints(c, p); return `<div style="--accent:${c.color};margin:10px 0">${c.icon} <b>${esc(c.name)}</b> — ${pts} pts <span class="title-badge">${esc(titleFor(c, pts).name)}</span><div class="progress" style="margin-top:6px"><span style="width:${pts / COURSE_TOTAL * 100}%"></span></div></div>`; }).join('')}
        </div>
        <div class="card"><h3 style="margin-top:0">Trocar ou criar perfil</h3>
          <form id="pf" class="form-row"><input id="pf-in" maxlength="30" placeholder="Nome do perfil" required><button class="btn">Entrar</button></form>
          <p class="muted" style="font-size:14px">Perfis neste navegador: ${Object.keys(state.profiles).map(esc).join(', ')}</p>
          <h3>Backup do progresso</h3>
          <div class="item-actions"><button class="btn ghost small" id="exp">⬇ Exportar</button><label class="btn ghost small">⬆ Importar<input type="file" id="imp" accept="application/json" hidden></label></div>
          <h3>Zona de perigo</h3>
          <button class="btn ghost small" id="del" style="border-color:var(--bad);color:var(--bad)">Apagar progresso deste perfil</button>
        </div>
      </div>`;
    $('#pf').onsubmit = e => { e.preventDefault(); ensureProfile($('#pf-in').value); route(); };
    $('#exp').onclick = () => {
      const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `estudaai-${p.name}.json`; a.click();
    };
    $('#imp').onchange = async e => {
      try { const d = JSON.parse(await e.target.files[0].text()); if (!d.name || !d.courses) throw new Error('arquivo inválido'); state.profiles[d.name] = d; state.current = d.name; save(); syncScore(); route(); }
      catch (err) { alert('Não foi possível importar: ' + err.message); }
    };
    $('#del').onclick = () => { if (confirm('Apagar todo o progresso de ' + p.name + '?')) { p.courses = {}; save(); syncScore(); route(); } };
  }

  route();
})();
