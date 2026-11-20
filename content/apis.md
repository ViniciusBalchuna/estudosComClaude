# COURSE apis
name: APIs REST
icon: 🔌
color: #06b6d4
desc: Do básico (HTTP, métodos, status, JSON) ao avançado: autenticação, OAuth/JWT, CORS, paginação, idempotência, cache com ETag, HATEOAS, OpenAPI e webhooks.
titles: Visitante | Cliente Curioso | Mensageiro HTTP | Projetista de Rotas | Guardião de Endpoints | Arquiteto REST

## MODULE m1 | Fundamentos de HTTP e REST
desc: O que é uma API, as restrições REST, métodos HTTP, códigos de status, URLs, headers e JSON.

### LESSON api-01 | O que é uma API e o que é REST
goal: entender o papel de uma API, o modelo cliente-servidor e as restrições do estilo REST.
minutes: 12

## API

**API** (*Application Programming Interface*) é um **contrato** que define como um programa pede coisas a outro. Uma **API web** faz isso pela rede, normalmente via **HTTP**: o **cliente** (app, site, outro servidor) envia uma **requisição** e o **servidor** devolve uma **resposta**.

```http
GET /usuarios/1 HTTP/1.1
Host: api.loja.exemplo
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": 1, "nome": "Ana Souza", "email": "ana@exemplo.com", "ativo": true}
```

## REST

**REST** (*Representational State Transfer*) é um **estilo de arquitetura** descrito por Roy Fielding em sua tese (2000). Não é um protocolo nem um padrão com especificação: é um conjunto de **restrições**:

| Restrição | Significa |
|---|---|
| Cliente-servidor | interface e armazenamento separados, evoluindo de forma independente |
| **Sem estado** (*stateless*) | cada requisição carrega tudo o que é preciso; o servidor não guarda "sessão de conversa" |
| Cache | respostas dizem se podem ser guardadas em cache |
| **Interface uniforme** | recursos identificados por URIs, manipulados por representações, mensagens autodescritivas e hipermídia (HATEOAS) |
| Sistema em camadas | o cliente não sabe se fala com o servidor final ou com um intermediário (proxy, CDN, gateway) |
| Código sob demanda (opcional) | o servidor pode enviar código executável ao cliente |

**Recurso** é qualquer coisa nomeável (um usuário, um pedido); a **representação** é o formato em que ele trafega (geralmente JSON). Uma API que segue essas restrições é chamada de **RESTful**.

## O simulador deste curso

Os exercícios rodam JavaScript no seu navegador. O `fetch()` está ligado a uma **API simulada** da loja em `https://api.loja.exemplo`, com usuários, produtos, pedidos, autenticação, cache e mais. Você escreve código de verdade e o verificador confere as **requisições feitas** e os **resultados**.

```javascript
const resposta = await fetch('https://api.loja.exemplo/');
const dados = await resposta.json();
console.log(dados);
```

:::descomplica
Uma **API** é o **garçom do restaurante**. 🍽️ Você (o cliente) não entra na cozinha: você faz o pedido ao garçom, ele leva até a cozinha (o servidor) e traz o prato (a resposta).

O **REST** é um **jeito educado e organizado de fazer pedidos**: cada prato tem um nome certinho no cardápio (a URL), e o garçom não precisa lembrar do seu pedido anterior — **a cada pedido você diz tudo de novo** (isso é ser *sem estado*).
:::

:::choice
? O que significa a restrição REST "sem estado" (stateless)?
- [ ] O servidor não pode ter banco de dados
- [x] Cada requisição deve conter toda a informação necessária; o servidor não depende de contexto guardado de requisições anteriores do cliente
- [ ] As respostas não podem ter corpo
- [ ] O cliente não pode guardar dados
> Os dados (recursos) ficam no servidor normalmente; o que não se guarda é o estado da "conversa" entre requisições.
:::

:::code js
Faça um **GET** na raiz da API (`https://api.loja.exemplo/`), converta a resposta para JSON e mostre no console o campo **`mensagem`**.
@@starter
const BASE = 'https://api.loja.exemplo';

// faça o fetch aqui

@@solution
const BASE = 'https://api.loja.exemplo';
const resposta = await fetch(BASE + '/');
const dados = await resposta.json();
console.log(dados.mensagem);
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/')) return 'Faça um GET em https://api.loja.exemplo/';
  if (!ctx.logs.some(l => l.trim() === 'Bem-vindo à API da Loja')) return 'Mostre no console apenas o campo mensagem da resposta.';
  return true;
}
:::

### LESSON api-02 | Métodos HTTP: GET, POST, PUT, PATCH, DELETE e companhia
goal: escolher o método certo e entender os conceitos de método seguro e idempotente.
minutes: 14

## Os métodos

| Método | Uso típico em REST | Seguro? | Idempotente? |
|---|---|---|---|
| `GET` | ler um recurso ou coleção | sim | sim |
| `HEAD` | igual ao GET, mas só os headers | sim | sim |
| `OPTIONS` | perguntar o que é permitido (usado no CORS) | sim | sim |
| `POST` | criar um recurso numa coleção / executar ação | não | **não** |
| `PUT` | **substituir** o recurso inteiro (ou criar num URI conhecido) | não | sim |
| `PATCH` | alterar **parte** do recurso | não | não garantido |
| `DELETE` | remover | não | sim |

- **Seguro**: não altera o estado do servidor (só leitura).
- **Idempotente**: repetir a mesma requisição N vezes tem o **mesmo efeito** que fazê-la uma vez. Apagar o usuário 5 duas vezes deixa o sistema igual (o 2º DELETE pode responder 404, mas o estado é o mesmo). Criar com POST duas vezes cria **dois** recursos.

(Definições da RFC 9110, a especificação atual da semântica HTTP.)

## Mapeando operações (CRUD)

| Ação | Requisição |
|---|---|
| listar usuários | `GET /usuarios` |
| ver um usuário | `GET /usuarios/3` |
| criar | `POST /usuarios` + corpo JSON |
| substituir | `PUT /usuarios/3` + corpo completo |
| alterar o e-mail | `PATCH /usuarios/3` + `{"email": "..."}` |
| remover | `DELETE /usuarios/3` |

!> Erro comum: usar `GET /usuarios/3/apagar`. Em REST, a **ação** está no **método**, e a URL identifica o **recurso**.

:::descomplica
Os métodos são os **verbos** do pedido:
- **GET** = "me **mostra**" 👀
- **POST** = "**cria** um novo"
- **PUT** = "**troca tudo** por este aqui"
- **PATCH** = "**muda só** este pedacinho"
- **DELETE** = "**joga fora**" 🗑️

**Idempotente** é como **apertar o botão do elevador**: apertar 1 ou 10 vezes dá no mesmo — o elevador vem uma vez. Já o POST é como **pedir uma pizza**: pedir duas vezes chegam **duas pizzas**! 🍕🍕
:::

:::choice
? Qual destes métodos **não** é idempotente?
- [ ] PUT
- [ ] DELETE
- [x] POST
- [ ] GET
> Repetir um POST normalmente cria um novo recurso a cada vez.
:::

:::code js
Faça um **HEAD** em `https://api.loja.exemplo/usuarios/3` e mostre no console o **status** e o header **`Content-Type`** (use `resposta.headers.get(...)`). Depois faça um **GET** no mesmo endereço e mostre o **nome** do usuário.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const h = await fetch(BASE + '/usuarios/3', { method: 'HEAD' });
console.log(h.status, h.headers.get('Content-Type'));
const r = await fetch(BASE + '/usuarios/3');
const u = await r.json();
console.log(u.nome);
@@check
(ctx) => {
  const head = ctx.requests.find(r => r.method === 'HEAD' && r.path === '/usuarios/3');
  if (!head) return 'Faça uma requisição com method: "HEAD" para /usuarios/3';
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/usuarios/3')) return 'Faça também um GET em /usuarios/3';
  if (!ctx.logs.some(l => l.includes('200') && l.includes('application/json'))) return 'Mostre o status (200) e o Content-Type da resposta do HEAD';
  if (!ctx.logs.some(l => l.trim() === 'Carla Dias')) return 'Mostre o nome do usuário 3 retornado pelo GET';
  return true;
}
:::

### LESSON api-03 | Códigos de status HTTP
goal: interpretar e escolher os códigos de status corretos e ler erros no formato Problem Details.
minutes: 14

## As cinco famílias

| Faixa | Significado | Exemplos |
|---|---|---|
| **1xx** | informativo | 100 Continue |
| **2xx** | sucesso | 200 OK, 201 Created, 204 No Content |
| **3xx** | redirecionamento | 301 Moved Permanently, 304 Not Modified |
| **4xx** | erro do **cliente** | 400, 401, 403, 404, 409, 422, 429 |
| **5xx** | erro do **servidor** | 500, 502, 503, 504 |

## Os mais usados em APIs

| Código | Quando |
|---|---|
| 200 OK | sucesso com corpo |
| 201 Created | recurso criado (com header `Location` apontando para ele) |
| 204 No Content | sucesso sem corpo (comum em DELETE) |
| 400 Bad Request | requisição malformada (JSON inválido) |
| 401 Unauthorized | **não autenticado** (falta credencial ou é inválida) |
| 403 Forbidden | autenticado, mas **sem permissão** |
| 404 Not Found | recurso não existe |
| 405 Method Not Allowed | método não suportado nesse recurso (com header `Allow`) |
| 409 Conflict | conflito com o estado atual (ex.: e-mail já cadastrado) |
| 415 Unsupported Media Type | formato do corpo não aceito |
| 422 Unprocessable Content | corpo bem formado, mas com dados inválidos |
| 429 Too Many Requests | limite de requisições excedido |
| 500 Internal Server Error | falha inesperada no servidor |
| 503 Service Unavailable | servidor temporariamente indisponível |

