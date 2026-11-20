<!-- Aprofundamento e exercícios extras do curso de SQL (mesclados por tools/build.js) -->

### EXTRA sql-01

### Como um banco relacional organiza os dados

Pense na loja que usamos nos exercícios. Ela tem quatro tabelas, e cada uma guarda **um tipo de coisa**:

| Tabela | Cada linha é… | Colunas principais |
|---|---|---|
| `clientes` | uma pessoa que compra | `id`, `nome`, `cidade`, `idade`, `email` |
| `produtos` | um item à venda | `id`, `nome`, `categoria`, `preco`, `estoque` |
| `pedidos` | uma compra feita | `id`, `cliente_id`, `data`, `status` |
| `itens` | um produto dentro de um pedido | `pedido_id`, `produto_id`, `quantidade`, `preco_unit` |

Repare que `pedidos` não repete o nome do cliente: guarda só o `cliente_id`. Esse número "aponta" para a linha certa em `clientes`. Essa ligação entre tabelas é o que dá o nome **relacional** ao modelo.

### Escolhendo colunas em vez de usar `*`

O `*` traz todas as colunas. É ótimo para explorar uma tabela, mas no dia a dia é melhor listar só o que você precisa:

```sql
SELECT nome, cidade FROM clientes;
```

| nome | cidade |
|---|---|
| Ana Souza | São Paulo |
| Bruno Lima | Rio de Janeiro |
| … | … |

Motivos para preferir colunas explícitas:

- **Menos dados trafegando** (importa quando a tabela tem milhões de linhas).
- **O código não quebra** se alguém adicionar uma coluna nova na tabela.
- **Fica claro** para quem lê o que a consulta usa.

As colunas aparecem no resultado **na ordem em que você escreveu**, não na ordem da tabela: `SELECT cidade, nome` mostra a cidade primeiro.

### Comentários e formatação

```sql
-- comentário de uma linha
/* comentário
   de várias linhas */
SELECT nome,       -- o SQL ignora espaços e quebras de linha extras
       email
FROM   clientes;
```

Quebrar a consulta em várias linhas, uma cláusula por linha, é o padrão usado em equipes: fica muito mais fácil de ler quando a consulta cresce.

### Erros comuns de iniciante

| Erro | Exemplo | Mensagem típica no SQLite |
|---|---|---|
| Nome de tabela errado | `SELECT * FROM cliente;` | `no such table: cliente` |
| Nome de coluna errado | `SELECT nomee FROM clientes;` | `no such column: nomee` |
| Vírgula sobrando | `SELECT nome, FROM clientes;` | `near "FROM": syntax error` |
| Esquecer o FROM | `SELECT nome clientes;` | `no such column: nome` |

Leia a mensagem de erro com calma: ela quase sempre diz exatamente o que está errado.

:::exercicio sql
Mostre apenas as colunas **`nome`** e **`email`** de todos os clientes (nessa ordem).
@@setup
#loja
@@starter
-- liste só as colunas pedidas

@@solution
SELECT nome, email FROM clientes;
@@variant
INSERT INTO clientes (nome, cidade, idade, email) VALUES ('Iris Melo', 'Recife', 33, 'iris@email.com');
:::

:::exercicio sql
Mostre **todas as colunas** da tabela **`pedidos`**.
@@setup
#loja
@@starter

@@solution
SELECT * FROM pedidos;
@@variant
INSERT INTO pedidos VALUES (11, 4, '2025-05-01', 'pendente');
:::

:::exercicio sql
Mostre, nesta ordem, as colunas **`categoria`**, **`nome`** e **`estoque`** de todos os produtos.

Atenção: a ordem das colunas no resultado é a ordem em que você as escreve.
@@setup
#loja
@@starter

@@solution
SELECT categoria, nome, estoque FROM produtos;
@@variant
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Tapete', 'Casa', 120, 9);
:::

### EXTRA sql-02

### Pensando antes de criar: modelagem

Antes de escrever o `CREATE TABLE`, responda três perguntas:

1. **Que coisa cada linha representa?** (um aluno, uma matrícula, um curso)
2. **Que informações eu preciso guardar sobre ela?** (viram as colunas)
3. **O que identifica cada linha de forma única?** (vira a chave primária)

Exemplo: uma escola com alunos, cursos e matrículas.

```sql
CREATE TABLE alunos (
    id    INTEGER PRIMARY KEY,
    nome  TEXT NOT NULL,
    email TEXT UNIQUE
);

CREATE TABLE cursos (
    id   INTEGER PRIMARY KEY,
    nome TEXT NOT NULL
);

-- uma matrícula liga UM aluno a UM curso
CREATE TABLE matriculas (
    aluno_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    data     TEXT NOT NULL DEFAULT (date('now')),
    PRIMARY KEY (aluno_id, curso_id)   -- o mesmo aluno não se matricula 2x no mesmo curso
);
```

Repare na **chave primária composta** de `matriculas`: nenhuma das colunas sozinha é única (um aluno tem várias matrículas; um curso tem vários alunos), mas a **combinação** é.

### Como o SQLite trata tipos

No PostgreSQL, tentar guardar `'abc'` numa coluna `INTEGER` dá erro. O SQLite é mais flexível: ele tenta converter e, se não conseguir, guarda o valor como veio. Você pode conferir o tipo real guardado com `typeof()`:

```sql
SELECT typeof(42), typeof(4.2), typeof('42'), typeof(NULL);
-- integer | real | text | null
```

Para quem está aprendendo, a dica é: **declare tipos como se fosse um banco rígido**. Seu SQL vai funcionar igual quando você migrar para PostgreSQL ou MySQL.

### Conferindo a estrutura de uma tabela

```sql
-- SQLite
PRAGMA table_info(alunos);
SELECT name, type, "notnull", dflt_value, pk FROM pragma_table_info('alunos');

-- PostgreSQL (no terminal psql):  \d alunos
```

### ALTER TABLE: o que dá e o que não dá

```sql
ALTER TABLE alunos ADD COLUMN telefone TEXT;           -- adicionar coluna
ALTER TABLE alunos RENAME COLUMN telefone TO celular;  -- renomear coluna
ALTER TABLE alunos RENAME TO estudantes;               -- renomear tabela
ALTER TABLE estudantes DROP COLUMN celular;            -- remover coluna (SQLite 3.35+)
```

Mudanças mais profundas (trocar o tipo de uma coluna, adicionar uma restrição em coluna existente) o SQLite não faz com `ALTER`: o caminho é criar uma tabela nova, copiar os dados e trocar os nomes. Bancos como o PostgreSQL aceitam `ALTER COLUMN ... TYPE`.

:::exercicio sql
Crie a tabela **`alunos`** com:
- `id` inteiro chave primária;
- `nome` texto **obrigatório**;
- `email` texto que **não pode se repetir**;
- `ativo` inteiro com valor padrão **1**.

O verificador insere alunos (inclusive tentando repetir um e-mail e inserir sem nome) e confere o que foi guardado.
@@starter
CREATE TABLE alunos (

);
@@solution
CREATE TABLE alunos (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    ativo INTEGER DEFAULT 1
);
@@query
INSERT INTO alunos (nome, email) VALUES ('Ana', 'ana@x.com'), ('Bia', 'bia@x.com');
INSERT OR IGNORE INTO alunos (nome, email) VALUES ('Outra Ana', 'ana@x.com');
INSERT OR IGNORE INTO alunos (nome, email) VALUES (NULL, 'semnome@x.com');
INSERT INTO alunos (nome, email, ativo) VALUES ('Caio', NULL, 0);
SELECT id, nome, email, ativo FROM alunos ORDER BY id;
:::

:::exercicio sql
A loja quer guardar o telefone dos clientes. **Adicione** à tabela `clientes` a coluna **`telefone`** do tipo texto.
@@setup
#loja
@@starter

@@solution
ALTER TABLE clientes ADD COLUMN telefone TEXT;
@@query
SELECT name FROM pragma_table_info('clientes') ORDER BY cid;
:::

:::exercicio sql
Crie a tabela **`matriculas`** com:
- `aluno_id` inteiro obrigatório;
- `curso_id` inteiro obrigatório;
- `data` texto com valor padrão `'2025-01-01'`;
- **chave primária composta** por `(aluno_id, curso_id)`.

O verificador tenta matricular o mesmo aluno duas vezes no mesmo curso.
@@starter
CREATE TABLE matriculas (

);
@@solution
CREATE TABLE matriculas (
    aluno_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    data TEXT DEFAULT '2025-01-01',
    PRIMARY KEY (aluno_id, curso_id)
);
@@query
INSERT INTO matriculas (aluno_id, curso_id) VALUES (1, 1), (1, 2), (2, 1);
INSERT OR IGNORE INTO matriculas (aluno_id, curso_id) VALUES (1, 1);
INSERT OR IGNORE INTO matriculas (aluno_id, curso_id) VALUES (NULL, 3);
INSERT INTO matriculas (aluno_id, curso_id, data) VALUES (3, 2, '2025-03-10');
SELECT aluno_id, curso_id, data FROM matriculas ORDER BY aluno_id, curso_id;
:::

### EXTRA sql-03

### INSERT a partir de um SELECT

Além de `VALUES`, você pode inserir o **resultado de uma consulta**. Útil para copiar ou arquivar dados:

```sql
CREATE TABLE pedidos_arquivo (id INTEGER, cliente_id INTEGER, data TEXT, status TEXT);

INSERT INTO pedidos_arquivo (id, cliente_id, data, status)
SELECT id, cliente_id, data, status
FROM pedidos
WHERE data < '2025-02-01';
```

### UPDATE com várias colunas e com expressões

```sql
-- reajuste de 5% e reposição de estoque nos produtos de Móveis
UPDATE produtos
SET preco   = ROUND(preco * 1.05, 2),
    estoque = estoque + 10
WHERE categoria = 'Móveis';
```

O lado direito do `=` é calculado com os valores **de antes** do UPDATE. Por isso `SET a = b, b = a` troca os valores de duas colunas no SQLite e no PostgreSQL.

### A ordem importa ao apagar dados relacionados

Se um pedido tem itens, os itens "apontam" para ele. Apagar o pedido primeiro deixaria itens órfãos (ou daria erro, se a chave estrangeira estiver sendo verificada). O caminho seguro é **apagar de baixo para cima**: primeiro os filhos, depois o pai.

```sql
DELETE FROM itens   WHERE pedido_id IN (SELECT id FROM pedidos WHERE status = 'cancelado');
DELETE FROM pedidos WHERE status = 'cancelado';
```

