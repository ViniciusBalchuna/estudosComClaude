#!/usr/bin/env node
/*
 * Servidor opcional (zero dependências): serve o site e mantém um ranking
 * compartilhado em data/ranking.json.  Uso: node server.js  (porta 8080 ou $PORT)
 * Sem o servidor, o site funciona igual (ex.: GitHub Pages) com ranking local.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data', 'ranking.json');
const PORT = +process.env.PORT || 8080;
const COURSES = ['sql', 'python', 'apis', 'ia'];
const MAX = 2400;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.wasm': 'application/wasm', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8' };

function load() { try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch (e) { return { players: {} }; } }
function persist(db) { fs.mkdirSync(path.dirname(DATA), { recursive: true }); fs.writeFileSync(DATA, JSON.stringify(db, null, 2)); }
let db = load();

function send(res, status, obj) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); }

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/ranking' && req.method === 'GET') {
    return send(res, 200, { players: Object.values(db.players) });
  }
  if (url.pathname === '/api/score' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 10000) req.destroy(); });
    req.on('end', () => {
      try {
        const d = JSON.parse(body);
        if (typeof d.id !== 'string' || !/^[a-z0-9]{6,40}$/.test(d.id)) return send(res, 422, { erro: 'id inválido' });
        const name = String(d.name || 'Estudante').slice(0, 30);
        const scores = {};
        for (const c of COURSES) scores[c] = Math.max(0, Math.min(MAX, Math.round(+((d.scores || {})[c]) || 0)));
        db.players[d.id] = { id: d.id, name, scores, updated: Date.now() };
        persist(db);
        send(res, 200, { ok: true });
      } catch (e) { send(res, 400, { erro: 'JSON inválido' }); }
    });
    return;
  }
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT) || file.includes(path.sep + 'data' + path.sep) || file.includes(path.sep + '.git')) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});
server.listen(PORT, () => console.log(`EstudaAí rodando em http://localhost:${PORT}`));