## Problem Details (RFC 9457)

Um formato padrão para erros em JSON, com `Content-Type: application/problem+json`:

```json
{
  "type": "https://api.loja.exemplo/erros/nao-encontrado",
  "title": "Não encontrado",
  "status": 404,
  "detail": "Usuário 99 não existe."
}
```

A API simulada usa esse formato em todos os erros.

!> O `fetch` **não lança exceção** para 404 ou 500 — só para falhas de rede. Você precisa checar `resposta.ok` (true para 200–299) ou `resposta.status`.

:::descomplica
Os códigos de status são **carinhas** que o servidor manda junto com a resposta:
- **2xx** = 😀 "deu tudo certo!"
- **3xx** = 👉 "não é aqui, olha ali"
- **4xx** = 🤨 "**você** pediu errado" (404 = "isso não existe", 401 = "quem é você?", 403 = "sei quem você é, mas não pode")
- **5xx** = 😵 "**eu** (servidor) passei mal"
:::

:::choice
? Um usuário logado tenta apagar um pedido de outra pessoa e não tem permissão. Qual status é o mais adequado?
- [ ] 401
- [x] 403
- [ ] 404
- [ ] 400
> 401 é falta de autenticação; 403 é autenticado mas sem autorização. (Algumas APIs respondem 404 para não revelar que o recurso existe.)
:::

:::code js
Peça o usuário **99** (que não existe). **Sem** usar try/catch para isso, verifique `resposta.ok`: se for falso, leia o corpo de erro (Problem Details) e mostre no console a frase:

`Erro <status>: <title>`

(ex.: `Erro 404: Não encontrado`)
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/usuarios/99');
if (!r.ok) {
  const erro = await r.json();
  console.log(`Erro ${r.status}: ${erro.title}`);
}
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/usuarios/99')) return 'Faça um GET em /usuarios/99';
  if (!ctx.logs.some(l => l.trim() === 'Erro 404: Não encontrado')) return 'A saída deve ser exatamente "Erro 404: Não encontrado", lida da resposta';
  return true;
}
:::

### LESSON api-04 | URLs, query strings, headers e JSON
goal: montar URLs corretamente, usar parâmetros de consulta e entender headers e negociação de conteúdo.
minutes: 15

## Anatomia de uma URL

```text
https://api.loja.exemplo:443/v1/produtos/7?categoria=livros&ordenar=-preco#topo
└─┬─┘   └──────┬───────┘└┬┘└──────┬─────┘ └───────────┬────────────┘ └─┬┘
esquema       host     porta   caminho          query string        fragmento
```

- **Caminho** identifica o recurso: `/produtos/7`.
- **Query string** passa filtros, ordenação, paginação: `?categoria=livros&ordenar=-preco`.
- O **fragmento** (`#...`) nunca é enviado ao servidor.

Caracteres especiais precisam ser **codificados** (espaço vira `%20` ou `+`). Em JS, use `URL` e `URLSearchParams` em vez de concatenar à mão:

```javascript
const url = new URL('https://api.loja.exemplo/usuarios');
url.searchParams.set('nome', 'ana souza');   // vira ?nome=ana+souza
const r = await fetch(url);
```

## Headers

Metadados da requisição e da resposta (nomes **não** diferenciam maiúsculas/minúsculas):

| Header | Direção | Para quê |
|---|---|---|
| `Content-Type` | ambos | formato do corpo enviado (`application/json`) |
| `Accept` | requisição | formatos que o cliente aceita |
| `Authorization` | requisição | credenciais |
| `Location` | resposta | URL do recurso criado (201) ou do redirecionamento |
| `Cache-Control`, `ETag` | resposta | cache |
| `Retry-After` | resposta | quanto esperar (429/503) |

**Negociação de conteúdo**: o cliente diz o que aceita (`Accept: application/json`), e o servidor escolhe o formato e informa em `Content-Type`.

## JSON

**JSON** (*JavaScript Object Notation*, RFC 8259) é o formato mais usado em APIs: objetos `{}`, listas `[]`, strings com **aspas duplas**, números, `true`, `false` e `null`. Não aceita comentários nem vírgula sobrando no final.

```javascript
JSON.stringify({ nome: 'Ana', ativo: true });   // objeto → texto
JSON.parse('{"nome":"Ana"}');                    // texto → objeto
```

:::descomplica
A **URL** é o **endereço da casa** do recurso: rua (caminho) e um bilhetinho na porta (a query string: "quero só os livros, do mais caro pro mais barato"). 🏠

Os **headers** são as **etiquetas no pacote do correio**: "frágil", "conteúdo: JSON", "remetente: fulano". E o **JSON** é a **língua** que todo mundo combinou de usar para escrever a carta dentro do pacote. 📦
:::

:::choice
? Qual destes é JSON **válido**?
- [ ] `{nome: 'Ana'}`
- [ ] `{"nome": "Ana",}`
- [x] `{"nome": "Ana", "idade": null}`
- [ ] `{'nome': "Ana"}`
> JSON exige chaves e strings com aspas duplas e não permite vírgula final.
:::

:::code js
Usando **`URL`** e **`searchParams`**, busque em `/usuarios` apenas os usuários **ativos** (`ativo=true`) cujo nome contém **"a s"** (parâmetro `nome`; repare no espaço — deixe o `URLSearchParams` codificar).

Termine o código com `return` da **lista de nomes** retornada.
@@starter
const BASE = 'https://api.loja.exemplo';
const url = new URL(BASE + '/usuarios');
// configure os parâmetros

@@solution
const BASE = 'https://api.loja.exemplo';
const url = new URL(BASE + '/usuarios');
url.searchParams.set('ativo', 'true');
url.searchParams.set('nome', 'a s');
const r = await fetch(url);
const lista = await r.json();
return lista.map(u => u.nome);
@@check
(ctx) => {
  const req = ctx.requests.find(r => r.path === '/usuarios' && r.method === 'GET');
  if (!req) return 'Faça um GET em /usuarios';
  if (req.query.ativo !== 'true') return 'Envie o parâmetro ativo=true';
  if (req.query.nome !== 'a s') return 'Envie o parâmetro nome com o valor "a s"';
  if (!Array.isArray(ctx.result) || JSON.stringify(ctx.result) !== JSON.stringify(['Ana Souza'])) return 'Retorne (return) a lista de nomes vinda da API';
  return true;
}
:::

### EXAM
:::choice
? REST é:
- [ ] Um protocolo de rede como o TCP
- [x] Um estilo de arquitetura com restrições (cliente-servidor, sem estado, cache, interface uniforme…)
- [ ] Uma biblioteca JavaScript
- [ ] Um formato de dados como o JSON
> REST foi definido por Roy Fielding como estilo arquitetural; HTTP é o protocolo mais usado para implementá-lo.
:::

:::choice
? Qual status indica que um recurso foi **criado**?
- [ ] 200
- [x] 201
- [ ] 204
- [ ] 202
> 201 Created, idealmente com o header Location apontando para o novo recurso.
:::

:::choice
? Qual é a forma REST de **remover** o produto 7?
- [ ] `GET /produtos/7/remover`
- [ ] `POST /removerProduto?id=7`
- [x] `DELETE /produtos/7`
- [ ] `PUT /produtos/7/delete`
> A URL identifica o recurso; o método indica a ação.
:::

:::choice
? Um fetch para uma URL que responde 500 faz o quê?
- [ ] Lança uma exceção automaticamente
- [x] Resolve normalmente; é preciso checar `resposta.ok` ou `resposta.status`
- [ ] Repete a requisição
- [ ] Retorna undefined
> O fetch só rejeita a Promise em falhas de rede (ou requisição inválida).
:::

:::text
? Qual header da **resposta** informa o formato do corpo (ex.: `application/json`)?
= Content-Type
> Na requisição, `Accept` diz o que o cliente aceita; `Content-Type` descreve o corpo enviado.
:::

:::choice
? Diferença entre PUT e PATCH:
- [x] PUT substitui o recurso inteiro; PATCH altera parcialmente
- [ ] PUT cria; PATCH apaga
- [ ] São sinônimos
- [ ] PATCH é idempotente por definição e PUT não
> PUT é idempotente; PATCH não tem essa garantia em geral.
:::

:::choice
? O status 422 costuma indicar:
- [ ] Servidor fora do ar
- [ ] Rota inexistente
- [x] Corpo bem formado, mas com dados que não passam na validação
- [ ] Falta de autenticação
> 400 = malformado; 422 = semanticamente inválido (ex.: e-mail sem @).
:::

:::choice
? A parte `#secao` de uma URL:
- [ ] É enviada ao servidor como parâmetro
- [x] Não é enviada ao servidor; é usada só pelo cliente
- [ ] Define o método HTTP
- [ ] Define a porta
> O fragmento é tratado apenas no navegador/cliente.
:::

## MODULE m2 | Consumindo e projetando APIs
desc: fetch com async/await, envio de dados, design de recursos e versionamento, paginação e filtros.

### LESSON api-05 | fetch na prática: async/await e tratamento de erros
goal: escrever funções de acesso à API robustas, tratando sucesso, erros HTTP e falhas de rede.
minutes: 15

## Promises e async/await

`fetch` devolve uma **Promise** (um valor que chega no futuro). Com `await`, o código espera o resultado sem travar a página:

