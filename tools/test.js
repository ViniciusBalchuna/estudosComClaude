#!/usr/bin/env node
/*
 * Testa todos os exercícios de código: a solução de referência PRECISA passar
 * e o código inicial (starter) PRECISA falhar.
 *   node tools/test.js [curso]
 * SQL: sql.js (npm i sql.js) · JS: Node 18+ · Python: python3 local (+ numpy/pandas/scikit-learn).
 * Passe SQLJS=/caminho/para/sql.js se o módulo não estiver em node_modules.
 */
const path = require('path');
const { execFileSync } = require('child_process');
const { parseFile } = require('./build');
const fs = require('fs');

global.MockAPI = require('../js/mockapi.js');
const Runners = require('../js/runners.js');

const only = process.argv[2];
const files = fs.readdirSync(path.join(__dirname, '..', 'content')).filter(f => f.endsWith('.md') && f !== 'FORMATO.md');

async function main() {
  let SQL = null;
  try { SQL = await require(process.env.SQLJS || 'sql.js')(); } catch (e) { console.warn('sql.js indisponível — pulando SQL'); }
  const pyJobs = [];
  let fails = 0, total = 0;
  for (const f of files) {
    const c = parseFile(path.join(__dirname, '..', 'content', f));
    if (only && c.id !== only) continue;
    for (const m of c.modules) for (const l of m.lessons) l.practice.forEach((it, i) => {
      if (it.type !== 'code') return;
      const tag = `${c.id}/${l.id}#${i}`;
      if (it.lang === 'python') pyJobs.push({ tag, setup: it.setup || '', solution: it.solution, starter: it.starter || '', test: it.test });
      else pending.push({ tag, it });
    });
  }
  for (const { tag, it } of pending) {
    total++;
    let good, bad;
    if (it.lang === 'sql') {
      if (!SQL) continue;
      good = await Runners.checkSQL(it, it.solution, SQL);
      bad = await Runners.checkSQL(it, it.starter || '', SQL);
    } else {
      good = await Runners.checkJS(it, it.solution);
      bad = await Runners.checkJS(it, it.starter || '');
    }
    if (!good.ok) { fails++; console.log(`✗ ${tag}: solução falhou → ${good.msg}`); }
    else if (bad.ok) { fails++; console.log(`✗ ${tag}: starter passou (verificação fraca)`); }
    else console.log(`✓ ${tag}`);
  }
  if (pyJobs.length) {
    const script = Runners.PY_HARNESS + `
import json, sys
jobs = json.load(sys.stdin)
out = []
for j in jobs:
    g = __ea_run(j['setup'], j['solution'], j['test'])
    b = __ea_run(j['setup'], j['starter'], j['test'])
    out.append({'tag': j['tag'], 'good': g, 'bad_ok': (b['err'] is None and b['test_err'] is None and b['setup_err'] is None)})
print(json.dumps(out))
`;
    const res = JSON.parse(execFileSync('python3', ['-I', '-c', script], { input: JSON.stringify(pyJobs), maxBuffer: 1 << 26 }).toString());
    for (const r of res) {
      total++;
      const g = r.good;
      if (g.setup_err || g.err || g.test_err) { fails++; console.log(`✗ ${r.tag}: solução falhou → ${g.setup_err || g.err || g.test_err}`); }
      else if (r.bad_ok) { fails++; console.log(`✗ ${r.tag}: starter passou (verificação fraca)`); }
      else console.log(`✓ ${r.tag}`);
    }
  }
  console.log(`\n${total - fails}/${total} exercícios OK`);
  process.exit(fails ? 1 : 0);
}
const pending = [];
main();
