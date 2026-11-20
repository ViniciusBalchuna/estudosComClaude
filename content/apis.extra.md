<!-- Aprofundamento e exercícios extras do curso de APIs REST (mesclados por tools/build.js) -->

### EXTRA api-01

### APIs estão em todo lugar

| Exemplo | Quem é o cliente | Quem é o servidor |
|---|---|---|
| App de clima no celular | o app | serviço de meteorologia |
| Botão "Pagar com Pix" numa loja | o back-end da loja | API do banco/gateway de pagamento |
| Login com Google | o site | servidor de autorização do Google |
| Um assistente de IA consultando o estoque | o agente | a API interna da empresa |

Nem toda API é web: bibliotecas também têm APIs (as funções que expõem), e o sistema operacional tem APIs para arquivos e rede. Neste curso, "API" significa **API web via HTTP**.

### Estilos de API web

| Estilo | Ideia central |
|---|---|
| **REST** | recursos identificados por URLs, manipulados com os métodos HTTP |
| **RPC/JSON-RPC** | chamar "procedimentos" remotos (`criarUsuario`) |
| **GraphQL** | uma URL única, o cliente descreve os dados que quer |
| **gRPC** | chamadas binárias entre serviços, contratos em Protocol Buffers |
| **SOAP** | mensagens XML com contrato rígido (WSDL), comum em sistemas antigos |

REST é o mais comum em APIs públicas por ser simples, usar o HTTP como ele foi pensado e funcionar com qualquer linguagem.

### Recurso x representação, na prática

O **recurso** "usuário 1" é uma ideia; ele pode ser **representado** de vários jeitos:

```json
{"id": 1, "nome": "Ana Souza", "ativo": true}
```

```xml
<usuario><id>1</id><nome>Ana Souza</nome><ativo>true</ativo></usuario>
```

O cliente pede o formato que prefere com o header `Accept`, e o servidor informa o formato enviado em `Content-Type`.

### Por que "sem estado" ajuda a escalar

Se o servidor não guarda nada sobre a "conversa", **qualquer** servidor pode atender **qualquer** requisição. Assim, dá para colocar 10 servidores atrás de um balanceador de carga e cada requisição vai para o que estiver livre. Por isso cada requisição carrega sua própria autenticação (um token no header), em vez de depender de "você já fez login antes neste servidor".

### Lendo a resposta: status, headers e corpo

```javascript
const r = await fetch('https://api.loja.exemplo/usuarios/1');
r.status;                         // 200
r.ok;                             // true (200–299)
r.headers.get('Content-Type');    // 'application/json; charset=utf-8'
const corpo = await r.json();     // o objeto
```

O `fetch` devolve a resposta assim que os **headers** chegam; o corpo é lido depois, com `json()`, `text()` ou `blob()` — por isso eles também precisam de `await`.

:::exercicio js
Faça um GET em `/produtos` e mostre no console o campo **`total`** da resposta (o número total de produtos da loja).
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/produtos');
const corpo = await r.json();
console.log(corpo.total);
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/produtos')) return 'Faça um GET em /produtos';
  if (!ctx.logs.some(l => l.trim() === '12')) return 'Mostre no console o campo total da resposta';
  return true;
}
:::

:::exercicio js
A raiz da API (`/`) traz um objeto `_links` com os recursos disponíveis. Faça o GET e **retorne** (`return`) a **lista com os nomes das chaves** de `_links` (use `Object.keys`).
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/');
const dados = await r.json();
return Object.keys(dados._links);
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/')) return 'Faça um GET em /';
  if (JSON.stringify(ctx.result) !== JSON.stringify(['usuarios', 'produtos', 'pedidos'])) return 'Retorne Object.keys(dados._links)';
  return true;
}
:::

:::exercicio js
Faça um GET em `/pedidos` (lista de pedidos) e **retorne** um objeto com:
- **`total`**: quantos pedidos existem;
- **`pendentes`**: quantos têm `status` igual a `'pendente'`;
- **`valorPendente`**: a soma do campo `total` dos pedidos pendentes.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/pedidos');
const pedidos = await r.json();
const pend = pedidos.filter(p => p.status === 'pendente');
return { total: pedidos.length, pendentes: pend.length, valorPendente: pend.reduce((s, p) => s + p.total, 0) };
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/pedidos')) return 'Faça um GET em /pedidos';
  const r = ctx.result || {};
  if (r.total !== 3) return 'total deve ser a quantidade de pedidos (3)';
  if (r.pendentes !== 2) return 'pendentes deve contar os pedidos com status "pendente"';
  if (Math.abs((r.valorPendente || 0) - 150.8) > 1e-9) return 'valorPendente deve somar o campo total dos pendentes (105.8 + 45)';
  return true;
}
:::

### EXTRA api-02

### Seguro e idempotente, com exemplos

| Requisição | Repetida 3 vezes… | Idempotente? |
|---|---|---|
| `GET /usuarios/1` | lê 3 vezes, nada muda | sim |
| `DELETE /usuarios/5` | 1ª apaga (204); 2ª e 3ª: já não existe (404). O estado final é o mesmo | sim |
| `PUT /usuarios/3` com o mesmo corpo | o usuário fica igual ao corpo, sempre | sim |
| `PATCH /contas/1 {"saldo_mais": 10}` | soma 10 três vezes | **não** |
| `PATCH /usuarios/3 {"ativo": false}` | fica falso, sempre | sim (neste caso) |
| `POST /usuarios` | cria **3** usuários | **não** |

Idempotência é sobre o **efeito no servidor**, não sobre a resposta ser igual. O 2º DELETE responde 404, mas não causa nenhum efeito novo.

### Por que isso importa: redes falham

Uma requisição pode chegar ao servidor e a **resposta** se perder no caminho. O cliente não sabe se deu certo. Se a operação for idempotente, é seguro **simplesmente repetir**. Se não for (POST), repetir pode duplicar — a aula de idempotência mostra como resolver.

### Métodos que poucos usam, mas existem

- **HEAD**: igual ao GET, mas só os headers. Útil para saber o tamanho de um arquivo (`Content-Length`) ou se um recurso mudou, sem baixá-lo.
- **OPTIONS**: pergunta ao servidor quais métodos são permitidos; o navegador usa no CORS.
- **405 Method Not Allowed**: o servidor responde quando o método não é aceito naquele recurso, com o header `Allow` listando os aceitos.

### Mesma URL, ações diferentes

```text
GET    /usuarios/3   → lê
PUT    /usuarios/3   → substitui
PATCH  /usuarios/3   → altera parte
DELETE /usuarios/3   → remove
```

Essa é a ideia da **interface uniforme**: você não inventa um nome para cada ação; combina o recurso com um verbo padrão.

### fetch com cada método

```javascript
const BASE = 'https://api.loja.exemplo';
const json = { 'Content-Type': 'application/json' };

await fetch(`${BASE}/usuarios`);                                        // GET (padrão)
await fetch(`${BASE}/usuarios`, { method: 'POST', headers: json, body: JSON.stringify({ nome: 'Lia', email: 'lia@x.com' }) });
await fetch(`${BASE}/usuarios/3`, { method: 'PATCH', headers: json, body: JSON.stringify({ ativo: false }) });
await fetch(`${BASE}/usuarios/3`, { method: 'DELETE' });
await fetch(`${BASE}/usuarios/3`, { method: 'HEAD' });
```

GET e HEAD **não podem ter corpo**: o `fetch` lança erro se você tentar.

:::exercicio js
Faça um GET em `/usuarios` e **retorne** a lista com os **nomes** dos usuários **ativos** (campo `ativo`), filtrando no seu código.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/usuarios');
const lista = await r.json();
return lista.filter(u => u.ativo).map(u => u.nome);
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/usuarios')) return 'Faça um GET em /usuarios';
  if (JSON.stringify(ctx.result) !== JSON.stringify(['Ana Souza', 'Carla Dias', 'Diego Rocha'])) return 'Retorne os nomes dos usuários com ativo === true';
  return true;
}
:::

:::exercicio js
Demonstre que **DELETE é idempotente**: envie **DELETE `/usuarios/5`** **duas vezes** e **retorne** um array com os **dois status** recebidos. Depois, confira (no console) que o usuário 5 não existe mais.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r1 = await fetch(BASE + '/usuarios/5', { method: 'DELETE' });
const r2 = await fetch(BASE + '/usuarios/5', { method: 'DELETE' });
const g = await fetch(BASE + '/usuarios/5');
console.log('GET depois:', g.status);
return [r1.status, r2.status];
@@check
(ctx) => {
  const dels = ctx.requests.filter(r => r.method === 'DELETE' && r.path === '/usuarios/5');
  if (dels.length !== 2) return 'Envie DELETE /usuarios/5 exatamente duas vezes';
  if (JSON.stringify(ctx.result) !== JSON.stringify([204, 404])) return 'Retorne os status: [204, 404]';
  if (ctx.api.usuarios.some(u => u.id === 5)) return 'O usuário 5 deveria ter sido removido';
  return true;
}
:::

:::exercicio js
O recurso `/produtos` só aceita leitura. Envie um **DELETE `/produtos`** e **retorne** um objeto com o **`status`** recebido e o valor do header **`Allow`** (os métodos aceitos).
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/produtos', { method: 'DELETE' });
return { status: r.status, allow: r.headers.get('Allow') };
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'DELETE' && r.path === '/produtos')) return 'Envie DELETE /produtos';
  const r = ctx.result || {};
  if (r.status !== 405) return 'status deve ser 405 (Method Not Allowed)';
  if (r.allow !== 'GET') return 'allow deve vir do header Allow da resposta';
  return true;
}
:::

### EXTRA api-03

### Um guia de decisão para escolher o status

```text
Deu certo?
├── sim → criou algo novo?            → 201 (+ Location)
│         não tem corpo para devolver? → 204
│         senão                        → 200
└── não → culpa de quem pediu?
          ├── sim → não está autenticado?         → 401
          │         autenticado mas sem permissão? → 403
          │         o recurso não existe?          → 404
          │         método não suportado?          → 405
          │         conflito com o estado atual?   → 409
          │         corpo malformado?              → 400
          │         dados inválidos?               → 422
          │         passou do limite de uso?       → 429
          └── não (culpa do servidor) → bug inesperado    → 500
                                        dependência fora   → 502/503/504
```

### Diferenças que confundem

| Par | Diferença |
|---|---|
| 401 x 403 | 401: "não sei quem você é" (falta/errou a credencial). 403: "sei quem você é e você não pode" |
| 400 x 422 | 400: não consegui nem ler (JSON quebrado). 422: li, mas os dados não fazem sentido (e-mail sem @) |
| 404 x 410 | 404: não encontrado. 410 Gone: existiu e foi removido de propósito, para sempre |
| 500 x 503 | 500: erro inesperado (bug). 503: indisponível temporariamente (manutenção, sobrecarga) |
| 301 x 302 x 307/308 | 301/308: mudou de endereço para sempre. 302/307: temporariamente. 307/308 preservam o método e o corpo |

### Redirecionamentos

Status 3xx vêm com o header `Location`. O `fetch` segue redirecionamentos automaticamente (até um limite); `r.redirected` diz se houve um e `r.url` mostra o endereço final.

### Problem Details: campos padrão e extensões

| Campo | Significado |
|---|---|
| `type` | URI que identifica o tipo do problema (pode apontar para a documentação) |
| `title` | resumo curto, igual para todas as ocorrências desse tipo |
| `status` | o código HTTP |
| `detail` | explicação desta ocorrência específica |
| `instance` | URI desta ocorrência (opcional) |

Além desses, você pode adicionar campos próprios, como a lista de erros de validação:

```json
{
  "type": "https://api.loja.exemplo/erros/dados-invalidos",
  "title": "Dados inválidos",
  "status": 422,
  "detail": "Corrija os campos indicados.",
  "erros": [{"campo": "email", "mensagem": "deve ser um e-mail válido"}]
}
```

### Tratando erros no cliente de forma organizada

```javascript
async function chamar(url, opcoes) {
  const r = await fetch(url, opcoes);
  if (r.ok) return r.status === 204 ? null : r.json();
  let problema = {};
  if ((r.headers.get('Content-Type') || '').includes('json')) problema = await r.json();
  const erro = new Error(problema.detail || `HTTP ${r.status}`);
  erro.status = r.status;
  erro.problema = problema;
  throw erro;
}
```

Com uma função assim, o resto do código só lida com sucesso ou com exceções que trazem o status e os detalhes.

:::exercicio js
Faça um GET em `/usuarios/1` e outro em `/usuarios/99` e **retorne** um array com os **dois status**, na ordem.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const a = await fetch(BASE + '/usuarios/1');
const b = await fetch(BASE + '/usuarios/99');
return [a.status, b.status];
@@check
(ctx) => {
  const paths = ctx.requests.map(r => r.path);
  if (!paths.includes('/usuarios/1') || !paths.includes('/usuarios/99')) return 'Faça GET em /usuarios/1 e /usuarios/99';
  if (JSON.stringify(ctx.result) !== JSON.stringify([200, 404])) return 'Retorne [200, 404], lidos das respostas';
  return true;
}
:::

:::exercicio js
Tente criar um usuário **sem nome e com e-mail inválido** (`POST /usuarios` com `{"email": "sem-arroba"}`). A API responde **422** com Problem Details contendo a lista `erros`.

**Retorne** um objeto com o **`status`**, o **`title`** e a lista **`campos`** com o campo `campo` de cada erro.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'sem-arroba' }),
});
const p = await r.json();
return { status: r.status, title: p.title, campos: p.erros.map(e => e.campo) };
@@check
(ctx) => {
  const post = ctx.requests.find(r => r.method === 'POST' && r.path === '/usuarios');
  if (!post) return 'Envie POST /usuarios';
  const r = ctx.result || {};
  if (r.status !== 422) return 'O status deve ser 422 (confira Content-Type e o corpo enviado)';
  if (r.title !== 'Dados inválidos') return 'title deve vir do corpo da resposta';
  if (JSON.stringify(r.campos) !== JSON.stringify(['nome', 'email'])) return 'campos deve ser ["nome", "email"], lido de erros';
  return true;
}
:::

:::exercicio js exports=classificar
Crie a função **`classificar(status)`** que retorna `'sucesso'` (2xx), `'redirecionamento'` (3xx), `'erro do cliente'` (4xx) ou `'erro do servidor'` (5xx).

Depois, faça estas requisições e **retorne** um objeto com a classificação de cada uma (chaves `a`, `b`, `c`, `d`):
- `a`: GET `/usuarios/1`;
- `b`: GET `/instavel` (falha temporária);
- `c`: POST `/usuarios` com `{"nome": "Clone", "email": "ana@exemplo.com"}` (e-mail já existe);
- `d`: GET `/rota-que-nao-existe`.
@@starter
const BASE = 'https://api.loja.exemplo';

function classificar(status) {
  return '';
}

@@solution
const BASE = 'https://api.loja.exemplo';

function classificar(status) {
  if (status >= 500) return 'erro do servidor';
  if (status >= 400) return 'erro do cliente';
  if (status >= 300) return 'redirecionamento';
  return 'sucesso';
}