```javascript
async function buscarUsuario(id) {
  const resposta = await fetch(`https://api.loja.exemplo/usuarios/${id}`);
  if (resposta.status === 404) return null;            // não existe
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.json();                               // também é uma Promise
}
```

## Duas camadas de erro

| Tipo | Como aparece | Como tratar |
|---|---|---|
| Falha de rede/DNS/CORS | a Promise **rejeita** (`TypeError`) | `try/catch` |
| Erro HTTP (4xx/5xx) | a Promise **resolve** com `ok === false` | checar `status` |

```javascript
try {
  const u = await buscarUsuario(1);
} catch (e) {
  console.error('Falhou:', e.message);
}
```

## Detalhes importantes

- O corpo só pode ser lido **uma vez** (`json()`, `text()`…).
- `Promise.all([...])` dispara várias requisições em **paralelo** e espera todas.
- Para cancelar ou limitar o tempo: `AbortController` / `AbortSignal.timeout(5000)` no `signal` do fetch.

```javascript
const [a, b] = await Promise.all([buscarUsuario(1), buscarUsuario(3)]);
const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

:::descomplica
O **await** é como **esperar o micro-ondas apitar** antes de tirar a pipoca. ⏲️ Enquanto isso, você pode fazer outras coisas.

Existem dois tipos de problema: o **micro-ondas nem ligou** (falha de rede → o `try/catch` pega) ou **ligou, mas queimou a pipoca** (erro 404/500 → você precisa **olhar** se deu certo, com `resposta.ok`). 🍿
:::

:::choice
? Qual situação faz a Promise do `fetch` **rejeitar**?
- [ ] Resposta 404
- [ ] Resposta 500
- [x] Falha de rede (servidor inacessível)
- [ ] Resposta 201
> Erros HTTP chegam como respostas normais com `ok === false`.
:::

:::code js
Crie a função **`buscarUsuario(id)`** que:
- retorna o **objeto do usuário** (JSON) se existir;
- retorna **`null`** se a API responder **404**;
- **lança um `Error`** para qualquer outro status de erro.

Depois, use **`Promise.all`** para buscar os usuários **1, 3 e 99** em paralelo e `return` a lista resultante (o 99 virá `null`).
@@starter
const BASE = 'https://api.loja.exemplo';

async function buscarUsuario(id) {
  // ...
}

@@solution
const BASE = 'https://api.loja.exemplo';