(Na aula de restrições você vai ver o `ON DELETE CASCADE`, que faz isso automaticamente.)

### O método seguro: SELECT antes de alterar

1. Escreva o `SELECT` com o `WHERE` que você pretende usar.
2. Confira se vieram **exatamente** as linhas certas.
3. Troque `SELECT ...` por `UPDATE ... SET ...` ou `DELETE`, mantendo o mesmo `WHERE`.

```sql
SELECT * FROM produtos WHERE estoque = 0;   -- passo 1: conferir (veio só o Livro Python)
DELETE FROM produtos WHERE estoque = 0;     -- passo 3: apagar
```

Em bancos de produção, faça isso **dentro de uma transação** (aula 13): se algo sair errado, um `ROLLBACK` desfaz tudo.

### Quantas linhas foram afetadas?

O terminal do curso mostra "Linhas afetadas pelo último comando". Em Python, `cursor.rowcount` dá essa informação; no PostgreSQL, o próprio cliente mostra `UPDATE 3`. Se o número for muito diferente do esperado, desconfie do seu `WHERE`.

:::exercicio sql
Cadastre duas novas clientes na tabela `clientes`:
- **Iris Melo**, de **Recife**, **33** anos, e-mail `iris@email.com`;
- **Joana Reis**, de **Curitiba**, **27** anos, **sem e-mail**.

Não informe o `id` (o banco gera sozinho).
@@setup
#loja
@@starter

@@solution
INSERT INTO clientes (nome, cidade, idade, email) VALUES
  ('Iris Melo', 'Recife', 33, 'iris@email.com'),
  ('Joana Reis', 'Curitiba', 27, NULL);
@@query
SELECT id, nome, cidade, idade, email FROM clientes ORDER BY id;
:::

:::exercicio sql
A filial de **Curitiba** fechou e os clientes de lá passaram a ser atendidos por **São Paulo**. Além disso, todos os clientes com **menos de 20 anos** devem ter o e-mail apagado (ficar `NULL`) por questões de privacidade.

Faça as duas alterações.
@@setup
#loja
@@starter

@@solution
UPDATE clientes SET cidade = 'São Paulo' WHERE cidade = 'Curitiba';
UPDATE clientes SET email = NULL WHERE idade < 20;
@@query
SELECT id, cidade, email FROM clientes ORDER BY id;
:::

:::exercicio sql
Limpe os pedidos **cancelados**: apague os **itens** desses pedidos e depois os próprios **pedidos** (nessa ordem, para não deixar itens órfãos).

Em seguida, os produtos que ficaram **sem nenhum item vendido** em nenhum pedido devem ter o **estoque aumentado em 5**.
@@setup
#loja
@@hint
Use `WHERE pedido_id IN (SELECT id FROM pedidos WHERE status = 'cancelado')` para os itens e `WHERE id NOT IN (SELECT produto_id FROM itens)` para os produtos.
@@starter

@@solution
DELETE FROM itens WHERE pedido_id IN (SELECT id FROM pedidos WHERE status = 'cancelado');
DELETE FROM pedidos WHERE status = 'cancelado';
UPDATE produtos SET estoque = estoque + 5 WHERE id NOT IN (SELECT produto_id FROM itens);
@@query
SELECT (SELECT COUNT(*) FROM pedidos) AS pedidos, (SELECT COUNT(*) FROM itens) AS itens, (SELECT group_concat(id || ':' || estoque, ',') FROM (SELECT id, estoque FROM produtos ORDER BY id)) AS estoques;
:::

### EXTRA sql-04

### Comparando textos, números e datas

O `WHERE` compara cada tipo de um jeito:

```sql
SELECT nome FROM produtos WHERE preco < 100;            -- números: ordem numérica
SELECT nome FROM clientes WHERE nome < 'C';             -- textos: ordem alfabética (Ana, Bruno)
SELECT id FROM pedidos WHERE data >= '2025-03-01';      -- datas ISO comparam bem como texto
```

Datas no formato **`AAAA-MM-DD`** podem ser comparadas como texto justamente porque o ano vem primeiro. Datas como `'05/01/2025'` **não** funcionam assim — por isso guarde sempre no formato ISO.

### Ordenando por mais de uma coluna

```sql
SELECT cidade, nome, idade
FROM clientes
ORDER BY cidade ASC, idade DESC;
```

| cidade | nome | idade |
|---|---|---|
| Belo Horizonte | Elisa Prado | 31 |
| Curitiba | Gabi Torres | 38 |
| Curitiba | Diego Rocha | 19 |
| Rio de Janeiro | Bruno Lima | 35 |
| … | … | … |

A segunda coluna só "desempata" linhas que têm o mesmo valor na primeira. Cada coluna tem sua própria direção (`ASC`/`DESC`).

Também é possível ordenar por uma expressão ou por um apelido:

```sql
SELECT nome, preco * estoque AS valor_em_estoque
FROM produtos
ORDER BY valor_em_estoque DESC;
```

### Onde ficam os NULLs na ordenação?

No SQLite e no MySQL, `NULL` é considerado **menor** que qualquer valor: aparece primeiro em `ASC` e por último em `DESC`. No PostgreSQL é o contrário. Para controlar, PostgreSQL e SQLite (3.30+) aceitam `ORDER BY email NULLS LAST`.

### Paginação com LIMIT e OFFSET

Para mostrar produtos de 3 em 3, ordenados por nome:

```sql
SELECT nome FROM produtos ORDER BY nome LIMIT 3 OFFSET 0;  -- página 1
SELECT nome FROM produtos ORDER BY nome LIMIT 3 OFFSET 3;  -- página 2
SELECT nome FROM produtos ORDER BY nome LIMIT 3 OFFSET 6;  -- página 3
```

A fórmula é `OFFSET = (página − 1) × tamanho_da_página`. **Sempre** use `ORDER BY` junto com `LIMIT`: sem ele, cada página pode trazer linhas diferentes a cada execução.

### Expressões no SELECT

```sql
SELECT nome,
       preco,
       preco * 0.9          AS com_desconto,
       ROUND(preco / 3, 2)  AS parcela_3x,
       nome || ' (' || categoria || ')' AS rotulo
FROM produtos;
```

`ROUND(x, 2)` arredonda para 2 casas e `||` junta textos.

:::exercicio sql ordered
Liste **nome** e **idade** dos clientes do **Rio de Janeiro**, do **mais novo para o mais velho**.
@@setup
#loja
@@starter

@@solution
SELECT nome, idade FROM clientes WHERE cidade = 'Rio de Janeiro' ORDER BY idade;
@@variant
INSERT INTO clientes (nome, cidade, idade, email) VALUES ('Lucas Pinto', 'Rio de Janeiro', 22, NULL);
UPDATE clientes SET cidade = 'Rio de Janeiro' WHERE id = 8;
:::

:::exercicio sql ordered
Liste **nome** e **preco** dos **3 produtos mais baratos**, do mais barato para o mais caro.
@@setup
#loja
@@starter

@@solution
SELECT nome, preco FROM produtos ORDER BY preco LIMIT 3;
@@variant
UPDATE produtos SET preco = 55 WHERE id = 3;
:::

:::exercicio sql ordered
A loja mostra produtos **em ordem alfabética**, **3 por página**, com o preço promocional de **10% de desconto**.

Mostre a **página 2**: as colunas `nome` e o preço com desconto com o apelido **`promocao`** (use `ROUND(preco * 0.9, 2)`).
@@setup
#loja
@@starter

@@solution
SELECT nome, ROUND(preco * 0.9, 2) AS promocao FROM produtos ORDER BY nome LIMIT 3 OFFSET 3;
@@variant
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Abajur', 'Casa', 70, 4), ('Caneca', 'Casa', 30, 50);
:::

### EXTRA sql-05

### Tabela-verdade do AND e do OR

| A | B | A AND B | A OR B |
|---|---|---|---|
| verdadeiro | verdadeiro | verdadeiro | verdadeiro |
| verdadeiro | falso | falso | verdadeiro |
| falso | verdadeiro | falso | verdadeiro |
| falso | falso | falso | falso |

E com `NULL` (desconhecido) — a chamada **lógica de três valores**:

| A | B | A AND B | A OR B |
|---|---|---|---|
| verdadeiro | NULL | NULL | verdadeiro |
| falso | NULL | falso | NULL |

O `WHERE` só deixa passar linhas cuja condição é **verdadeira**. `NULL` não passa.

### O perigo de misturar AND e OR sem parênteses

Queremos clientes de **São Paulo ou Curitiba** que tenham **menos de 30 anos**.

```sql
-- ERRADO: o AND é avaliado primeiro
WHERE cidade = 'São Paulo' OR cidade = 'Curitiba' AND idade < 30
-- o banco entende: São Paulo (qualquer idade)  OU  (Curitiba E menos de 30)

-- CERTO
WHERE (cidade = 'São Paulo' OR cidade = 'Curitiba') AND idade < 30
-- ou, mais legível:
WHERE cidade IN ('São Paulo', 'Curitiba') AND idade < 30
```

A versão errada traria Carla (42) e Hugo (50), de São Paulo. Regra prática: **sempre que misturar AND e OR, use parênteses**.

### NOT e suas formas

```sql
WHERE NOT (cidade = 'São Paulo')
WHERE cidade <> 'São Paulo'          -- equivalente (mas veja o NULL abaixo!)
WHERE preco NOT BETWEEN 100 AND 1000
WHERE nome NOT LIKE 'Livro%'
WHERE email IS NOT NULL
```

Cuidado: `cidade <> 'São Paulo'` **não** traz linhas com `cidade` `NULL` (comparar NULL dá desconhecido). Se quiser incluí-las: `WHERE cidade <> 'São Paulo' OR cidade IS NULL`.

### LIKE na prática

| Padrão | Combina com | Não combina com |
|---|---|---|
| `'Livro%'` | Livro SQL, Livro Python | O Livro |
| `'%Lima'` | Bruno Lima | Lima Barreto |
| `'%ar%'` | Carla, Cadeira | Mouse |
| `'_a%'` | Carla, Mariana | Ana |
| `'____'` | Mesa (exatamente 4 letras) | Mouse |

Para procurar um `%` ou `_` de verdade, use `ESCAPE`: `WHERE codigo LIKE '10\%%' ESCAPE '\'`.

### COALESCE e NULLIF

```sql
SELECT nome, COALESCE(email, 'sem e-mail') AS contato FROM clientes;
SELECT COALESCE(NULL, NULL, 'terceiro');     -- 'terceiro'
SELECT NULLIF(estoque, 0) FROM produtos;     -- vira NULL quando estoque = 0
```