const a = await fetch(BASE + '/usuarios/1');
const b = await fetch(BASE + '/instavel');
const c = await fetch(BASE + '/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: 'Clone', email: 'ana@exemplo.com' }) });
const d = await fetch(BASE + '/rota-que-nao-existe');
return { a: classificar(a.status), b: classificar(b.status), c: classificar(c.status), d: classificar(d.status) };
@@check
(ctx) => {
  const f = ctx.exports.classificar;
  if (typeof f !== 'function') return 'Defina a função classificar';
  const casos = [[200, 'sucesso'], [204, 'sucesso'], [301, 'redirecionamento'], [404, 'erro do cliente'], [429, 'erro do cliente'], [500, 'erro do servidor'], [503, 'erro do servidor']];
  for (const [s, e] of casos) if (f(s) !== e) return `classificar(${s}) deveria ser "${e}"`;
  const r = ctx.result || {};
  if (r.a !== 'sucesso' || r.b !== 'erro do servidor' || r.c !== 'erro do cliente' || r.d !== 'erro do cliente') return 'As classificações das 4 requisições não conferem (b é 503, c é 409, d é 404)';
  if (!ctx.requests.some(q => q.method === 'POST')) return 'Faça o POST do item c';
  return true;
}
:::

### EXTRA api-04

### Codificação de URL (percent-encoding)

Só alguns caracteres podem aparecer "crus" numa URL. Os outros são codificados com `%` e o código do byte:

| Caractere | Codificado |
|---|---|
| espaço | `%20` (ou `+` em query strings de formulário) |
| `ç` | `%C3%A7` (os bytes UTF-8) |
| `&` | `%26` |
| `=` | `%3D` |
| `/` | `%2F` |

Por que isso importa: se um usuário buscar `"pão & leite"` e você concatenar direto, o `&` vira um separador de parâmetros e a API recebe `busca=pão ` e um parâmetro estranho ` leite`. O `URLSearchParams` (ou `encodeURIComponent`) resolve:

```javascript
const url = new URL('https://api.loja.exemplo/produtos');
url.searchParams.set('busca', 'pão & leite');
url.toString();   // https://api.loja.exemplo/produtos?busca=p%C3%A3o+%26+leite

encodeURIComponent('pão & leite');   // 'p%C3%A3o%20%26%20leite'
```

### Parâmetros repetidos e listas

Não existe um padrão único para listas na query string. As convenções mais comuns:

```text
?tag=a&tag=b          ← repetir a chave (URLSearchParams.append + getAll)
?tags=a,b             ← separar por vírgula
?tags[]=a&tags[]=b    ← colchetes (comum em PHP/Rails)
```

Siga sempre o que a documentação da API pede.

### Caminho x query: quando usar cada um

- **Caminho** identifica **qual** recurso: `/usuarios/3`, `/usuarios/3/pedidos`.
- **Query** **modifica** a visualização de uma coleção: filtrar, ordenar, paginar, escolher campos (`?campos=id,nome`).

Regra prática: se tirar o parâmetro muda **qual coisa** você está acessando, ele é caminho; se só muda **como** a coleção aparece, é query.

### Headers que todo dev de API encontra

| Header | Exemplo | Uso |
|---|---|---|
| `Accept` | `application/json` | o que o cliente aceita receber |
| `Content-Type` | `application/json; charset=utf-8` | formato do corpo |
| `Content-Length` | `348` | tamanho do corpo em bytes |
| `Authorization` | `Bearer eyJ...` | credenciais |
| `User-Agent` | `MeuApp/1.2` | identifica o cliente |
| `Location` | `/usuarios/6` | recurso criado ou redirecionamento |
| `ETag` / `If-None-Match` | `"p1-v1"` | cache e versões |
| `Retry-After` | `30` | espere antes de tentar de novo |
| `X-Request-Id` | `a1b2...` | id para rastrear a requisição nos logs (convenção comum) |

### JSON: tipos e armadilhas

| JSON | JavaScript | Python |
|---|---|---|
| objeto `{}` | Object | dict |
| array `[]` | Array | list |
| string `"x"` | string | str |
| número `1.5` | number | int / float |
| `true`/`false` | boolean | bool |
| `null` | null | None |

Armadilhas comuns:

- **Datas** não existem em JSON: são enviadas como texto, de preferência ISO 8601 (`"2025-04-25T14:30:00Z"`).
- **Números grandes**: em JavaScript, inteiros acima de 2⁵³ perdem precisão. IDs muito grandes costumam ser enviados como string.
- **Dinheiro**: muitas APIs enviam valores em **centavos inteiros** (`"valor": 1990`) para evitar erros de ponto flutuante.

:::exercicio js
Usando `URL` e `searchParams`, busque em `/produtos` os produtos da categoria **`livros`**, ordenados por **preço crescente** (`ordenar=preco`), e **retorne** a lista de nomes.
@@starter
const BASE = 'https://api.loja.exemplo';
const url = new URL(BASE + '/produtos');

@@solution
const BASE = 'https://api.loja.exemplo';
const url = new URL(BASE + '/produtos');
url.searchParams.set('categoria', 'livros');
url.searchParams.set('ordenar', 'preco');
const r = await fetch(url);
const corpo = await r.json();
return corpo.dados.map(p => p.nome);
@@check
(ctx) => {
  const q = ctx.requests.find(r => r.path === '/produtos');
  if (!q) return 'Faça GET em /produtos';
  if (q.query.categoria !== 'livros' || q.query.ordenar !== 'preco') return 'Envie categoria=livros e ordenar=preco';
  if (JSON.stringify(ctx.result) !== JSON.stringify(['Livro de SQL', 'Livro de Python', 'Livro de IA'])) return 'Retorne os nomes recebidos, na ordem da API';
  return true;
}
:::

:::exercicio js
Faça um GET em `/produtos/1` e **retorne** um objeto com o valor de três headers da resposta:
- **`tipo`**: `Content-Type`;
- **`etag`**: `ETag`;
- **`cache`**: `Cache-Control`.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/produtos/1');
return { tipo: r.headers.get('Content-Type'), etag: r.headers.get('ETag'), cache: r.headers.get('Cache-Control') };
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.path === '/produtos/1')) return 'Faça GET em /produtos/1';
  const r = ctx.result || {};
  if (!r.tipo || !r.tipo.includes('application/json')) return 'tipo deve vir do header Content-Type';
  if (r.etag !== '"p1-v1"') return 'etag deve vir do header ETag';
  if (r.cache !== 'max-age=60') return 'cache deve vir do header Cache-Control';
  return true;
}
:::

:::exercicio js
Veja na prática a importância do `Content-Type`. Envie o **mesmo corpo JSON** de criação de usuário (`{"nome": "Teo", "email": "teo@x.com"}`) para `POST /usuarios` duas vezes:
1. **sem** o header `Content-Type`;
2. **com** `Content-Type: application/json`.

**Retorne** um array com os dois status. (Repare que só o segundo cria o usuário.)
@@starter
const BASE = 'https://api.loja.exemplo';
const corpo = JSON.stringify({ nome: 'Teo', email: 'teo@x.com' });

@@solution
const BASE = 'https://api.loja.exemplo';
const corpo = JSON.stringify({ nome: 'Teo', email: 'teo@x.com' });
const a = await fetch(BASE + '/usuarios', { method: 'POST', body: corpo });
const b = await fetch(BASE + '/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo });
return [a.status, b.status];
@@check
(ctx) => {
  const posts = ctx.requests.filter(r => r.method === 'POST' && r.path === '/usuarios');
  if (posts.length !== 2) return 'Envie dois POST para /usuarios';
  if (posts[0].headers['content-type'] && posts[0].headers['content-type'].includes('json')) return 'O primeiro POST deve ir SEM Content-Type: application/json';
  if (JSON.stringify(ctx.result) !== JSON.stringify([415, 201])) return 'Retorne os status [415, 201]';
  if (ctx.api.usuarios.filter(u => u.email === 'teo@x.com').length !== 1) return 'Apenas o segundo POST deve criar o usuário';
  return true;
}
:::

### EXTRA api-05

### Como o JavaScript espera sem travar

O JavaScript do navegador roda em **uma única thread**. Se ele parasse para esperar uma resposta de rede, a página congelaria. Em vez disso, o `fetch` **dispara** a requisição e devolve uma **Promise** imediatamente; quando a resposta chega, o *event loop* retoma o seu código no ponto do `await`.

```javascript
console.log('1. antes');
const p = fetch('https://api.loja.exemplo/usuarios');  // dispara e segue
console.log('2. a requisição está em andamento');
const r = await p;                                       // aqui sim espera
console.log('3. chegou:', r.status);
```

### Os três estados de uma Promise

| Estado | Significa |
|---|---|
| *pending* | ainda esperando |
| *fulfilled* | deu certo, tem um valor (`await` devolve o valor) |
| *rejected* | falhou, tem um erro (`await` lança a exceção) |

O mesmo código sem `async/await`, com `.then()`:

```javascript
fetch(url)
  .then(r => r.json())
  .then(dados => console.log(dados))
  .catch(erro => console.error(erro));
```

`async/await` é só uma forma mais legível de escrever a mesma coisa.

### Sequencial x paralelo

```javascript
// SEQUENCIAL: ~3x o tempo de uma requisição
const a = await buscarUsuario(1);
const b = await buscarUsuario(2);
const c = await buscarUsuario(3);

// PARALELO: ~o tempo da mais lenta
const [x, y, z] = await Promise.all([buscarUsuario(1), buscarUsuario(2), buscarUsuario(3)]);
```

Use o sequencial quando uma requisição **depende** do resultado da anterior (ex.: criar o usuário e depois usar o id dele).

### Promise.all x allSettled x race x any

| Função | Resolve quando… | Se alguma falhar… |
|---|---|---|
| `Promise.all` | todas resolvem | rejeita na primeira falha |
| `Promise.allSettled` | todas terminam | nunca rejeita: devolve `{status, value/reason}` de cada |
| `Promise.race` | a primeira termina (sucesso ou erro) | segue a primeira |
| `Promise.any` | a primeira **com sucesso** | só rejeita se todas falharem |

```javascript
const resultados = await Promise.allSettled([fetch(url1), fetch(url2)]);
const ok = resultados.filter(r => r.status === 'fulfilled').map(r => r.value);
```

### Timeout e cancelamento

```javascript
try {
  const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
} catch (e) {
  if (e.name === 'TimeoutError') console.log('demorou mais de 3 s');
  else if (e.name === 'AbortError') console.log('cancelado');
  else throw e;
}
```

Com `AbortController` você cancela manualmente (por exemplo, quando o usuário digita outra busca antes da anterior terminar).

### Erro comum: esquecer o await

```javascript
const dados = fetch(url).json();    // TypeError: fetch(...).json is not a function
const r = await fetch(url);
const dados2 = r.json();            // dados2 é uma Promise, não o objeto!
const dados3 = await r.json();      // ✔
```

:::exercicio js
Crie a função **`nomeDoUsuario(id)`** que retorna o **nome** do usuário ou o texto **`'desconhecido'`** se a API responder 404.

Depois, chame-a **em sequência** para os ids **2** e **42** e **retorne** um array com os dois resultados.
@@starter
const BASE = 'https://api.loja.exemplo';

async function nomeDoUsuario(id) {
  return '';
}

@@solution
const BASE = 'https://api.loja.exemplo';

async function nomeDoUsuario(id) {
  const r = await fetch(`${BASE}/usuarios/${id}`);
  if (r.status === 404) return 'desconhecido';
  const u = await r.json();
  return u.nome;
}

return [await nomeDoUsuario(2), await nomeDoUsuario(42)];
@@check
(ctx) => {
  if (JSON.stringify(ctx.result) !== JSON.stringify(['Bruno Lima', 'desconhecido'])) return 'Retorne ["Bruno Lima", "desconhecido"]';
  if (!ctx.requests.some(r => r.path === '/usuarios/42')) return 'Consulte a API para o id 42';
  return true;
}
:::

:::exercicio js
Falhas de rede **rejeitam** a Promise do `fetch`. Tente buscar `https://outro-site.exemplo/dados` (o simulador bloqueia outros domínios, como uma rede fora do ar) e trate com **try/catch**.

**Retorne** um objeto com **`ok: false`** e **`tipo`** igual ao **nome** do erro capturado (`erro.name`).
@@starter
let resultado;

return resultado;
@@solution
let resultado;
try {
  await fetch('https://outro-site.exemplo/dados');
  resultado = { ok: true };
} catch (erro) {
  resultado = { ok: false, tipo: erro.name };
}
return resultado;
@@check
(ctx) => {
  const r = ctx.result || {};
  if (r.ok !== false) return 'Capture a falha com try/catch e retorne ok: false';
  if (r.tipo !== 'TypeError') return 'tipo deve ser o nome do erro capturado (TypeError)';
  return true;
}
:::

:::exercicio js
Busque **em paralelo** os usuários de ids **1 a 8** usando **`Promise.allSettled`** (ou `Promise.all`) e **retorne** a lista com os **nomes dos que existem**, em **ordem alfabética**.

Todas as requisições devem ser disparadas sem esperar as anteriores.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const ids = [1, 2, 3, 4, 5, 6, 7, 8];
const respostas = await Promise.all(ids.map(id => fetch(`${BASE}/usuarios/${id}`)));
const encontrados = await Promise.all(respostas.filter(r => r.ok).map(r => r.json()));
return encontrados.map(u => u.nome).sort();
@@check
(ctx) => {
  const ids = ctx.requests.filter(r => /^\/usuarios\/\d+$/.test(r.path)).map(r => +r.path.split('/')[2]).sort((a, b) => a - b);
  if (JSON.stringify(ids) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8])) return 'Faça um GET para cada id de 1 a 8';
  if (JSON.stringify(ctx.result) !== JSON.stringify(['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Elisa Prado'])) return 'Retorne os nomes encontrados em ordem alfabética';
  return true;
}
:::

### EXTRA api-06

### O ciclo de vida completo de um recurso

```text
POST   /usuarios        → 201 Created, Location: /usuarios/6     (nasce)
GET    /usuarios/6      → 200 OK                                  (é lido)
PATCH  /usuarios/6      → 200 OK                                  (muda um pedaço)
PUT    /usuarios/6      → 200 OK                                  (é substituído)
DELETE /usuarios/6      → 204 No Content                          (morre)
GET    /usuarios/6      → 404 Not Found
```

### PUT na prática: o perigo de esquecer campos

```javascript
// usuário 3 hoje: { id: 3, nome: 'Carla Dias', email: 'carla@exemplo.com', ativo: true }
await fetch(`${BASE}/usuarios/3`, {
  method: 'PUT', headers,
  body: JSON.stringify({ nome: 'Carla D.' }),     // esqueci o e-mail!
});
// A API simulada responde 422: PUT substitui TUDO, então os campos obrigatórios precisam vir.
```

Em algumas APIs, um PUT incompleto não dá erro: os campos ausentes simplesmente **somem** ou voltam ao valor padrão. Por isso, para mudar um campo só, prefira **PATCH**.