async function buscarUsuario(id) {
  const r = await fetch(`${BASE}/usuarios/${id}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

return await Promise.all([buscarUsuario(1), buscarUsuario(3), buscarUsuario(99)]);
@@check
(ctx) => {
  const r = ctx.result;
  if (!Array.isArray(r) || r.length !== 3) return 'Retorne a lista com os 3 resultados de Promise.all';
  if (!r[0] || r[0].nome !== 'Ana Souza') return 'O primeiro item deveria ser o usuário 1 (Ana Souza)';
  if (!r[1] || r[1].nome !== 'Carla Dias') return 'O segundo item deveria ser o usuário 3 (Carla Dias)';
  if (r[2] !== null) return 'Para o usuário 99 (404) a função deve retornar null';
  const ids = ctx.requests.filter(q => q.method === 'GET').map(q => q.path).sort();
  if (JSON.stringify(ids) !== JSON.stringify(['/usuarios/1', '/usuarios/3', '/usuarios/99'])) return 'Faça um GET para cada usuário (1, 3 e 99)';
  return true;
}
:::

### LESSON api-06 | Enviando dados: POST, PUT, PATCH e DELETE
goal: criar, substituir, alterar e remover recursos enviando JSON corretamente.
minutes: 16

## Enviando JSON

```javascript
const r = await fetch('https://api.loja.exemplo/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },     // avisa o formato!
  body: JSON.stringify({ nome: 'Lia Mendes', email: 'lia@exemplo.com' }),
});
console.log(r.status);                    // 201
console.log(r.headers.get('Location'));   // /usuarios/6
const criado = await r.json();
```

Esquecer o `Content-Type` ou enviar o objeto sem `JSON.stringify` é o erro mais comum (a API simulada responde **415** ou **400**).

## PUT x PATCH na prática

```javascript
// PUT: envia o recurso COMPLETO (o que faltar é perdido/assume padrão)
await fetch(`${BASE}/usuarios/6`, { method: 'PUT', headers, body: JSON.stringify({ nome: 'Lia M.', email: 'lia@exemplo.com', ativo: true }) });

// PATCH: envia só o que muda
await fetch(`${BASE}/usuarios/6`, { method: 'PATCH', headers, body: JSON.stringify({ ativo: false }) });

// DELETE: normalmente responde 204 No Content (sem corpo — não chame .json()!)
const d = await fetch(`${BASE}/usuarios/6`, { method: 'DELETE' });
console.log(d.status); // 204
```

Formatos padronizados de PATCH existem: **JSON Merge Patch** (RFC 7396, `application/merge-patch+json`) e **JSON Patch** (RFC 6902, lista de operações `add`/`remove`/`replace`).

## Validação no servidor

Mesmo que o front-end valide, a API **sempre** valida de novo: o cliente pode ser qualquer programa. Respostas típicas: **400** (malformado), **422** (dados inválidos, com a lista de erros), **409** (conflito, ex.: e-mail duplicado).

:::descomplica
- **POST** é **entregar uma ficha nova** preenchida para a secretária guardar. Ela responde "guardei na gaveta 6!" (o `Location`). 📝
- **PUT** é **jogar fora a ficha velha e colocar uma nova inteirinha**.
- **PATCH** é **corrigir só uma linha** da ficha com corretivo.
- **DELETE** é **rasgar a ficha**.

E o `Content-Type: application/json` é avisar: "**essa ficha está escrita em JSON**, tá?"
:::

:::choice
? Você esqueceu `JSON.stringify` e passou `body: { nome: 'Ana' }`. O que é enviado?
- [ ] O JSON correto
- [x] O texto "[object Object]"
- [ ] Nada
- [ ] Um erro de compilação
> Objetos são convertidos com toString(), virando "[object Object]".
:::

:::code js
Faça o ciclo completo com a usuária **Lia Mendes** (`lia@exemplo.com`):
1. **crie** com POST e guarde o `id` retornado;
2. **desative** com **PATCH** (`ativo: false`);
3. **mude o nome** para `Lia M.` com outro PATCH;
4. **apague** o usuário **2** com DELETE.

Termine com `return` do objeto final da Lia (resposta do último PATCH).
@@starter
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

@@solution
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };
const r = await fetch(BASE + '/usuarios', { method: 'POST', headers, body: JSON.stringify({ nome: 'Lia Mendes', email: 'lia@exemplo.com' }) });
const { id } = await r.json();
await fetch(`${BASE}/usuarios/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ ativo: false }) });
const r2 = await fetch(`${BASE}/usuarios/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ nome: 'Lia M.' }) });
await fetch(`${BASE}/usuarios/2`, { method: 'DELETE' });
return await r2.json();
@@check
(ctx) => {
  const lia = ctx.api.usuarios.find(u => u.email === 'lia@exemplo.com');
  if (!lia) return 'A usuária Lia não foi criada (confira method, headers e JSON.stringify)';
  if (lia.ativo !== false) return 'A Lia deveria estar com ativo = false';
  if (lia.nome !== 'Lia M.') return 'O nome da Lia deveria ser "Lia M."';
  if (ctx.requests.filter(r => r.method === 'PATCH').length < 2) return 'Use PATCH para as alterações';
  if (ctx.requests.some(r => r.method === 'PUT')) return 'Use PATCH (alteração parcial), não PUT';
  if (ctx.api.usuarios.some(u => u.id === 2)) return 'O usuário 2 deveria ter sido apagado';
  if (!ctx.result || ctx.result.nome !== 'Lia M.' || ctx.result.ativo !== false) return 'Retorne o objeto da Lia vindo do último PATCH';
  return true;
}
:::

### LESSON api-07 | Design de recursos, rotas e versionamento
goal: projetar URLs consistentes, modelar relacionamentos e versionar uma API sem quebrar clientes.
minutes: 14

## Boas práticas de nomes

| Faça | Evite |
|---|---|
| substantivos no plural: `/produtos` | verbos: `/listarProdutos` |
| hierarquia para relações: `/usuarios/3/pedidos` | aninhamento profundo: `/a/1/b/2/c/3/d` |
| minúsculas e hífens: `/itens-pedido` | `/ItensPedido`, `/itens_pedido` (ambos funcionam, mas mantenha um padrão) |
| filtros na query: `/pedidos?status=pendente` | `/pedidos/pendentes/apenas` |
| IDs estáveis e opacos | expor detalhes internos do banco |

**Ações que não são CRUD**: modele como sub-recurso ou recurso de "comando", sempre com POST: `POST /pedidos/1/cancelar`, `POST /pagamentos/9/estornos`.

## Respostas consistentes

- Use os mesmos nomes de campos em toda a API (`criado_em` ou `createdAt`, não os dois).
- Datas em **ISO 8601** com fuso: `"2025-04-25T14:30:00Z"`.
- Erros sempre no mesmo formato (Problem Details).
- Após criar, responda **201** com `Location`.

## Versionamento

Mudanças **compatíveis** (adicionar um campo opcional, um endpoint novo) não exigem nova versão. Mudanças **incompatíveis** (remover/renomear campo, mudar tipo, mudar significado) exigem.

| Estratégia | Exemplo |
|---|---|
| no caminho | `/v1/produtos`, `/v2/produtos` (a mais comum) |
| em header | `Accept: application/vnd.loja.v2+json` ou um header próprio |
| na query | `/produtos?versao=2` |

Ao descontinuar uma versão, avise com antecedência; os headers `Deprecation` e `Sunset` (RFC 8594) comunicam isso de forma padronizada.

:::descomplica
Projetar rotas é **organizar uma biblioteca**. 📚 As estantes têm nomes simples ("Livros", "Revistas"), e dentro delas ficam os itens ("Livros, número 3"). Você não escreve "**pegue** os livros" na estante — o verbo é você que faz (GET, POST...).

**Versionar** é como lançar a **2ª edição** de um livro: quem tem a 1ª continua lendo a dela sem problemas.
:::

:::choice
? Qual rota segue melhor as convenções REST para os pedidos do usuário 3?
- [ ] `GET /getPedidosDoUsuario?id=3`
- [x] `GET /usuarios/3/pedidos`
- [ ] `POST /usuarios/3/pedidos/listar`
- [ ] `GET /Usuario/3/Pedido`
> Substantivos no plural e hierarquia para indicar o relacionamento.
:::

:::code js
Crie o usuário **Rui Costa** (`rui@exemplo.com`) e, **sem montar a URL na mão**, leia o header **`Location`** da resposta e faça um **GET** nesse endereço (ele é relativo: combine com a base usando `new URL(location, BASE)`).

`return` o objeto obtido no GET.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nome: 'Rui Costa', email: 'rui@exemplo.com' }),
});
const location = r.headers.get('Location');
const r2 = await fetch(new URL(location, BASE));
return await r2.json();
@@check
(ctx) => {
  const post = ctx.requests.find(r => r.method === 'POST' && r.path === '/usuarios');
  if (!post) return 'Crie o usuário com POST /usuarios';
  const rui = ctx.api.usuarios.find(u => u.email === 'rui@exemplo.com');
  if (!rui) return 'O usuário Rui não foi criado';
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/usuarios/' + rui.id)) return 'Faça um GET no endereço indicado pelo header Location';
  if (!ctx.result || ctx.result.id !== rui.id || ctx.result.nome !== 'Rui Costa') return 'Retorne o objeto obtido no GET';
  return true;
}
:::

### LESSON api-08 | Paginação, filtros e ordenação
goal: consumir e projetar coleções grandes com paginação por página/offset e por cursor.
minutes: 15

## Por que paginar

Devolver 1 milhão de registros de uma vez é lento e caro. A API devolve **páginas**.

## Estilos de paginação

| Estilo | Requisição | Prós | Contras |
|---|---|---|---|
| página/limite | `?pagina=2&limite=20` | simples, permite pular páginas | itens podem "pular" se houver inserções; `OFFSET` grande é lento no banco |
| offset/limit | `?offset=40&limit=20` | idem | idem |
| **cursor** (keyset) | `?depois=eyJpZCI6NDB9&limite=20` | estável e rápido em grandes volumes | não dá para pular direto para a página 50 |

A resposta costuma trazer metadados (total, próxima página) no corpo ou no header `Link` (RFC 8288):

```json
{ "dados": [...], "pagina": 1, "limite": 5, "total": 12, "total_paginas": 3, "proxima": 2 }
```

```http
Link: <https://api.loja.exemplo/produtos?pagina=2>; rel="next", <...pagina=3>; rel="last"
```

## Filtros e ordenação

```text
GET /produtos?categoria=livros&busca=python&ordenar=-preco&pagina=1&limite=10
```

Convenções comuns: `ordenar=preco` (crescente), `ordenar=-preco` (decrescente), campos de filtro com o mesmo nome do atributo e um limite máximo de `limite` (a API simulada aceita até 50).

## Percorrendo todas as páginas

```javascript
let pagina = 1, todos = [];
while (pagina) {
  const r = await fetch(`${BASE}/produtos?pagina=${pagina}&limite=5`);
  const corpo = await r.json();
  todos.push(...corpo.dados);
  pagina = corpo.proxima;        // null na última página → sai do laço
}
```

:::descomplica
Paginação é como **ler um livro grosso**: ninguém lê as 1000 páginas de uma vez — você lê uma página, vira, lê a próxima. 📖 A API diz "**essa é a página 1 de 3, a próxima é a 2**".

O **cursor** é um **marcador de página**: "continua de onde eu parei", mesmo que alguém tenha colocado folhas novas no livro.
:::

:::choice
? Qual problema a paginação por **cursor** resolve melhor que a por página/offset?
- [ ] Permite pular direto para qualquer página
- [x] Resultados estáveis mesmo com inserções durante a navegação e boa performance em grandes volumes
- [ ] Elimina a necessidade de ordenação
- [ ] Retorna todos os registros de uma vez
> O cursor aponta para "depois do último item visto", sem depender de OFFSET.
:::

:::code js
Busque **todos** os produtos da categoria **`casa`**, ordenados por **preço decrescente** (`ordenar=-preco`), usando **`limite=2`** e percorrendo **todas as páginas** pelo campo `proxima`.

`return` a lista de **nomes** na ordem recebida.
@@starter
const BASE = 'https://api.loja.exemplo';
const nomes = [];

return nomes;
@@solution
const BASE = 'https://api.loja.exemplo';
const nomes = [];
let pagina = 1;
while (pagina) {
  const r = await fetch(`${BASE}/produtos?categoria=casa&ordenar=-preco&limite=2&pagina=${pagina}`);
  const corpo = await r.json();
  nomes.push(...corpo.dados.map(p => p.nome));
  pagina = corpo.proxima;
}
return nomes;
@@check
(ctx) => {
  const reqs = ctx.requests.filter(r => r.path === '/produtos');
  if (!reqs.length) return 'Faça GET em /produtos';
  if (!reqs.every(r => r.query.limite === '2')) return 'Use limite=2 em todas as páginas';
  if (!reqs.every(r => r.query.categoria === 'casa' && r.query.ordenar === '-preco')) return 'Filtre categoria=casa e ordene com ordenar=-preco em todas as páginas';
  if (reqs.length !== 3) return 'São 5 produtos de casa: com limite=2 você precisa de 3 páginas';
  const esp = ['Luminária', 'Vaso', 'Almofada', 'Caneca', 'Caderno'];
  if (JSON.stringify(ctx.result) !== JSON.stringify(esp)) return 'A lista retornada não confere (ordem por preço decrescente, todas as páginas)';
  return true;
}
:::

### EXAM
:::choice
? Qual header indica onde está um recurso recém-criado?
- [ ] Content-Location é obrigatório
- [x] Location
- [ ] Host
- [ ] Referer
> 201 Created + Location: /recurso/id.
:::

:::choice
? O `fetch` com `body: JSON.stringify(obj)` precisa também de qual header para a API entender o corpo?
- [ ] `Accept: text/html`
- [x] `Content-Type: application/json`
- [ ] `Authorization`
- [ ] `Cache-Control`
> Sem ele, muitos servidores tratam o corpo como texto e respondem 415 ou 400.
:::

:::choice
? Por que não chamar `resposta.json()` numa resposta 204?
- [ ] Porque 204 é erro
- [x] Porque 204 não tem corpo, e o parse de um corpo vazio falha
- [ ] Porque json() só funciona em GET
- [ ] Não há problema
> 204 No Content: sucesso sem corpo.
:::

:::choice
? Qual destas mudanças exige uma **nova versão** da API?
- [ ] Adicionar um campo opcional na resposta
- [ ] Criar um endpoint novo
- [x] Renomear o campo `email` para `e_mail`
- [ ] Melhorar a performance
> Renomear ou remover campos quebra clientes existentes.
:::

:::text
? Qual função do JavaScript dispara várias Promises em paralelo e espera todas terminarem? (`Promise.___`)
= all | Promise.all
> `Promise.all` rejeita se alguma falhar; `Promise.allSettled` espera todas e informa o resultado de cada.
:::

:::choice
? Qual é o modo REST mais adequado de cancelar o pedido 10?
- [ ] `GET /pedidos/10?cancelar=true`
- [x] `POST /pedidos/10/cancelar` (ou PATCH do status, conforme o design)
- [ ] `DELETE /cancelar/10`
- [ ] `GET /cancelarPedido/10`
> GET nunca deve alterar estado. Ações viram sub-recursos com POST ou mudanças de estado com PATCH.
:::

:::choice
? Paginação `?pagina=50&limite=20` em SQL costuma virar `LIMIT 20 OFFSET 980`. Qual é o problema em tabelas enormes?
- [ ] Nenhum
- [x] O banco ainda precisa percorrer e descartar as linhas puladas, ficando lento
- [ ] OFFSET não existe em SQL
- [ ] Retorna linhas duplicadas sempre
> Por isso a paginação por cursor (keyset: WHERE id > ultimo_id) escala melhor.
:::

:::choice
? Em `ordenar=-preco`, o sinal de menos indica (convenção comum):
- [x] ordem decrescente
- [ ] excluir o campo preço
- [ ] preço negativo
- [ ] ordem aleatória
> É uma convenção (usada por várias APIs), não um padrão obrigatório; documente sempre.
:::

## MODULE m3 | Segurança e robustez
desc: API keys, Basic e Bearer, OAuth 2.0 e JWT, CORS e HTTPS, limites de taxa e retentativas com backoff.

### LESSON api-09 | Autenticação: API key, Basic e Bearer
goal: diferenciar autenticação de autorização e enviar credenciais corretamente.
minutes: 15

## Autenticação x autorização

- **Autenticação**: *quem é você?* (401 quando falha)
- **Autorização**: *o que você pode fazer?* (403 quando falha)

## Esquemas comuns

| Esquema | Como vai na requisição | Observações |
|---|---|---|
| **API key** | header próprio, ex.: `X-API-Key: abc123` | identifica a aplicação; simples; rotacione as chaves |
| **Basic** | `Authorization: Basic base64(usuario:senha)` | base64 **não é criptografia**: só com HTTPS |
| **Bearer token** | `Authorization: Bearer <token>` | "quem portar o token tem acesso"; tokens com validade curta |

```javascript
await fetch(`${BASE}/chave/relatorio`, { headers: { 'X-API-Key': 'chave-demo-123' } });
await fetch(`${BASE}/privado/perfil`, { headers: { Authorization: `Bearer ${token}` } });
```

Quando a autenticação falta, o servidor responde **401** com o header `WWW-Authenticate` indicando o esquema esperado (ex.: `Bearer realm="loja"`).

## Cuidados

- **Nunca** coloque credenciais na URL (`?api_key=...`): URLs vão parar em logs, histórico e headers `Referer`.
- Não guarde chaves secretas no front-end (o usuário consegue ver o código). Chaves de serviços pagos ficam no **back-end**.
- Use **HTTPS** sempre.

:::descomplica
- **Autenticação** é o porteiro perguntando "**quem é você?**" e olhando seu crachá. 🪪
- **Autorização** é o porteiro dizendo "**você pode ir só até o 2º andar**".
- A **API key** é uma **senha do clube** que você fala na portaria.
- O **token Bearer** é uma **pulseira de festa**: quem está com ela entra — por isso ela vence rapidinho e não se empresta!
:::

:::choice
? Por que Basic Auth só deve ser usado com HTTPS?
- [ ] Porque o navegador exige
- [x] Porque base64 é só uma codificação, facilmente revertida; sem TLS a senha trafega legível
- [ ] Porque Basic Auth é criptografado só no HTTPS
- [ ] Não há relação
> Codificar não é criptografar: `atob('YWx1bm86MTIzNA==')` devolve `aluno:1234`.
:::

:::code js
O endpoint `GET /chave/relatorio` exige o header **`X-API-Key`**.
1. Chame **sem** a chave e mostre o **status** recebido;
2. chame **com** a chave `chave-demo-123` e `return` o JSON do relatório.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const semChave = await fetch(BASE + '/chave/relatorio');
console.log(semChave.status);
const r = await fetch(BASE + '/chave/relatorio', { headers: { 'X-API-Key': 'chave-demo-123' } });
return await r.json();
@@check
(ctx) => {
  const reqs = ctx.requests.filter(r => r.path === '/chave/relatorio');
  if (!reqs.some(r => !r.headers['x-api-key'])) return 'Faça primeiro uma chamada sem a chave';
  if (!ctx.logs.some(l => l.trim() === '401')) return 'Mostre o status da chamada sem chave (deve ser 401)';
  if (!reqs.some(r => r.headers['x-api-key'] === 'chave-demo-123')) return 'Envie o header X-API-Key com a chave correta';
  if (!ctx.result || ctx.result.vendas_mes !== 1520.4) return 'Retorne o JSON do relatório';
  return true;
}
:::

### LESSON api-10 | OAuth 2.0 e JWT
goal: entender os fluxos do OAuth 2.0, a estrutura de um JWT e como usar tokens de acesso.
minutes: 18

## OAuth 2.0 em uma frase

**OAuth 2.0** (RFC 6749) é um **framework de autorização**: permite que um app acesse recursos **em nome do usuário** sem conhecer a senha dele, recebendo um **token de acesso** emitido por um **servidor de autorização**.

Papéis: **dono do recurso** (usuário), **cliente** (o app), **servidor de autorização** (emite tokens) e **servidor de recursos** (a API).

| Fluxo (*grant*) | Quando usar |
|---|---|
| **Authorization Code + PKCE** | apps web, mobile e SPAs com usuário (o recomendado hoje) |
| **Client Credentials** | máquina para máquina, sem usuário |
| Refresh Token | trocar um token expirado por um novo sem pedir login de novo |
| ~~Implicit~~ e ~~Password~~ | desaconselhados pelas boas práticas atuais de segurança do OAuth |

**OpenID Connect (OIDC)** é uma camada sobre o OAuth 2.0 para **autenticação** ("login com Google"), que acrescenta o *ID token*.

## JWT

Um **JWT** (JSON Web Token, RFC 7519) tem três partes em **base64url** separadas por ponto:

```text
xxxxx.yyyyy.zzzzz
header.payload.assinatura
```

- **header**: algoritmo, ex.: `{"alg":"HS256","typ":"JWT"}`
- **payload**: as *claims*: `sub` (quem), `exp` (expira em, segundos desde 1970), `iat` (emitido em), `iss`, `aud`, e dados próprios (`papel`).
- **assinatura**: garante que ninguém alterou header e payload.

!> O payload de um JWT assinado é **apenas codificado, não criptografado**: qualquer um lê. Nunca coloque segredos nele. O servidor **precisa verificar** a assinatura, o `exp` e o `aud` antes de confiar.

## Decodificando o payload no cliente

```javascript
function lerPayload(jwt) {
  const parte = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(parte));
}
```

(Ler no cliente serve para exibir informações; **validar** é trabalho do servidor.)

:::descomplica
O **OAuth** é como dar uma **chave de manobrista** para o carro: o manobrista consegue estacionar, mas **não** abre o porta-malas nem fica com a sua chave principal. 🚗🔑

O **JWT** é um **ingresso de show com holograma**: está escrito nele "Nome: Ana, Setor: Pista, Válido até 22h". Todo mundo consegue **ler** o ingresso, mas ninguém consegue **falsificar** o holograma (a assinatura).
:::

:::choice
? Qual é o fluxo OAuth 2.0 recomendado para um aplicativo mobile ou SPA com usuário?
- [ ] Implicit
- [ ] Password (Resource Owner Password Credentials)
- [x] Authorization Code com PKCE
- [ ] Client Credentials
> PKCE protege a troca do código mesmo sem um segredo de cliente.
:::

:::code js
1. Obtenha um token com **POST `/auth/token`** enviando o JSON `{"usuario": "aluno", "senha": "1234"}`;
2. **decodifique o payload** do `access_token` (JWT) e mostre no console o campo **`papel`**;
3. chame **GET `/privado/perfil`** com o header `Authorization: Bearer <token>` e `return` o JSON do perfil.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario: 'aluno', senha: '1234' }),
});
const { access_token } = await r.json();
const payload = JSON.parse(atob(access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
console.log(payload.papel);
const perfil = await fetch(BASE + '/privado/perfil', { headers: { Authorization: 'Bearer ' + access_token } });
return await perfil.json();
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'POST' && r.path === '/auth/token')) return 'Peça o token com POST /auth/token';
  const p = ctx.requests.find(r => r.path === '/privado/perfil');
  if (!p) return 'Chame GET /privado/perfil';
  if (p.headers.authorization !== 'Bearer ' + ctx.MockAPI.JWT) return 'Envie o header Authorization: Bearer <access_token>';
  if (!ctx.logs.some(l => l.trim() === 'estudante')) return 'Mostre no console o campo papel do payload do JWT';
  if (!ctx.result || ctx.result.usuario !== 'aluno') return 'Retorne o JSON do perfil';
  return true;
}
:::

### LESSON api-11 | CORS e HTTPS
goal: entender a política de mesma origem, o funcionamento do CORS e por que HTTPS é obrigatório.
minutes: 15

## Política de mesma origem

**Origem** = esquema + host + porta. `https://app.loja.exemplo` e `https://api.loja.exemplo` são origens **diferentes**. Por segurança, o **navegador** impede que um script de uma origem leia respostas de outra — a menos que o servidor permita via **CORS**.