`NULLIF` é útil para evitar divisão por zero: `preco / NULLIF(estoque, 0)`.

:::exercicio sql
Liste o **nome** dos produtos que custam **entre 80 e 200** (inclusive) **e** são das categorias **'Eletrônicos'** ou **'Livros'**.
@@setup
#loja
@@starter

@@solution
SELECT nome FROM produtos WHERE preco BETWEEN 80 AND 200 AND categoria IN ('Eletrônicos', 'Livros');
@@variant
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Livro IA', 'Livros', 200, 3), ('Banco', 'Móveis', 150, 2), ('Cabo', 'Eletrônicos', 79.9, 30);
:::

:::exercicio sql ordered
Liste **id**, **data** e **status** dos pedidos que **não** estão `'entregue'` nem `'cancelado'`, do pedido **mais antigo para o mais recente**.
@@setup
#loja
@@starter

@@solution
SELECT id, data, status FROM pedidos WHERE status NOT IN ('entregue', 'cancelado') ORDER BY data;
@@variant
INSERT INTO pedidos VALUES (11, 4, '2025-01-02', 'pendente'), (12, 7, '2025-05-01', 'devolvido');
:::

:::exercicio sql ordered
Para os clientes com **menos de 30 anos** **ou** que moram em **Curitiba**, mostre o **nome** e uma coluna **`contato`** com o e-mail ou, se não houver e-mail, o texto `'sem e-mail'`. Ordene por nome.
@@setup
#loja
@@starter

@@solution
SELECT nome, COALESCE(email, 'sem e-mail') AS contato FROM clientes WHERE idade < 30 OR cidade = 'Curitiba' ORDER BY nome;
@@variant
INSERT INTO clientes (nome, cidade, idade, email) VALUES ('Lia Mota', 'Recife', 21, NULL), ('Otto Paz', 'Curitiba', 60, 'otto@email.com');
:::

### EXTRA sql-06

### Como o GROUP BY funciona, passo a passo

```sql
SELECT categoria, COUNT(*) AS qtd, MIN(preco) AS mais_barato
FROM produtos
GROUP BY categoria;
```

1. O banco lê as 8 linhas de `produtos`.
2. Separa em grupos pela `categoria`: Eletrônicos (3 linhas), Móveis (2), Livros (2), Casa (1).
3. Para cada grupo, calcula as agregações.
4. Devolve **uma linha por grupo**:

| categoria | qtd | mais_barato |
|---|---|---|
| Casa | 1 | 60.0 |
| Eletrônicos | 3 | 80.0 |
| Livros | 2 | 90.0 |
| Móveis | 2 | 900.0 |

### Agrupando por mais de uma coluna

```sql
SELECT cliente_id, status, COUNT(*) AS qtd
FROM pedidos
GROUP BY cliente_id, status;
```

Cada combinação distinta de `(cliente_id, status)` vira um grupo: a cliente 1 tem uma linha para `entregue` (2 pedidos) e outra para `enviado` (1 pedido).

### Agregações e NULL

- `COUNT(*)` conta linhas; `COUNT(coluna)` ignora NULLs; `COUNT(DISTINCT coluna)` conta valores diferentes.
- `SUM`, `AVG`, `MIN`, `MAX` **ignoram** NULLs.
- Se não houver nenhuma linha, `SUM` devolve `NULL` (não 0). Use `COALESCE(SUM(x), 0)` quando precisar de zero.

```sql
SELECT COUNT(*) AS clientes,
       COUNT(email) AS com_email,
       COUNT(DISTINCT cidade) AS cidades
FROM clientes;
-- 8 | 6 | 4
```

### Médias "bonitas"

`AVG` devolve um número com muitas casas. Arredonde na exibição:

```sql
SELECT categoria, ROUND(AVG(preco), 2) AS preco_medio FROM produtos GROUP BY categoria;
```

Cuidado com divisão inteira em outros bancos: no PostgreSQL, `5 / 2` dá `2`. Para média manual, use `SUM(x) * 1.0 / COUNT(*)`.

### Filtrar antes ou depois?

Pergunta: "categorias de produtos **com estoque**, que tenham **2 ou mais** produtos". As duas condições vão em lugares diferentes:

```sql
SELECT categoria, COUNT(*) AS qtd
FROM produtos
WHERE estoque > 0          -- condição sobre cada PRODUTO → WHERE
GROUP BY categoria
HAVING COUNT(*) >= 2;      -- condição sobre o GRUPO → HAVING
```

Se uma condição não usa agregação, coloque no `WHERE`: o banco descarta as linhas antes de agrupar e trabalha menos.

:::exercicio sql
Mostre cada **status** de pedido e a **quantidade de pedidos** com aquele status.
@@setup
#loja
@@starter

@@solution
SELECT status, COUNT(*) FROM pedidos GROUP BY status;
@@variant
INSERT INTO pedidos VALUES (11, 4, '2025-05-01', 'pendente'), (12, 7, '2025-05-02', 'devolvido');
:::

:::exercicio sql
Para cada **categoria** de produto, mostre a categoria, o **preço médio arredondado para 2 casas** (`ROUND(AVG(preco), 2)`) e o **maior preço**.
@@setup
#loja
@@starter

@@solution
SELECT categoria, ROUND(AVG(preco), 2), MAX(preco) FROM produtos GROUP BY categoria;
@@variant
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Vaso', 'Casa', 45.5, 7), ('Estante', 'Móveis', 433.33, 2);
:::

:::exercicio sql ordered
Usando só a tabela `itens`, calcule o **valor total de cada pedido** (`SUM(quantidade * preco_unit)`) e mostre `pedido_id` e o total **apenas** dos pedidos acima de **500**, do **maior para o menor** total.
@@setup
#loja
@@starter

@@solution
SELECT pedido_id, SUM(quantidade * preco_unit) AS total FROM itens GROUP BY pedido_id HAVING SUM(quantidade * preco_unit) > 500 ORDER BY total DESC;
@@variant
INSERT INTO itens VALUES (9, 3, 4, 150), (2, 8, 10, 60);
:::

### EXTRA sql-07

### Visualizando o JOIN

Pense em duas listas lado a lado. O `ON` diz quais linhas "se encaixam":

```text
clientes                      pedidos
id | nome                     id | cliente_id | status
 1 | Ana      ◄────────────── 1  |     1      | entregue
 1 | Ana      ◄────────────── 3  |     1      | enviado
 1 | Ana      ◄────────────── 10 |     1      | entregue
 2 | Bruno    ◄────────────── 2  |     2      | entregue
 4 | Diego      (nenhum pedido)
```

- **INNER JOIN**: só as setas. Ana aparece 3 vezes (uma por pedido); Diego some.
- **LEFT JOIN** (clientes à esquerda): todas as setas **e** Diego, com as colunas de pedidos em `NULL`.

Uma linha da esquerda aparece **uma vez para cada correspondência** na direita. Por isso JOINs podem "multiplicar" linhas — e um `SUM` depois de um JOIN mal pensado pode somar valores repetidos.

### O lugar do filtro no LEFT JOIN

Esta é uma das pegadinhas mais famosas do SQL. Compare:

```sql
-- A) filtro no WHERE: transforma o LEFT JOIN em INNER JOIN na prática
SELECT c.nome, p.id
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.status = 'entregue';          -- clientes sem pedido entregue SOMEM

-- B) filtro no ON: mantém todos os clientes
SELECT c.nome, p.id
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id AND p.status = 'entregue';
-- clientes sem pedido entregue aparecem com p.id = NULL
```

Em A, para Diego `p.status` é NULL, então o `WHERE` o descarta. Em B, a condição faz parte do encaixe, e quem não encaixa continua aparecendo.

### Contando com LEFT JOIN

Quantos pedidos cada cliente fez, **incluindo quem não fez nenhum**:

```sql
SELECT c.nome, COUNT(p.id) AS pedidos
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nome
ORDER BY pedidos DESC;
```

Repare em `COUNT(p.id)` e não `COUNT(*)`: para Diego, a linha existe (com `p.id` NULL), então `COUNT(*)` daria 1; `COUNT(p.id)` dá 0, o correto.

### Self join: a tabela com ela mesma

Na tabela `funcionarios`, `gerente_id` aponta para outro funcionário. Para mostrar cada funcionário com o nome do seu gerente:

```sql
SELECT f.nome AS funcionario, g.nome AS gerente
FROM funcionarios f
LEFT JOIN funcionarios g ON g.id = f.gerente_id;
```

Os apelidos `f` e `g` são obrigatórios aqui: são duas "cópias" da mesma tabela.

### USING e NATURAL JOIN

Quando as colunas têm o mesmo nome nas duas tabelas, dá para escrever `JOIN t2 USING (coluna)`. O `NATURAL JOIN` junta por **todas** as colunas de mesmo nome — evite: se alguém criar uma coluna nova com nome repetido, a consulta muda de significado em silêncio.

:::exercicio sql
Mostre o **nome do cliente**, o **id do pedido** e a **data** de todos os pedidos (use `INNER JOIN` entre `pedidos` e `clientes`).
@@setup
#loja
@@starter

@@solution
SELECT c.nome, p.id, p.data FROM pedidos p JOIN clientes c ON c.id = p.cliente_id;
@@variant
INSERT INTO pedidos VALUES (11, 4, '2025-05-01', 'pendente');
:::

:::exercicio sql
Liste o **nome** dos clientes que **nunca fizeram nenhum pedido** (use `LEFT JOIN` e `IS NULL`).
@@setup
#loja
@@starter

@@solution
SELECT c.nome FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;
@@variant
INSERT INTO pedidos VALUES (11, 4, '2025-05-01', 'pendente');
INSERT INTO clientes (nome, cidade, idade) VALUES ('Nina Sol', 'Recife', 29);
:::

:::exercicio sql ordered
Para **cada produto** (inclusive os que nunca foram vendidos), mostre o **nome** e a **quantidade total vendida** em pedidos que **não estão cancelados** (0 se não houver vendas). Ordene pela quantidade (maior primeiro) e depois pelo nome.

Dica: o filtro de status precisa ficar no lugar certo para não sumir com os produtos sem venda.
@@setup
#loja
@@hint
Faça `produtos LEFT JOIN (itens JOIN pedidos ... AND status <> 'cancelado')`, ou junte os pedidos com LEFT JOIN e coloque a condição de status no `ON`. Use `COALESCE(SUM(...), 0)`.
@@starter

