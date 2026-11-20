/*
 * Terminais do site. Cada runner executa o código do aluno e valida o RESULTADO
 * (linhas retornadas, estado final do banco, saída/variáveis do programa,
 * requisições feitas à API simulada) — nunca o texto exato da resposta.
 */
(function (root) {
  const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

  const PY_HARNESS = String.raw`
import sys, io, traceback
def __ea_exec(code, ns, filename, friendly_assert=False):
    buf = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = buf
    sys.stderr = buf
    err = None
    try:
        exec(compile(code, filename, 'exec'), ns)
    except SystemExit:
        pass
    except BaseException as e:
        if friendly_assert and isinstance(e, AssertionError):
            err = str(e) or 'O resultado não confere com o esperado.'
        else:
            frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == filename]
            err = ''.join(traceback.format_list(frames)) + ''.join(traceback.format_exception_only(type(e), e))
    finally:
        sys.stdout, sys.stderr = old_out, old_err
    return buf.getvalue(), err

def __ea_rerun(setup, code):
    def rodar(**valores):
        ns2 = {'__name__': '__main__'}
        if setup:
            exec(compile(setup, '<preparo>', 'exec'), ns2)
        ns2.update(valores)
        buf = io.StringIO()
        old = sys.stdout
        sys.stdout = buf
        try:
            exec(compile(code, '<seu código>', 'exec'), ns2)
        finally:
            sys.stdout = old
        return buf.getvalue(), ns2
    return rodar

def __ea_run(setup, code, test):
    ns = {'__name__': '__main__'}
    res = {'out': '', 'err': None, 'setup_err': None, 'test_err': None, 'test_out': ''}
    if setup:
        o, e = __ea_exec(setup, ns, '<preparo>')
        if e:
            res['setup_err'] = e
            return res
    o, e = __ea_exec(code, ns, '<seu código>')
    res['out'] = o
    res['err'] = e
    if test is not None and e is None:
        ns['__saida__'] = o
        ns['__rodar__'] = __ea_rerun(setup, code)
        o2, e2 = __ea_exec(test, ns, '<verificação>', True)
        res['test_out'] = o2
        res['test_err'] = e2
    return res
`;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- SQL ---------------- */
  let sqlPromise = null;
  function getSQL() {
    if (!sqlPromise) sqlPromise = root.initSqlJs({ locateFile: f => 'vendor/' + f });
    return sqlPromise;
  }
  function normVal(v) {
    if (typeof v === 'number') return Math.round(v * 1e6) / 1e6;
    if (v instanceof Uint8Array) return '[blob]';
    return v;
  }
  function normRows(rs, ordered) {
    const rows = rs.values.map(r => JSON.stringify(r.map(normVal)));
    return ordered ? rows : rows.slice().sort();
  }
  function compareResults(got, exp, ordered) {
    if (!got) return 'Seu código não retornou nenhuma tabela de resultado (faltou um SELECT?).';
    if (!exp) return null;
    if (got.columns.length !== exp.columns.length)
      return `Número de colunas diferente: esperado ${exp.columns.length}, seu resultado tem ${got.columns.length}.`;
    if (got.values.length !== exp.values.length)
      return `Número de linhas diferente: esperado ${exp.values.length}, seu resultado tem ${got.values.length}.`;
    const a = normRows(got, ordered), b = normRows(exp, ordered);
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return ordered
        ? `Os valores não conferem a partir da linha ${i + 1}${ordered ? ' (a ordem importa aqui)' : ''}.`
        : 'Os valores retornados não conferem com o esperado.';
    }
    return null;
  }
  function sqlExec(SQL, setup, variant, code) {
    const db = new SQL.Database();
    try {
      if (setup) db.exec(setup);
      if (variant) db.exec(variant);
      const res = db.exec(code);
      return { db, res, modified: db.getRowsModified() };
    } catch (e) { return { db, error: e.message }; }
  }
  function lastResult(res) { return res && res.length ? res[res.length - 1] : null; }

  async function checkSQL(ex, code, SQLin) {
    const SQL = SQLin || await getSQL();
    const variants = [null].concat(ex.variant ? [ex.variant] : []);
    let shown = null;
    for (const v of variants) {
      const u = sqlExec(SQL, ex.setup, v, code);
      const s = sqlExec(SQL, ex.setup, v, ex.solution);
      try {
        if (s.error) return { ok: false, msg: 'Erro interno na solução de referência: ' + s.error };
        if (!shown) shown = u;
        if (u.error) return { ok: false, msg: 'Erro SQL: ' + u.error, run: u };
        let got, exp;
        if (ex.query) {
          try { got = lastResult(u.db.exec(ex.query)); } catch (e) { return { ok: false, msg: 'O estado final do banco não permite a verificação: ' + e.message, run: u }; }
          exp = lastResult(s.db.exec(ex.query));
          if (!got && exp) got = { columns: exp.columns, values: [] };
          if (!exp && got) exp = { columns: got.columns, values: [] };
        } else { got = lastResult(u.res); exp = lastResult(s.res); }
        const err = compareResults(got, exp, ex.ordered);
        if (err) return { ok: false, msg: (v ? '[teste com dados diferentes] ' : '') + err + (ex.query ? ' (verificação do estado final do banco)' : ''), run: u, expected: exp };
      } finally { u.db.close(); s.db.close(); }
    }
    return { ok: true, msg: 'Resultado correto!', run: shown };
  }

  function renderTable(rs, max = 60) {
    let h = '<table><tr>' + rs.columns.map(c => `<th>${esc(c)}</th>`).join('') + '</tr>';
    rs.values.slice(0, max).forEach(r => { h += '<tr>' + r.map(v => `<td>${v === null ? '<i>NULL</i>' : esc(v)}</td>`).join('') + '</tr>'; });
    h += '</table>';
    if (rs.values.length > max) h += `<div class="info">… mais ${rs.values.length - max} linhas</div>`;
    h += `<div class="info">(${rs.values.length} linha${rs.values.length === 1 ? '' : 's'})</div>`;
    return h;
  }
  async function runSQL(ex, code) {
    const SQL = await getSQL();
    const u = sqlExec(SQL, ex.setup, null, code);
    let html = '';
    if (u.error) html = `<span class="err">Erro: ${esc(u.error)}</span>`;
    else if (!u.res.length) html = `<span class="ok">Comando executado com sucesso.</span> <span class="info">Linhas afetadas pelo último comando: ${u.modified}</span>`;
    else html = u.res.map(r => renderTable(r)).join('');
    u.db.close();
    return html;
  }

  /* ---------------- Python (Pyodide) ---------------- */
  let pyPromise = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res;
      s.onerror = () => rej(new Error('Não foi possível baixar ' + src + ' (sem internet?)'));
      document.head.appendChild(s);
    });
  }
  function getPy(onStatus) {
    if (!pyPromise) {
      pyPromise = (async () => {
        onStatus && onStatus('Baixando o Python (Pyodide)… isso só acontece na primeira vez.');
        await loadScript(PYODIDE_BASE + 'pyodide.js');
        const py = await root.loadPyodide({ indexURL: PYODIDE_BASE });
        py.runPython(PY_HARNESS);
        return py;
      })();
      pyPromise.catch(() => { pyPromise = null; });
    }
    return pyPromise;
  }
  async function pyRun(ex, code, withTest, onStatus) {
    const py = await getPy(onStatus);
    onStatus && onStatus('Preparando bibliotecas…');
    await py.loadPackagesFromImports((ex.setup || '') + '\n' + code + '\n' + (ex.test || ''));
    const fn = py.globals.get('__ea_run');
    const r = fn(ex.setup || '', code, withTest ? ex.test : undefined);
    const obj = r.toJs({ dict_converter: Object.fromEntries });
    r.destroy(); fn.destroy();
    return obj;
  }
  function pyOutputHtml(r) {
    let h = '';
    if (r.setup_err) return `<span class="err">Erro interno no preparo do exercício:\n${esc(r.setup_err)}</span>`;
    if (r.out) h += esc(r.out);
    if (r.err) h += `<span class="err">${esc(r.err)}</span>`;
    if (!r.out && !r.err) h += '<span class="info">(programa executado sem saída)</span>';
    return h;
  }
  async function runPython(ex, code, onStatus) { return pyOutputHtml(await pyRun(ex, code, false, onStatus)); }
  async function checkPython(ex, code, onStatus) {
    const r = await pyRun(ex, code, true, onStatus);
    const html = pyOutputHtml(r);
    if (r.setup_err) return { ok: false, msg: 'Erro interno no preparo.', html };
    if (r.err) return { ok: false, msg: 'Seu código gerou um erro. Leia a mensagem no terminal.', html };
    if (r.test_err) return { ok: false, msg: r.test_err, html };
    return { ok: true, msg: 'Resultado correto!', html };
  }

  /* ---------------- JavaScript + API simulada ---------------- */
  const BLOQUEADOS = ['window', 'self', 'globalThis', 'document', 'location', 'top', 'parent', 'frames', 'opener',
    'open', 'history', 'navigator', 'localStorage', 'sessionStorage', 'indexedDB', 'XMLHttpRequest', 'WebSocket',
    'EventSource', 'importScripts', 'Worker', 'SharedWorker'];
  function fmt(v) {
    if (typeof v === 'string') return v;
    if (typeof Response !== 'undefined' && v instanceof Response) return `Response { status: ${v.status}, ok: ${v.ok} }`;
    if (v instanceof Error) return v.name + ': ' + v.message;
    try { return JSON.stringify(v, null, 2); } catch (e) { return String(v); }
  }
  async function execJS(ex, code) {
    const api = new root.MockAPI();
    const logs = [];
    const push = kind => (...a) => logs.push({ kind, text: a.map(fmt).join(' ') });
    const cons = { log: push('log'), info: push('log'), warn: push('warn'), error: push('error'), table: push('log') };
    const fetchFn = (i, init) => api.fetch(i, init);
    const sleep = ms => new Promise(r => setTimeout(r, Math.min(ms, 200)));
    let src = code;
    const ex_ = {};
    // captura funções/variáveis nomeadas em ex.exports por closure (funciona mesmo com return antecipado)
    if (ex.exports) src = '__ex.get = () => ({' + ex.exports.map(n => `${n}: (() => { try { return ${n}; } catch (e) { return undefined; } })()`).join(', ') + '});\n' + src;
    let result, error = null;
    try {
      // Os nomes em BLOQUEADOS viram `undefined` dentro do código do aluno: um trecho colado
      // de fora não consegue redirecionar a página (location/open), ler o progresso
      // (localStorage) nem falar com servidores reais (XMLHttpRequest/WebSocket).
      // Não é um sandbox perfeito, mas fecha os caminhos comuns.
      const fn = new Function('fetch', 'console', 'esperar', '__ex', ...BLOQUEADOS, '"use strict";\nreturn (async () => {\n' + src + '\n})();');
      result = await Promise.race([
        fn(fetchFn, cons, sleep, ex_, ...BLOQUEADOS.map(() => undefined)),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Tempo esgotado (8s). Há um laço infinito ou uma Promise sem await?')), 8000))
      ]);
    } catch (e) { error = e; }
    let exportsObj = {};
    try { exportsObj = ex_.get ? ex_.get() : {}; } catch (e) { exportsObj = {}; }
    return { api, logs, result, error, requests: api.requests, exports: exportsObj };
  }
  function jsOutputHtml(r) {
    let h = r.logs.map(l => l.kind === 'error' ? `<span class="err">${esc(l.text)}</span>` : l.kind === 'warn' ? `<span class="info">${esc(l.text)}</span>` : esc(l.text)).join('\n');
    if (r.error) h += (h ? '\n' : '') + `<span class="err">${esc(r.error.name + ': ' + r.error.message)}</span>`;
    const reqs = r.requests.map(q => `→ ${q.method} ${q.url.replace(root.MockAPI.BASE, '')}`).join('\n');
    if (reqs) h += (h ? '\n' : '') + `<span class="info">Requisições feitas:\n${esc(reqs)}</span>`;
    if (!h) h = '<span class="info">(nenhuma saída — use console.log)</span>';
    return h;
  }
  function compileCheck(src) { return new Function('return (' + src + ');')(); }
  async function runJS(ex, code) { return jsOutputHtml(await execJS(ex, code)); }
  async function checkJS(ex, code) {
    const r = await execJS(ex, code);
    const html = jsOutputHtml(r);
    if (r.error) return { ok: false, msg: 'Seu código lançou um erro: ' + r.error.message, html };
    let verdict;
    try {
      verdict = await compileCheck(ex.check)({ logs: r.logs.map(l => l.text), result: r.result, exports: r.exports || {}, api: r.api, requests: r.requests, MockAPI: root.MockAPI });
    } catch (e) { verdict = 'Falha ao verificar: ' + e.message; }
    if (verdict === true) return { ok: true, msg: 'Resultado correto!', html };
    return { ok: false, msg: typeof verdict === 'string' ? verdict : 'O resultado não confere com o esperado.', html };
  }

  const Runners = {
    PY_HARNESS, PYODIDE_BASE, compareResults, checkSQL, sqlExec, renderTable, execJS, checkJS,
    run(ex, code, onStatus) {
      if (ex.lang === 'sql') return runSQL(ex, code);
      if (ex.lang === 'python') return runPython(ex, code, onStatus);
      return runJS(ex, code);
    },
    async check(ex, code, onStatus) {
      if (ex.lang === 'sql') {
        const r = await checkSQL(ex, code);
        let html = '';
        if (r.run) {
          if (r.run.error) html = `<span class="err">Erro: ${esc(r.run.error)}</span>`;
          else if (r.run.res && r.run.res.length) html = r.run.res.map(x => renderTable(x)).join('');
          else html = '<span class="ok">Comando executado.</span>';
        }
        return { ok: r.ok, msg: r.msg, html, expected: r.expected };
      }
      if (ex.lang === 'python') return checkPython(ex, code, onStatus);
      return checkJS(ex, code);
    }
  };
  root.Runners = Runners;
  if (typeof module !== 'undefined' && module.exports) module.exports = Runners;
})(typeof window !== 'undefined' ? window : globalThis);