### O que devolver em cada operação

| Operação | Resposta comum |
|---|---|
| POST criou | `201` + `Location` + o recurso criado no corpo |
| PUT/PATCH alterou | `200` + o recurso atualizado (ou `204` sem corpo) |
| DELETE removeu | `204` sem corpo |
| POST que dispara um processamento demorado | `202 Accepted` + um link para acompanhar |

Devolver o recurso completo depois de criar/alterar poupa o cliente de fazer um GET extra (por exemplo, para descobrir o `id` gerado ou campos calculados pelo servidor).

### Erros de validação: devolva todos de uma vez

Uma boa API não para no primeiro erro: devolve **a lista completa** (como faz a API simulada, com o campo `erros`). Assim o formulário pode marcar todos os campos errados de uma vez.

### Enviando outros formatos

```javascript
// formulário clássico
await fetch(url, { method: 'POST', body: new URLSearchParams({ nome: 'Ana', idade: '30' }) });
// → Content-Type: application/x-www-form-urlencoded

// upload de arquivo
const form = new FormData();
form.append('foto', arquivoInput.files[0]);
await fetch(url, { method: 'POST', body: form });
// → Content-Type: multipart/form-data (o navegador define o boundary sozinho; não defina à mão)
```

### Operações em lote

Para criar 1000 itens, 1000 requisições são lentas. APIs costumam oferecer endpoints de lote (`POST /usuarios/lote` com um array). Sem isso, use paralelismo com moderação (poucas requisições simultâneas por vez) para não estourar o limite de taxa.

:::exercicio js
Crie dois usuários com POST: **`Lia Mendes`** (`lia@x.com`) e **`Rui Costa`** (`rui@x.com`). **Retorne** um array com os **ids** recebidos nas respostas, na ordem.
@@starter
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

@@solution
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };
const ids = [];
for (const u of [{ nome: 'Lia Mendes', email: 'lia@x.com' }, { nome: 'Rui Costa', email: 'rui@x.com' }]) {
  const r = await fetch(BASE + '/usuarios', { method: 'POST', headers, body: JSON.stringify(u) });
  ids.push((await r.json()).id);
}
return ids;
@@check
(ctx) => {
  const lia = ctx.api.usuarios.find(u => u.email === 'lia@x.com');
  const rui = ctx.api.usuarios.find(u => u.email === 'rui@x.com');
  if (!lia || !rui) return 'Crie os dois usuários (confira method, headers e JSON.stringify)';
  if (lia.nome !== 'Lia Mendes' || rui.nome !== 'Rui Costa') return 'Confira os nomes';
  if (JSON.stringify(ctx.result) !== JSON.stringify([lia.id, rui.id])) return 'Retorne os ids das respostas, na ordem';
  return true;
}
:::

:::exercicio js
Faça duas tentativas de **PUT** em `/usuarios/3`:
1. só com `{"nome": "Carla D."}` (incompleto);
2. com `{"nome": "Carla D.", "email": "carla.d@exemplo.com"}` (sem `ativo`).

**Retorne** um objeto com **`statusIncompleto`**, **`statusCompleto`** e **`ativoDepois`** (o campo `ativo` do usuário na resposta do segundo PUT — repare que ele assume o valor padrão).
@@starter
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

@@solution
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };
const a = await fetch(BASE + '/usuarios/3', { method: 'PUT', headers, body: JSON.stringify({ nome: 'Carla D.' }) });
const b = await fetch(BASE + '/usuarios/3', { method: 'PUT', headers, body: JSON.stringify({ nome: 'Carla D.', email: 'carla.d@exemplo.com' }) });
const u = await b.json();
return { statusIncompleto: a.status, statusCompleto: b.status, ativoDepois: u.ativo };
@@check
(ctx) => {
  const puts = ctx.requests.filter(r => r.method === 'PUT' && r.path === '/usuarios/3');
  if (puts.length !== 2) return 'Envie dois PUT para /usuarios/3';
  const r = ctx.result || {};
  if (r.statusIncompleto !== 422 || r.statusCompleto !== 200) return 'Os status devem ser 422 (incompleto) e 200 (completo)';
  if (r.ativoDepois !== true) return 'ativoDepois deve vir da resposta do segundo PUT';
  const u = ctx.api.usuarios.find(x => x.id === 3);
  if (u.email !== 'carla.d@exemplo.com' || u.nome !== 'Carla D.') return 'O segundo PUT deve substituir nome e e-mail';
  return true;
}
:::

:::exercicio js
Crie **`sincronizar(desejados)`**, onde `desejados` é uma lista de `{nome, email}`. A função deve deixar a API assim:
- quem está em `desejados` e **não existe** (comparando por e-mail) → **criar** com POST;
- quem existe, está em `desejados` mas está **inativo** → **reativar** com PATCH (`ativo: true`);
- quem existe e **não está** em `desejados` → **desativar** com PATCH (`ativo: false`) — nunca apagar.

Por fim, chame `sincronizar` com Ana (`ana@exemplo.com`), Elisa (`elisa@exemplo.com`) e uma nova pessoa, Nina (`nina@x.com`). Não faça PATCH em quem já está no estado certo.
@@starter
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

async function sincronizar(desejados) {
}

await sincronizar([
  { nome: 'Ana Souza', email: 'ana@exemplo.com' },
  { nome: 'Elisa Prado', email: 'elisa@exemplo.com' },
  { nome: 'Nina Lopes', email: 'nina@x.com' },
]);
@@solution
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

async function sincronizar(desejados) {
  const atuais = await (await fetch(BASE + '/usuarios')).json();
  const emails = new Set(desejados.map(d => d.email));
  for (const d of desejados) {
    const u = atuais.find(x => x.email === d.email);
    if (!u) await fetch(BASE + '/usuarios', { method: 'POST', headers, body: JSON.stringify(d) });
    else if (!u.ativo) await fetch(`${BASE}/usuarios/${u.id}`, { method: 'PATCH', headers, body: JSON.stringify({ ativo: true }) });
  }
  for (const u of atuais) {
    if (!emails.has(u.email) && u.ativo) await fetch(`${BASE}/usuarios/${u.id}`, { method: 'PATCH', headers, body: JSON.stringify({ ativo: false }) });
  }
}

await sincronizar([
  { nome: 'Ana Souza', email: 'ana@exemplo.com' },
  { nome: 'Elisa Prado', email: 'elisa@exemplo.com' },
  { nome: 'Nina Lopes', email: 'nina@x.com' },
]);
@@check
(ctx) => {
  const estado = Object.fromEntries(ctx.api.usuarios.map(u => [u.email, u.ativo]));
  const esp = { 'ana@exemplo.com': true, 'bruno@exemplo.com': false, 'carla@exemplo.com': false, 'diego@exemplo.com': false, 'elisa@exemplo.com': true, 'nina@x.com': true };
  for (const [e, a] of Object.entries(esp)) if (estado[e] !== a) return `${e} deveria estar com ativo = ${a}`;
  if (ctx.requests.some(r => r.method === 'DELETE')) return 'Nunca apague usuários; desative com PATCH';
  const patches = ctx.requests.filter(r => r.method === 'PATCH').map(r => r.path).sort();
  if (JSON.stringify(patches) !== JSON.stringify(['/usuarios/3', '/usuarios/4', '/usuarios/5'])) return 'Faça PATCH só em quem precisa mudar (Carla e Diego para inativo, Elisa para ativo)';
  if (ctx.requests.filter(r => r.method === 'POST').length !== 1) return 'Crie apenas quem não existe (Nina)';
  return true;
}
:::

### EXTRA api-07

### Modelando uma API do zero: um exemplo

Requisitos de uma API de cursos online: alunos, cursos, matrículas e aulas concluídas.

| Necessidade | Rota |
|---|---|
| listar cursos (com filtro de nível) | `GET /cursos?nivel=iniciante` |
| ver um curso | `GET /cursos/{id}` |
| ver as aulas de um curso | `GET /cursos/{id}/aulas` |
| matricular um aluno | `POST /matriculas` com `{aluno_id, curso_id}` |
| matrículas de um aluno | `GET /alunos/{id}/matriculas` |
| marcar aula como concluída | `PUT /alunos/{id}/aulas-concluidas/{aula_id}` (idempotente!) |
| cancelar matrícula | `DELETE /matriculas/{id}` |

Note o "marcar como concluída" com **PUT** em um sub-recurso: repetir não duplica nada.

### Até onde aninhar

`/alunos/7/matriculas` é ótimo. Já `/escolas/1/turmas/3/alunos/7/matriculas/2/notas` é profundo demais: se a matrícula tem um id único, ela pode ser acessada diretamente em `/matriculas/2`. Uma regra comum: **no máximo um nível de aninhamento** — use-o para listar "os X de um Y" e acesse cada item pelo seu próprio caminho.

### Nomes de campos e formatos

- Escolha **um** estilo (`snake_case` ou `camelCase`) e use-o em toda a API.
- Prefira nomes completos: `data_criacao`, não `dt_cr`.
- Booleanos como perguntas: `ativo`, `pago`, `tem_estoque`.
- IDs como string se puderem ser muito grandes ou não forem sequenciais (UUIDs).
- Enumerações em texto legível: `"status": "enviado"`, não `"status": 3`.

### Envelopes: com ou sem?

```json
[{"id": 1}, {"id": 2}]
```

```json
{"dados": [{"id": 1}, {"id": 2}], "pagina": 1, "total": 42}
```

O segundo formato (com **envelope**) permite adicionar metadados (paginação, avisos) sem quebrar o cliente. Por isso muitas APIs usam envelope em coleções.

### Compatibilidade: o que pode mudar sem nova versão

| Mudança | Compatível? |
|---|---|
| adicionar um campo novo na resposta | ✔ (clientes devem ignorar campos desconhecidos) |
| adicionar um endpoint | ✔ |
| adicionar um parâmetro **opcional** | ✔ |
| tornar obrigatório um parâmetro que era opcional | ✖ |
| remover ou renomear um campo | ✖ |
| mudar o tipo de um campo (`"10"` → `10`) | ✖ |
| adicionar um novo valor numa enumeração | ⚠️ pode quebrar clientes que não esperam valores novos |

:::exercicio js exports=rota
Crie a função **`rota(recurso, id, subrecurso, filtros)`** que monta caminhos REST:
- `rota('usuarios')` → `'/usuarios'`;
- `rota('usuarios', 3)` → `'/usuarios/3'`;
- `rota('usuarios', 3, 'pedidos')` → `'/usuarios/3/pedidos'`;
- `rota('produtos', null, null, { categoria: 'livros', pagina: 2 })` → `'/produtos?categoria=livros&pagina=2'` (use `URLSearchParams`, que também codifica caracteres especiais).

Termine com `return rota('usuarios', 3, 'pedidos');`.
@@starter
function rota(recurso, id, subrecurso, filtros) {
  return '/' + recurso;
}

return rota('usuarios', 3, 'pedidos');
@@solution
function rota(recurso, id, subrecurso, filtros) {
  let caminho = '/' + recurso;
  if (id !== undefined && id !== null) caminho += '/' + id;
  if (subrecurso) caminho += '/' + subrecurso;
  if (filtros && Object.keys(filtros).length) caminho += '?' + new URLSearchParams(filtros).toString();
  return caminho;
}

return rota('usuarios', 3, 'pedidos');
@@check
(ctx) => {
  const f = ctx.exports.rota;
  if (typeof f !== 'function') return 'Defina a função rota';
  const casos = [
    [['usuarios'], '/usuarios'],
    [['usuarios', 3], '/usuarios/3'],
    [['usuarios', 3, 'pedidos'], '/usuarios/3/pedidos'],
    [['produtos', null, null, { categoria: 'livros', pagina: 2 }], '/produtos?categoria=livros&pagina=2'],
    [['produtos', null, null, { busca: 'pão & leite' }], '/produtos?busca=p%C3%A3o+%26+leite'],
    [['pedidos', 0], '/pedidos/0'],
  ];
  for (const [args, esp] of casos) if (f(...args) !== esp) return `rota(${args.map(a => JSON.stringify(a)).join(', ')}) deveria ser "${esp}" (veio "${f(...args)}")`;
  return true;
}
:::

:::exercicio js exports=mapear
Crie **`mapear(acao, recurso, id)`** que traduz uma intenção em **método + caminho REST**, retornando `{ method, path }`:

| acao | method | path |
|---|---|---|
| `'listar'` | GET | `/recurso` |
| `'ver'` | GET | `/recurso/id` |
| `'criar'` | POST | `/recurso` |
| `'substituir'` | PUT | `/recurso/id` |
| `'alterar'` | PATCH | `/recurso/id` |
| `'remover'` | DELETE | `/recurso/id` |

Para ações desconhecidas, lance um `Error`. Termine com `return mapear('remover', 'usuarios', 4);`.
@@starter
function mapear(acao, recurso, id) {
  return { method: 'GET', path: '/' + recurso };
}

return mapear('remover', 'usuarios', 4);
@@solution
function mapear(acao, recurso, id) {
  const tabela = {
    listar: ['GET', false], ver: ['GET', true], criar: ['POST', false],
    substituir: ['PUT', true], alterar: ['PATCH', true], remover: ['DELETE', true],
  };
  if (!(acao in tabela)) throw new Error('ação desconhecida: ' + acao);
  const [method, comId] = tabela[acao];
  return { method, path: comId ? `/${recurso}/${id}` : `/${recurso}` };
}

return mapear('remover', 'usuarios', 4);
@@check
(ctx) => {
  const f = ctx.exports.mapear;
  if (typeof f !== 'function') return 'Defina a função mapear';
  const casos = [['listar', 'produtos', undefined, 'GET', '/produtos'], ['ver', 'produtos', 7, 'GET', '/produtos/7'], ['criar', 'usuarios', undefined, 'POST', '/usuarios'], ['substituir', 'usuarios', 2, 'PUT', '/usuarios/2'], ['alterar', 'usuarios', 2, 'PATCH', '/usuarios/2'], ['remover', 'pedidos', 9, 'DELETE', '/pedidos/9']];
  for (const [a, r, i, m, p] of casos) {
    const out = f(a, r, i) || {};
    if (out.method !== m || out.path !== p) return `mapear("${a}", "${r}", ${i}) deveria ser { method: "${m}", path: "${p}" }`;
  }
  try { f('apagarTudo', 'usuarios'); return 'Ação desconhecida deve lançar Error'; } catch (e) { /* esperado */ }
  return true;
}
:::

:::exercicio js
Use a função `mapear` (escreva-a de novo aqui) para **executar de verdade** esta sequência na API, na ordem, e **retorne** a lista de status recebidos:
1. `criar` um usuário (`usuarios`) com `{"nome": "Ivo", "email": "ivo@x.com"}`;
2. `alterar` o usuário criado com `{"ativo": false}`;
3. `ver` o usuário criado;
4. `remover` o usuário criado.

Use o `id` retornado pelo passo 1 nos passos seguintes.
@@starter
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

function mapear(acao, recurso, id) {
}