@@solution
SELECT pr.nome, COALESCE(SUM(i.quantidade), 0) AS vendidos
FROM produtos pr
LEFT JOIN (itens i JOIN pedidos p ON p.id = i.pedido_id AND p.status <> 'cancelado') ON i.produto_id = pr.id
GROUP BY pr.id, pr.nome
ORDER BY vendidos DESC, pr.nome;
@@variant
UPDATE pedidos SET status = 'cancelado' WHERE id IN (1, 6);
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Webcam', 'Eletrônicos', 250, 3);
:::

### EXTRA sql-08

### Por que confiar no banco e não só na aplicação

Uma aplicação pode ter vários pontos de entrada: o site, o app de celular, um script de importação, alguém rodando SQL direto. Se a regra "preço não pode ser negativo" existe só no código do site, o script de importação pode gravar `-50` sem ninguém perceber. Uma restrição no banco vale **para todos**, sempre.

### Testando as restrições na prática (SQLite)

```sql
PRAGMA foreign_keys = ON;

INSERT INTO produtos (nome, categoria, preco) VALUES ('Erro', 'Casa', -5);
-- Erro: CHECK constraint failed: preco >= 0

INSERT INTO clientes (nome, email) VALUES ('Clone', 'ana@email.com');
-- Erro: UNIQUE constraint failed: clientes.email

INSERT INTO pedidos (cliente_id, data, status) VALUES (999, '2025-05-01', 'pendente');
-- Erro: FOREIGN KEY constraint failed
```

### Dando nomes às restrições

Restrições com nome deixam as mensagens de erro e as migrações mais claras:

```sql
CREATE TABLE cupons (
    codigo   TEXT PRIMARY KEY,
    desconto REAL NOT NULL,
    CONSTRAINT desconto_valido CHECK (desconto > 0 AND desconto <= 0.5)
);
```

### Escolhendo a ação da chave estrangeira

| Situação | Ação indicada | Por quê |
|---|---|---|
| itens de um pedido | `ON DELETE CASCADE` | item não faz sentido sem o pedido |
| pedidos de um cliente | `ON DELETE RESTRICT` | não se apaga histórico de vendas por acidente |
| funcionário e seu gerente | `ON DELETE SET NULL` | se o gerente sair, o funcionário fica temporariamente sem gerente |

Também existe `ON UPDATE CASCADE`, que atualiza as referências se a chave do pai mudar (raro quando se usam ids numéricos).

### Chaves naturais x substitutas

- **Natural**: um dado do mundo real que já é único (CPF, código ISBN, sigla do estado).
- **Substituta** (*surrogate*): um número gerado pelo banco (`id`).

O mais comum é usar **id substituto** como chave primária **e** `UNIQUE` na chave natural. Assim, se o dado natural precisar ser corrigido, nenhuma referência quebra.

### As formas normais em exemplos

Tabela ruim:

| pedido | cliente | cidade_cliente | produtos |
|---|---|---|---|
| 1 | Ana | São Paulo | Notebook, Mouse |

- **1FN** (valores atômicos): "Notebook, Mouse" numa célula viola. Solução: uma linha por produto (tabela `itens`).
- **2FN** (sem dependência parcial): numa tabela com chave `(pedido, produto)`, o nome do cliente depende só do pedido. Solução: separar `pedidos`.
- **3FN** (sem dependência transitiva): a cidade depende do cliente, não do pedido. Solução: separar `clientes`.

O resultado é exatamente o modelo da loja do curso.

:::exercicio sql
Crie a tabela **`categorias`** com `id` (inteiro, chave primária) e `nome` (texto, **obrigatório** e **único**).
@@starter

@@solution
CREATE TABLE categorias (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE);
@@query
INSERT INTO categorias (nome) VALUES ('Livros'), ('Casa');
INSERT OR IGNORE INTO categorias (nome) VALUES ('Livros');
INSERT OR IGNORE INTO categorias (nome) VALUES (NULL);
INSERT INTO categorias (nome) VALUES ('Móveis');
SELECT id, nome FROM categorias ORDER BY id;
:::

:::exercicio sql
Crie a tabela **`enderecos`** com:
- `id` inteiro chave primária;
- `cliente_id` inteiro, chave estrangeira para `clientes(id)` com **ON DELETE SET NULL**;
- `rua` texto obrigatório.

O verificador liga as FKs, cadastra endereços, apaga um cliente e confere o resultado.
@@setup
#loja
@@starter

@@solution
CREATE TABLE enderecos (
    id INTEGER PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    rua TEXT NOT NULL
);
@@query
PRAGMA foreign_keys = ON;
INSERT INTO enderecos (cliente_id, rua) VALUES (4, 'Rua A'), (7, 'Rua B'), (4, 'Rua C');
INSERT OR IGNORE INTO enderecos (cliente_id, rua) VALUES (7, NULL);
DELETE FROM clientes WHERE id = 4;
SELECT id, cliente_id, rua FROM enderecos ORDER BY id;
:::

:::exercicio sql
Crie a tabela **`cupons`** com:
- `codigo` texto, chave primária;
- `desconto` real **obrigatório**, que só aceita valores **maiores que 0 e no máximo 0.5** (CHECK);
- `usos_max` inteiro com padrão **100** que precisa ser **maior que zero**.

O verificador tenta inserir cupons válidos e inválidos.
@@starter

@@solution
CREATE TABLE cupons (
    codigo TEXT PRIMARY KEY,
    desconto REAL NOT NULL CHECK (desconto > 0 AND desconto <= 0.5),
    usos_max INTEGER DEFAULT 100 CHECK (usos_max > 0)
);
@@query
INSERT INTO cupons (codigo, desconto) VALUES ('BEMVINDO', 0.1), ('METADE', 0.5);
INSERT INTO cupons (codigo, desconto, usos_max) VALUES ('VIP', 0.25, 5);
INSERT OR IGNORE INTO cupons (codigo, desconto) VALUES ('ZERO', 0);
INSERT OR IGNORE INTO cupons (codigo, desconto) VALUES ('DEMAIS', 0.6);
INSERT OR IGNORE INTO cupons (codigo, desconto, usos_max) VALUES ('NEG', 0.2, 0);
INSERT OR IGNORE INTO cupons (codigo, desconto) VALUES ('NULO', NULL);
INSERT OR IGNORE INTO cupons (codigo, desconto) VALUES ('VIP', 0.3);
SELECT codigo, desconto, usos_max FROM cupons ORDER BY codigo;
:::

### EXTRA sql-09

### Os três "formatos" de subconsulta

| Formato | Retorna | Onde costuma ir | Exemplo |
|---|---|---|---|
| Escalar | 1 linha, 1 coluna | `SELECT`, `WHERE` | `(SELECT AVG(preco) FROM produtos)` |
| Lista | várias linhas, 1 coluna | `IN`, `NOT IN` | `(SELECT cliente_id FROM pedidos)` |
| Tabela | várias linhas e colunas | `FROM`, `JOIN` | `(SELECT ... GROUP BY ...) AS t` |

Se uma subconsulta escalar devolver **mais de uma linha**, o PostgreSQL dá erro; o SQLite usa silenciosamente a primeira linha — mais um motivo para garantir que ela devolve um único valor.

### Subconsulta escalar no SELECT

Mostrar cada produto ao lado da média geral e da diferença:

```sql
SELECT nome,
       preco,
       ROUND((SELECT AVG(preco) FROM produtos), 2) AS media,
       ROUND(preco - (SELECT AVG(preco) FROM produtos), 2) AS diferenca
FROM produtos
ORDER BY diferenca DESC;
```

### Correlacionada: pensando "para cada linha"

```sql
SELECT c.nome,
       (SELECT COUNT(*) FROM pedidos p WHERE p.cliente_id = c.id) AS qtd_pedidos
FROM clientes c;
```

Leia assim: "para cada cliente `c`, conte os pedidos cujo `cliente_id` é o `c.id` dele". O resultado é igual ao do `LEFT JOIN ... GROUP BY` da aula anterior. Muitas vezes as duas formas são equivalentes; escolha a que fica mais clara.

### EXISTS x IN x JOIN

Três jeitos de achar "clientes que têm pelo menos um pedido entregue":

```sql
SELECT nome FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'entregue');

SELECT nome FROM clientes c
WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id AND p.status = 'entregue');

SELECT DISTINCT c.nome FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'entregue';
```

Todas dão o mesmo resultado. A do JOIN precisa do `DISTINCT`, porque a Ana tem dois pedidos entregues e apareceria duas vezes. O `EXISTS` para de procurar assim que encontra a primeira correspondência.

### Tabela derivada: agregar em duas etapas

"Qual é o gasto médio **por cliente**?" exige duas agregações: primeiro somar por cliente, depois tirar a média dessas somas.

```sql
SELECT ROUND(AVG(gasto), 2) AS gasto_medio_por_cliente
FROM (
    SELECT p.cliente_id, SUM(i.quantidade * i.preco_unit) AS gasto
    FROM pedidos p JOIN itens i ON i.pedido_id = p.id
    GROUP BY p.cliente_id
) AS por_cliente;
```

Não dá para escrever `AVG(SUM(...))` diretamente: agregações não podem ser aninhadas.

:::exercicio sql
Liste **nome** e **preco** dos produtos que custam **mais que a média de preço de todos os produtos**.
@@setup
#loja
@@starter

@@solution
SELECT nome, preco FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos);
@@variant
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Geladeira', 'Casa', 5000, 2);
:::

:::exercicio sql
Liste o **nome** dos clientes que têm **pelo menos um pedido com status `'enviado'`** (use uma subconsulta com `IN` ou `EXISTS`).
@@setup
#loja
@@starter

@@solution
SELECT nome FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'enviado');
@@variant
UPDATE pedidos SET status = 'enviado' WHERE id IN (6, 8);
UPDATE pedidos SET status = 'entregue' WHERE id = 3;
:::

:::exercicio sql
Liste o **nome** dos clientes cujo **gasto total** (soma de `quantidade * preco_unit` de todos os seus pedidos, de qualquer status) é **maior que o gasto médio por cliente** (considerando só clientes que compraram).

Dica: calcule o gasto por cliente numa tabela derivada (ou CTE) e compare com a média desses gastos.
@@setup
#loja
@@starter

@@solution
SELECT c.nome
FROM clientes c
JOIN (SELECT p.cliente_id, SUM(i.quantidade * i.preco_unit) AS gasto
      FROM pedidos p JOIN itens i ON i.pedido_id = p.id
      GROUP BY p.cliente_id) g ON g.cliente_id = c.id
