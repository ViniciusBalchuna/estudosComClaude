#!/usr/bin/env node
/*
 * Compila content/*.md (formato próprio, ver content/FORMATO.md) em js/courses/<id>.js
 * Uso: node tools/build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'js', 'courses');

function fail(file, ln, msg) {
  throw new Error(`${path.basename(file)}:${ln}: ${msg}`);
}

function parseChoice(lines, file, ln) {
  const q = []; const options = []; let answer = -1; const explain = [];
  let mode = 'q';
  for (const l of lines) {
    const m = l.match(/^- \[( |x)\] (.*)$/);
    if (m) { mode = 'opt'; if (m[1] === 'x') { if (answer !== -1) fail(file, ln, 'mais de uma resposta correta'); answer = options.length; } options.push(m[2]); continue; }
    if (l.startsWith('> ') || l === '>') { mode = 'exp'; explain.push(l.replace(/^> ?/, '')); continue; }
    if (mode === 'q') q.push(l.replace(/^\? ?/, ''));
    else if (mode === 'exp') explain.push(l);
    else if (l.trim()) fail(file, ln, 'linha inesperada em choice: ' + l);
  }
  if (options.length < 2) fail(file, ln, 'choice precisa de >= 2 opções');
  if (answer === -1) fail(file, ln, 'choice sem resposta [x]');
  return { type: 'choice', q: q.join('\n').trim(), options, answer, explain: explain.join('\n').trim() };
}

function parseText(lines, file, ln) {
  const q = []; let accept = null; const explain = [];
  for (const l of lines) {
    if (l.startsWith('= ')) { accept = l.slice(2).split('|').map(s => s.trim()).filter(Boolean); continue; }
    if (l.startsWith('> ') || l === '>') { explain.push(l.replace(/^> ?/, '')); continue; }
    if (explain.length) explain.push(l); else q.push(l.replace(/^\? ?/, ''));
  }
  if (!accept) fail(file, ln, 'text sem "= resposta"');
  return { type: 'text', q: q.join('\n').trim(), accept, explain: explain.join('\n').trim() };
}

function parseCode(header, lines, file, ln) {
  const parts = header.trim().split(/\s+/);
  const lang = parts[0];
  if (!['sql', 'python', 'js'].includes(lang)) fail(file, ln, 'linguagem inválida em :::code ' + lang);
  const flags = parts.slice(1);
  const item = { type: 'code', lang, prompt: '', ordered: flags.includes('ordered') };
  const exp = flags.find(f => f.startsWith('exports='));
  if (exp) item.exports = exp.slice(8).split(',');
  let sec = 'prompt'; const buf = { prompt: [] };
  for (const l of lines) {
    const m = l.match(/^@@(\w+)\s*$/);
    if (m) { sec = m[1]; buf[sec] = buf[sec] || []; continue; }
    buf[sec].push(l);
  }
  const allowed = ['prompt', 'setup', 'starter', 'solution', 'query', 'test', 'check', 'variant', 'hint'];
  for (const k of Object.keys(buf)) {
    if (!allowed.includes(k)) fail(file, ln, 'seção desconhecida @@' + k);
    item[k] = buf[k].join('\n').replace(/^\n+|\s+$/g, '');
  }
  if (!item.solution) fail(file, ln, 'code sem @@solution');
  if (lang === 'python' && !item.test) fail(file, ln, 'python sem @@test');
  if (lang === 'js' && !item.check) fail(file, ln, 'js sem @@check');
  return item;
}

function parseFile(file, extraFiles = []) {
  const raw = [file, ...extraFiles].map(f => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')).join('\n');
  const lines = raw.split('\n');
  let course = null, mod = null, lesson = null, target = null; // target: 'lesson' | 'exam'
  const datasets = {};
  let i = 0;
  const kv = (obj, l) => { const m = l.match(/^(\w+):\s?(.*)$/); if (!m) return false; obj[m[1]] = m[2]; return true; };

  while (i < lines.length) {
    const l = lines[i]; const ln = i + 1;
    let m;
    if ((m = l.match(/^# COURSE (\S+)\s*$/))) {
      course = { id: m[1], modules: [] }; i++;
      while (i < lines.length && lines[i].trim() && kv(course, lines[i])) i++;
      course.titles = (course.titles || '').split('|').map(s => s.trim());
      continue;
    }
    if ((m = l.match(/^## MODULE (\S+) \| (.+)$/))) {
      mod = { id: m[1], title: m[2].trim(), desc: '', lessons: [], exam: [] }; course.modules.push(mod); lesson = null; target = null; i++;
      while (i < lines.length && lines[i].trim() && kv(mod, lines[i])) i++;
      continue;
    }
    if ((m = l.match(/^### LESSON (\S+) \| (.+)$/))) {
      lesson = { id: m[1], title: m[2].trim(), goal: '', content: [], easy: '', practice: [], exercises: [] };
      mod.lessons.push(lesson); target = 'lesson'; i++;
      while (i < lines.length && /^(goal|minutes):/.test(lines[i])) { kv(lesson, lines[i]); i++; }
      continue;
    }
    if ((m = l.match(/^### EXTRA (\S+)\s*$/))) {
      lesson = null;
      for (const md of course.modules) for (const ls of md.lessons) if (ls.id === m[1]) lesson = ls;
      if (!lesson) fail(file, ln, 'EXTRA para lição inexistente ' + m[1]);
      lesson.content.push('', '## Aprofundando', '');
      target = 'lesson'; i++;
      continue;
    }
    if (/^### EXAM\s*$/.test(l)) { target = 'exam'; lesson = null; i++; continue; }
    if ((m = l.match(/^:::(\w+)\s*(.*)$/))) {
      const kind = m[1]; const header = m[2];
      const body = []; i++;
      let inFence = false;
      while (i < lines.length && !(lines[i] === ':::' && !inFence)) {
        if (/^```/.test(lines[i])) inFence = !inFence;
        body.push(lines[i]); i++;
      }
      if (i >= lines.length) fail(file, ln, 'bloco ::: não fechado');
      i++; // skip closing :::
      let item;
      if (kind === 'dataset') { datasets[header.trim()] = body.join('\n').trim(); continue; }
      if (kind === 'descomplica') { if (!lesson) fail(file, ln, 'descomplica fora de lição'); lesson.easy = body.join('\n').trim(); continue; }
      if (kind === 'choice') item = parseChoice(body, file, ln);
      else if (kind === 'text') item = parseText(body, file, ln);
      else if (kind === 'code' || kind === 'exercicio') {
        item = parseCode(header, body, file, ln);
        for (const k of ['setup', 'variant']) {
          if (item[k]) item[k] = item[k].replace(/^#(\w+)\s*$/gm, (_, n) => { if (!(n in datasets)) fail(file, ln, 'dataset desconhecido #' + n); return datasets[n]; });
        }
      }
      else fail(file, ln, 'bloco desconhecido ' + kind);
      if (target === 'exam') mod.exam.push(item);
      else if (lesson && kind === 'exercicio') lesson.exercises.push(item);
      else if (lesson) lesson.practice.push(item);
      else fail(file, ln, 'item fora de lição/exame');
      continue;
    }
    if (lesson && target === 'lesson') lesson.content.push(l);
    else if (l.trim() && !l.startsWith('<!--')) fail(file, ln, 'texto solto: ' + l.slice(0, 60));
    i++;
  }
  for (const md of course.modules) {
    for (const ls of md.lessons) {
      ls.content = ls.content.join('\n').trim();
      if (!ls.easy) fail(file, 0, `lição ${ls.id} sem descomplica`);
      if (!ls.practice.length) fail(file, 0, `lição ${ls.id} sem prática`);
      const nCode = ls.practice.filter(x => x.type === 'code').length + ls.exercises.length;
      if (process.env.EXIGIR_EXERCICIOS && (ls.exercises.length < 3 || nCode < 4)) fail(file, 0, `lição ${ls.id} com ${ls.exercises.length} exercícios / ${nCode} de código (mínimo 3 / 4)`);
    }
    if (md.exam.length < 4) fail(file, 0, `módulo ${md.id} com exame curto`);
  }
  return course;
}

function extrasFor(f) {
  const x = path.join(SRC, f.replace(/\.md$/, '.extra.md'));
  return fs.existsSync(x) ? [x] : [];
}

function main() {
  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.md') && f !== 'FORMATO.md' && !f.endsWith('.extra.md')).sort();
  fs.mkdirSync(OUT, { recursive: true });
  const all = [];
  for (const f of files) {
    const c = parseFile(path.join(SRC, f), extrasFor(f));
    all.push(c);
    const js = `/* Gerado por tools/build.js a partir de content/${f} — não edite à mão. */\n` +
      `window.COURSES = window.COURSES || [];\nwindow.COURSES.push(${JSON.stringify(c)});\n`;
    fs.writeFileSync(path.join(OUT, c.id + '.js'), js);
    const nl = c.modules.reduce((a, m) => a + m.lessons.length, 0);
    const np = c.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.practice.length, 0), 0);
    const ne = c.modules.reduce((a, m) => a + m.exam.length, 0);
    const nx = c.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.exercises.length, 0), 0);
    console.log(`${c.id}: ${c.modules.length} módulos, ${nl} lições, ${np} práticas, ${nx} exercícios, ${ne} questões de exame`);
  }
  return all;
}

if (require.main === module) main();
module.exports = { parseFile, main, extrasFor };