@@solution
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

function mapear(acao, recurso, id) {
  const tabela = { listar: ['GET', false], ver: ['GET', true], criar: ['POST', false], substituir: ['PUT', true], alterar: ['PATCH', true], remover: ['DELETE', true] };
  const [method, comId] = tabela[acao];
  return { method, path: comId ? `/${recurso}/${id}` : `/${recurso}` };
}

async function executar(acao, id, corpo) {
  const { method, path } = mapear(acao, 'usuarios', id);
  const opcoes = { method };
  if (corpo) { opcoes.headers = headers; opcoes.body = JSON.stringify(corpo); }
  return fetch(BASE + path, opcoes);
}

const status = [];
const r1 = await executar('criar', null, { nome: 'Ivo', email: 'ivo@x.com' });
status.push(r1.status);
const { id } = await r1.json();
status.push((await executar('alterar', id, { ativo: false })).status);
status.push((await executar('ver', id)).status);
status.push((await executar('remover', id)).status);
return status;
@@check
(ctx) => {
  const seq = ctx.requests.map(r => r.method + ' ' + r.path);
  if (JSON.stringify(seq) !== JSON.stringify(['POST /usuarios', 'PATCH /usuarios/6', 'GET /usuarios/6', 'DELETE /usuarios/6'])) return 'A sequência deve ser POST /usuarios, PATCH, GET e DELETE em /usuarios/<id criado>';
  if (JSON.stringify(ctx.result) !== JSON.stringify([201, 200, 200, 204])) return 'Retorne os status [201, 200, 200, 204]';
  if (ctx.api.usuarios.some(u => u.email === 'ivo@x.com')) return 'O usuário criado deve ter sido removido no fim';
  return true;
}
:::

### EXTRA api-08

### Como o servidor implementa cada estilo de paginação

```sql
-- página/limite (offset): simples, mas lê e descarta as linhas puladas
SELECT * FROM produtos ORDER BY id LIMIT 20 OFFSET 980;

-- cursor (keyset): continua "depois do último id visto"; usa o índice e não descarta nada
SELECT * FROM produtos WHERE id > 1000 ORDER BY id LIMIT 20;
```

O cursor enviado ao cliente costuma ser **opaco** (por exemplo, `"eyJpZCI6MTAwMH0"`, que é `{"id":1000}` em base64): o cliente só devolve o valor, sem precisar entender o formato — e o servidor pode mudar a implementação sem quebrar ninguém.

### O problema dos itens que "pulam" ou se repetem

Com OFFSET, se alguém **inserir** um produto no começo da lista enquanto você navega, todos os itens "andam" uma posição: o último item da página 1 reaparece no início da página 2. Se alguém **apagar**, um item é pulado. O cursor não tem esse problema, porque continua a partir de um valor, não de uma posição.

### Metadados úteis na resposta

| Campo | Para quê |
|---|---|
| `total` | mostrar "142 resultados" (contar pode ser caro em tabelas enormes) |
| `total_paginas` | montar a navegação 1, 2, 3… |
| `proxima` / `anterior` | navegar sem calcular nada |
| `links.next` (ou header `Link`) | URL completa da próxima página (estilo HATEOAS) |

### Filtros: convenções comuns

```text
GET /produtos?categoria=livros                 igualdade
GET /produtos?preco_min=50&preco_max=200       faixas
GET /produtos?busca=python                     busca textual
GET /produtos?ordenar=-preco,nome              várias chaves de ordenação
GET /produtos?campos=id,nome,preco             escolher campos (respostas menores)
GET /pedidos?criado_depois=2025-01-01          datas em ISO 8601
```

### Lado do servidor: valide e limite

- Limite o tamanho da página (`limite` máximo 100, por exemplo) para ninguém pedir 1 milhão de linhas.
- Aceite ordenação **só por campos permitidos** (a API simulada responde 400 para `ordenar=senha`).
- Valide números e datas e responda **400** com uma mensagem clara.

### Async generator: paginação elegante no cliente

```javascript
async function* todosOsProdutos(limite = 5) {
  let pagina = 1;
  while (pagina) {
    const r = await fetch(`${BASE}/produtos?pagina=${pagina}&limite=${limite}`);
    const corpo = await r.json();
    yield* corpo.dados;            // entrega os itens um a um
    pagina = corpo.proxima;
  }
}

for await (const produto of todosOsProdutos()) {
  console.log(produto.nome);       // as páginas são buscadas conforme a necessidade
}
```

O gerador busca a próxima página **só quando** o laço precisa de mais itens; se você der `break` no meio, as páginas seguintes nem são pedidas.

:::exercicio js
Busque em `/produtos` os itens cujo nome contém **`livro`** (parâmetro `busca`), ordenados por **preço decrescente** (`ordenar=-preco`), e **retorne** a lista de objetos `{ nome, preco }`.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const url = new URL(BASE + '/produtos');
url.searchParams.set('busca', 'livro');
url.searchParams.set('ordenar', '-preco');
const corpo = await (await fetch(url)).json();
return corpo.dados.map(p => ({ nome: p.nome, preco: p.preco }));
@@check
(ctx) => {
  const q = ctx.requests.find(r => r.path === '/produtos');
  if (!q || q.query.busca !== 'livro' || q.query.ordenar !== '-preco') return 'Envie busca=livro e ordenar=-preco';
  const esp = [{ nome: 'Livro de IA', preco: 120 }, { nome: 'Livro de Python', preco: 95 }, { nome: 'Livro de SQL', preco: 89 }];
  if (JSON.stringify(ctx.result) !== JSON.stringify(esp)) return 'Retorne a lista de { nome, preco }, na ordem recebida';
  return true;
}
:::

:::exercicio js
Faça **uma única** requisição a `/produtos?limite=4` e, **usando os metadados** da resposta, **retorne** um objeto com:
- **`total`** de produtos;
- **`paginas`**: o total de páginas;
- **`ultimaPagina`**: o resultado de buscar a **última página** (faça uma segunda requisição) — a lista de nomes dela.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const primeira = await (await fetch(BASE + '/produtos?limite=4')).json();
const ultima = await (await fetch(`${BASE}/produtos?limite=4&pagina=${primeira.total_paginas}`)).json();
return { total: primeira.total, paginas: primeira.total_paginas, ultimaPagina: ultima.dados.map(p => p.nome) };
@@check
(ctx) => {
  const reqs = ctx.requests.filter(r => r.path === '/produtos');
  if (reqs.length !== 2) return 'Use exatamente duas requisições: a primeira página e a última';
  if (!reqs.every(r => r.query.limite === '4')) return 'Use limite=4 nas duas';
  const r = ctx.result || {};
  if (r.total !== 12 || r.paginas !== 3) return 'total e paginas devem vir dos metadados (12 e 3)';
  if (JSON.stringify(r.ultimaPagina) !== JSON.stringify(['Almofada', 'Livro de IA', 'Monitor', 'Vaso'])) return 'ultimaPagina deve ter os nomes da página 3';
  return true;
}
:::

:::exercicio js
Crie o **async generator** **`produtosOrdenados(ordenar, limite)`** que percorre todas as páginas de `/produtos` com esses parâmetros e entrega os produtos **um a um** (`yield`).

Use-o com **`for await`** para coletar os nomes com `ordenar='-preco'` e `limite=5`, mas **pare (`break`) assim que encontrar um produto com preço menor que 50**, sem incluí-lo. **Retorne** os nomes coletados. Graças ao generator, páginas desnecessárias não devem ser buscadas.
@@starter
const BASE = 'https://api.loja.exemplo';

async function* produtosOrdenados(ordenar, limite) {
}

const nomes = [];

return nomes;
@@solution
const BASE = 'https://api.loja.exemplo';

async function* produtosOrdenados(ordenar, limite) {
  let pagina = 1;
  while (pagina) {
    const corpo = await (await fetch(`${BASE}/produtos?ordenar=${ordenar}&limite=${limite}&pagina=${pagina}`)).json();
    yield* corpo.dados;
    pagina = corpo.proxima;
  }
}

const nomes = [];
for await (const p of produtosOrdenados('-preco', 5)) {
  if (p.preco < 50) break;
  nomes.push(p.nome);
}
return nomes;
@@check
(ctx) => {
  const esp = ['Monitor', 'Fone Bluetooth', 'Teclado', 'Livro de IA', 'Livro de Python', 'Livro de SQL', 'Luminária', 'Mouse'];
  if (JSON.stringify(ctx.result) !== JSON.stringify(esp)) return 'Os nomes coletados não conferem (preço decrescente, parando antes do primeiro < 50)';
  const reqs = ctx.requests.filter(r => r.path === '/produtos');
  if (!reqs.every(r => r.query.ordenar === '-preco' && r.query.limite === '5')) return 'Use ordenar=-preco e limite=5';
  if (reqs.length !== 2) return `Deveriam ser buscadas só 2 páginas (o break acontece na página 2); foram ${reqs.length}`;
  return true;
}
:::

### EXTRA api-09

### Onde guardar credenciais no cliente

| Tipo de cliente | Onde guardar | Observação |
|---|---|---|
| servidor (back-end) | variáveis de ambiente, cofre de segredos | o lugar certo para chaves de API |
| app de celular/desktop | armazenamento seguro do sistema (Keychain, Keystore) | nunca chaves "mestras" embutidas no app |
| navegador (SPA) | cookie `HttpOnly` + `Secure` + `SameSite`, ou memória | `localStorage` pode ser lido por qualquer script injetado (XSS) |

Chaves que dão acesso a serviços pagos ou a dados de todos os usuários **nunca** devem ir para o front-end: o usuário consegue extraí-las do código. O padrão é o front-end falar com o **seu** back-end, que guarda a chave e chama o serviço.

### Cookies x tokens

- **Sessão com cookie**: o servidor guarda a sessão e o navegador envia o cookie automaticamente. Simples para sites, mas exige proteção contra **CSRF** (tokens anti-CSRF, `SameSite`).
- **Token no header** (`Authorization: Bearer`): o cliente envia explicitamente; combina com APIs usadas por apps e outros serviços.

### Basic Auth montado à mão

```javascript
const credenciais = btoa('aluno:1234');            // 'YWx1bm86MTIzNA=='
headers: { Authorization: `Basic ${credenciais}` }
atob('YWx1bm86MTIzNA==');                            // 'aluno:1234'  ← qualquer um decodifica
```

(`btoa` só aceita caracteres latinos; para senhas com acentos, converta para UTF-8 antes.)

### API keys: boas práticas do lado de quem cria a API

- Gere chaves longas e aleatórias, com um **prefixo** que identifique o tipo (`loja_live_...`, `loja_test_...`): facilita detectar vazamentos em repositórios.
- Guarde no banco só um **hash** da chave, como se faz com senhas.
- Permita **várias chaves** por cliente, com **escopos** (só leitura, só pagamentos) e **revogação** individual.
- Registre o uso de cada chave (quando, de onde) para investigar abusos.

### Autorização: além do "está logado?"

Autenticar é só o começo. Toda rota precisa conferir **se este usuário pode fazer isto com este recurso**:

```text
GET /pedidos/42
  1. o token é válido?                    → senão 401
  2. o usuário pode ver pedidos?          → senão 403
  3. o pedido 42 pertence a ele (ou ele é admin)? → senão 403 (ou 404)
```

Esquecer o passo 3 é uma das falhas mais comuns em APIs (conhecida como **BOLA/IDOR**: trocar o id na URL e ver dados de outra pessoa). Ela lidera a lista OWASP API Security Top 10.

:::exercicio js exports=basicAuth,lerBasic
Crie a função **`basicAuth(usuario, senha)`** que retorna o valor do header `Authorization` no esquema Basic: `'Basic '` seguido de `usuario:senha` em **base64** (use `btoa`).

Crie também **`lerBasic(header)`** que faz o caminho inverso e retorna `{ usuario, senha }` (a senha pode conter `:`).

Termine com `return basicAuth('aluno', '1234');`.
@@starter
function basicAuth(usuario, senha) {
  return '';
}

function lerBasic(header) {
  return {};
}

return basicAuth('aluno', '1234');
@@solution
function basicAuth(usuario, senha) {
  return 'Basic ' + btoa(`${usuario}:${senha}`);
}

function lerBasic(header) {
  const texto = atob(header.replace(/^Basic /, ''));
  const i = texto.indexOf(':');
  return { usuario: texto.slice(0, i), senha: texto.slice(i + 1) };
}

return basicAuth('aluno', '1234');
@@check
(ctx) => {
  const { basicAuth, lerBasic } = ctx.exports;
  if (typeof basicAuth !== 'function' || typeof lerBasic !== 'function') return 'Defina basicAuth e lerBasic';
  if (basicAuth('aluno', '1234') !== 'Basic YWx1bm86MTIzNA==') return 'basicAuth("aluno", "1234") deve ser "Basic YWx1bm86MTIzNA=="';
  if (basicAuth('admin', 's3nh@') !== 'Basic ' + btoa('admin:s3nh@')) return 'basicAuth incorreto para outros valores';
  const r = lerBasic('Basic ' + btoa('maria:a:b:c'));
  if (r.usuario !== 'maria' || r.senha !== 'a:b:c') return 'lerBasic deve separar no PRIMEIRO ":" (a senha pode conter ":")';
  return true;
}
:::

:::exercicio js
Chame `GET /privado/perfil` com um token **inválido** (`Authorization: Bearer token-falso`) e **retorne** um objeto com:
- **`status`** recebido;
- **`esquema`**: o valor do header **`WWW-Authenticate`** da resposta;
- **`detalhe`**: o campo `detail` do Problem Details.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/privado/perfil', { headers: { Authorization: 'Bearer token-falso' } });
const p = await r.json();
return { status: r.status, esquema: r.headers.get('WWW-Authenticate'), detalhe: p.detail };
@@check
(ctx) => {
  const q = ctx.requests.find(r => r.path === '/privado/perfil');
  if (!q || q.headers.authorization !== 'Bearer token-falso') return 'Envie Authorization: Bearer token-falso';
  const r = ctx.result || {};
  if (r.status !== 401) return 'status deve ser 401';
  if (r.esquema !== 'Bearer realm="loja"') return 'esquema deve vir do header WWW-Authenticate';
  if (r.detalhe !== 'O token enviado não é válido.') return 'detalhe deve vir do campo detail da resposta';
  return true;
}
:::

:::exercicio js exports=criarCliente
Crie a função **`criarCliente(token)`** que retorna uma função **`api(caminho, opcoes)`**: ela faz o `fetch` em `https://api.loja.exemplo` + caminho, **acrescentando** o header `Authorization: Bearer <token>` aos headers que vierem em `opcoes` (sem perdê-los), e devolve o **JSON** da resposta (lança `Error` se `!ok`).

Obtenha um token em `POST /auth/token` (`{"usuario": "aluno", "senha": "1234"}`), crie o cliente e use-o para buscar `/privado/perfil`. **Retorne** o perfil.
@@starter
const BASE = 'https://api.loja.exemplo';

function criarCliente(token) {
  return async (caminho, opcoes = {}) => {
  };
}