WHERE g.gasto > (SELECT AVG(gasto) FROM (SELECT SUM(i.quantidade * i.preco_unit) AS gasto
                                         FROM pedidos p JOIN itens i ON i.pedido_id = p.id
                                         GROUP BY p.cliente_id));
@@variant
INSERT INTO itens VALUES (9, 1, 2, 3500);
:::

### EXTRA sql-10

### CTE x subconsulta: o mesmo resultado, leitura diferente

Com subconsulta (lê-se de dentro para fora):

```sql
SELECT c.nome, t.total
FROM clientes c
JOIN (SELECT p.cliente_id, SUM(i.quantidade * i.preco_unit) AS total
      FROM pedidos p JOIN itens i ON i.pedido_id = p.id
      GROUP BY p.cliente_id) t ON t.cliente_id = c.id;
```

Com CTE (lê-se de cima para baixo, como uma receita):

```sql
WITH gasto_por_cliente AS (
    SELECT p.cliente_id, SUM(i.quantidade * i.preco_unit) AS total
    FROM pedidos p JOIN itens i ON i.pedido_id = p.id
    GROUP BY p.cliente_id
)
SELECT c.nome, g.total
FROM clientes c
JOIN gasto_por_cliente g ON g.cliente_id = c.id;
```

### Várias CTEs encadeadas

Cada CTE pode usar as anteriores. Exemplo: "clientes que gastaram acima da média":

```sql
WITH gastos AS (
    SELECT p.cliente_id, SUM(i.quantidade * i.preco_unit) AS total
    FROM pedidos p JOIN itens i ON i.pedido_id = p.id
    GROUP BY p.cliente_id
),
media AS (
    SELECT AVG(total) AS valor FROM gastos
)
SELECT c.nome, g.total
FROM gastos g
JOIN clientes c ON c.id = g.cliente_id
WHERE g.total > (SELECT valor FROM media);
```

Compare com o último exercício da aula anterior: a lógica é a mesma, mas cada passo tem nome.

### Acompanhando uma recursão linha a linha

```sql
WITH RECURSIVE cadeia(id, nome, nivel) AS (
    SELECT id, nome, 0 FROM funcionarios WHERE gerente_id IS NULL     -- âncora
    UNION ALL
    SELECT f.id, f.nome, c.nivel + 1
    FROM funcionarios f JOIN cadeia c ON f.gerente_id = c.id           -- passo
)
SELECT * FROM cadeia;
```

| Rodada | Linhas novas |
|---|---|
| âncora | Marta (0) |
| 1 | Paulo (1), Renata (1) — subordinados de Marta |
| 2 | Sérgio, Tânia (2) — de Paulo; Vera, Wagner, Xênia (2) — de Renata |
| 3 | Ulisses (3) — de Sérgio |
| 4 | nenhuma → fim |

### Montando um caminho

Dá para acumular texto a cada passo para mostrar a cadeia hierárquica:

```sql
WITH RECURSIVE caminho(id, trilha) AS (
    SELECT id, nome FROM funcionarios WHERE gerente_id IS NULL
    UNION ALL
    SELECT f.id, c.trilha || ' > ' || f.nome
    FROM funcionarios f JOIN caminho c ON f.gerente_id = c.id
)
SELECT trilha FROM caminho;
-- Marta > Paulo > Sérgio > Ulisses ...
```

### Gerando datas (calendário)

Recursão também cria linhas que não existem em tabela nenhuma, como todos os meses de um período — útil para relatórios que precisam mostrar meses **sem** vendas com zero:

```sql
WITH RECURSIVE meses(mes) AS (
    SELECT '2025-01-01'
    UNION ALL
    SELECT date(mes, '+1 month') FROM meses WHERE mes < '2025-06-01'
)
SELECT strftime('%Y-%m', mes) FROM meses;
```

!> Sempre coloque uma condição de parada (`WHERE mes < ...`). Em dados com ciclos (A gerencia B e B gerencia A), use `UNION` em vez de `UNION ALL` ou um limite de nível para não entrar em laço infinito.

:::exercicio sql
Usando uma **CTE** chamada `totais` (pedido e soma de `quantidade * preco_unit`), liste o **id** e o **status** dos pedidos cujo total é **maior que 1000**.
@@setup
#loja
@@starter
WITH totais AS (

)
SELECT ...;
@@solution
WITH totais AS (
    SELECT pedido_id, SUM(quantidade * preco_unit) AS total FROM itens GROUP BY pedido_id
)
SELECT p.id, p.status FROM pedidos p JOIN totais t ON t.pedido_id = p.id WHERE t.total > 1000;
@@variant
INSERT INTO itens VALUES (2, 4, 2, 900);
:::

:::exercicio sql ordered
Com **WITH RECURSIVE**, mostre o **nome** e o **nível hierárquico** de **todos** os funcionários, sendo a diretora Marta (sem gerente) o nível **0**, seus subordinados diretos nível 1, e assim por diante. Ordene por nível e depois por nome.
@@setup
#empresa
@@starter

@@solution
WITH RECURSIVE h(id, nome, nivel) AS (
    SELECT id, nome, 0 FROM funcionarios WHERE gerente_id IS NULL
    UNION ALL
    SELECT f.id, f.nome, h.nivel + 1 FROM funcionarios f JOIN h ON f.gerente_id = h.id
)
SELECT nome, nivel FROM h ORDER BY nivel, nome;
@@variant
INSERT INTO funcionarios VALUES (10, 'Yuri', 'TI', 4000, 6, '2024-02-01');
:::

:::exercicio sql ordered
Relatório de vendas mensal **sem buracos**: para **cada mês de janeiro a junho de 2025** (formato `'AAAA-MM'`), mostre o mês e a **quantidade de pedidos** — inclusive os meses sem pedido nenhum, que devem aparecer com **0**. Ordene por mês.

Dica: gere os meses com uma CTE recursiva e faça um `LEFT JOIN` com os pedidos.
@@setup
#loja
@@hint
Gere `'2025-01-01'`, `date(mes, '+1 month')`... até `'2025-06-01'`; depois `LEFT JOIN pedidos p ON strftime('%Y-%m', p.data) = strftime('%Y-%m', m.mes)` e `COUNT(p.id)`.
@@starter

@@solution
WITH RECURSIVE meses(mes) AS (
    SELECT '2025-01-01'
    UNION ALL
    SELECT date(mes, '+1 month') FROM meses WHERE mes < '2025-06-01'
)
SELECT strftime('%Y-%m', m.mes) AS mes, COUNT(p.id) AS pedidos
FROM meses m
LEFT JOIN pedidos p ON strftime('%Y-%m', p.data) = strftime('%Y-%m', m.mes)
GROUP BY m.mes
ORDER BY m.mes;
@@variant
INSERT INTO pedidos VALUES (11, 4, '2025-06-15', 'pendente'), (12, 7, '2025-06-20', 'pendente');
DELETE FROM itens WHERE pedido_id IN (SELECT id FROM pedidos WHERE data LIKE '2025-02%');
DELETE FROM pedidos WHERE data LIKE '2025-02%';
:::

### EXTRA sql-11

### GROUP BY x window function no mesmo dado

```sql
-- GROUP BY: uma linha por departamento
SELECT depto, AVG(salario) FROM funcionarios GROUP BY depto;
```

| depto | AVG(salario) |
|---|---|
| Diretoria | 20000 |
| TI | 8500 |
| Vendas | 7625 |

```sql
-- window: cada funcionário continua aparecendo, com a média do seu depto ao lado
SELECT nome, depto, salario, AVG(salario) OVER (PARTITION BY depto) AS media_depto
FROM funcionarios;
```

| nome | depto | salario | media_depto |
|---|---|---|---|
| Paulo | TI | 12000 | 8500 |
| Sérgio | TI | 8000 | 8500 |
| Vera | Vendas | 7000 | 7625 |
| … | … | … | … |

### OVER() vazio

`SUM(salario) OVER ()` usa a tabela inteira como uma única janela. Útil para percentuais:

```sql
SELECT nome, salario,
       ROUND(100.0 * salario / SUM(salario) OVER (), 1) AS pct_da_folha
FROM funcionarios;
```

### Total acumulado, passo a passo

```sql
SELECT pedido_id, total,
       SUM(total) OVER (ORDER BY pedido_id) AS acumulado
FROM (SELECT pedido_id, SUM(quantidade * preco_unit) AS total FROM itens GROUP BY pedido_id);
```

| pedido_id | total | acumulado |
|---|---|---|
| 1 | 3580 | 3580 |
| 2 | 180 | 3760 |
| 3 | 310 | 4070 |
| … | … | … |

A cada linha, a janela vai "do início até aqui".

### LAG e LEAD para comparar com a linha vizinha

Quantos dias se passaram entre um pedido e o anterior do mesmo cliente?

```sql
SELECT cliente_id, data,
       LAG(data) OVER (PARTITION BY cliente_id ORDER BY data) AS pedido_anterior,
       julianday(data) - julianday(LAG(data) OVER (PARTITION BY cliente_id ORDER BY data)) AS dias
FROM pedidos;
```

Na primeira linha de cada cliente, `LAG` devolve `NULL` (não há anterior). `LAG(x, 2)` olha duas linhas atrás; `LAG(x, 1, 0)` usa 0 como valor padrão.

### Outras funções úteis

| Função | Para quê |
|---|---|
| `NTILE(4) OVER (ORDER BY salario)` | divide em 4 grupos (quartis) |
| `FIRST_VALUE(nome) OVER (PARTITION BY depto ORDER BY salario DESC)` | o primeiro da janela (o maior salário do depto) |
| `PERCENT_RANK()` | posição relativa de 0 a 1 |

### Janela nomeada

Quando várias funções usam a mesma janela, nomeie-a com `WINDOW`:

```sql
SELECT nome, salario,
       RANK() OVER w AS posicao,
       AVG(salario) OVER w AS media
FROM funcionarios
WINDOW w AS (PARTITION BY depto ORDER BY salario DESC);
```

:::exercicio sql ordered
Mostre **nome**, **salario** e uma numeração sequencial (`ROW_NUMBER`) de **todos** os funcionários do **maior para o menor salário** (empates desempatados pelo **nome**). Ordene pela numeração.
@@setup
#empresa
@@starter

@@solution
SELECT nome, salario, ROW_NUMBER() OVER (ORDER BY salario DESC, nome) AS n FROM funcionarios ORDER BY n;
@@variant
UPDATE funcionarios SET salario = 12000 WHERE id = 3;
:::

