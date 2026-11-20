/*
 * MockAPI — uma API REST de verdade (em memória) que roda dentro do navegador.
 * Usada pelo terminal JavaScript do curso de APIs REST: o fetch() do aluno é
 * redirecionado para cá. Base: https://api.loja.exemplo
 */
(function (root) {
  const BASE = 'https://api.loja.exemplo';
  const TOKEN_USER = { usuario: 'aluno', senha: '1234' };
  const API_KEY = 'chave-demo-123';

  function b64url(obj) {
    const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const JWT = b64url({ alg: 'HS256', typ: 'JWT' }) + '.' +
    b64url({ sub: 'aluno', papel: 'estudante', iat: 1767225600, exp: 1767229200 }) + '.' +
    'assinatura-demo';

  function seed() {
    const cats = ['livros', 'eletronicos', 'casa'];
    const nomes = ['Caderno', 'Fone Bluetooth', 'Caneca', 'Livro de SQL', 'Teclado', 'Luminária',
      'Livro de Python', 'Mouse', 'Almofada', 'Livro de IA', 'Monitor', 'Vaso'];
    const precos = [15.9, 199.0, 29.9, 89.0, 149.9, 79.5, 95.0, 59.9, 39.0, 120.0, 899.0, 45.0];
    const catOf = [2, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2];
    return {
      usuarios: [
        { id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com', ativo: true },
        { id: 2, nome: 'Bruno Lima', email: 'bruno@exemplo.com', ativo: false },
        { id: 3, nome: 'Carla Dias', email: 'carla@exemplo.com', ativo: true },
        { id: 4, nome: 'Diego Rocha', email: 'diego@exemplo.com', ativo: true },
        { id: 5, nome: 'Elisa Prado', email: 'elisa@exemplo.com', ativo: false }
      ],
      produtos: nomes.map((n, i) => ({ id: i + 1, nome: n, preco: precos[i], categoria: cats[catOf[i]], versao: 1 })),
      pedidos: [
        { id: 1, usuarioId: 1, status: 'pendente', total: 105.8 },
        { id: 2, usuarioId: 3, status: 'enviado', total: 199.0 },
        { id: 3, usuarioId: 4, status: 'pendente', total: 45.0 }
      ]
    };
  }

  class MockAPI {
    constructor() { this.reset(); }
    reset() {
      const s = seed();
      this.usuarios = s.usuarios; this.produtos = s.produtos; this.pedidos = s.pedidos;
      this.nextUserId = 6; this.pagamentos = []; this.idem = new Map();
      this.requests = []; this.counters = { instavel: 0, limitado: 0 };
    }
    static get BASE() { return BASE; }
    static get JWT() { return JWT; }

    json(status, obj, headers = {}) {
      return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
    }
    problem(status, title, detail, extra = {}, headers = {}) {
      const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return new Response(JSON.stringify({ type: BASE + '/erros/' + slug, title, status, detail, ...extra }),
        { status, headers: { 'Content-Type': 'application/problem+json', ...headers } });
    }
    empty(status, headers = {}) { return new Response(null, { status, headers }); }

    readJSON(req) {
      const ct = req.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return { error: this.problem(415, 'Tipo de mídia não suportado', 'Envie o corpo como JSON com o header Content-Type: application/json.') };
      try { return { data: JSON.parse(req.body || '') }; } catch (e) { return { error: this.problem(400, 'JSON inválido', 'Não foi possível interpretar o corpo como JSON. Dica: use JSON.stringify(objeto).') }; }
    }

    async fetch(input, init = {}) {
      const urlStr = typeof input === 'string' ? input : (input && input.url) || String(input);
      let url;
      try { url = new URL(urlStr); } catch (e) { throw new TypeError('URL inválida: ' + urlStr); }
      if (url.origin !== BASE) throw new TypeError('Failed to fetch — o simulador só acessa ' + BASE);
      const method = (init.method || 'GET').toUpperCase();
      const headers = new Headers(init.headers || {});
      let body = init.body;
      if (body !== undefined && body !== null && typeof body !== 'string') body = String(body);
      const req = { method, path: url.pathname.replace(/\/+$/, '') || '/', query: url.searchParams, headers, body };
      const hobj = {}; headers.forEach((v, k) => { hobj[k] = v; });
      this.requests.push({ method, url: url.href, path: req.path, query: Object.fromEntries(url.searchParams), headers: hobj, body });
      if (['GET', 'HEAD'].includes(method) && body) throw new TypeError('Request with GET/HEAD method cannot have body.');
      let res = this.route(req);
      if (method === 'HEAD') res = new Response(null, { status: res.status, headers: res.headers });
      return res;
    }

    route(req) {
      const p = req.path, m = req.method;
      let mm;
      if (m === 'OPTIONS') {
        return this.empty(204, {
          'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Origin': 'https://app.loja.exemplo',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '600'
        });
      }
      if (p === '/') {
        if (m !== 'GET' && m !== 'HEAD') return this.notAllowed('GET');
        return this.json(200, { mensagem: 'Bem-vindo à API da Loja', versao: '1.0', _links: { usuarios: { href: '/usuarios' }, produtos: { href: '/produtos' }, pedidos: { href: '/pedidos' } } });
      }
      if (p === '/usuarios') return this.usuariosCol(req);
      if ((mm = p.match(/^\/usuarios\/(\d+)$/))) return this.usuarioItem(req, +mm[1]);
      if (p === '/produtos') return this.produtosCol(req);
      if ((mm = p.match(/^\/produtos\/(\d+)$/))) return this.produtoItem(req, +mm[1]);
      if ((mm = p.match(/^\/pedidos\/(\d+)$/))) return this.pedidoItem(req, +mm[1]);
      if ((mm = p.match(/^\/pedidos\/(\d+)\/cancelar$/))) return this.pedidoCancelar(req, +mm[1]);
      if (p === '/pedidos') {
        if (m !== 'GET') return this.notAllowed('GET');
        return this.json(200, this.pedidos.map(x => ({ ...x })));
      }
      if (p === '/auth/token') return this.authToken(req);
      if (p === '/privado/perfil') return this.perfil(req);
      if (p === '/chave/relatorio') return this.relatorio(req);
      if (p === '/instavel') {
        this.counters.instavel++;
        if (this.counters.instavel <= 2) return this.problem(503, 'Serviço indisponível', 'Instabilidade temporária. Tente novamente.', {}, { 'Retry-After': '0' });
        return this.json(200, { status: 'ok', tentativas: this.counters.instavel });
      }
      if (p === '/limitado') {
        this.counters.limitado++;
        const rest = Math.max(0, 3 - this.counters.limitado);
        const h = { 'X-RateLimit-Limit': '3', 'X-RateLimit-Remaining': String(rest) };
        if (this.counters.limitado > 3) return this.problem(429, 'Muitas requisições', 'Limite de 3 requisições por janela excedido.', {}, { ...h, 'Retry-After': '30' });
        return this.json(200, { ok: true, chamada: this.counters.limitado }, h);
      }
      if (p === '/pagamentos') return this.pagamentosCol(req);
      return this.problem(404, 'Não encontrado', `O recurso ${p} não existe nesta API.`);
    }

    notAllowed(allow) { return this.problem(405, 'Método não permitido', 'Métodos aceitos: ' + allow, {}, { 'Allow': allow }); }

    usuariosCol(req) {
      if (req.method === 'GET' || req.method === 'HEAD') {
        let list = this.usuarios.map(u => ({ ...u }));
        const at = req.query.get('ativo');
        if (at !== null) list = list.filter(u => String(u.ativo) === at);
        const nome = req.query.get('nome');
        if (nome) list = list.filter(u => u.nome.toLowerCase().includes(nome.toLowerCase()));
        return this.json(200, list);
      }
      if (req.method === 'POST') {
        const r = this.readJSON(req); if (r.error) return r.error;
        const d = r.data || {};
        const erros = [];
        if (typeof d.nome !== 'string' || !d.nome.trim()) erros.push({ campo: 'nome', mensagem: 'obrigatório' });
        if (typeof d.email !== 'string' || !d.email.includes('@')) erros.push({ campo: 'email', mensagem: 'deve ser um e-mail válido' });
        if (erros.length) return this.problem(422, 'Dados inválidos', 'Corrija os campos indicados.', { erros });
        if (this.usuarios.some(u => u.email === d.email)) return this.problem(409, 'Conflito', 'Já existe um usuário com esse e-mail.');
        const u = { id: this.nextUserId++, nome: d.nome.trim(), email: d.email, ativo: d.ativo === undefined ? true : !!d.ativo };
        this.usuarios.push(u);
        return this.json(201, u, { 'Location': '/usuarios/' + u.id });
      }
      return this.notAllowed('GET, POST');
    }

    usuarioItem(req, id) {
      const idx = this.usuarios.findIndex(u => u.id === id);
      if (idx === -1) return this.problem(404, 'Não encontrado', `Usuário ${id} não existe.`);
      const u = this.usuarios[idx];
      if (req.method === 'GET' || req.method === 'HEAD') return this.json(200, { ...u });
      if (req.method === 'DELETE') { this.usuarios.splice(idx, 1); return this.empty(204); }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const r = this.readJSON(req); if (r.error) return r.error;
        const d = r.data || {};
        if (req.method === 'PUT') {
          const erros = [];
          if (typeof d.nome !== 'string' || !d.nome.trim()) erros.push({ campo: 'nome', mensagem: 'obrigatório no PUT (substituição completa)' });
          if (typeof d.email !== 'string' || !d.email.includes('@')) erros.push({ campo: 'email', mensagem: 'obrigatório no PUT (substituição completa)' });
          if (erros.length) return this.problem(422, 'Dados inválidos', 'PUT substitui o recurso inteiro: envie todos os campos.', { erros });
          this.usuarios[idx] = { id, nome: d.nome, email: d.email, ativo: d.ativo === undefined ? true : !!d.ativo };
        } else {
          for (const k of ['nome', 'email', 'ativo']) if (k in d) u[k] = d[k];
        }
        return this.json(200, { ...this.usuarios[idx] });
      }
      return this.notAllowed('GET, PUT, PATCH, DELETE');
    }

    produtosCol(req) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return this.notAllowed('GET');
      let list = this.produtos.map(({ versao, ...p }) => p);
      const cat = req.query.get('categoria'); if (cat) list = list.filter(p => p.categoria === cat);
      const busca = req.query.get('busca'); if (busca) list = list.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));
      const ord = req.query.get('ordenar');
      if (ord) {
        const desc = ord.startsWith('-'); const campo = ord.replace(/^-/, '');
        if (!['preco', 'nome', 'id'].includes(campo)) return this.problem(400, 'Parâmetro inválido', 'ordenar aceita: preco, nome, id (prefixo - para decrescente).');
        list.sort((a, b) => (a[campo] > b[campo] ? 1 : a[campo] < b[campo] ? -1 : 0) * (desc ? -1 : 1));
      }
      const pagina = parseInt(req.query.get('pagina') || '1', 10);
      const limite = parseInt(req.query.get('limite') || '5', 10);
      if (!(pagina >= 1) || !(limite >= 1) || limite > 50) return this.problem(400, 'Parâmetro inválido', 'pagina >= 1 e 1 <= limite <= 50.');
      const total = list.length; const total_paginas = Math.max(1, Math.ceil(total / limite));
      const dados = list.slice((pagina - 1) * limite, pagina * limite);
      return this.json(200, { dados, pagina, limite, total, total_paginas, proxima: pagina < total_paginas ? pagina + 1 : null });
    }

    produtoItem(req, id) {
      const p = this.produtos.find(x => x.id === id);
      if (!p) return this.problem(404, 'Não encontrado', `Produto ${id} não existe.`);
      const etag = `"p${p.id}-v${p.versao}"`;
      const { versao, ...pub } = p;
      if (req.method === 'GET' || req.method === 'HEAD') {
        const inm = req.headers.get('if-none-match');
        if (inm && inm === etag) return this.empty(304, { 'ETag': etag, 'Cache-Control': 'max-age=60' });
        return this.json(200, pub, { 'ETag': etag, 'Cache-Control': 'max-age=60' });
      }
      if (req.method === 'PATCH') {
        const im = req.headers.get('if-match');
        if (im && im !== etag) return this.problem(412, 'Pré-condição falhou', 'O recurso mudou desde a sua leitura (ETag diferente).');
        const r = this.readJSON(req); if (r.error) return r.error;
        const d = r.data || {};
        if ('preco' in d) { if (typeof d.preco !== 'number' || d.preco < 0) return this.problem(422, 'Dados inválidos', 'preco deve ser número >= 0'); p.preco = d.preco; }
        if ('nome' in d) p.nome = String(d.nome);
        p.versao++;
        const { versao: v2, ...pub2 } = p;
        return this.json(200, pub2, { 'ETag': `"p${p.id}-v${p.versao}"` });
      }
      return this.notAllowed('GET, PATCH');
    }

    pedidoItem(req, id) {
      const p = this.pedidos.find(x => x.id === id);
      if (!p) return this.problem(404, 'Não encontrado', `Pedido ${id} não existe.`);
      if (req.method !== 'GET' && req.method !== 'HEAD') return this.notAllowed('GET');
      const links = { self: { href: `/pedidos/${id}` }, usuario: { href: `/usuarios/${p.usuarioId}` } };
      if (p.status === 'pendente') links.cancelar = { href: `/pedidos/${id}/cancelar`, method: 'POST' };
      return this.json(200, { ...p, _links: links });
    }

    pedidoCancelar(req, id) {
      const p = this.pedidos.find(x => x.id === id);
      if (!p) return this.problem(404, 'Não encontrado', `Pedido ${id} não existe.`);
      if (req.method !== 'POST') return this.notAllowed('POST');
      if (p.status !== 'pendente') return this.problem(409, 'Conflito', `Pedido com status "${p.status}" não pode ser cancelado.`);
      p.status = 'cancelado';
      return this.json(200, { ...p, _links: { self: { href: `/pedidos/${id}` } } });
    }

    authToken(req) {
      if (req.method !== 'POST') return this.notAllowed('POST');
      const r = this.readJSON(req); if (r.error) return r.error;
      const d = r.data || {};
      if (d.usuario !== TOKEN_USER.usuario || d.senha !== TOKEN_USER.senha) return this.problem(401, 'Credenciais inválidas', 'Usuário ou senha incorretos.');
      return this.json(200, { access_token: JWT, token_type: 'Bearer', expires_in: 3600 });
    }

    perfil(req) {
      if (req.method !== 'GET') return this.notAllowed('GET');
      const a = req.headers.get('authorization');
      const wa = { 'WWW-Authenticate': 'Bearer realm="loja"' };
      if (!a) return this.problem(401, 'Não autenticado', 'Envie o header Authorization: Bearer <token>.', {}, wa);
      if (a !== 'Bearer ' + JWT) return this.problem(401, 'Token inválido', 'O token enviado não é válido.', {}, wa);
      return this.json(200, { usuario: 'aluno', papel: 'estudante', cursos: ['sql', 'python', 'apis', 'ia'] });
    }

    relatorio(req) {
      if (req.method !== 'GET') return this.notAllowed('GET');
      const k = req.headers.get('x-api-key');
      if (!k) return this.problem(401, 'Não autenticado', 'Envie o header X-API-Key.');
      if (k !== API_KEY) return this.problem(403, 'Proibido', 'Chave sem permissão.');
      return this.json(200, { vendas_mes: 1520.4, pedidos: 3 });
    }

    pagamentosCol(req) {
      if (req.method === 'GET') return this.json(200, this.pagamentos.map(x => ({ ...x })));
      if (req.method !== 'POST') return this.notAllowed('GET, POST');
      const key = req.headers.get('idempotency-key');
      if (key && this.idem.has(key)) {
        const saved = this.idem.get(key);
        return this.json(saved.status, saved.body, { 'Idempotent-Replayed': 'true' });
      }
      const r = this.readJSON(req); if (r.error) return r.error;
      const d = r.data || {};
      if (typeof d.valor !== 'number' || d.valor <= 0) return this.problem(422, 'Dados inválidos', 'valor deve ser número > 0');
      const pg = { id: this.pagamentos.length + 1, valor: d.valor, pedidoId: d.pedidoId ?? null, status: 'aprovado' };
      this.pagamentos.push(pg);
      if (key) this.idem.set(key, { status: 201, body: pg });
      return this.json(201, pg, { 'Location': '/pagamentos/' + pg.id });
    }
  }

  root.MockAPI = MockAPI;
  if (typeof module !== 'undefined' && module.exports) module.exports = MockAPI;
})(typeof window !== 'undefined' ? window : globalThis);