@@solution
const BASE = 'https://api.loja.exemplo';

function criarCliente(token) {
  return async (caminho, opcoes = {}) => {
    const headers = { ...(opcoes.headers || {}), Authorization: `Bearer ${token}` };
    const r = await fetch(BASE + caminho, { ...opcoes, headers });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  };
}

const t = await fetch(BASE + '/auth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'aluno', senha: '1234' }) });
const { access_token } = await t.json();
const api = criarCliente(access_token);
return await api('/privado/perfil');
@@check
async (ctx) => {
  if (!ctx.result || ctx.result.usuario !== 'aluno') return 'Retorne o perfil obtido com o cliente autenticado';
  const f = ctx.exports.criarCliente;
  if (typeof f !== 'function') return 'Defina criarCliente';
  ctx.api.reset();
  const api = f(ctx.MockAPI.JWT);
  await api('/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: 'Zed', email: 'zed@x.com' }) });
  const q = ctx.api.requests[0];
  if (q.headers.authorization !== 'Bearer ' + ctx.MockAPI.JWT) return 'O cliente deve enviar Authorization: Bearer <token>';
  if (q.headers['content-type'] !== 'application/json') return 'Os headers passados em opcoes não podem ser perdidos';
  try { await api('/usuarios/999'); return 'Para respostas de erro (404), o cliente deve lançar Error'; } catch (e) { /* esperado */ }
  return true;
}
:::

### EXTRA api-10

### O fluxo Authorization Code com PKCE, passo a passo

```text
1. O app gera um segredo aleatório (code_verifier) e seu hash SHA-256 (code_challenge).
2. O app redireciona o usuário ao servidor de autorização:
   GET /authorize?response_type=code&client_id=app&redirect_uri=...&scope=pedidos:ler
       &code_challenge=HASH&code_challenge_method=S256&state=ALEATORIO
3. O usuário faz login e consente ("o app quer ler seus pedidos").
4. O servidor redireciona de volta: https://app/callback?code=CODIGO&state=ALEATORIO
5. O app confere o state e troca o código por tokens, enviando o code_verifier original:
   POST /token  grant_type=authorization_code&code=CODIGO&code_verifier=SEGREDO...
6. O servidor confere que hash(code_verifier) == code_challenge e devolve:
   { access_token, token_type: "Bearer", expires_in: 3600, refresh_token }
```

- O **state** protege contra CSRF no retorno.
- O **PKCE** garante que, mesmo que alguém intercepte o `code`, não consiga trocá-lo por tokens (não tem o `code_verifier`).

### Escopos: o mínimo necessário

O app pede só as permissões de que precisa (`scope=pedidos:ler perfil`). O token carrega esses escopos, e a API confere a cada chamada: um token com `pedidos:ler` não pode criar pedidos.

### Access token x refresh token

| | Access token | Refresh token |
|---|---|---|
| Para quê | chamar a API | obter um novo access token |
| Validade | curta (minutos, horas) | longa (dias, semanas) |
| Vai para | a API, em todo request | só o servidor de autorização |

Se um access token vazar, o estrago dura pouco. O refresh token é guardado com mais cuidado e, em boas implementações, é **rotacionado** a cada uso.

### Como a API valida um JWT

1. Separa as três partes e decodifica o header.
2. Confere o algoritmo: **só aceita os esperados** (nunca `"alg": "none"`).
3. Verifica a **assinatura** com a chave (HMAC com um segredo compartilhado, ou RSA/ECDSA com a chave pública do emissor).
4. Confere `exp` (não expirou), `nbf` (já vale), `iss` (emissor esperado) e `aud` (o token é para **esta** API).
5. Só então usa as claims (`sub`, escopos, papel).

Na prática, use uma biblioteca bem testada (por exemplo `jose` em JavaScript ou `PyJWT` em Python) em vez de implementar a verificação à mão.

### JWT não é sessão revogável

Um JWT vale até expirar: se o usuário fizer logout ou for bloqueado, o token antigo continua válido. As soluções são validade curta, lista de tokens revogados ou consultar o servidor de autorização (*token introspection*).

:::exercicio js exports=lerPayload
Crie **`lerPayload(jwt)`** que decodifica o **payload** (2ª parte) de um JWT: troque `-` por `+` e `_` por `/`, complete com `=` até o tamanho ser múltiplo de 4, decodifique com `atob` e faça `JSON.parse`.

Use-a no token obtido em `POST /auth/token` (`{"usuario": "aluno", "senha": "1234"}`) e **retorne** o payload.
@@starter
const BASE = 'https://api.loja.exemplo';

function lerPayload(jwt) {
  return {};
}

@@solution
const BASE = 'https://api.loja.exemplo';

function lerPayload(jwt) {
  let parte = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  while (parte.length % 4) parte += '=';
  return JSON.parse(atob(parte));
}

const r = await fetch(BASE + '/auth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'aluno', senha: '1234' }) });
const { access_token } = await r.json();
return lerPayload(access_token);
@@check
(ctx) => {
  const f = ctx.exports.lerPayload;
  if (typeof f !== 'function') return 'Defina lerPayload';
  const r = ctx.result || {};
  if (r.sub !== 'aluno' || r.papel !== 'estudante' || typeof r.exp !== 'number') return 'Retorne o payload do token (sub, papel, iat, exp)';
  const b64u = o => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const outro = b64u({ alg: 'HS256' }) + '.' + b64u({ sub: 'zé?', n: 1, ok: true }) + '.x';
  const p = f(outro);
  if (!p || p.sub !== 'zé?' || p.n !== 1) return 'lerPayload deve funcionar com payloads de qualquer tamanho (complete o padding com =)';
  return true;
}
:::

:::exercicio js exports=tokenValido
Crie **`tokenValido(jwt, agoraSegundos)`** que decodifica o payload e retorna **`true`** se o token **ainda não expirou**, considerando uma **margem de segurança de 60 segundos** (ou seja, válido se `agora + 60 < exp`). Tokens sem `exp` são considerados **inválidos**.

Termine com `return tokenValido(<o JWT da API>, 1767226000);` usando o token de `POST /auth/token`.
@@starter
const BASE = 'https://api.loja.exemplo';

function tokenValido(jwt, agoraSegundos) {
  return true;
}

@@solution
const BASE = 'https://api.loja.exemplo';

function tokenValido(jwt, agoraSegundos) {
  let parte = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  while (parte.length % 4) parte += '=';
  const p = JSON.parse(atob(parte));
  if (typeof p.exp !== 'number') return false;
  return agoraSegundos + 60 < p.exp;
}

const r = await fetch(BASE + '/auth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'aluno', senha: '1234' }) });
const { access_token } = await r.json();
return tokenValido(access_token, 1767226000);
@@check
(ctx) => {
  const f = ctx.exports.tokenValido;
  if (typeof f !== 'function') return 'Defina tokenValido';
  if (ctx.result !== true) return 'O token da API deve ser válido no instante 1767226000';
  const jwt = ctx.MockAPI.JWT;
  if (f(jwt, 1767229200) !== false) return 'No instante exato do exp o token é inválido';
  if (f(jwt, 1767229140) !== false) return 'Faltando exatamente 60 s, a margem de segurança torna o token inválido';
  if (f(jwt, 1767229139) !== true) return 'Faltando 61 s o token ainda é válido';
  const b64u = o => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (f(b64u({}) + '.' + b64u({ sub: 'x' }) + '.y', 0) !== false) return 'Token sem exp deve ser inválido';
  return true;
}
:::

:::exercicio js
Crie **`obterToken()`** com **cache**: na primeira chamada, faz `POST /auth/token` e guarda o token; nas seguintes, **reaproveita** o token guardado sem chamar a API de novo.

Crie também **`perfil()`**, que usa `obterToken()` e chama `GET /privado/perfil`.

Chame `perfil()` **três vezes** e **retorne** o resultado da última. O endpoint de token deve ser chamado **uma única vez**.
@@starter
const BASE = 'https://api.loja.exemplo';

async function obterToken() {
}

async function perfil() {
}

@@solution
const BASE = 'https://api.loja.exemplo';
let cache = null;

async function obterToken() {
  if (cache) return cache;
  const r = await fetch(BASE + '/auth/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'aluno', senha: '1234' }) });
  cache = (await r.json()).access_token;
  return cache;
}

async function perfil() {
  const token = await obterToken();
  const r = await fetch(BASE + '/privado/perfil', { headers: { Authorization: `Bearer ${token}` } });
  return r.json();
}

await perfil();
await perfil();
return await perfil();
@@check
(ctx) => {
  const tokens = ctx.requests.filter(r => r.path === '/auth/token').length;
  const perfis = ctx.requests.filter(r => r.path === '/privado/perfil');
  if (perfis.length !== 3) return 'Chame /privado/perfil três vezes (via perfil())';
  if (tokens !== 1) return `O token deve ser obtido uma única vez (foram ${tokens} chamadas a /auth/token)`;
  if (!perfis.every(p => p.headers.authorization === 'Bearer ' + ctx.MockAPI.JWT)) return 'Todas as chamadas devem levar o token';
  if (!ctx.result || ctx.result.usuario !== 'aluno') return 'Retorne o resultado da última chamada';
  return true;
}
:::

### EXTRA api-11

### O que conta como "mesma origem"

Comparando com `https://app.loja.exemplo/pagina`:

| URL | Mesma origem? | Por quê |
|---|---|---|
| `https://app.loja.exemplo/outra` | ✔ | só o caminho muda |
| `http://app.loja.exemplo/` | ✖ | esquema diferente |
| `https://api.loja.exemplo/` | ✖ | host diferente (subdomínio também conta) |
| `https://app.loja.exemplo:8443/` | ✖ | porta diferente (a padrão do https é 443) |

### Requisições simples x com preflight

O navegador manda direto (sem preflight) quando a requisição é "simples":

- método `GET`, `HEAD` ou `POST`;
- só headers da lista segura (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type`);
- e, se houver `Content-Type`, ele é `text/plain`, `multipart/form-data` ou `application/x-www-form-urlencoded`.

Qualquer outra coisa — `PUT`, `DELETE`, `Content-Type: application/json`, header `Authorization` — dispara o **preflight** `OPTIONS`. Mesmo nas simples, o navegador só entrega a resposta ao seu código se ela tiver o `Access-Control-Allow-Origin` adequado.

### Um preflight completo

```http
OPTIONS /usuarios/3 HTTP/1.1
Origin: https://app.loja.exemplo
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.loja.exemplo
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600          ← o navegador pode guardar essa permissão por 600 s
```

Se a permissão for concedida, o navegador então envia o `DELETE` de verdade.

### Cookies entre origens

Para enviar cookies em requisições a outra origem:

- no cliente: `fetch(url, { credentials: 'include' })`;
- no servidor: `Access-Control-Allow-Credentials: true` **e** uma origem específica (não `*`).

### Erros de configuração comuns

| Sintoma no console | Causa provável |
|---|---|
| "No 'Access-Control-Allow-Origin' header" | o servidor não enviou o header (ou deu erro antes de enviá-lo) |
| funciona no Postman, falha no navegador | é CORS: o Postman não aplica a política de mesma origem |
| GET funciona, PUT não | o preflight OPTIONS não está sendo tratado |
| "credentials mode is 'include'" | usou `*` junto com credenciais |

Uma configuração perigosa é **refletir qualquer `Origin`** recebido de volta no `Access-Control-Allow-Origin` com credenciais habilitadas: na prática, libera todos os sites. Use uma **lista de origens permitidas**.

### HTTPS: o que o TLS faz por baixo

No início da conexão, cliente e servidor fazem o *handshake* TLS: o servidor apresenta um **certificado** (assinado por uma autoridade certificadora em que o sistema confia), os dois combinam chaves de sessão e, daí em diante, tudo trafega criptografado. Hoje os certificados são gratuitos (ex.: Let's Encrypt) e não há motivo para APIs sem HTTPS.

:::exercicio js
Envie um **OPTIONS** para `/produtos` e **retorne** o valor do header **`Access-Control-Max-Age`** convertido para **número**, junto com a lista de métodos de `Access-Control-Allow-Methods` como **array** (separe por vírgula e tire os espaços): `{ maxAge, metodos }`.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/produtos', { method: 'OPTIONS' });
return {
  maxAge: Number(r.headers.get('Access-Control-Max-Age')),
  metodos: r.headers.get('Access-Control-Allow-Methods').split(',').map(m => m.trim()),
};
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'OPTIONS' && r.path === '/produtos')) return 'Envie OPTIONS /produtos';
  const r = ctx.result || {};
  if (r.maxAge !== 600) return 'maxAge deve ser o número 600';
  if (JSON.stringify(r.metodos) !== JSON.stringify(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])) return 'metodos deve ser o array ["GET", "POST", "PUT", "PATCH", "DELETE"]';
  return true;
}
:::

:::exercicio js exports=mesmaOrigem
Crie **`mesmaOrigem(a, b)`** que recebe duas URLs e retorna `true` se tiverem a **mesma origem** (esquema, host e porta). Use `new URL(...).origin`, que já considera as portas padrão.

Termine com `return mesmaOrigem('https://app.loja.exemplo/a', 'https://app.loja.exemplo:443/b');`.
@@starter
function mesmaOrigem(a, b) {
  return a === b;
}

return mesmaOrigem('https://app.loja.exemplo/a', 'https://app.loja.exemplo:443/b');
@@solution
function mesmaOrigem(a, b) {
  return new URL(a).origin === new URL(b).origin;
}

return mesmaOrigem('https://app.loja.exemplo/a', 'https://app.loja.exemplo:443/b');
@@check
(ctx) => {
  const f = ctx.exports.mesmaOrigem;
  if (typeof f !== 'function') return 'Defina mesmaOrigem';
  const casos = [
    ['https://app.loja.exemplo/a', 'https://app.loja.exemplo/b?x=1', true],
    ['https://app.loja.exemplo/a', 'https://app.loja.exemplo:443/b', true],
    ['https://app.loja.exemplo', 'http://app.loja.exemplo', false],
    ['https://app.loja.exemplo', 'https://api.loja.exemplo', false],
    ['https://app.loja.exemplo', 'https://app.loja.exemplo:8443', false],
    ['http://localhost:3000/x', 'http://localhost:3000/y', true],
  ];
  for (const [a, b, e] of casos) if (f(a, b) !== e) return `mesmaOrigem("${a}", "${b}") deveria ser ${e}`;
  return true;
}
:::

:::exercicio js exports=precisaPreflight
Crie **`precisaPreflight(metodo, headers)`**, que diz se o navegador enviaria um **preflight** para uma requisição entre origens, seguindo as regras da aula:
- métodos simples: `GET`, `HEAD`, `POST` (compare sem diferenciar maiúsculas);
- headers permitidos sem preflight: `accept`, `accept-language`, `content-language`, `content-type` (nomes sem diferenciar maiúsculas);
- `content-type` só é simples se o valor (antes de um eventual `;`) for `text/plain`, `multipart/form-data` ou `application/x-www-form-urlencoded`.

`headers` é um objeto `{nome: valor}`. Termine com `return precisaPreflight('POST', { 'Content-Type': 'application/json' });`.
@@starter
function precisaPreflight(metodo, headers) {
  return false;
}

return precisaPreflight('POST', { 'Content-Type': 'application/json' });
@@solution
function precisaPreflight(metodo, headers = {}) {
  if (!['GET', 'HEAD', 'POST'].includes(metodo.toUpperCase())) return true;
  const seguros = ['accept', 'accept-language', 'content-language', 'content-type'];
  const tipos = ['text/plain', 'multipart/form-data', 'application/x-www-form-urlencoded'];
  for (const [nome, valor] of Object.entries(headers)) {
    const n = nome.toLowerCase();
    if (!seguros.includes(n)) return true;
    if (n === 'content-type' && !tipos.includes(String(valor).split(';')[0].trim().toLowerCase())) return true;
  }
  return false;
}

return precisaPreflight('POST', { 'Content-Type': 'application/json' });
@@check
(ctx) => {
  const f = ctx.exports.precisaPreflight;
  if (typeof f !== 'function') return 'Defina precisaPreflight';
  const casos = [
    ['GET', {}, false], ['get', { Accept: 'application/json' }, false], ['POST', { 'Content-Type': 'application/json' }, true],
    ['POST', { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' }, false], ['POST', { 'Content-Type': 'text/plain' }, false],
    ['PUT', {}, true], ['DELETE', {}, true], ['GET', { Authorization: 'Bearer x' }, true], ['HEAD', { 'X-Request-Id': '1' }, true],
    ['PATCH', { Accept: '*/*' }, true],
  ];
  for (const [m, h, e] of casos) if (f(m, h) !== e) return `precisaPreflight("${m}", ${JSON.stringify(h)}) deveria ser ${e}`;
  if (ctx.result !== true) return 'O return final deve ser true';
  return true;
}
:::

### EXTRA api-12

### Como o servidor limita: token bucket

Imagine um balde com capacidade para 10 fichas, que ganha 1 ficha por segundo. Cada requisição gasta uma ficha. Se o balde estiver vazio, a resposta é **429**. Isso permite **rajadas** curtas (até 10 seguidas) mas limita a taxa média (1 por segundo).

```text
capacidade = 10, reposição = 1/s
t=0s  10 fichas → 10 requisições seguidas: OK (balde vazio)
t=0s  11ª requisição → 429, Retry-After: 1
t=1s  1 ficha → 1 requisição OK
```

Limites costumam ser aplicados **por chave de API, por usuário ou por IP**, e podem ser diferentes por rota (login, por exemplo, é bem mais restrito para dificultar ataques de senha).

### Lendo os headers de limite

```javascript
const r = await fetch(url);
const restante = Number(r.headers.get('X-RateLimit-Remaining'));
if (restante <= 1) console.warn('quase no limite; diminua o ritmo');
if (r.status === 429) {
  const espera = Number(r.headers.get('Retry-After') || 1) * 1000;
  // aguarde "espera" milissegundos antes de tentar de novo
}
```

O `Retry-After` pode vir em **segundos** (`30`) ou como **data HTTP** (`Wed, 21 Oct 2025 07:28:00 GMT`).

### Calculando o backoff

| Tentativa | Exponencial (base 500 ms) | Com teto de 8 s | Com "jitter total" |
|---|---|---|---|
| 0 | 500 ms | 500 ms | aleatório entre 0 e 500 ms |
| 1 | 1 s | 1 s | entre 0 e 1 s |
| 2 | 2 s | 2 s | entre 0 e 2 s |
| 3 | 4 s | 4 s | entre 0 e 4 s |
| 4 | 8 s | 8 s | entre 0 e 8 s |
| 5 | 16 s | **8 s** | entre 0 e 8 s |

Sempre limite também o **número total de tentativas**: depois disso, falhe de forma clara para quem chamou.

### Só repita o que é seguro repetir

Retentativas automáticas são seguras para **GET, PUT e DELETE** (idempotentes). Para **POST**, repita só se a API suportar `Idempotency-Key` (próxima aula) — senão você pode criar o mesmo pedido duas vezes.

### Circuit breaker em uma tabela

| Estado | Comportamento |
|---|---|
| **Fechado** (normal) | as chamadas passam; falhas são contadas |
| **Aberto** | após N falhas seguidas, as chamadas falham na hora, sem nem tentar (dá tempo ao serviço de se recuperar) |
| **Meio-aberto** | depois de um tempo, deixa passar uma chamada de teste; se der certo, volta a fechado |

### Erros de validação não são temporários

Um 400/422 não melhora com o tempo. A resposta certa é mostrar o erro ao usuário (ou corrigir o código), não tentar de novo.

:::exercicio js
O endpoint `/limitado` aceita **3** chamadas por janela. Faça **4** chamadas seguidas e **retorne** um objeto com:
- **`restantes`**: array com o valor (número) do header `X-RateLimit-Remaining` de cada resposta;
- **`ultimoStatus`**: o status da 4ª resposta;
- **`retryAfter`**: o valor (número) do header `Retry-After` da 4ª resposta.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const restantes = [];
let ultima;
for (let i = 0; i < 4; i++) {
  ultima = await fetch(BASE + '/limitado');
  restantes.push(Number(ultima.headers.get('X-RateLimit-Remaining')));
}
return { restantes, ultimoStatus: ultima.status, retryAfter: Number(ultima.headers.get('Retry-After')) };
@@check
(ctx) => {
  if (ctx.requests.filter(r => r.path === '/limitado').length !== 4) return 'Faça exatamente 4 chamadas a /limitado';
  const r = ctx.result || {};
  if (JSON.stringify(r.restantes) !== JSON.stringify([2, 1, 0, 0])) return 'restantes deve ser [2, 1, 0, 0] (números lidos do header)';
  if (r.ultimoStatus !== 429) return 'ultimoStatus deve ser 429';
  if (r.retryAfter !== 30) return 'retryAfter deve ser o número 30';
  return true;
}
:::

:::exercicio js exports=calcularEspera,deveRetentar
Crie **`calcularEspera(tentativa, retryAfter)`** que retorna quantos **milissegundos** esperar:
- se `retryAfter` (texto, em segundos) for informado e for um número válido, use-o (× 1000);
- senão, use **backoff exponencial**: `500 × 2^tentativa`, com **teto de 8000 ms**.

Crie também **`deveRetentar(status)`**: `true` para **429, 502, 503 e 504**; `false` para o resto.

Termine com `return [calcularEspera(0), calcularEspera(5), calcularEspera(1, '3')];`.
@@starter
function calcularEspera(tentativa, retryAfter) {
  return 0;
}

function deveRetentar(status) {
  return false;
}

return [calcularEspera(0), calcularEspera(5), calcularEspera(1, '3')];
@@solution
function calcularEspera(tentativa, retryAfter) {
  const ra = Number(retryAfter);
  if (retryAfter !== undefined && retryAfter !== null && retryAfter !== '' && Number.isFinite(ra)) return ra * 1000;
  return Math.min(8000, 500 * 2 ** tentativa);
}

function deveRetentar(status) {
  return [429, 502, 503, 504].includes(status);
}

return [calcularEspera(0), calcularEspera(5), calcularEspera(1, '3')];
@@check
(ctx) => {
  const { calcularEspera: c, deveRetentar: d } = ctx.exports;
  if (typeof c !== 'function' || typeof d !== 'function') return 'Defina calcularEspera e deveRetentar';
  const casos = [[[0], 500], [[1], 1000], [[3], 4000], [[4], 8000], [[10], 8000], [[2, '0'], 0], [[2, '30'], 30000], [[2, 'abc'], 2000], [[1, null], 1000]];
  for (const [args, e] of casos) if (c(...args) !== e) return `calcularEspera(${args.map(a => JSON.stringify(a)).join(', ')}) deveria ser ${e}`;
  for (const s of [429, 502, 503, 504]) if (d(s) !== true) return `deveRetentar(${s}) deveria ser true`;
  for (const s of [200, 400, 401, 404, 422, 500]) if (d(s) !== false) return `deveRetentar(${s}) deveria ser false`;
  return true;
}
:::

:::exercicio js exports=buscarComLimite
Crie **`buscarComLimite(url, maxTentativas)`** que:
- retorna o **JSON** quando a resposta for `ok`;
- em **429**, lê `Retry-After`: se for **até 5 segundos**, espera (`esperar(ms)`) e tenta de novo; se for **maior que 5**, **desiste na hora** lançando `Error` com a mensagem **`'limite excedido, tente em <N>s'`**;
- em **503**, espera 100 ms e tenta de novo;
- se acabarem as tentativas, lança `Error('tentativas esgotadas')`.

Use-a em `/instavel` (5 tentativas) e **retorne** o JSON. O verificador também testa `/limitado`, que pede 30 s de espera.
@@starter
const BASE = 'https://api.loja.exemplo';

async function buscarComLimite(url, maxTentativas) {
  const r = await fetch(url);
  return r.json();
}

return await buscarComLimite(BASE + '/instavel', 5);
@@solution
const BASE = 'https://api.loja.exemplo';

async function buscarComLimite(url, maxTentativas) {
  for (let i = 0; i < maxTentativas; i++) {
    const r = await fetch(url);
    if (r.ok) return r.json();
    if (r.status === 429) {
      const s = Number(r.headers.get('Retry-After') || 1);
      if (s > 5) throw new Error(`limite excedido, tente em ${s}s`);
      await esperar(s * 1000);
    } else if (r.status === 503) {
      await esperar(100);
    } else {
      throw new Error('HTTP ' + r.status);
    }
  }
  throw new Error('tentativas esgotadas');
}

return await buscarComLimite(BASE + '/instavel', 5);
@@check
async (ctx) => {
  if (!ctx.result || ctx.result.status !== 'ok') return 'Retorne o JSON de /instavel após as retentativas';
  const f = ctx.exports.buscarComLimite;
  if (typeof f !== 'function') return 'Defina buscarComLimite';
  ctx.api.reset();
  for (let i = 0; i < 3; i++) await ctx.api.fetch('https://api.loja.exemplo/limitado');
  const antes = ctx.api.requests.length;
  try { await f('https://api.loja.exemplo/limitado', 5); return 'Com Retry-After de 30 s a função deve desistir lançando Error'; }
  catch (e) { if (e.message !== 'limite excedido, tente em 30s') return `Mensagem esperada "limite excedido, tente em 30s", veio "${e.message}"`; }
  if (ctx.api.requests.length - antes !== 1) return 'Ao receber Retry-After longo, desista na hora (sem novas tentativas)';
  ctx.api.reset();
  try { await f('https://api.loja.exemplo/instavel', 2); return 'Com 2 tentativas em /instavel deve lançar "tentativas esgotadas"'; }
  catch (e) { if (e.message !== 'tentativas esgotadas') return `Mensagem esperada "tentativas esgotadas", veio "${e.message}"`; }
  return true;
}
:::

### EXTRA api-13

### Como o servidor implementa a chave de idempotência

```text
POST /pagamentos  Idempotency-Key: 7f3c...
  1. Procura a chave na tabela de chaves.
     ├── não existe → grava a chave como "em processamento", processa, grava a resposta, responde.
     ├── existe e já tem resposta → devolve a MESMA resposta (sem processar de novo).
     └── existe e ainda está em processamento → 409 (outra requisição igual está rodando).
  2. Se o corpo for diferente do da requisição original com a mesma chave → erro (422).
  3. Chaves expiram depois de um tempo (ex.: 24 h).
```

A gravação da chave e o processamento precisam ser **atômicos** (numa transação, ou com uma restrição `UNIQUE` na chave), para que duas requisições simultâneas não processem as duas.

### Gerando boas chaves

```javascript
const chave = crypto.randomUUID();     // 'c2a4f1b8-...' (UUID v4, aleatório)
```

Uma alternativa é derivar a chave da **operação de negócio**: `pagamento-pedido-42-tentativa-1`. Assim, até o mesmo usuário clicando duas vezes no botão "Pagar" gera a mesma chave.

### Outras técnicas de idempotência

| Técnica | Exemplo |
|---|---|
| `PUT` com id escolhido pelo cliente | `PUT /pedidos/c2a4f1b8` cria ou substitui; repetir não duplica |
| restrição `UNIQUE` no banco | um pedido só pode ter um pagamento aprovado |
| verificação de estado | "cancelar" um pedido já cancelado não faz nada (ou responde 409) |
| deduplicação por id de evento | webhooks repetidos são ignorados pelo `id` do evento |

### "Exatamente uma vez" não existe na rede

Na prática, sistemas distribuídos garantem entrega **"no máximo uma vez"** (pode perder) ou **"pelo menos uma vez"** (pode repetir). O efeito de "exatamente uma vez" é obtido combinando **entrega pelo menos uma vez + processamento idempotente**. Esse é o motivo de toda essa aula.

:::exercicio js
Compare: envie **dois** `POST /pagamentos` (valor 50, pedido 3) **sem** `Idempotency-Key` e depois **dois** (valor 70, pedido 1) **com a mesma** `Idempotency-Key`.

**Retorne** um objeto com **`semChave`** (quantos pagamentos de valor 50 existem) e **`comChave`** (quantos de valor 70), consultando `GET /pagamentos` no final.
@@starter
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

@@solution
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };
const sem = { method: 'POST', headers, body: JSON.stringify({ valor: 50, pedidoId: 3 }) };
await fetch(BASE + '/pagamentos', sem);
await fetch(BASE + '/pagamentos', sem);
const com = { method: 'POST', headers: { ...headers, 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ valor: 70, pedidoId: 1 }) };
await fetch(BASE + '/pagamentos', com);
await fetch(BASE + '/pagamentos', com);
const lista = await (await fetch(BASE + '/pagamentos')).json();
return { semChave: lista.filter(p => p.valor === 50).length, comChave: lista.filter(p => p.valor === 70).length };
@@check
(ctx) => {
  const posts = ctx.requests.filter(r => r.method === 'POST' && r.path === '/pagamentos');
  if (posts.length !== 4) return 'Envie 4 POST para /pagamentos';
  const r = ctx.result || {};
  if (r.semChave !== 2 || r.comChave !== 1) return 'Esperado { semChave: 2, comChave: 1 }';
  if (!ctx.requests.some(q => q.method === 'GET' && q.path === '/pagamentos')) return 'Consulte GET /pagamentos no final';
  return true;
}
:::

:::exercicio js
Envie o mesmo pagamento (valor 99, pedido 2) duas vezes com a mesma `Idempotency-Key` e **retorne** um objeto com:
- **`ids`**: o `id` do pagamento em cada uma das duas respostas;
- **`repetida`**: o valor do header **`Idempotent-Replayed`** da **segunda** resposta.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const op = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'pagto-pedido-2' }, body: JSON.stringify({ valor: 99, pedidoId: 2 }) };
const r1 = await fetch(BASE + '/pagamentos', op);
const r2 = await fetch(BASE + '/pagamentos', op);
return { ids: [(await r1.json()).id, (await r2.json()).id], repetida: r2.headers.get('Idempotent-Replayed') };
@@check
(ctx) => {
  const r = ctx.result || {};
  if (JSON.stringify(r.ids) !== JSON.stringify([1, 1])) return 'As duas respostas devem trazer o mesmo id (1)';
  if (r.repetida !== 'true') return 'repetida deve ser o header Idempotent-Replayed da segunda resposta';
  if (ctx.api.pagamentos.length !== 1) return 'Só um pagamento deve existir';
  return true;
}
:::

:::exercicio js exports=pagar
Crie **`pagar(enviar, valor, pedidoId)`**, onde `enviar(url, opcoes)` funciona como o `fetch` mas **pode lançar erro de rede** mesmo depois de o servidor ter processado a requisição (a resposta "se perdeu").

A função deve gerar **uma única** `Idempotency-Key` e tentar até **3 vezes**, repetindo **apenas** quando `enviar` lançar erro, e retornar o JSON do pagamento.

Teste com `return await pagar(fetch, 10, 1);`. O verificador usa um `enviar` que falha na primeira tentativa **depois** de o servidor já ter criado o pagamento.
@@starter
const BASE = 'https://api.loja.exemplo';

async function pagar(enviar, valor, pedidoId) {
  const r = await enviar(BASE + '/pagamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valor, pedidoId }),
  });
  return r.json();
}

return await pagar(fetch, 10, 1);
@@solution
const BASE = 'https://api.loja.exemplo';

async function pagar(enviar, valor, pedidoId) {
  const opcoes = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ valor, pedidoId }),
  };
  let ultimoErro;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await enviar(BASE + '/pagamentos', opcoes);
      return await r.json();
    } catch (e) {
      ultimoErro = e;
    }
  }
  throw ultimoErro;
}

return await pagar(fetch, 10, 1);
@@check
async (ctx) => {
  const f = ctx.exports.pagar;
  if (typeof f !== 'function') return 'Defina pagar';
  ctx.api.reset();
  let n = 0;
  const instavel = async (url, op) => { const r = await ctx.api.fetch(url, op); n++; if (n === 1) throw new TypeError('conexão perdida'); return r; };
  let out;
  try { out = await f(instavel, 75, 2); } catch (e) { return 'pagar deve tentar de novo quando enviar lança erro (até 3 vezes)'; }
  if (n !== 2) return `Esperadas 2 tentativas, foram ${n}`;
  if (ctx.api.pagamentos.length !== 1) return `A retentativa duplicou o pagamento (${ctx.api.pagamentos.length} criados): use a MESMA Idempotency-Key em todas as tentativas`;
  if (!out || out.valor !== 75) return 'Retorne o JSON do pagamento';
  const keys = ctx.api.requests.map(r => r.headers['idempotency-key']);
  if (!keys[0] || keys[0] !== keys[1]) return 'Envie a mesma Idempotency-Key nas duas tentativas';
  ctx.api.reset();
  try { await f(async () => { throw new TypeError('rede fora'); }, 1, 1); return 'Se todas as 3 tentativas falharem, lance o erro'; } catch (e) { /* esperado */ }
  return true;
}
:::

### EXTRA api-14

### Onde existe cache numa requisição

```text
seu código → cache do navegador → CDN / proxy → gateway → servidor de aplicação → cache interno (Redis) → banco
```

Os headers HTTP controlam os caches do **navegador** e dos **intermediários** (CDNs). Caches internos do servidor (como Redis) são outra camada, decidida pela aplicação.

### Combinações comuns de Cache-Control

| Situação | Header |
|---|---|
| imagem/JS com nome versionado (`app.3f9a.js`) | `public, max-age=31536000, immutable` |
| página/JSON que muda às vezes | `no-cache` + `ETag` (sempre revalida, quase sempre 304) |
| dados do usuário logado | `private, max-age=60` |
| extrato bancário, dados sensíveis | `no-store` |
| pode servir algo um pouco velho enquanto busca o novo | `max-age=60, stale-while-revalidate=30` |

### ETag forte x fraco

- **Forte** (`"p1-v1"`): byte a byte idêntico.
- **Fraco** (`W/"p1-v1"`): semanticamente equivalente (por exemplo, o mesmo conteúdo com compressão diferente).

Para concorrência otimista com `If-Match`, use ETags **fortes**.

### Gerando ETags no servidor

Duas abordagens comuns:

1. **Versão** do registro: uma coluna `versao` incrementada a cada UPDATE (como faz a API simulada: `"p1-v2"`).
2. **Hash** do conteúdo: `sha256(json_da_resposta)` — não exige coluna nova, mas precisa montar a resposta para comparar.

### O fluxo completo de concorrência otimista

```text
Atendente A: GET /produtos/1  → ETag "p1-v1", preço 3500
Atendente B: GET /produtos/1  → ETag "p1-v1", preço 3500
A: PATCH preço 3200  If-Match: "p1-v1"  → 200, ETag "p1-v2"
B: PATCH preço 3300  If-Match: "p1-v1"  → 412 Precondition Failed
B: GET /produtos/1   → ETag "p1-v2", preço 3200   ← vê a mudança de A
B: decide (mantém 3200 ou aplica 3300 conscientemente) e reenvia com If-Match: "p1-v2"
```

Sem o `If-Match`, a alteração de A seria apagada em silêncio pela de B. Algumas APIs exigem o `If-Match` em toda escrita e respondem **428 Precondition Required** se ele faltar.

### Otimista x pessimista

| Estratégia | Como | Bom quando |
|---|---|---|
| **Otimista** (ETag/versão) | não trava; confere a versão na hora de gravar | conflitos são raros (a maioria dos sistemas web) |
| **Pessimista** (trava) | trava o registro durante a edição (`SELECT ... FOR UPDATE`) | conflitos frequentes e caros |

:::exercicio js
Faça GET em `/produtos/2` e **retorne** `{ etag, maxAge }`, onde `maxAge` é o **número** extraído do header `Cache-Control` (`max-age=60` → `60`). Use uma expressão regular ou `split`.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/produtos/2');
const cc = r.headers.get('Cache-Control');
return { etag: r.headers.get('ETag'), maxAge: Number(cc.match(/max-age=(\d+)/)[1]) };
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.path === '/produtos/2')) return 'Faça GET em /produtos/2';
  const r = ctx.result || {};
  if (r.etag !== '"p2-v1"') return 'etag deve vir do header ETag';
  if (r.maxAge !== 60) return 'maxAge deve ser o número 60';
  return true;
}
:::

:::exercicio js exports=criarClienteComCache
Crie **`criarClienteComCache()`** que retorna a função **`obter(url)`** com cache por ETag:
- na primeira vez, faz GET normal, guarda **ETag e corpo** num `Map` e retorna o corpo;
- nas próximas, envia **`If-None-Match`**; se vier **304**, retorna o corpo guardado; se vier 200, atualiza o cache e retorna o corpo novo.

Use: `const obter = criarClienteComCache();` e busque `/produtos/1` **duas vezes**, retornando o resultado da segunda.
@@starter
const BASE = 'https://api.loja.exemplo';

function criarClienteComCache() {
  return async (url) => {
    const r = await fetch(url);
    return r.json();
  };
}

const obter = criarClienteComCache();
await obter(BASE + '/produtos/1');
return await obter(BASE + '/produtos/1');
@@solution
const BASE = 'https://api.loja.exemplo';

function criarClienteComCache() {
  const cache = new Map();
  return async (url) => {
    const salvo = cache.get(url);
    const r = await fetch(url, salvo ? { headers: { 'If-None-Match': salvo.etag } } : {});
    if (r.status === 304 && salvo) return salvo.corpo;
    const corpo = await r.json();
    const etag = r.headers.get('ETag');
    if (etag) cache.set(url, { etag, corpo });
    return corpo;
  };
}

const obter = criarClienteComCache();
await obter(BASE + '/produtos/1');
return await obter(BASE + '/produtos/1');
@@check
async (ctx) => {
  const reqs = ctx.requests.filter(r => r.path === '/produtos/1');
  if (reqs.length !== 2) return 'Faça duas chamadas a /produtos/1';
  if (reqs[0].headers['if-none-match']) return 'A primeira chamada não deve ter If-None-Match';
  if (reqs[1].headers['if-none-match'] !== '"p1-v1"') return 'A segunda chamada deve enviar If-None-Match com o ETag guardado';
  if (!ctx.result || ctx.result.nome !== 'Caderno') return 'Em 304, retorne o corpo guardado em cache';
  const f = ctx.exports.criarClienteComCache;
  if (typeof f !== 'function') return 'Defina criarClienteComCache';
  ctx.api.reset();
  const obter = f();
  await obter('https://api.loja.exemplo/produtos/3');
  await ctx.api.fetch('https://api.loja.exemplo/produtos/3', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preco: 1 }) });
  const novo = await obter('https://api.loja.exemplo/produtos/3');
  if (!novo || novo.preco !== 1) return 'Quando o recurso muda (200), o cliente deve devolver e guardar o corpo novo';
  const terceiro = await obter('https://api.loja.exemplo/produtos/3');
  if (ctx.api.requests[ctx.api.requests.length - 1].headers['if-none-match'] !== '"p3-v2"' || terceiro.preco !== 1) return 'Depois de atualizar, o cache deve usar o ETag novo';
  return true;
}
:::

:::exercicio js exports=atualizarPreco
Crie **`atualizarPreco(id, calcular)`** com **concorrência otimista**:
1. faz GET em `/produtos/<id>` e guarda o ETag;
2. calcula o novo preço com `calcular(precoAtual)`;
3. envia PATCH com `{ preco: novo }` e `If-Match: <etag>`;
4. se receber **412**, **recomeça do passo 1** (até 3 tentativas no total); retorna o JSON do PATCH bem-sucedido.

Use-a para dar **10% de desconto** no produto 1 e **retorne** o resultado. O verificador simula outro atendente alterando o produto entre a sua leitura e a sua escrita.
@@starter
const BASE = 'https://api.loja.exemplo';

async function atualizarPreco(id, calcular) {
}

return await atualizarPreco(1, p => Math.round(p * 0.9 * 100) / 100);
@@solution
const BASE = 'https://api.loja.exemplo';

async function atualizarPreco(id, calcular) {
  for (let i = 0; i < 3; i++) {
    const g = await fetch(`${BASE}/produtos/${id}`);
    const etag = g.headers.get('ETag');
    const atual = await g.json();
    const r = await fetch(`${BASE}/produtos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'If-Match': etag },
      body: JSON.stringify({ preco: calcular(atual.preco) }),
    });
    if (r.status !== 412) return r.json();
  }
  throw new Error('conflito persistente');
}

return await atualizarPreco(1, p => Math.round(p * 0.9 * 100) / 100);
@@check
async (ctx) => {
  if (!ctx.result || Math.abs(ctx.result.preco - 14.31) > 1e-9) return 'Retorne o produto com 10% de desconto (15.9 → 14.31)';
  const f = ctx.exports.atualizarPreco;
  if (typeof f !== 'function') return 'Defina atualizarPreco';
  ctx.api.reset();
  const original = ctx.api.fetch.bind(ctx.api);
  let interferiu = false;
  ctx.api.fetch = async (url, op = {}) => {
    if (!interferiu && op.method === 'PATCH') {
      interferiu = true;
      await original('https://api.loja.exemplo/produtos/2', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preco: 100 }) });
    }
    return original(url, op);
  };
  const out = await f(2, p => p - 10);
  ctx.api.fetch = original;
  const patches = ctx.api.requests.filter(r => r.method === 'PATCH' && r.path === '/produtos/2').slice(1);
  if (!patches.length || !patches.every(p => p.headers['if-match'])) return 'Envie If-Match em todos os PATCH';
  if (patches.length !== 2) return 'Ao receber 412, releia o produto e tente de novo';
  if (!out || out.preco !== 90) return 'Depois do conflito, recalcule a partir do preço NOVO (100 − 10 = 90)';
  return true;
}
:::