:::exercicio sql ordered
Mostre **nome**, **depto**, **salario**, a **média salarial do departamento** (`AVG ... OVER (PARTITION BY depto)`) e a **diferença** entre o salário e essa média (salário − média). Ordene por depto e nome.
@@setup
#empresa
@@starter

@@solution
SELECT nome, depto, salario,
       AVG(salario) OVER (PARTITION BY depto) AS media_depto,
       salario - AVG(salario) OVER (PARTITION BY depto) AS diferenca
FROM funcionarios
ORDER BY depto, nome;
@@variant
INSERT INTO funcionarios VALUES (10, 'Yuri', 'TI', 15000, 2, '2024-02-01');
:::

:::exercicio sql ordered
Mostre os **2 maiores salários de cada departamento**: colunas **depto**, **nome** e **salario**. Em caso de empate de salário, vence quem vem antes em **ordem alfabética**. Ordene por depto e depois por salário (maior primeiro) e nome.

Dica: `ROW_NUMBER()` numa CTE e filtro na consulta de fora.
@@setup
#empresa
@@starter

@@solution
WITH r AS (
    SELECT depto, nome, salario,
           ROW_NUMBER() OVER (PARTITION BY depto ORDER BY salario DESC, nome) AS rn
    FROM funcionarios
)
SELECT depto, nome, salario FROM r WHERE rn <= 2 ORDER BY depto, salario DESC, nome;
@@variant
INSERT INTO funcionarios VALUES (10, 'Ana', 'Vendas', 11000, 3, '2024-02-01'), (11, 'Bia', 'Diretoria', 19000, 1, '2024-03-01');
:::

### EXTRA sql-12

### CASE simples x CASE pesquisado

```sql
-- CASE simples: compara uma expressão com valores
SELECT id,
  CASE status
    WHEN 'entregue'  THEN '✔ concluído'
    WHEN 'cancelado' THEN '✖ cancelado'
    ELSE '… em andamento'
  END AS situacao
FROM pedidos;

-- CASE pesquisado: cada WHEN tem sua própria condição
SELECT nome,
  CASE
    WHEN idade < 25 THEN 'jovem'
    WHEN idade < 40 THEN 'adulto'
    ELSE 'experiente'
  END AS faixa
FROM clientes;
```

### CASE em ORDER BY e em agregações (pivot)

Ordem personalizada de status:

```sql
SELECT id, status FROM pedidos
ORDER BY CASE status WHEN 'pendente' THEN 1 WHEN 'enviado' THEN 2 WHEN 'entregue' THEN 3 ELSE 4 END;
```

"Girar" linhas em colunas (*pivot*) — uma linha por cliente, uma coluna por status:

```sql
SELECT cliente_id,
       SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) AS entregues,
       SUM(CASE WHEN status = 'enviado'  THEN 1 ELSE 0 END) AS enviados,
       SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) AS cancelados
FROM pedidos
GROUP BY cliente_id;
```

(O SQLite e o PostgreSQL também aceitam `COUNT(*) FILTER (WHERE status = 'entregue')`.)

### Regras das operações de conjunto

- Mesmo **número de colunas**, com tipos compatíveis.
- Os **nomes** das colunas do resultado vêm do **primeiro** SELECT.
- `ORDER BY` só no **final**, valendo para o resultado combinado.

```sql
SELECT nome, 'cliente' AS tipo FROM clientes
UNION ALL
SELECT nome, 'funcionário' FROM funcionarios   -- (se as duas tabelas estivessem no mesmo banco)
ORDER BY nome;
```

`INTERSECT` e `EXCEPT` em exemplos:

```sql
-- cidades que têm cliente jovem E cliente com mais de 40
SELECT cidade FROM clientes WHERE idade < 30
INTERSECT
SELECT cidade FROM clientes WHERE idade > 40;          -- São Paulo

-- produtos que nunca foram vendidos
SELECT id FROM produtos
EXCEPT
SELECT produto_id FROM itens;
```

### Funções de texto em ação

```sql
SELECT UPPER(nome)                         AS maiusculo,
       LENGTH(nome)                        AS letras,
       SUBSTR(nome, 1, INSTR(nome, ' ') - 1) AS primeiro_nome,
       REPLACE(email, '@email.com', '')    AS usuario,
       TRIM('   espaços   ')               AS sem_espacos
FROM clientes;
```

`INSTR(texto, ' ')` dá a posição do primeiro espaço; combinado com `SUBSTR`, extrai o primeiro nome.

### Datas no SQLite

| Expressão | Resultado |
|---|---|
| `date('2025-01-31', '+1 day')` | `2025-02-01` |
| `date('2025-03-15', 'start of month')` | `2025-03-01` |
| `strftime('%d/%m/%Y', '2025-04-25')` | `25/04/2025` |
| `strftime('%w', '2025-04-25')` | `5` (dia da semana, 0 = domingo) |
| `julianday('2025-04-25') - julianday('2025-01-05')` | `110.0` (dias) |

:::exercicio sql
Mostre o **nome** de cada cliente e uma coluna **`faixa`** com:
- `'jovem'` para menos de **25** anos;
- `'adulto'` de **25 a 39**;
- `'experiente'` para **40 ou mais**.
@@setup
#loja
@@starter

@@solution
SELECT nome, CASE WHEN idade < 25 THEN 'jovem' WHEN idade < 40 THEN 'adulto' ELSE 'experiente' END AS faixa FROM clientes;
@@variant
INSERT INTO clientes (nome, cidade, idade) VALUES ('Teo', 'Recife', 25), ('Rui', 'Recife', 40), ('Gil', 'Recife', 24);
:::

:::exercicio sql
Usando **`INTERSECT`**, liste as **cidades** que têm **ao mesmo tempo** algum cliente com **menos de 30 anos** e algum cliente com **mais de 30 anos**.
@@setup
#loja
@@starter

@@solution
SELECT cidade FROM clientes WHERE idade < 30
INTERSECT
SELECT cidade FROM clientes WHERE idade > 30;
@@variant
INSERT INTO clientes (nome, cidade, idade) VALUES ('Lia', 'Belo Horizonte', 20), ('Max', 'Recife', 18);
:::

:::exercicio sql ordered
Para cada cliente que fez pedidos, mostre:
- o **primeiro nome** em **maiúsculas** (o texto antes do primeiro espaço);
- a data do **primeiro** pedido;
- quantos **dias** se passaram entre o primeiro e o último pedido (use `julianday`; 0 se fez um só).

Ordene pelo primeiro nome.
@@setup
#loja
@@hint
Junte clientes e pedidos, agrupe por cliente e use `MIN(data)`, `MAX(data)`, `UPPER(SUBSTR(nome, 1, INSTR(nome, ' ') - 1))`.
@@starter

@@solution
SELECT UPPER(SUBSTR(c.nome, 1, INSTR(c.nome, ' ') - 1)) AS primeiro_nome,
       MIN(p.data) AS primeiro_pedido,
       julianday(MAX(p.data)) - julianday(MIN(p.data)) AS dias
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id
ORDER BY primeiro_nome;
@@variant
INSERT INTO pedidos VALUES (11, 5, '2025-06-01', 'entregue'), (12, 4, '2025-02-10', 'pendente');
:::

### EXTRA sql-13

### Por que transações existem: duas situações reais

**1. Falha no meio do caminho.** Sem transação:

```sql
UPDATE contas SET saldo = saldo - 200 WHERE id = 1;   -- executou
-- 💥 queda de energia aqui
UPDATE contas SET saldo = saldo + 200 WHERE id = 2;   -- nunca executou
```

R$ 200 sumiram. Com `BEGIN ... COMMIT`, o banco garante que, se o `COMMIT` não aconteceu, nenhuma das alterações vale.

**2. Duas pessoas ao mesmo tempo.** Ana e Bruno compram o último notebook (estoque = 1) no mesmo segundo. Os dois leem "estoque 1", os dois vendem, e o estoque vai a −1. Transações com o nível de isolamento adequado (ou `SELECT ... FOR UPDATE`, ou um `UPDATE ... WHERE estoque > 0` atômico) evitam isso.

### O jeito atômico de baixar estoque

```sql
UPDATE produtos SET estoque = estoque - 1
WHERE id = 1 AND estoque > 0;
-- se "linhas afetadas" = 0, não havia estoque: avise o cliente
```

Ler o valor, calcular na aplicação e gravar depois abre uma janela para conflito. Fazer a conta **dentro** do `UPDATE` é atômico.

### Autocommit

Quando você não abre uma transação, cada comando é uma transação sozinho (**autocommit**): executou, já está confirmado. Em Python, o módulo `sqlite3` abre transações implicitamente antes de INSERT/UPDATE/DELETE — por isso é preciso chamar `commit()`.

### Erros dentro da transação

No SQLite, se um comando falha dentro de uma transação, **só aquele comando** é desfeito; a transação continua aberta e cabe a você decidir entre `COMMIT` e `ROLLBACK`. No PostgreSQL, depois de um erro a transação inteira fica "abortada" e só aceita `ROLLBACK` (ou `ROLLBACK TO SAVEPOINT`). Em código de aplicação, o padrão é:

```text
BEGIN
  tenta todos os comandos
  se tudo deu certo → COMMIT
  se algo falhou    → ROLLBACK
```

### SAVEPOINT na prática: importação com itens opcionais

```sql
BEGIN;
INSERT INTO pedidos VALUES (20, 4, '2025-05-01', 'pendente');
SAVEPOINT itens_extras;
INSERT INTO itens VALUES (20, 99, 1, 10);   -- produto 99 não existe (com FKs ligadas, falharia)
ROLLBACK TO itens_extras;                   -- desfaz só os itens extras
INSERT INTO itens VALUES (20, 2, 1, 80);
COMMIT;                                     -- pedido + item válido confirmados
```

`RELEASE nome` descarta o savepoint mantendo as alterações.

### Deadlock

Transação A trava a conta 1 e quer a conta 2; transação B trava a conta 2 e quer a conta 1. Ninguém avança: é um **deadlock**. Bancos detectam isso e cancelam uma das transações (que deve ser repetida pela aplicação). Para reduzir as chances: transações **curtas** e acesso às linhas **sempre na mesma ordem** (por exemplo, menor id primeiro).

:::exercicio sql
Registre um **depósito de 250** na conta **3 (Carla)** de forma atômica: dentro de uma **transação**, aumente o saldo e insira o movimento correspondente (`valor` = 250, `descricao` = `'depósito'`), confirmando no fim.
@@setup
#banco
@@starter
BEGIN;