## CORS (Cross-Origin Resource Sharing)

O servidor diz, por headers, quem pode ler suas respostas:

```http
Access-Control-Allow-Origin: https://app.loja.exemplo
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

Requisições "não simples" (ex.: com `Content-Type: application/json`, header `Authorization` ou métodos como PUT/DELETE) disparam antes uma **requisição de preflight** `OPTIONS`, em que o navegador pergunta se pode.

Pontos que caem em entrevista:

- CORS é aplicado **pelo navegador**. Um script em Python ou o `curl` não sofrem CORS.
- CORS **não** é um mecanismo de autenticação nem protege o servidor de requisições: ele controla **quem pode ler a resposta no navegador**.
- `Access-Control-Allow-Origin: *` não pode ser usado junto com credenciais (`Access-Control-Allow-Credentials: true`).

## HTTPS

**HTTPS** = HTTP sobre **TLS**. Garante:

- **confidencialidade** (ninguém no caminho lê os dados);
- **integridade** (ninguém altera);
- **autenticidade** do servidor (certificado).

Em APIs, HTTPS é obrigatório: tokens e senhas trafegam em headers. O header **HSTS** (`Strict-Transport-Security`) instrui o navegador a só usar HTTPS naquele domínio.

:::descomplica
O navegador é um **pai cuidadoso**. 👨‍👧 Quando o site da escola (uma origem) quer pegar informação do site do clube (outra origem), o pai pergunta para o clube: "**vocês deixam?**" (isso é o *preflight* OPTIONS). Se o clube responder "deixo, sim, para a escola" (o header `Access-Control-Allow-Origin`), tudo bem.

O **HTTPS** é mandar a carta num **envelope lacrado e com cadeado**, em vez de num cartão-postal que qualquer carteiro pode ler. 🔒
:::

:::choice
? Uma chamada feita por um script Python (fora do navegador) para uma API sem headers CORS:
- [ ] É bloqueada pelo CORS
- [x] Funciona normalmente, pois CORS é imposto pelos navegadores
- [ ] Recebe 403 automaticamente
- [ ] Precisa de preflight
> CORS protege usuários de navegador; não é controle de acesso do servidor.
:::

:::code js
Simule o **preflight** que o navegador faria: envie um **OPTIONS** para `/usuarios` com os headers `Origin: https://app.loja.exemplo` e `Access-Control-Request-Method: DELETE`.