### EXTRA api-15

### Por que HATEOAS é útil (mesmo sem seguir à risca)

Sem links, o cliente precisa **saber as regras** de cor: "só posso cancelar se o status for pendente". Se o servidor mudar a regra (agora também dá para cancelar pedidos "em separação"), todos os clientes precisam ser atualizados. Com links, o cliente simplesmente mostra o botão "Cancelar" **se o link `cancelar` existir** — a regra fica só no servidor.

```javascript
const pedido = await (await fetch(`${BASE}/pedidos/1`)).json();
botaoCancelar.hidden = !pedido._links.cancelar;
```

### Formatos de hipermídia

| Formato | Exemplo de link |
|---|---|
| HAL (`application/hal+json`) | `"_links": {"self": {"href": "/pedidos/1"}}` |
| JSON:API | `"links": {"self": "/pedidos/1"}`, com `"relationships"` |
| header `Link` (RFC 8288) | `Link: </pedidos?pagina=2>; rel="next"` |

Os nomes das relações (`self`, `next`, `prev`, `first`, `last`, `edit`...) seguem um registro padronizado da IANA, além dos nomes próprios da sua API.

### OpenAPI: as partes de um documento

```yaml
openapi: 3.1.0
info: { title: API da Loja, version: 1.2.0 }
servers:
  - url: https://api.loja.exemplo
paths:
  /usuarios:
    post:
      summary: Cria um usuário
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/UsuarioNovo' }
      responses:
        '201':
          description: Criado
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Usuario' }
        '422': { description: Dados inválidos }
components:
  schemas:
    UsuarioNovo:
      type: object
      required: [nome, email]
      properties:
        nome:  { type: string, minLength: 1 }
        email: { type: string, format: email }
    Usuario:
      allOf:
        - $ref: '#/components/schemas/UsuarioNovo'
        - type: object
          properties: { id: { type: integer } }
  securitySchemes:
    bearer: { type: http, scheme: bearer, bearerFormat: JWT }
security:
  - bearer: []
```