COMMIT;
@@solution
BEGIN;
UPDATE contas SET saldo = saldo + 250 WHERE id = 3;
INSERT INTO movimentos (conta_id, valor, descricao) VALUES (3, 250, 'depósito');
COMMIT;
@@query
SELECT c.id, c.saldo, (SELECT group_concat(valor || '/' || descricao) FROM movimentos m WHERE m.conta_id = c.id) AS movs FROM contas c ORDER BY c.id;
:::

:::exercicio sql
Numa única transação:
1. transfira **100** da conta 1 para a conta 2 (dois UPDATEs);
2. crie um **SAVEPOINT** chamado `bonus`;
3. dê um bônus de **50** para a conta 2;
4. o bônus foi um engano: volte com **ROLLBACK TO bonus**;
5. confirme a transação.

No fim, só a transferência deve valer.
@@setup
#banco
@@starter
BEGIN;

COMMIT;
@@solution
BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
SAVEPOINT bonus;
UPDATE contas SET saldo = saldo + 50 WHERE id = 2;
ROLLBACK TO bonus;
COMMIT;
@@query
SELECT id, saldo FROM contas ORDER BY id;
:::

:::exercicio sql
**Fechamento do mês.** Numa transação:
1. registre na tabela `movimentos` um movimento de **juros de 2%** para **cada conta com saldo maior que zero** (`valor` = saldo × 0.02, `descricao` = `'juros'`) — use `INSERT ... SELECT`;
2. aplique os juros nos saldos dessas contas (`saldo = saldo * 1.02`);
3. confirme.

Atenção à ordem: os movimentos precisam usar o saldo **antes** dos juros.
@@setup
#banco
@@starter
BEGIN;

COMMIT;
@@solution
BEGIN;
INSERT INTO movimentos (conta_id, valor, descricao) SELECT id, saldo * 0.02, 'juros' FROM contas WHERE saldo > 0;
UPDATE contas SET saldo = saldo * 1.02 WHERE saldo > 0;
COMMIT;
@@query
SELECT c.id, ROUND(c.saldo, 2), (SELECT ROUND(SUM(valor), 2) FROM movimentos m WHERE m.conta_id = c.id AND descricao = 'juros') AS juros, (SELECT COUNT(*) FROM movimentos) AS total_movs FROM contas c ORDER BY c.id;
:::

### EXTRA sql-14

### Por dentro de uma B-tree (de forma simplificada)

Imagine o índice `idx_clientes_cidade` como um fichário ordenado:

```text
                [ Curitiba | São Paulo ]
               /           |            \
 [Belo Horizonte]  [Curitiba, Rio de Janeiro]  [São Paulo]
      → id 5        → ids 4,7   → ids 2,6       → ids 1,3,8
```

Para achar "Rio de Janeiro", o banco desce poucos níveis em vez de ler todas as linhas. Com milhões de linhas, uma busca no índice percorre só alguns níveis (a altura cresce de forma **logarítmica**), enquanto a varredura lê tudo.

### Experimento com EXPLAIN QUERY PLAN

```sql
EXPLAIN QUERY PLAN SELECT * FROM clientes WHERE cidade = 'Curitiba';
-- SCAN clientes

CREATE INDEX idx_clientes_cidade ON clientes (cidade);

EXPLAIN QUERY PLAN SELECT * FROM clientes WHERE cidade = 'Curitiba';
-- SEARCH clientes USING INDEX idx_clientes_cidade (cidade=?)
```

Outras saídas que você vai encontrar:

| Plano (SQLite) | Significado |
|---|---|
| `SCAN t` | lê a tabela inteira |
| `SEARCH t USING INDEX idx (col=?)` | busca pelo índice |
| `SEARCH t USING COVERING INDEX idx` | o índice já tem todas as colunas necessárias: nem precisa ler a tabela |
| `SEARCH t USING INTEGER PRIMARY KEY (rowid=?)` | busca direta pela chave primária |
| `USE TEMP B-TREE FOR ORDER BY` | precisou ordenar à parte (um índice na coluna do ORDER BY evitaria) |

### Índice de cobertura

Se a consulta só precisa de colunas que estão no índice, o banco responde só com o índice:

```sql
CREATE INDEX idx_pedidos_cliente_status ON pedidos (cliente_id, status);
EXPLAIN QUERY PLAN SELECT status FROM pedidos WHERE cliente_id = 1;
-- SEARCH pedidos USING COVERING INDEX idx_pedidos_cliente_status (cliente_id=?)
```

### Índice de expressão e índice parcial

```sql
-- buscas que ignoram maiúsculas/minúsculas no e-mail
CREATE INDEX idx_clientes_email_lower ON clientes (lower(email));
SELECT * FROM clientes WHERE lower(email) = 'ana@email.com';   -- usa o índice

-- só indexa o que interessa: pedidos ainda abertos
CREATE INDEX idx_pedidos_abertos ON pedidos (data) WHERE status IN ('pendente', 'enviado');
```

A consulta precisa usar **exatamente a mesma expressão** do índice para aproveitá-lo.

### Checklist para decidir um índice

1. A consulta é frequente ou lenta de verdade? (meça antes)
2. A coluna aparece em `WHERE`, `JOIN ... ON` ou `ORDER BY`?
3. A coluna tem muitos valores diferentes (alta **seletividade**)? Indexar uma coluna `ativo` com só 0 e 1 raramente ajuda.
4. A tabela recebe muitas escritas? Cada índice extra deixa INSERT/UPDATE/DELETE mais lentos.
5. Depois de criar, confira com `EXPLAIN` se ele está sendo usado.

:::exercicio sql
Buscas por cidade estão lentas. Crie o índice **`idx_clientes_cidade`** sobre a coluna **`cidade`** da tabela `clientes`.

O verificador confere o plano da consulta `SELECT * FROM clientes WHERE cidade = 'Curitiba'`.
@@setup
#loja
@@starter

@@solution
CREATE INDEX idx_clientes_cidade ON clientes (cidade);
@@query
EXPLAIN QUERY PLAN SELECT * FROM clientes WHERE cidade = 'Curitiba';
:::

:::exercicio sql
Os nomes de produtos devem ser **únicos** e as buscas por nome precisam ser rápidas. Crie um **índice único** chamado **`idx_produtos_nome`** sobre `produtos(nome)`.

O verificador confere o plano de uma busca por nome e tenta cadastrar um nome repetido.
@@setup
#loja
@@starter

@@solution
CREATE UNIQUE INDEX idx_produtos_nome ON produtos (nome);
@@query
INSERT OR IGNORE INTO produtos (nome, categoria, preco, estoque) VALUES ('Mouse', 'Eletrônicos', 70, 1);
SELECT (SELECT COUNT(*) FROM produtos WHERE nome = 'Mouse') AS mouses, (SELECT "unique" FROM pragma_index_list('produtos') WHERE name = 'idx_produtos_nome') AS unico;
:::

:::exercicio sql
O login da loja procura clientes por e-mail **ignorando maiúsculas e minúsculas**, assim:

`SELECT * FROM clientes WHERE lower(email) = 'ana@email.com';`

Um índice comum em `email` **não** ajuda essa consulta. Crie um **índice de expressão** chamado **`idx_clientes_email_lower`** que faça o banco usar índice nela.
@@setup
#loja
@@starter

@@solution
CREATE INDEX idx_clientes_email_lower ON clientes (lower(email));
@@query
EXPLAIN QUERY PLAN SELECT * FROM clientes WHERE lower(email) = 'ana@email.com';
:::

### EXTRA sql-15

### Views: por que usar

1. **Simplificar**: uma consulta complexa (vários JOINs e cálculos) vira um nome simples.
2. **Padronizar**: todo mundo calcula "valor do pedido" do mesmo jeito.
3. **Proteger**: dá acesso à view (com algumas colunas) em vez da tabela inteira.

```sql
CREATE VIEW vw_pedidos_detalhados AS
SELECT p.id AS pedido, c.nome AS cliente, p.data, p.status,
       SUM(i.quantidade * i.preco_unit) AS total,
       COUNT(*) AS qtd_itens
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
JOIN itens i ON i.pedido_id = p.id
GROUP BY p.id;

SELECT cliente, SUM(total) FROM vw_pedidos_detalhados WHERE status = 'entregue' GROUP BY cliente;
```

Como a view não guarda dados, ela **sempre** reflete o estado atual das tabelas. Para alterar uma view no SQLite: `DROP VIEW IF EXISTS nome;` e criar de novo (o PostgreSQL tem `CREATE OR REPLACE VIEW`).

### Triggers com condição (WHEN) e coluna específica

```sql
-- registra mudanças de preço, mas só quando o preço realmente muda
CREATE TABLE historico_precos (produto_id INTEGER, preco_antigo REAL, preco_novo REAL,
                               alterado_em TEXT DEFAULT CURRENT_TIMESTAMP);

CREATE TRIGGER trg_historico_preco
AFTER UPDATE OF preco ON produtos
FOR EACH ROW
WHEN OLD.preco <> NEW.preco
BEGIN
    INSERT INTO historico_precos (produto_id, preco_antigo, preco_novo)
    VALUES (NEW.id, OLD.preco, NEW.preco);
END;
```

- `UPDATE OF preco`: o trigger só dispara se a coluna `preco` estiver no UPDATE.
- `WHEN`: condição extra; sem ela, um `UPDATE` que regrava o mesmo valor também seria registrado.

### Bloqueando operações com RAISE

```sql
CREATE TRIGGER trg_sem_estoque_negativo
BEFORE UPDATE OF estoque ON produtos
WHEN NEW.estoque < 0
BEGIN
    SELECT RAISE(ABORT, 'estoque não pode ficar negativo');
END;
```

`RAISE(ABORT, msg)` cancela o comando com erro; `RAISE(IGNORE)` simplesmente ignora aquela linha, sem erro.

### Cuidados com triggers

- São **invisíveis** para quem lê só o código da aplicação: documente-os.
- Lógica demais em triggers deixa o sistema difícil de depurar e testar.
- Triggers que disparam outros triggers podem formar cadeias difíceis de prever.
- Use para regras que **precisam** valer sempre (auditoria, integridade), não para regra de negócio que muda toda semana.

### UPSERT em detalhes

```sql
INSERT INTO produtos (id, nome, categoria, preco, estoque)
VALUES (2, 'Mouse', 'Eletrônicos', 75, 10),
       (9, 'Webcam', 'Eletrônicos', 250, 5)
ON CONFLICT (id) DO UPDATE SET
    estoque = produtos.estoque + excluded.estoque,
    preco   = excluded.preco;
```