`return` um objeto com as chaves **`origem`** e **`metodos`**, preenchidas com os headers `Access-Control-Allow-Origin` e `Access-Control-Allow-Methods` da resposta.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/usuarios', {
  method: 'OPTIONS',
  headers: { Origin: 'https://app.loja.exemplo', 'Access-Control-Request-Method': 'DELETE' },
});
return {
  origem: r.headers.get('Access-Control-Allow-Origin'),
  metodos: r.headers.get('Access-Control-Allow-Methods'),
};
@@check
(ctx) => {
  const o = ctx.requests.find(r => r.method === 'OPTIONS' && r.path === '/usuarios');
  if (!o) return 'Envie uma requisição OPTIONS para /usuarios';
  if (o.headers['access-control-request-method'] !== 'DELETE') return 'Inclua o header Access-Control-Request-Method: DELETE';
  if (o.headers.origin !== 'https://app.loja.exemplo') return 'Inclua o header Origin: https://app.loja.exemplo';
  const r = ctx.result || {};
  if (r.origem !== 'https://app.loja.exemplo') return 'origem deve vir do header Access-Control-Allow-Origin';
  if (!r.metodos || !r.metodos.includes('DELETE')) return 'metodos deve vir do header Access-Control-Allow-Methods';
  return true;
}
:::

### LESSON api-12 | Erros, limites de taxa e retentativas com backoff
goal: lidar com 429 e 5xx de forma responsável, com retentativas, backoff exponencial e jitter.
minutes: 16

## Rate limiting

APIs limitam quantas requisições cada cliente faz por janela de tempo. Ao exceder, respondem **429 Too Many Requests**, geralmente com:

```http
Retry-After: 30
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 0
```

(`X-RateLimit-*` é convenção de várias APIs; há uma proposta de padronização na IETF com headers `RateLimit`.) Algoritmos comuns no servidor: **token bucket**, **leaky bucket**, janela fixa e janela deslizante.

## Quando tentar de novo

| Situação | Retentar? |
|---|---|
| falha de rede, timeout | sim (se a operação for idempotente) |
| 429, 503 | sim, respeitando `Retry-After` |
| 500, 502, 504 | às vezes, com limite |
| 400, 401, 403, 404, 422 | **não** — repetir não muda o resultado |

## Backoff exponencial com jitter

Espere cada vez mais entre as tentativas e adicione aleatoriedade para que milhares de clientes não voltem todos no mesmo instante:

$$ espera = min(teto, base · 2^tentativa) + aleatório $$

```javascript
async function comRetry(url, tentativas = 4) {
  for (let i = 0; i < tentativas; i++) {
    const r = await fetch(url);
    if (r.ok) return r;
    if (![429, 503].includes(r.status) || i === tentativas - 1) throw new Error('HTTP ' + r.status);
    const ra = Number(r.headers.get('Retry-After'));
    const ms = Number.isFinite(ra) && r.headers.has('Retry-After') ? ra * 1000 : 100 * 2 ** i + Math.random() * 100;
    await esperar(ms);
  }
}
```

Para não sobrecarregar um serviço doente, sistemas maiores usam também o padrão **circuit breaker**: depois de muitas falhas, param de tentar por um tempo.

!> No simulador, a função `esperar(ms)` está disponível (e é acelerada para os testes). O endpoint `/instavel` falha duas vezes com **503** e responde 200 na terceira.

:::descomplica
Imagine que você liga para a pizzaria e dá **ocupado**. 📞 Você não fica ligando 100 vezes por segundo, certo? Espera um pouquinho e liga de novo. Se der ocupado de novo, espera **um pouco mais**. Isso é o **backoff**.

O **jitter** é cada pessoa esperar um tempinho **diferente**, para não ligarem todas no mesmo segundo. E se a pizzaria disser "**liga daqui a 30 segundos**" (o `Retry-After`), você obedece!
:::

:::choice
? Sua requisição recebeu **422**. Deve-se fazer retentativa automática?
- [ ] Sim, com backoff
- [x] Não, os dados são inválidos e repetir dará o mesmo erro
- [ ] Sim, imediatamente
- [ ] Só se for GET
> Erros 4xx (exceto 429 e alguns casos como 408) indicam problema na requisição em si.
:::

:::code js exports=comRetry
Crie **`comRetry(url, tentativas)`** que:
- faz o GET e **retorna a Response** quando `ok`;
- em **503** ou **429**, espera (use `esperar(ms)`, respeitando `Retry-After` quando existir) e tenta de novo;
- para outros erros, **lança `Error` imediatamente**;
- se acabarem as tentativas, **lança `Error`**.

Por fim, use-a em `/instavel` com 5 tentativas e `return` o JSON.
@@starter
const BASE = 'https://api.loja.exemplo';

async function comRetry(url, tentativas) {
  const r = await fetch(url);
  return r;
}

@@solution
const BASE = 'https://api.loja.exemplo';

async function comRetry(url, tentativas) {
  for (let i = 0; i < tentativas; i++) {
    const r = await fetch(url);
    if (r.ok) return r;
    if (![429, 503].includes(r.status)) throw new Error('HTTP ' + r.status);
    if (i === tentativas - 1) break;
    const ra = r.headers.get('Retry-After');
    await esperar(ra !== null ? Number(ra) * 1000 : 100 * 2 ** i);
  }
  throw new Error('tentativas esgotadas');
}

const r = await comRetry(BASE + '/instavel', 5);
return await r.json();
@@check
async (ctx) => {
  if (!ctx.result || ctx.result.status !== 'ok') return 'Retorne o JSON de /instavel após as retentativas';
  const n = ctx.requests.filter(r => r.path === '/instavel').length;
  if (n !== 3) return `Esperadas 3 chamadas a /instavel (2 falhas + sucesso), foram ${n}`;
  const fn = ctx.exports.comRetry;
  if (typeof fn !== 'function') return 'Defina a função comRetry';
  ctx.api.reset();
  try { await fn('https://api.loja.exemplo/instavel', 2); return 'Com 2 tentativas (e 2 falhas) a função deveria lançar um Error'; } catch (e) { /* esperado */ }
  ctx.api.reset();
  const antes = ctx.api.requests.length;
  try { await fn('https://api.loja.exemplo/usuarios/99', 5); return 'Para 404 a função deveria lançar Error'; } catch (e) { /* esperado */ }
  if (ctx.api.requests.length - antes !== 1) return 'Não repita requisições para erros como 404';
  return true;
}
:::

### EXAM
:::choice
? Qual status indica **excesso de requisições**?
- [ ] 403
- [ ] 503
- [x] 429
- [ ] 408
> 429 Too Many Requests, frequentemente com Retry-After.
:::

:::choice
? O payload de um JWT assinado (JWS) pode ser lido por quem tem o token?
- [x] Sim, ele é apenas codificado em base64url
- [ ] Não, ele é criptografado
- [ ] Só com a chave privada
- [ ] Só o servidor de autorização lê
> Por isso não se põem segredos no payload. (Existe o JWE para tokens criptografados.)
:::

:::choice
? Qual claim de um JWT indica o momento de **expiração**?
- [ ] iat
- [ ] sub
- [x] exp
- [ ] aud
> exp: expiration time; iat: issued at; sub: subject; aud: audience.
:::

:::choice
? Para comunicação **máquina-a-máquina** sem usuário, qual fluxo OAuth 2.0 é indicado?
- [ ] Authorization Code com PKCE
- [x] Client Credentials
- [ ] Implicit
- [ ] Device Code obrigatoriamente
> O próprio cliente se autentica com suas credenciais e recebe um token.
:::

:::choice
? CORS é aplicado por:
- [ ] Servidor de banco de dados
- [x] Navegador, com base nos headers enviados pelo servidor
- [ ] Firewall
- [ ] Sistema operacional
> Clientes fora do navegador não aplicam a política de mesma origem.
:::

:::text
? Qual método HTTP é usado na requisição de **preflight** do CORS?
= OPTIONS
> O navegador envia OPTIONS com Access-Control-Request-Method/Headers.
:::

:::choice
? O que é "jitter" numa estratégia de retentativa?
- [ ] Repetir sem esperar
- [x] Adicionar aleatoriedade ao tempo de espera para evitar picos sincronizados
- [ ] Diminuir a espera a cada tentativa
- [ ] Cancelar após a primeira falha
> Sem jitter, muitos clientes que falharam juntos voltam juntos ("thundering herd").
:::

:::choice
? Onde **não** se deve enviar uma credencial?
- [ ] No header Authorization
- [ ] Num header próprio como X-API-Key
- [x] Na query string da URL
- [ ] No corpo de um POST de login via HTTPS
> URLs ficam registradas em logs, histórico e podem vazar pelo Referer.
:::

## MODULE m4 | Tópicos avançados
desc: Idempotência, cache HTTP e concorrência otimista, HATEOAS e OpenAPI, webhooks com assinatura e panorama de alternativas.

### LESSON api-13 | Idempotência na prática: Idempotency-Key
goal: tornar operações POST seguras para retentativas e evitar cobranças duplicadas.
minutes: 14

## O problema

O cliente envia `POST /pagamentos`, a conexão cai **antes** da resposta chegar. O pagamento foi feito ou não? Se o cliente tentar de novo, pode **cobrar duas vezes**.

## A solução: chave de idempotência

O cliente gera um identificador único **por operação** (normalmente um UUID) e o envia num header. O servidor guarda a resposta associada à chave; se a mesma chave chegar de novo, devolve **a mesma resposta** sem repetir o efeito.

```javascript
const chave = crypto.randomUUID();          // gere UMA vez por operação
const opcoes = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave },
  body: JSON.stringify({ valor: 150.0, pedidoId: 1 }),
};
const r1 = await fetch(`${BASE}/pagamentos`, opcoes);
const r2 = await fetch(`${BASE}/pagamentos`, opcoes);   // retentativa: não duplica
```

O header `Idempotency-Key` é usado por APIs de pagamento como a do Stripe e está em processo de padronização na IETF (*draft*).

## Regras de implementação (no servidor)

