# EstudaAí — estudosComClaude

Site de cursos gratuitos (estilo plataforma de cursos) com **4 cursos, 64 aulas, 130 práticas e 128 questões de exame**:

| Curso | Conteúdo |
|---|---|
| 🗄️ SQL | fundamentos, filtros, agregações, JOINs, restrições, subconsultas, CTEs recursivas, window functions, transações/ACID/isolamento, índices e EXPLAIN, views, triggers, UPSERT/RETURNING, GRANT/REVOKE e Row Level Security (policies) |
| 🐍 Python | fundamentos, coleções, funções, exceções, POO (classes, herança, polimorfismo, encapsulamento, dunder, ABC, dataclass), biblioteca padrão, NumPy, Pandas, sqlite3, consumo de APIs, FastAPI, Django, scikit-learn, métricas, SDK de IA com tool use, embeddings e RAG |
| 🔌 APIs REST | REST, métodos, status, URLs/headers/JSON, fetch, CRUD, design e versionamento, paginação, API key/Basic/Bearer, OAuth 2.0 e JWT, CORS/HTTPS, rate limit e retry com backoff, idempotência, ETag/304/412, HATEOAS/OpenAPI, webhooks com HMAC |
| 🤖 Modelos de IA | estrutura (neurônios, tokens/BPE, embeddings, transformers e atenção), fórmulas (softmax, temperatura, top-p, perda, gradiente, perplexidade) com guia consolidado, prompts avançados, saída estruturada, IA como validadora, treinamento (pré-treino, SFT, RLHF, DPO, LoRA), agentes, orquestração, MCP, skills, plugins, hooks, harness, contexto, caching e segurança |

## Como funciona

- **Cada aula** tem explicação, uma aba **🧸 Descomplica** (fechada, só com o título; ao clicar abre a explicação "para criança") e uma **prática** no fim.
- **Práticas**: questões de assinalar ou código num **terminal próprio** que valida o **resultado**, não o texto:
  - SQL → SQLite no navegador (sql.js); compara linhas retornadas ou o estado final do banco, inclusive rodando de novo com **dados diferentes** para pegar respostas "chumbadas".
  - Python → Pyodide (CPython em WebAssembly); testes reexecutam o código com outras entradas.
  - JavaScript → `fetch` ligado a uma **API REST simulada** (`https://api.loja.exemplo`) com auth, paginação, ETag, idempotência etc.; o verificador confere as requisições feitas e o estado da API.
- **Pontuação**: cada curso vale **2400 pts** = 16 aulas × 100 + 4 exames × 200. Acertar de primeira dá nota cheia; errar reduz; ver a solução dá 25%.
- **Exame de fim de módulo**: questões novas, uma por vez, **sem voltar** e com as **lições bloqueadas** até terminar (recarregar a página retoma o exame). Fica a melhor nota.
- **Ranking e títulos**: 6 títulos por curso (0, 200, 600, 1200, 1800, 2400 pts). Ranking local (perfis do navegador) ou global se rodar o servidor.

## Rodando

```bash
node server.js            # http://localhost:8080 — site + ranking compartilhado (data/ranking.json)
```

Também funciona como site estático (ex.: GitHub Pages), com ranking local. O Python baixa o Pyodide do jsDelivr na primeira execução (precisa de internet).

## Editando o conteúdo

O conteúdo fica em `content/*.md` (formato descrito em `content/FORMATO.md`) e é compilado para `js/courses/*.js`:

```bash
node tools/build.js       # gera js/courses/*.js
npm i sql.js && node tools/test.js   # confere que toda solução passa e todo código inicial falha
```

`tools/test.js` usa Node 18+ para JS, `sql.js` para SQL e `python3` (com numpy, pandas e scikit-learn) para Python.