- O produto 2 já existe → soma 10 ao estoque e atualiza o preço.
- O produto 9 não existe → é inserido normalmente.
- `ON CONFLICT DO NOTHING` ignora as linhas que já existem.

:::exercicio sql
Crie a view **`vw_estoque_baixo`** com as colunas **`nome`** e **`estoque`** dos produtos com estoque **menor que 20**.

O verificador altera estoques depois e consulta a view (ela precisa refletir os dados atuais).
@@setup
#loja
@@starter

@@solution
CREATE VIEW vw_estoque_baixo AS SELECT nome, estoque FROM produtos WHERE estoque < 20;
@@query
UPDATE produtos SET estoque = 15 WHERE id = 6;
UPDATE produtos SET estoque = 30 WHERE id = 1;
SELECT nome, estoque FROM vw_estoque_baixo ORDER BY nome;
:::

:::exercicio sql
Chegou uma remessa. Com **um único INSERT** usando **UPSERT** (`ON CONFLICT (id) DO UPDATE`):
- o produto **id 2** (Mouse) recebe **+10** no estoque;
- o produto **id 7** (Livro Python) recebe **+15** no estoque;
- o produto novo **id 9**, `'Webcam'`, categoria `'Eletrônicos'`, preço **250**, estoque **5**, é cadastrado.

Para os que já existem, **some** a quantidade nova ao estoque atual (use `excluded`) e mantenha os outros dados.
@@setup
#loja
@@starter

@@solution
INSERT INTO produtos (id, nome, categoria, preco, estoque) VALUES
  (2, 'Mouse', 'Eletrônicos', 80, 10),
  (7, 'Livro Python', 'Livros', 110, 15),
  (9, 'Webcam', 'Eletrônicos', 250, 5)
ON CONFLICT (id) DO UPDATE SET estoque = produtos.estoque + excluded.estoque;
@@query
SELECT id, nome, preco, estoque FROM produtos ORDER BY id;
:::

:::exercicio sql
A tabela `historico_precos` já existe. Crie o trigger **`trg_historico_preco`** que, **depois** de cada alteração do **preço** de um produto, insira em `historico_precos` o `produto_id`, o `preco_antigo` e o `preco_novo` — **somente se o preço realmente mudou**.
@@setup
#loja
CREATE TABLE historico_precos (produto_id INTEGER, preco_antigo REAL, preco_novo REAL);
@@hint
`AFTER UPDATE OF preco ON produtos FOR EACH ROW WHEN OLD.preco <> NEW.preco BEGIN INSERT ... VALUES (NEW.id, OLD.preco, NEW.preco); END;`
@@starter

@@solution
CREATE TRIGGER trg_historico_preco
AFTER UPDATE OF preco ON produtos
FOR EACH ROW
WHEN OLD.preco <> NEW.preco
BEGIN
    INSERT INTO historico_precos (produto_id, preco_antigo, preco_novo) VALUES (NEW.id, OLD.preco, NEW.preco);
END;
@@query
UPDATE produtos SET preco = preco * 1.1 WHERE categoria = 'Livros';
UPDATE produtos SET preco = 80 WHERE id = 2;
UPDATE produtos SET estoque = 0 WHERE id = 3;
UPDATE produtos SET preco = 1000 WHERE id = 4;
SELECT produto_id, ROUND(preco_antigo, 2), ROUND(preco_novo, 2) FROM historico_precos ORDER BY produto_id;
:::

### EXTRA sql-16

### Um modelo de permissões em camadas (PostgreSQL)

```sql
-- papéis "de grupo", sem login
CREATE ROLE leitura;
CREATE ROLE escrita;

GRANT USAGE ON SCHEMA public TO leitura, escrita;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO leitura;
GRANT SELECT, INSERT, UPDATE ON pedidos, itens TO escrita;

-- usuários reais herdam dos grupos
CREATE ROLE analista_ana LOGIN PASSWORD '...' IN ROLE leitura;
CREATE ROLE app_loja     LOGIN PASSWORD '...' IN ROLE escrita;
```

Dar permissões a **papéis de grupo** e colocar usuários dentro deles facilita muito a manutenção: quando alguém muda de função, troca-se o grupo, não dezenas de GRANTs.

Permissões também podem ser por **coluna**:

```sql
GRANT SELECT (id, nome, cidade) ON clientes TO marketing;   -- sem acesso ao e-mail
```

### RLS completo: um sistema multi-inquilino

Várias empresas usam o mesmo banco, cada linha tem um `empresa_id`, e ninguém pode ver dados de outra empresa:

```sql
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY isolamento_empresa ON pedidos
    USING (empresa_id = current_setting('app.empresa_id')::int)
    WITH CHECK (empresa_id = current_setting('app.empresa_id')::int);

-- a aplicação, no início de cada requisição/transação:
SET app.empresa_id = '42';
SELECT * FROM pedidos;              -- só vê pedidos da empresa 42
INSERT INTO pedidos (empresa_id, ...) VALUES (7, ...);   -- ERRO: viola a policy (WITH CHECK)
```

Policies diferentes por comando:

```sql
CREATE POLICY ver_proprios    ON pedidos FOR SELECT USING (vendedor = current_user);
CREATE POLICY gerente_ve_tudo ON pedidos FOR SELECT TO gerentes USING (true);
CREATE POLICY so_pendentes    ON pedidos FOR UPDATE USING (status = 'pendente');
```

Como `ver_proprios` e `gerente_ve_tudo` são permissivas e valem para `SELECT`, elas se somam (OR): gerentes veem tudo, vendedores só os seus.

### Simulando no SQLite

O SQLite não tem RLS, mas os conceitos podem ser imitados com o que você já aprendeu:

| Conceito do PostgreSQL | Simulação no SQLite |
|---|---|
| `current_user` / `current_setting` | tabela `sessao` com o usuário atual |
| `USING` (filtrar leitura) | **view** com `WHERE` usando a sessão |
| `WITH CHECK` (validar escrita) | trigger **INSTEAD OF INSERT** na view, que só insere linhas permitidas |
| GRANT por coluna | view sem as colunas sensíveis |

Isso é útil para entender a lógica, mas **não é segurança de verdade**: quem acessa o arquivo do SQLite acessa tudo.

### SQL Injection em detalhes

Uma tela de login monta o SQL assim (código vulnerável):

```text
sql = "SELECT * FROM usuarios WHERE login = '" + login + "' AND senha = '" + senha + "'"
```

Se o atacante digitar no login `admin' --`, o SQL vira:

```sql
SELECT * FROM usuarios WHERE login = 'admin' --' AND senha = '...'
```

Tudo depois de `--` é comentário: a senha nem é verificada. Defesas, em ordem de importância:

1. **Consultas parametrizadas** sempre (`WHERE login = ?`).
2. **Menor privilégio**: o usuário do banco da aplicação não deve poder apagar tabelas.
3. Validar entradas (tipo, tamanho) — ajuda, mas **não substitui** os parâmetros.
4. Nunca guardar senhas em texto puro: guarde um *hash* lento próprio para senhas (bcrypt, scrypt, Argon2).

:::exercicio sql
**Segurança por coluna.** O time de marketing não pode ver e-mails. Crie a view **`vw_clientes_publico`** com apenas `id`, `nome` e `cidade` de todos os clientes.
@@setup
#loja
@@starter

@@solution
CREATE VIEW vw_clientes_publico AS SELECT id, nome, cidade FROM clientes;
@@query
INSERT INTO clientes (nome, cidade, idade, email) VALUES ('Nova Cliente', 'Recife', 30, 'nova@email.com');
SELECT * FROM vw_clientes_publico ORDER BY id;
:::

:::exercicio sql
**Simulação de `USING`.** A tabela `sessao` guarda o `cliente_id` de quem está logado na área do cliente. Crie a view **`meus_pedidos`** com `id`, `data` e `status` **apenas dos pedidos do cliente logado**.

O verificador troca o cliente logado e consulta a view.
@@setup
#loja
CREATE TABLE sessao (cliente_id INTEGER);
INSERT INTO sessao VALUES (1);
@@starter

@@solution
CREATE VIEW meus_pedidos AS SELECT id, data, status FROM pedidos WHERE cliente_id = (SELECT cliente_id FROM sessao);
@@query
UPDATE sessao SET cliente_id = 3;
SELECT * FROM meus_pedidos ORDER BY id;
:::

:::exercicio sql
**Simulação de `WITH CHECK`.** Crie:
1. a view **`meus_pedidos`** (`id`, `cliente_id`, `data`, `status`) com os pedidos do cliente da tabela `sessao`;
2. um trigger **`trg_inserir_meus_pedidos`** do tipo **INSTEAD OF INSERT ON meus_pedidos** que insira o pedido na tabela `pedidos` **somente se** o `cliente_id` da nova linha for o do cliente logado (caso contrário, não faz nada).

O verificador tenta inserir pela view um pedido próprio e um de outro cliente.
@@setup
#loja
CREATE TABLE sessao (cliente_id INTEGER);
INSERT INTO sessao VALUES (4);
@@hint
`CREATE TRIGGER ... INSTEAD OF INSERT ON meus_pedidos FOR EACH ROW WHEN NEW.cliente_id = (SELECT cliente_id FROM sessao) BEGIN INSERT INTO pedidos (id, cliente_id, data, status) VALUES (NEW.id, NEW.cliente_id, NEW.data, NEW.status); END;`
@@starter

@@solution
CREATE VIEW meus_pedidos AS SELECT id, cliente_id, data, status FROM pedidos WHERE cliente_id = (SELECT cliente_id FROM sessao);
CREATE TRIGGER trg_inserir_meus_pedidos
INSTEAD OF INSERT ON meus_pedidos
FOR EACH ROW
WHEN NEW.cliente_id = (SELECT cliente_id FROM sessao)
BEGIN
    INSERT INTO pedidos (id, cliente_id, data, status) VALUES (NEW.id, NEW.cliente_id, NEW.data, NEW.status);
END;
@@query
INSERT INTO meus_pedidos (id, cliente_id, data, status) VALUES (20, 4, '2025-05-01', 'pendente');
INSERT INTO meus_pedidos (id, cliente_id, data, status) VALUES (21, 1, '2025-05-02', 'pendente');
SELECT (SELECT group_concat(id) FROM pedidos WHERE id >= 20) AS novos, (SELECT COUNT(*) FROM meus_pedidos) AS visiveis;
:::