- Guarde chave + resposta por um tempo (ex.: 24 h).
- Se a mesma chave vier com um **corpo diferente**, responda erro (ex.: 422/409).
- Duas requisições simultâneas com a mesma chave: processe uma e faça a outra aguardar ou falhar (409).
- Lembre que `PUT` e `DELETE` já são idempotentes por definição; a chave é para operações **não** idempotentes, como POST.

:::descomplica
A **Idempotency-Key** é como o **número do pedido** na lanchonete. 🧾 Se você não ouviu chamarem e pergunta de novo "cadê o pedido **47**?", o atendente vê que o 47 **já foi feito** e te entrega o mesmo lanche — ele **não** faz outro e cobra de novo!
:::

:::choice
? Qual o momento certo para gerar a Idempotency-Key?
- [ ] A cada tentativa de envio
- [x] Uma vez por operação lógica, reutilizando-a nas retentativas
- [ ] Uma vez por usuário, para sempre
- [ ] Só depois de receber erro
> Se cada tentativa tiver uma chave nova, o servidor não reconhece a repetição.
:::

:::code js
Envie um pagamento de **150** para o pedido **1** com **POST `/pagamentos`**, simulando que a primeira resposta "se perdeu": envie a **mesma requisição duas vezes**, com a **mesma** `Idempotency-Key` (use `crypto.randomUUID()`).

Depois faça um **GET `/pagamentos`** e `return` a lista. Deve haver **apenas 1** pagamento.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const chave = crypto.randomUUID();
const opcoes = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave },
  body: JSON.stringify({ valor: 150, pedidoId: 1 }),
};
await fetch(BASE + '/pagamentos', opcoes);
await fetch(BASE + '/pagamentos', opcoes);
const r = await fetch(BASE + '/pagamentos');
return await r.json();
@@check
(ctx) => {
  const posts = ctx.requests.filter(r => r.method === 'POST' && r.path === '/pagamentos');
  if (posts.length < 2) return 'Envie o POST duas vezes (simulando a retentativa)';
  const keys = posts.map(p => p.headers['idempotency-key']);
  if (!keys[0]) return 'Envie o header Idempotency-Key';
  if (new Set(keys).size !== 1) return 'As retentativas devem usar a MESMA Idempotency-Key';
  if (ctx.api.pagamentos.length !== 1) return `Deveria existir 1 pagamento, existem ${ctx.api.pagamentos.length}`;
  if (ctx.api.pagamentos[0].valor !== 150) return 'O pagamento deve ser de 150';
  if (!Array.isArray(ctx.result) || ctx.result.length !== 1) return 'Retorne a lista obtida com GET /pagamentos';
  return true;
}
:::

### LESSON api-14 | Cache HTTP e concorrência otimista: ETag, 304 e 412
goal: economizar banda com requisições condicionais e evitar que um cliente sobrescreva a alteração de outro.
minutes: 18

## Cache-Control

O servidor diz por quanto tempo (e por quem) a resposta pode ser reutilizada:

| Diretiva | Significa |
|---|---|
| `max-age=60` | pode reutilizar por 60 s sem perguntar |
| `no-cache` | pode guardar, mas **revalide** antes de usar |
| `no-store` | não guarde (dados sensíveis) |
| `private` / `public` | só o navegador do usuário / também caches compartilhados (CDN) |

## Validação com ETag (GET condicional)

O **ETag** é um identificador da versão do recurso. O cliente guarda e pergunta depois "mudou?":

```http
GET /produtos/1                      →  200 OK, ETag: "p1-v1", corpo
GET /produtos/1
If-None-Match: "p1-v1"               →  304 Not Modified (sem corpo)
```

O **304** economiza banda: o cliente reutiliza o que já tinha. (`Last-Modified` + `If-Modified-Since` fazem o mesmo usando datas.)

## Concorrência otimista (If-Match)

Dois atendentes abrem o mesmo produto. O primeiro salva; o segundo salva por cima **sem saber** — é o problema da **atualização perdida**. Solução: só aceitar a escrita se a versão for a esperada:

```http
PATCH /produtos/1
If-Match: "p1-v1"                    →  200 OK, ETag: "p1-v2"
PATCH /produtos/1
If-Match: "p1-v1"   (versão velha)   →  412 Precondition Failed
```

Ao receber **412**, o cliente busca a versão nova, reaplica a mudança e tenta de novo.

:::descomplica
O **ETag** é como o **número da edição** de uma revista. 📰 Você pergunta à banca: "Saiu edição nova depois da **edição 1**?". Se não saiu, o jornaleiro diz "**não mudou nada**" (304) e você nem precisa carregar a revista de novo.

O **If-Match** é: "só troca a figurinha do álbum **se ainda for a edição 1**". Se alguém já trocou antes (edição 2), o jornaleiro diz "**opa, mudou!**" (412) e você confere antes.
:::

:::choice
? O que significa a resposta **304 Not Modified**?
- [ ] O recurso foi apagado
- [x] O recurso não mudou desde a versão que o cliente tem; ele pode reutilizar a cópia em cache
- [ ] Erro de permissão
- [ ] O recurso foi movido
> É a resposta a um GET condicional (If-None-Match / If-Modified-Since) quando nada mudou.
:::

:::code js
1. Faça GET em `/produtos/1` e guarde o **ETag**;
2. repita o GET com **`If-None-Match`** e mostre no console o **status** (deve ser 304);
3. altere o preço para **3200** com **PATCH** enviando **`If-Match`** com o ETag guardado;
4. tente **outro PATCH** (preço 3100) com o **ETag antigo** e mostre o **status** (deve ser 412).

`return` o JSON da resposta do PATCH bem-sucedido.
@@starter
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };

@@solution
const BASE = 'https://api.loja.exemplo';
const headers = { 'Content-Type': 'application/json' };
const r1 = await fetch(BASE + '/produtos/1');
const etag = r1.headers.get('ETag');
const r2 = await fetch(BASE + '/produtos/1', { headers: { 'If-None-Match': etag } });
console.log(r2.status);
const p1 = await fetch(BASE + '/produtos/1', { method: 'PATCH', headers: { ...headers, 'If-Match': etag }, body: JSON.stringify({ preco: 3200 }) });
const p2 = await fetch(BASE + '/produtos/1', { method: 'PATCH', headers: { ...headers, 'If-Match': etag }, body: JSON.stringify({ preco: 3100 }) });
console.log(p2.status);
return await p1.json();
@@check
(ctx) => {
  const gets = ctx.requests.filter(r => r.method === 'GET' && r.path === '/produtos/1');
  if (!gets.some(g => g.headers['if-none-match'] === '"p1-v1"')) return 'Repita o GET com If-None-Match contendo o ETag recebido';
  if (!ctx.logs.some(l => l.trim() === '304')) return 'Mostre o status do GET condicional (304)';
  const patches = ctx.requests.filter(r => r.method === 'PATCH' && r.path === '/produtos/1');
  if (patches.length < 2 || !patches.every(p => p.headers['if-match'] === '"p1-v1"')) return 'Envie os dois PATCH com If-Match usando o ETag ANTIGO ("p1-v1")';
  if (!ctx.logs.some(l => l.trim() === '412')) return 'Mostre o status do segundo PATCH (412)';
  const prod = ctx.api.produtos.find(p => p.id === 1);
  if (prod.preco !== 3200) return 'O preço final deve ser 3200 (o segundo PATCH deve ser rejeitado)';
  if (!ctx.result || ctx.result.preco !== 3200) return 'Retorne o JSON do PATCH bem-sucedido';
  return true;
}
:::

### LESSON api-15 | HATEOAS, OpenAPI e documentação
goal: entender hipermídia como motor do estado da aplicação e descrever APIs com OpenAPI.
minutes: 15

## HATEOAS

*Hypermedia As The Engine Of Application State*: a resposta traz **links** para as próximas ações possíveis. O cliente navega pelos links em vez de montar URLs fixas, e o servidor pode mudar caminhos ou habilitar/desabilitar ações conforme o estado.

```json
{
  "id": 1, "status": "pendente", "total": 105.8,
  "_links": {
    "self":     { "href": "/pedidos/1" },
    "usuario":  { "href": "/usuarios/1" },
    "cancelar": { "href": "/pedidos/1/cancelar", "method": "POST" }
  }
}
```

Quando o pedido já foi enviado, o link `cancelar` **some** — o próprio servidor indica o que é permitido. (O formato `_links` vem da convenção HAL; existem outros, como JSON:API.) É a restrição REST menos implementada na prática.

## OpenAPI

A **OpenAPI Specification** (antigo Swagger) descreve uma API HTTP em YAML/JSON: caminhos, métodos, parâmetros, corpos, respostas, autenticação.

```yaml
openapi: 3.1.0
info: { title: API da Loja, version: 1.0.0 }
paths:
  /usuarios/{id}:
    get:
      summary: Busca um usuário
      parameters:
        - { name: id, in: path, required: true, schema: { type: integer } }
      responses:
        '200': { description: Usuário encontrado }
        '404': { description: Não encontrado }
```

Com ela se geram **documentação interativa** (Swagger UI, Redoc), **clientes** (SDKs), **mocks** e **testes de contrato**. O FastAPI, por exemplo, gera a especificação automaticamente.

Abordagens: **design-first** (escreve o contrato antes) ou **code-first** (gera do código).

## Boa documentação tem

Autenticação explicada, exemplos de requisição e resposta reais, todos os erros possíveis, limites de taxa, política de versionamento e *changelog*.

:::descomplica
O **HATEOAS** é como um **jogo de aventura em livro**: no fim de cada página está escrito "se quiser abrir a porta, vá para a página 42; se quiser fugir, vá para a 17". 📕 Você não precisa decorar o livro: **a própria página diz o que você pode fazer agora**.

A **OpenAPI** é o **manual de instruções** da API, escrito de um jeito que **até os computadores entendem**.
:::