- `components/schemas` evita repetição: os modelos são definidos uma vez e referenciados com `$ref`.
- Os schemas usam **JSON Schema** (na versão 3.1, totalmente compatível).
- `securitySchemes` documenta a autenticação.

### Testes de contrato

Com a especificação em mãos, testes automáticos conferem que a API **real** responde exatamente como o contrato diz (status, campos, tipos). Isso pega mudanças incompatíveis antes que quebrem os clientes.

### O que uma boa documentação mostra

1. Como obter credenciais e autenticar (com exemplo copiável).
2. Um "primeiros passos" em 5 minutos.
3. Cada endpoint com exemplos reais de requisição e resposta.
4. Todos os erros possíveis e o que fazer em cada um.
5. Limites de taxa, paginação e política de versionamento.
6. *Changelog* com as mudanças de cada versão.

:::exercicio js
Comece pela raiz da API (`/`) e, **seguindo o link** `_links.pedidos.href` (sem escrever `/pedidos` no código), busque a lista de pedidos. **Retorne** a quantidade de pedidos.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const raiz = await (await fetch(BASE + '/')).json();
const pedidos = await (await fetch(new URL(raiz._links.pedidos.href, BASE))).json();
return pedidos.length;
@@check
(ctx) => {
  const seq = ctx.requests.map(r => r.path);
  if (JSON.stringify(seq) !== JSON.stringify(['/', '/pedidos'])) return 'Primeiro GET em /, depois siga _links.pedidos.href';
  if (ctx.result !== 3) return 'Retorne a quantidade de pedidos (3)';
  return true;
}
:::