:::choice
? Na OpenAPI, onde se descreve que `/usuarios/{id}` pode responder 404?
- [ ] Em `info`
- [x] Em `responses` da operação
- [ ] Em `servers`
- [ ] Em `tags`
> Cada operação lista suas respostas possíveis por código de status.
:::

:::code js
Sem montar URLs na mão (exceto a do primeiro GET), faça:
1. GET em `/pedidos/1`;
2. se o recurso trouxer o link **`cancelar`** em `_links`, execute-o usando o **`href`** e o **`method`** informados;
3. `return` o JSON da resposta do cancelamento.

Faça o mesmo teste mentalmente com o pedido 2 (já enviado): ele **não** tem link de cancelar.
@@starter
const BASE = 'https://api.loja.exemplo';

@@solution
const BASE = 'https://api.loja.exemplo';
const r = await fetch(BASE + '/pedidos/1');
const pedido = await r.json();
const link = pedido._links.cancelar;
if (link) {
  const c = await fetch(new URL(link.href, BASE), { method: link.method });
  return await c.json();
}
@@check
(ctx) => {
  if (!ctx.requests.some(r => r.method === 'GET' && r.path === '/pedidos/1')) return 'Comece com GET /pedidos/1';
  if (!ctx.requests.some(r => r.method === 'POST' && r.path === '/pedidos/1/cancelar')) return 'Siga o link cancelar usando o method indicado (POST)';
  if (ctx.api.pedidos.find(p => p.id === 1).status !== 'cancelado') return 'O pedido 1 deveria estar cancelado';
  if (!ctx.result || ctx.result.status !== 'cancelado') return 'Retorne o JSON da resposta do cancelamento';
  return true;
}
:::

### LESSON api-16 | Webhooks, assinaturas HMAC e o ecossistema além do REST
goal: receber eventos via webhooks com segurança e conhecer GraphQL, gRPC e observabilidade.
minutes: 18

## Webhooks

Em vez de o cliente perguntar a cada minuto "tem novidade?" (*polling*), o **servidor avisa**: quando algo acontece, faz um **POST** para uma URL que você cadastrou.

```http
POST https://minhaloja.exemplo/webhooks/pagamentos
Content-Type: application/json
X-Assinatura: d74ab924...

{"evento":"pedido.pago","pedidoId":1}
```

## Verificando a origem com HMAC

Qualquer um pode fazer POST na sua URL. Por isso, o provedor **assina** o corpo com um segredo compartilhado usando **HMAC-SHA256**, e você recalcula e compara:

$$ assinatura = HMAC_SHA256(segredo, corpo_bruto) $$

```javascript
async function hmacHex(segredo, corpo) {
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey('raw', enc.encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', chave, enc.encode(corpo));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
```

Boas práticas: assine o **corpo bruto** (antes de fazer parse), inclua um **timestamp** na assinatura e rejeite eventos antigos (contra *replay*), compare em **tempo constante** no servidor (ex.: `crypto.timingSafeEqual` no Node), responda **2xx rápido** e processe em fila, e trate entregas **duplicadas** (webhooks costumam ser "pelo menos uma vez" — use o id do evento para idempotência).

## Além do REST

| Estilo | Ideia | Bom para |
|---|---|---|
| **GraphQL** | um endpoint; o cliente pede exatamente os campos que quer | front-ends com necessidades variadas, evitar *over/under-fetching* |
| **gRPC** | chamadas de procedimento com Protocol Buffers sobre HTTP/2 | comunicação interna entre microsserviços, streaming |
| **WebSocket / SSE** | conexão aberta para eventos em tempo real | chats, painéis ao vivo |

## Observabilidade

Em produção: **logs** estruturados, **métricas** (latência p50/p95/p99, taxa de erro, requisições por segundo) e **traces** distribuídos (ex.: OpenTelemetry), com um **ID de correlação** por requisição (ex.: header `traceparent`, do padrão W3C Trace Context) para seguir uma chamada entre serviços.

:::descomplica
- **Polling** é a criança no carro perguntando "**já chegou? já chegou?**" a cada minuto. 🚗
- **Webhook** é o papai dizendo "**eu te aviso quando chegar**".
- A **assinatura HMAC** é um **aperto de mão secreto**: só quem sabe o segredo consegue fazer igual. Se alguém mandar uma mensagem sem o aperto de mão certo, você sabe que é **impostor**. 🤝
:::

:::choice
? Por que a assinatura do webhook deve ser calculada sobre o **corpo bruto** recebido?
- [ ] Porque é mais rápido
- [x] Porque re-serializar o JSON pode mudar espaços/ordem das chaves e gerar uma assinatura diferente
- [ ] Porque o corpo bruto é criptografado
- [ ] Não faz diferença
> Qualquer byte diferente muda o HMAC.
:::

:::code js exports=verificarAssinatura
Implemente **`verificarAssinatura(corpo, assinatura, segredo)`** que retorna `true` se `assinatura` (hexadecimal) for o **HMAC-SHA256** de `corpo` com `segredo`, e `false` caso contrário. Use `crypto.subtle` (veja o exemplo da aula).

Teste com o webhook abaixo (deve dar `true`) e `return` o resultado.
@@starter
const corpo = '{"evento":"pedido.pago","pedidoId":1}';
const assinatura = 'd74ab924111a093e1a984985d5cf927e525b1e2c71da790b394b9aa5cb812a25';
const segredo = 'whsec_demo';

async function verificarAssinatura(corpo, assinatura, segredo) {
  return false;
}

return await verificarAssinatura(corpo, assinatura, segredo);
@@solution
const corpo = '{"evento":"pedido.pago","pedidoId":1}';
const assinatura = 'd74ab924111a093e1a984985d5cf927e525b1e2c71da790b394b9aa5cb812a25';
const segredo = 'whsec_demo';

async function verificarAssinatura(corpo, assinatura, segredo) {
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', chave, enc.encode(corpo));
  const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === assinatura;
}

return await verificarAssinatura(corpo, assinatura, segredo);
@@check
async (ctx) => {
  if (ctx.result !== true) return 'Para o webhook de exemplo, a verificação deve retornar true';
  const f = ctx.exports.verificarAssinatura;
  if (typeof f !== 'function') return 'Defina a função verificarAssinatura';
  const ok = 'd74ab924111a093e1a984985d5cf927e525b1e2c71da790b394b9aa5cb812a25';
  if (await f('{"evento":"pedido.pago","pedidoId":2}', ok, 'whsec_demo') !== false) return 'Corpo adulterado deve retornar false';
  if (await f('{"evento":"pedido.pago","pedidoId":1}', ok, 'outro_segredo') !== false) return 'Segredo errado deve retornar false';
  if (await f('{"evento":"pedido.pago","pedidoId":1}', ok.replace('d7', 'e7'), 'whsec_demo') !== false) return 'Assinatura errada deve retornar false';
  if (await f('abc', '9b6a8f0a8a0b8e2d5a4b6c1c4c2e2a2a', 'k') !== false) return 'Assinatura inválida deve retornar false';
  return true;
}
:::

### EXAM
:::choice
? Para que serve o header `Idempotency-Key` num POST?
- [ ] Para autenticar o cliente
- [x] Para que retentativas da mesma operação não criem efeitos duplicados
- [ ] Para habilitar cache
- [ ] Para definir a versão da API
> O servidor reconhece a chave e devolve o resultado já processado.
:::

:::choice
? Um cliente envia `If-None-Match: "v3"` e o recurso ainda está na versão "v3". O servidor responde:
- [ ] 200 com o corpo
- [x] 304 Not Modified
- [ ] 412 Precondition Failed
- [ ] 409 Conflict
> 412 é para If-Match que não confere (escritas condicionais).
:::

:::choice
? Qual diretiva proíbe guardar a resposta em qualquer cache?
- [ ] no-cache
- [x] no-store
- [ ] private
- [ ] max-age=0
> no-cache permite guardar mas exige revalidação; no-store proíbe guardar.
:::

:::choice
? O que caracteriza HATEOAS?
- [ ] Respostas sempre em XML
- [x] Respostas trazem links para as ações e recursos relacionados disponíveis no estado atual
- [ ] Uso de WebSockets
- [ ] Versionamento na URL
> O cliente descobre as transições possíveis pelos links.
:::

:::text
? Qual especificação (antes chamada Swagger) descreve APIs HTTP em YAML ou JSON?
= OpenAPI | OpenAPI Specification | OAS
> OpenAPI permite gerar documentação, clientes, mocks e testes.
:::

:::choice
? Qual o objetivo da assinatura HMAC em webhooks?
- [ ] Comprimir o corpo
- [x] Permitir que o receptor verifique que a mensagem veio de quem conhece o segredo e não foi alterada
- [ ] Criptografar o corpo para ninguém ler
- [ ] Acelerar a entrega
> HMAC dá autenticidade e integridade, não confidencialidade.
:::

:::choice
? Webhooks costumam ter garantia de entrega "pelo menos uma vez". Isso implica que o receptor deve:
- [ ] Ignorar todos os eventos repetidos sem verificar nada
- [x] Tratar duplicatas de forma idempotente (ex.: pelo id do evento)
- [ ] Responder 500 para forçar reenvio
- [ ] Fazer polling também
> O mesmo evento pode chegar mais de uma vez; processe-o só uma vez.
:::

:::choice
? Em que cenário GraphQL costuma ser escolhido no lugar de REST?
- [ ] Para transferir arquivos grandes
- [x] Quando clientes diferentes precisam de combinações variadas de campos e se quer evitar várias idas e vindas
- [ ] Para comunicação binária entre microsserviços com HTTP/2 (gRPC é a escolha típica)
- [ ] Quando não há banco de dados
> O cliente declara exatamente os campos que quer num único endpoint.
:::