:::exercicio js
Crie **`acoesDisponiveis(pedidoId)`** que busca o pedido e retorna a lista das **relações** presentes em `_links`, **exceto `self`**, em ordem alfabética.

**Retorne** um objeto com o resultado para os pedidos **1** e **2**: `{ p1, p2 }`.
@@starter
const BASE = 'https://api.loja.exemplo';

async function acoesDisponiveis(pedidoId) {
  return [];
}

@@solution
const BASE = 'https://api.loja.exemplo';

async function acoesDisponiveis(pedidoId) {
  const p = await (await fetch(`${BASE}/pedidos/${pedidoId}`)).json();
  return Object.keys(p._links).filter(k => k !== 'self').sort();
}

return { p1: await acoesDisponiveis(1), p2: await acoesDisponiveis(2) };
@@check
(ctx) => {
  const r = ctx.result || {};
  if (JSON.stringify(r.p1) !== JSON.stringify(['cancelar', 'usuario'])) return 'Para o pedido 1 (pendente): ["cancelar", "usuario"]';
  if (JSON.stringify(r.p2) !== JSON.stringify(['usuario'])) return 'Para o pedido 2 (enviado): ["usuario"] — sem cancelar';
  return true;
}
:::

:::exercicio js exports=validar
Implemente um **validador mínimo de JSON Schema**: **`validar(dado, schema)`** retorna a **lista de erros** (vazia se válido). Suporte:
- `type`: `'object'`, `'string'`, `'integer'`, `'number'`, `'boolean'`, `'array'`;
- `required` (lista de campos obrigatórios de um objeto) → erro `'<campo>: obrigatório'`;
- `properties` (valida cada campo presente, recursivamente) → erro de tipo `'<caminho>: esperado <tipo>'`;
- `minLength` para strings → `'<caminho>: mínimo <n> caracteres'`.

O caminho de um campo aninhado é `pai.filho`; para a raiz, use `'raiz'`. Termine com `return validar({ nome: '', idade: 2.5 }, schemaUsuario);`.
@@starter
const schemaUsuario = {
  type: 'object',
  required: ['nome', 'email'],
  properties: { nome: { type: 'string', minLength: 1 }, email: { type: 'string' }, idade: { type: 'integer' } },
};

function validar(dado, schema) {
  return [];
}

return validar({ nome: '', idade: 2.5 }, schemaUsuario);
@@solution
const schemaUsuario = {
  type: 'object',
  required: ['nome', 'email'],
  properties: { nome: { type: 'string', minLength: 1 }, email: { type: 'string' }, idade: { type: 'integer' } },
};

function tipoOk(v, t) {
  if (t === 'object') return typeof v === 'object' && v !== null && !Array.isArray(v);
  if (t === 'array') return Array.isArray(v);
  if (t === 'integer') return Number.isInteger(v);
  if (t === 'number') return typeof v === 'number' && Number.isFinite(v);
  return typeof v === t;
}

function validar(dado, schema, caminho = 'raiz') {
  const erros = [];
  if (schema.type && !tipoOk(dado, schema.type)) return [`${caminho}: esperado ${schema.type}`];
  if (schema.type === 'string' && schema.minLength !== undefined && dado.length < schema.minLength) erros.push(`${caminho}: mínimo ${schema.minLength} caracteres`);
  if (schema.type === 'object') {
    for (const campo of schema.required || []) if (!(campo in dado)) erros.push(`${campo}: obrigatório`);
    for (const [campo, sub] of Object.entries(schema.properties || {})) {
      if (campo in dado) erros.push(...validar(dado[campo], sub, caminho === 'raiz' ? campo : `${caminho}.${campo}`));
    }
  }
  return erros;
}

return validar({ nome: '', idade: 2.5 }, schemaUsuario);
@@check
(ctx) => {
  const v = ctx.exports.validar;
  if (typeof v !== 'function') return 'Defina validar';
  const s = { type: 'object', required: ['nome', 'email'], properties: { nome: { type: 'string', minLength: 1 }, email: { type: 'string' }, idade: { type: 'integer' } } };
  const eq = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  if (!eq(v({ nome: 'Ana', email: 'a@x', idade: 3 }, s), [])) return 'Objeto válido deve retornar []';
  if (!eq(v({ nome: '', idade: 2.5 }, s), ['email: obrigatório', 'nome: mínimo 1 caracteres', 'idade: esperado integer'])) return 'Para { nome: "", idade: 2.5 } os erros são: email obrigatório, nome com mínimo 1 caracteres e idade esperado integer';
  if (!eq(v([1, 2], s), ['raiz: esperado object'])) return 'Um array no lugar de objeto → ["raiz: esperado object"]';
  const aninhado = { type: 'object', properties: { endereco: { type: 'object', required: ['cep'], properties: { numero: { type: 'number' } } }, tags: { type: 'array' }, ativo: { type: 'boolean' } } };
  if (!eq(v({ endereco: { numero: 'dez' }, tags: 'x', ativo: 1 }, aninhado), ['cep: obrigatório', 'endereco.numero: esperado number', 'tags: esperado array', 'ativo: esperado boolean'])) return 'Valide objetos aninhados (caminho pai.filho), arrays e booleanos';
  return true;
}
:::

### EXTRA api-16

### Desenhando um sistema de webhooks (lado de quem envia)

1. O cliente **cadastra** uma URL e os eventos de interesse (`pedido.pago`, `pedido.enviado`).
2. Quando o evento acontece, o sistema grava o evento numa **fila**.
3. Um processo entrega: `POST` para a URL com o corpo do evento, a assinatura e um id único.
4. Se a resposta não for 2xx (ou demorar demais), **tenta de novo** com backoff (por exemplo: 1 min, 5 min, 30 min, 2 h…) por um período limitado.
5. Depois de muitas falhas, desativa o webhook e avisa o cliente.
6. Oferece um painel para ver entregas e **reenviar** manualmente.

### O formato de um evento bem projetado

```json
{
  "id": "evt_01HZX8...",
  "tipo": "pedido.pago",
  "criado_em": "2025-04-25T14:30:00Z",
  "dados": { "pedidoId": 1, "valor": 105.8 }
}
```

- `id` único permite descartar duplicatas.
- `tipo` permite rotear o tratamento.
- `criado_em` permite detectar eventos fora de ordem (webhooks **não** garantem ordem).
- Muitos provedores mandam só o essencial (ex.: o id do pedido) e esperam que você **busque o estado atual** na API — assim, se os eventos chegarem fora de ordem, você sempre usa o dado mais recente.

### Assinatura com timestamp (proteção contra replay)

Se alguém capturar um webhook legítimo, poderia reenviá-lo depois (*replay*). Para evitar, o provedor inclui um **timestamp** na assinatura:

```text
X-Assinatura-Timestamp: 1767225600
X-Assinatura: hex( HMAC_SHA256(segredo, "1767225600." + corpo) )
```

O receptor recalcula a assinatura **e** rejeita mensagens com timestamp muito antigo (ex.: mais de 5 minutos). Assim, uma mensagem capturada não pode ser reaproveitada depois.

### Comparação em tempo constante

Comparar strings com `===` para logo no primeiro caractere diferente; em teoria, medindo o tempo da resposta, um atacante poderia descobrir a assinatura aos poucos. No servidor, use comparações em tempo constante (`crypto.timingSafeEqual` no Node, `hmac.compare_digest` no Python).

### Checklist do receptor de webhooks

- [ ] verificar a assinatura sobre o corpo **bruto**;
- [ ] rejeitar timestamps antigos;
- [ ] responder 2xx **rápido** e processar em segundo plano;
- [ ] ignorar eventos já processados (pelo `id`);
- [ ] não depender da ordem de chegada;
- [ ] registrar o que chegou para investigar problemas.

:::exercicio js exports=assinar
Crie **`assinar(corpo, segredo)`** que retorna o **HMAC-SHA256** de `corpo` com `segredo` em **hexadecimal** (use `crypto.subtle`, como na aula).

Termine com `return await assinar('{"evento":"teste"}', 'segredo');`.
@@starter
async function assinar(corpo, segredo) {
  return '';
}

return await assinar('{"evento":"teste"}', 'segredo');
@@solution
async function assinar(corpo, segredo) {
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', chave, enc.encode(corpo));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

return await assinar('{"evento":"teste"}', 'segredo');
@@check
async (ctx) => {
  const f = ctx.exports.assinar;
  if (typeof f !== 'function') return 'Defina assinar';
  if (await f('{"evento":"pedido.pago","pedidoId":1}', 'whsec_demo') !== 'd74ab924111a093e1a984985d5cf927e525b1e2c71da790b394b9aa5cb812a25') return 'O HMAC-SHA256 em hexadecimal não confere (teste com o webhook da aula)';
  const a = await f('abc', 'k1'), b = await f('abc', 'k2');
  if (a === b || a.length !== 64) return 'Segredos diferentes devem gerar assinaturas diferentes de 64 caracteres hexadecimais';
  return true;
}
:::

:::exercicio js exports=verificar
Crie **`verificar(corpo, timestamp, assinatura, segredo, agora)`** que retorna `true` somente se:
1. `|agora − timestamp|` for **no máximo 300** segundos;
2. `assinatura` for o HMAC-SHA256 (hex) de **`` `${timestamp}.${corpo}` ``** com `segredo`.

Termine com `return await verificar('{}', 1000, 'x', 's', 1000);` (deve dar `false`).
@@starter
async function verificar(corpo, timestamp, assinatura, segredo, agora) {
  return true;
}

return await verificar('{}', 1000, 'x', 's', 1000);
@@solution
async function hmacHex(segredo, texto) {
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', chave, enc.encode(texto));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verificar(corpo, timestamp, assinatura, segredo, agora) {
  if (Math.abs(agora - timestamp) > 300) return false;
  return (await hmacHex(segredo, `${timestamp}.${corpo}`)) === assinatura;
}

return await verificar('{}', 1000, 'x', 's', 1000);
@@check
async (ctx) => {
  const f = ctx.exports.verificar;
  if (typeof f !== 'function') return 'Defina verificar';
  if (ctx.result !== false) return 'Assinatura inválida deve retornar false';
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode('whsec'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const hex = async t => [...new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');
  const corpo = '{"id":"evt_1"}', ts = 1767225600;
  const sig = await hex(`${ts}.${corpo}`);
  if (await f(corpo, ts, sig, 'whsec', ts + 10) !== true) return 'Assinatura correta dentro da janela deve retornar true';
  if (await f(corpo, ts, sig, 'whsec', ts + 300) !== true) return 'Exatamente 300 s ainda é aceito';
  if (await f(corpo, ts, sig, 'whsec', ts + 301) !== false) return 'Mais de 300 s → false (proteção contra replay)';
  if (await f(corpo, ts, sig, 'whsec', ts - 400) !== false) return 'Timestamp muito no futuro também deve ser rejeitado';
  if (await f(corpo + ' ', ts, sig, 'whsec', ts) !== false) return 'Corpo alterado → false';
  if (await f(corpo, ts + 1, sig, 'whsec', ts) !== false) return 'Timestamp alterado → false (ele faz parte da assinatura)';
  if (await f(corpo, ts, await hex(corpo), 'whsec', ts) !== false) return 'A assinatura deve ser sobre "timestamp.corpo", não só o corpo';
  return true;
}
:::

:::exercicio js exports=criarReceptor
Crie **`criarReceptor()`** que retorna a função **`processar(evento)`** para eventos `{ id, tipo, dados: { pedidoId } }`:
- eventos com `id` **já processado** são ignorados (retorne `'duplicado'`);
- `'pedido.pago'` marca o pedido como `'pago'` e `'pedido.enviado'` como `'enviado'` num objeto de estado; retorne `'ok'`;
- tipos desconhecidos são registrados como processados, sem mudar o estado; retorne `'ignorado'`;
- o estado **nunca volta atrás**: um `'pedido.pago'` que chegar **depois** de `'pedido.enviado'` (fora de ordem) não muda o status (`enviado` vence `pago`).

O receptor expõe o estado em **`processar.estado`** (objeto `{ pedidoId: status }`). Termine com um exemplo e `return processar.estado;`.
@@starter
function criarReceptor() {
  const processar = (evento) => 'ok';
  processar.estado = {};
  return processar;
}

const processar = criarReceptor();
processar({ id: 'e1', tipo: 'pedido.pago', dados: { pedidoId: 1 } });
return processar.estado;
@@solution
function criarReceptor() {
  const vistos = new Set();
  const ordem = { pago: 1, enviado: 2 };
  const processar = (evento) => {
    if (vistos.has(evento.id)) return 'duplicado';
    vistos.add(evento.id);
    const novo = { 'pedido.pago': 'pago', 'pedido.enviado': 'enviado' }[evento.tipo];
    if (!novo) return 'ignorado';
    const id = evento.dados.pedidoId;
    const atual = processar.estado[id];
    if (!atual || ordem[novo] > ordem[atual]) processar.estado[id] = novo;
    return 'ok';
  };
  processar.estado = {};
  return processar;
}

const processar = criarReceptor();
processar({ id: 'e1', tipo: 'pedido.pago', dados: { pedidoId: 1 } });
return processar.estado;
@@check
(ctx) => {
  const f = ctx.exports.criarReceptor;
  if (typeof f !== 'function') return 'Defina criarReceptor';
  const p = f();
  const r = [
    p({ id: 'a', tipo: 'pedido.pago', dados: { pedidoId: 1 } }),
    p({ id: 'a', tipo: 'pedido.pago', dados: { pedidoId: 1 } }),
    p({ id: 'b', tipo: 'pedido.enviado', dados: { pedidoId: 2 } }),
    p({ id: 'c', tipo: 'pedido.pago', dados: { pedidoId: 2 } }),
    p({ id: 'd', tipo: 'cliente.criado', dados: { pedidoId: 3 } }),
    p({ id: 'd', tipo: 'cliente.criado', dados: { pedidoId: 3 } }),
    p({ id: 'e', tipo: 'pedido.enviado', dados: { pedidoId: 1 } }),
  ];
  if (JSON.stringify(r) !== JSON.stringify(['ok', 'duplicado', 'ok', 'ok', 'ignorado', 'duplicado', 'ok'])) return `Retornos esperados: ok, duplicado, ok, ok, ignorado, duplicado, ok (veio ${r.join(', ')})`;
  if (JSON.stringify(p.estado) !== JSON.stringify({ 1: 'enviado', 2: 'enviado' })) return `Estado esperado { 1: "enviado", 2: "enviado" } (o pago fora de ordem não pode voltar o pedido 2), veio ${JSON.stringify(p.estado)}`;
  if (Object.keys(f().estado).length) return 'Cada receptor deve ter seu próprio estado';
  return true;
}
:::
