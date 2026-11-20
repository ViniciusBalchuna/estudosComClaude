# COURSE sql
name: SQL
icon: 🗄️
color: #f59e0b
desc: Dos fundamentos (CREATE, INSERT, SELECT) a JOINs, subconsultas, CTEs, window functions, transações, índices, triggers e Row Level Security.
titles: Visitante | Aprendiz de Tabelas | Explorador de SELECTs | Arquiteto de JOINs | Guardião das Transações | Mestre DBA

:::dataset loja
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cidade TEXT, idade INTEGER, email TEXT UNIQUE);
INSERT INTO clientes VALUES
(1,'Ana Souza','São Paulo',28,'ana@email.com'),
(2,'Bruno Lima','Rio de Janeiro',35,'bruno@email.com'),
(3,'Carla Dias','São Paulo',42,'carla@email.com'),
(4,'Diego Rocha','Curitiba',19,NULL),
(5,'Elisa Prado','Belo Horizonte',31,'elisa@email.com'),
(6,'Fábio Nunes','Rio de Janeiro',25,'fabio@email.com'),
(7,'Gabi Torres','Curitiba',38,NULL),
(8,'Hugo Alves','São Paulo',50,'hugo@email.com');
CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, categoria TEXT NOT NULL, preco REAL NOT NULL CHECK (preco >= 0), estoque INTEGER NOT NULL DEFAULT 0);
INSERT INTO produtos VALUES
(1,'Notebook','Eletrônicos',3500.00,10),
(2,'Mouse','Eletrônicos',80.00,150),
(3,'Teclado','Eletrônicos',150.00,75),
(4,'Cadeira','Móveis',900.00,20),
(5,'Mesa','Móveis',1200.00,8),
(6,'Livro SQL','Livros',90.00,40),
(7,'Livro Python','Livros',110.00,0),
(8,'Luminária','Casa',60.00,35);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER NOT NULL REFERENCES clientes(id), data TEXT NOT NULL, status TEXT NOT NULL);
INSERT INTO pedidos VALUES
(1,1,'2025-01-05','entregue'),
(2,2,'2025-01-10','entregue'),
(3,1,'2025-02-02','enviado'),
(4,3,'2025-02-15','entregue'),
(5,5,'2025-03-01','cancelado'),
(6,6,'2025-03-08','entregue'),
(7,3,'2025-03-20','pendente'),
(8,8,'2025-04-02','entregue'),
(9,2,'2025-04-11','enviado'),
(10,1,'2025-04-25','entregue');
CREATE TABLE itens (pedido_id INTEGER NOT NULL REFERENCES pedidos(id), produto_id INTEGER NOT NULL REFERENCES produtos(id), quantidade INTEGER NOT NULL, preco_unit REAL NOT NULL, PRIMARY KEY (pedido_id, produto_id));
INSERT INTO itens VALUES
(1,1,1,3500),(1,2,1,80),
(2,6,2,90),
(3,3,1,150),(3,2,2,80),
(4,4,2,900),
(5,5,1,1200),
(6,8,3,60),(6,6,1,90),
(7,1,1,3400),
(8,5,1,1200),(8,4,1,900),
(9,7,1,110),
(10,2,1,80),(10,8,2,60);
:::

:::dataset empresa
CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, depto TEXT NOT NULL, salario REAL NOT NULL, gerente_id INTEGER REFERENCES funcionarios(id), admissao TEXT NOT NULL);
INSERT INTO funcionarios VALUES
(1,'Marta','Diretoria',20000,NULL,'2015-03-01'),
(2,'Paulo','TI',12000,1,'2017-06-10'),
(3,'Renata','Vendas',11000,1,'2018-01-15'),
(4,'Sérgio','TI',8000,2,'2019-09-01'),
(5,'Tânia','TI',8000,2,'2020-02-20'),
(6,'Ulisses','TI',6000,4,'2022-05-05'),
(7,'Vera','Vendas',7000,3,'2019-11-11'),
(8,'Wagner','Vendas',5500,3,'2023-01-09'),
(9,'Xênia','Vendas',7000,3,'2021-07-07');
:::

:::dataset banco
CREATE TABLE contas (id INTEGER PRIMARY KEY, titular TEXT NOT NULL, saldo REAL NOT NULL CHECK (saldo >= 0));
INSERT INTO contas VALUES (1,'Ana',1000),(2,'Bruno',500),(3,'Carla',0);
CREATE TABLE movimentos (id INTEGER PRIMARY KEY, conta_id INTEGER NOT NULL REFERENCES contas(id), valor REAL NOT NULL, descricao TEXT);
:::

## MODULE m1 | Fundamentos
desc: O que é um banco relacional, como criar tabelas, inserir, alterar, apagar e consultar dados.

### LESSON sql-01 | Bancos de dados, tabelas e a linguagem SQL
goal: entender o que é um banco de dados relacional, o que é SQL e rodar sua primeira consulta.
minutes: 10

## O que é um banco de dados?

Um **banco de dados** é um conjunto organizado de dados guardado de forma que seja fácil **consultar, inserir, alterar e apagar** informações. Quem cuida disso é o **SGBD** (Sistema Gerenciador de Banco de Dados): PostgreSQL, MySQL, SQL Server, Oracle e SQLite são exemplos.

Nos bancos **relacionais**, os dados ficam em **tabelas**:

| Termo | Significado | Exemplo |
|---|---|---|
| Tabela | conjunto de registros de um mesmo tipo | `clientes` |
| Coluna (campo/atributo) | uma característica, com um tipo | `nome TEXT` |
| Linha (registro/tupla) | um item concreto | Ana, São Paulo, 28 |
| Chave primária | coluna que identifica cada linha de forma única | `id` |

## E o SQL?

**SQL** (*Structured Query Language*) é a linguagem padrão para conversar com bancos relacionais. Ela é **declarativa**: você descreve *o que* quer, e o SGBD decide *como* buscar.

Os comandos costumam ser agrupados assim:

- **DDL** (definição): `CREATE`, `ALTER`, `DROP` — criam e mudam a estrutura.
- **DML** (manipulação): `INSERT`, `UPDATE`, `DELETE` — mexem nos dados.
- **DQL** (consulta): `SELECT` — lê dados.
- **DCL** (controle): `GRANT`, `REVOKE` — permissões.
- **TCL** (transações): `BEGIN`, `COMMIT`, `ROLLBACK`.

## Sua primeira consulta

```sql
SELECT * FROM clientes;
```

Lê-se: "selecione todas as colunas (`*`) da tabela `clientes`". O `;` termina o comando. Palavras-chave não diferenciam maiúsculas de minúsculas (`select` = `SELECT`), mas a convenção é escrevê-las em maiúsculas para facilitar a leitura.

!> Neste curso, o terminal usa **SQLite** rodando no seu navegador. O SQL básico é igual em todos os bancos; quando algo for específico de um SGBD (como o PostgreSQL), a aula avisa.

:::descomplica
Imagine uma **caixa de fichas**, como as de uma biblioteca. Cada **ficha** é uma linha: tem o nome de uma pessoa, a cidade e a idade. Todas as fichas de pessoas ficam na mesma **gaveta** — essa gaveta é a **tabela**.

O **SQL** é o jeito de pedir coisas para o bibliotecário. Quando você escreve `SELECT * FROM clientes;`, é como dizer: "Moço, me mostra **todas** as fichas da gaveta *clientes*, por favor!" 📇
:::

:::choice
? Qual grupo de comandos SQL é usado para **mudar a estrutura** do banco (criar ou apagar tabelas)?
- [ ] DML
- [x] DDL
- [ ] DQL
- [ ] TCL
> DDL (*Data Definition Language*) reúne `CREATE`, `ALTER` e `DROP`. DML mexe nos dados, não na estrutura.
:::

:::code sql
Mostre **todas as colunas** de **todos os clientes**.
@@setup
#loja
@@starter
-- escreva sua consulta aqui

@@solution
SELECT * FROM clientes;
:::

### LESSON sql-02 | Criando tabelas: CREATE TABLE e tipos de dados
goal: criar tabelas com colunas tipadas, chave primária e valores padrão.
minutes: 12

## A sintaxe

```sql
CREATE TABLE nome_da_tabela (
    coluna1 TIPO [restrições],
    coluna2 TIPO [restrições],
    ...
);
```

## Tipos mais comuns

| Tipo (padrão SQL / PostgreSQL) | Para quê | Observação |
|---|---|---|
| `INTEGER`, `BIGINT` | números inteiros | |
| `NUMERIC(10,2)` / `DECIMAL` | valores exatos (dinheiro) | evita erros de arredondamento |
| `REAL`, `DOUBLE PRECISION` | ponto flutuante | aproximado |
| `VARCHAR(n)`, `TEXT` | textos | |
| `BOOLEAN` | verdadeiro/falso | |
| `DATE`, `TIMESTAMP` | datas e horas | |

O **SQLite** é flexível: ele usa *afinidades de tipo* (`INTEGER`, `REAL`, `TEXT`, `BLOB`, `NUMERIC`) e guarda datas como texto ISO (`'2025-01-31'`). Outros bancos são mais rígidos.

## Exemplo completo

```sql
CREATE TABLE alunos (
    id INTEGER PRIMARY KEY,          -- identifica cada aluno
    nome TEXT NOT NULL,              -- obrigatório
    email TEXT UNIQUE,               -- não pode repetir
    ativo INTEGER NOT NULL DEFAULT 1 -- se não informar, vale 1
);
```

- `PRIMARY KEY`: identifica a linha; não repete. No SQLite, `INTEGER PRIMARY KEY` é preenchido automaticamente (1, 2, 3…) se você não informar.
- `NOT NULL`: proíbe valor vazio (`NULL`).
- `DEFAULT`: valor usado quando a coluna não é informada.

## Alterar e apagar tabelas

```sql
ALTER TABLE alunos ADD COLUMN telefone TEXT;  -- adiciona coluna
DROP TABLE alunos;                             -- apaga a tabela inteira (cuidado!)
DROP TABLE IF EXISTS alunos;                   -- não dá erro se não existir
```

:::descomplica
Criar uma tabela é como **desenhar uma ficha em branco** antes de preenchê-la. Você decide os espaços: "aqui vai o nome (é obrigatório!)", "aqui vai o e-mail (não pode ter dois iguais)", "aqui vai se está ativo — se ninguém escrever nada, coloca *sim*".

O `id` é como o **número da cadeira** de cada aluno na sala: cada um tem o seu e ninguém repete. 🪑
:::

:::choice
? Em `ativo INTEGER NOT NULL DEFAULT 1`, o que acontece se você inserir uma linha **sem** informar `ativo`?
- [ ] Dá erro, porque a coluna é NOT NULL
- [x] A coluna recebe o valor 1
- [ ] A coluna fica NULL
- [ ] A linha é ignorada
> O `DEFAULT` entra em ação quando a coluna é omitida no INSERT, então o NOT NULL é respeitado.
:::

:::code sql
Crie a tabela **`cursos`** com:
- `id` inteiro, chave primária;
- `nome` texto **obrigatório**;
- `carga_horaria` inteiro com **valor padrão 40**.

O verificador vai inserir cursos sem informar `id` nem `carga_horaria` e conferir o que o banco guardou.
@@starter
CREATE TABLE cursos (

);
@@solution
CREATE TABLE cursos (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    carga_horaria INTEGER DEFAULT 40
);
@@query
INSERT INTO cursos (nome) VALUES ('SQL'), ('Python');
INSERT INTO cursos (nome, carga_horaria) VALUES ('IA', 60);
SELECT id, nome, carga_horaria FROM cursos ORDER BY id;
:::

### LESSON sql-03 | Inserindo, alterando e apagando: INSERT, UPDATE, DELETE
goal: manipular dados com segurança e entender por que o WHERE é vital no UPDATE e no DELETE.
minutes: 12

## INSERT — adicionar linhas

```sql
INSERT INTO produtos (nome, categoria, preco, estoque)
VALUES ('Webcam', 'Eletrônicos', 250.00, 12);

-- várias linhas de uma vez
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES
  ('Headset', 'Eletrônicos', 300.00, 5),
  ('Tapete',  'Casa',         120.00, 9);
```

Sempre **liste as colunas**: o código fica legível e não quebra se a ordem das colunas mudar.

## UPDATE — alterar linhas existentes

```sql
UPDATE produtos
SET preco = preco * 1.10, estoque = 0
WHERE categoria = 'Livros';
```

## DELETE — apagar linhas

```sql
DELETE FROM pedidos WHERE status = 'cancelado';
```

> ⚠️ **Sem `WHERE`, o `UPDATE` e o `DELETE` afetam a tabela INTEIRA.** `DELETE FROM pedidos;` apaga todos os pedidos. Um bom hábito: escreva primeiro um `SELECT` com o mesmo `WHERE`, confira as linhas e só então troque por `UPDATE`/`DELETE`.

## Diferença entre DELETE, TRUNCATE e DROP

| Comando | O que faz |
|---|---|
| `DELETE FROM t WHERE ...` | apaga linhas escolhidas (DML) |
| `TRUNCATE TABLE t` | esvazia a tabela inteira de uma vez (não existe no SQLite; lá use `DELETE FROM t`) |
| `DROP TABLE t` | remove a tabela e a estrutura |

:::descomplica
Pense numa **lista de compras no caderno**:
- **INSERT** é escrever um item novo na lista. ✍️
- **UPDATE** é riscar "2 maçãs" e escrever "5 maçãs".
- **DELETE** é apagar um item com a borracha.

O **WHERE** é você dizer **qual** item. Se você só disser "apaga!" sem dizer qual, a borracha apaga **a lista toda**! 😱
:::

:::choice
? O que faz `UPDATE produtos SET estoque = 0;`?
- [ ] Zera o estoque só do primeiro produto
- [ ] Dá erro porque falta WHERE
- [x] Zera o estoque de todos os produtos
- [ ] Não faz nada sem WHERE
> Sem WHERE, o UPDATE vale para todas as linhas. Isso é permitido — e perigoso.
:::

:::code sql
Na tabela `produtos`:
1. Insira o produto **'Webcam'**, categoria **'Eletrônicos'**, preço **250**, estoque **12**.
2. Aumente em **10%** o preço de todos os produtos da categoria **'Livros'**.
3. Apague os produtos com **estoque igual a 0** (depois do passo 2).

O verificador confere o estado final da tabela.
@@setup
#loja
@@starter
-- 1. INSERT

-- 2. UPDATE

-- 3. DELETE

@@solution
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Webcam', 'Eletrônicos', 250, 12);
UPDATE produtos SET preco = preco * 1.10 WHERE categoria = 'Livros';
DELETE FROM produtos WHERE estoque = 0;
@@query
SELECT nome, categoria, ROUND(preco, 2), estoque FROM produtos ORDER BY nome;
:::

### LESSON sql-04 | Consultando: SELECT, WHERE, ORDER BY, LIMIT
goal: escolher colunas, filtrar linhas, ordenar, limitar e dar apelidos com AS.
minutes: 14

## A ordem em que se escreve

```sql
SELECT colunas
FROM tabela
WHERE condição
ORDER BY coluna [ASC|DESC]
LIMIT n OFFSET m;
```

## Escolhendo colunas e apelidos

```sql
SELECT nome, preco, preco * 0.9 AS preco_com_desconto
FROM produtos;
```

`AS` dá um apelido (*alias*) à coluna do resultado. Expressões (`preco * 0.9`) são calculadas linha a linha.

## Filtrando com WHERE

Operadores de comparação: `=`, `<>` (ou `!=`), `>`, `<`, `>=`, `<=`.

```sql
SELECT nome, cidade FROM clientes WHERE cidade = 'São Paulo';
SELECT nome, preco FROM produtos WHERE preco >= 100;
```

Textos ficam entre **aspas simples** (`'São Paulo'`). Aspas duplas, no padrão SQL, servem para **nomes** de colunas/tabelas.

## Ordenando e limitando

```sql
SELECT nome, preco FROM produtos
ORDER BY preco DESC   -- do mais caro ao mais barato
LIMIT 3;              -- só os 3 primeiros
```

- `ASC` (padrão) = crescente; `DESC` = decrescente.
- Pode ordenar por várias colunas: `ORDER BY cidade, nome`.
- `LIMIT 3 OFFSET 3` pula 3 linhas e traz as 3 seguintes (útil para paginação).
- Sem `ORDER BY`, **a ordem do resultado não é garantida**.

## DISTINCT

```sql
SELECT DISTINCT cidade FROM clientes;  -- cada cidade uma vez só
```

:::descomplica
O `SELECT` é como pedir figurinhas para um amigo:
- **SELECT nome, preco** → "me mostra só o nome e o preço" (não a figurinha inteira).
- **WHERE preco >= 100** → "só as que valem 100 ou mais".
- **ORDER BY preco DESC** → "organiza da mais valiosa para a menos valiosa".
- **LIMIT 3** → "só me dá as 3 primeiras". 🃏
:::

:::choice
? Qual consulta traz os **2 clientes mais velhos**?
- [ ] `SELECT nome FROM clientes ORDER BY idade LIMIT 2;`
- [x] `SELECT nome FROM clientes ORDER BY idade DESC LIMIT 2;`
- [ ] `SELECT nome FROM clientes WHERE idade = MAX LIMIT 2;`
- [ ] `SELECT TOP nome FROM clientes LIMIT 2;`
> Ordenar por idade decrescente coloca os mais velhos primeiro; LIMIT 2 corta os dois primeiros.
:::

:::code sql ordered
Liste **nome** e **preco** dos produtos com **preço maior que 100**, do **mais caro para o mais barato**.
@@setup
#loja
@@solution
SELECT nome, preco FROM produtos WHERE preco > 100 ORDER BY preco DESC;
@@variant
UPDATE produtos SET preco = 99 WHERE id = 3;
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Monitor', 'Eletrônicos', 1500, 3);
:::

### EXAM
:::choice
? Qual comando adiciona uma coluna a uma tabela que já existe?
- [ ] `UPDATE TABLE clientes ADD telefone TEXT;`
- [x] `ALTER TABLE clientes ADD COLUMN telefone TEXT;`
- [ ] `INSERT COLUMN telefone INTO clientes;`
- [ ] `CREATE COLUMN telefone ON clientes;`
> Mudanças de estrutura são DDL: `ALTER TABLE ... ADD COLUMN`.
:::

:::choice
? Em SQL padrão, como se escreve um **texto** literal?
- [x] Entre aspas simples: `'Curitiba'`
- [ ] Entre aspas duplas: `"Curitiba"`
- [ ] Entre crases: `` `Curitiba` ``
- [ ] Sem aspas: `Curitiba`
> Aspas simples delimitam textos. Aspas duplas delimitam identificadores (nomes de colunas/tabelas).
:::

:::choice
? Qual é o efeito de `DELETE FROM clientes;`?
- [ ] Apaga a tabela clientes
- [x] Apaga todas as linhas, mantendo a tabela
- [ ] Dá erro sem WHERE
- [ ] Apaga só a última linha
> DELETE sem WHERE remove todas as linhas; a estrutura continua. Para remover a tabela, DROP TABLE.
:::

:::choice
? Sem `ORDER BY`, a ordem das linhas de um SELECT é:
- [ ] sempre a ordem de inserção
- [ ] sempre pela chave primária
- [x] não garantida
- [ ] alfabética
> O padrão SQL não garante ordem sem ORDER BY. Às vezes "parece" ordenado, mas não se deve depender disso.
:::

:::text
? Complete: para não repetir valores no resultado, usa-se `SELECT ________ cidade FROM clientes;`
= DISTINCT
> `SELECT DISTINCT` remove linhas duplicadas do resultado.
:::

:::choice
? O que `LIMIT 5 OFFSET 10` retorna?
- [ ] As linhas 5 a 10
- [x] 5 linhas, pulando as 10 primeiras
- [ ] 10 linhas, pulando as 5 primeiras
- [ ] As 15 primeiras linhas
> OFFSET pula; LIMIT limita. É a base da paginação: página 3 de 5 em 5 itens.
:::

:::choice
? Qual restrição impede que uma coluna fique vazia?
- [ ] UNIQUE
- [ ] DEFAULT
- [x] NOT NULL
- [ ] CHECK
> NOT NULL proíbe NULL. UNIQUE proíbe repetição; DEFAULT dá valor padrão.
:::

:::text
? Qual palavra-chave dá um apelido a uma coluna no resultado? (ex.: `preco * 2 ___ dobro`)
= AS
> `AS` define um alias. Em muitos bancos ele é opcional, mas deixá-lo explícito ajuda a leitura.
:::

## MODULE m2 | Consultas e relacionamentos
desc: Filtros compostos, agregações, GROUP BY/HAVING, JOINs e restrições de integridade.

### LESSON sql-05 | Filtros poderosos: AND, OR, IN, BETWEEN, LIKE e NULL
goal: combinar condições e tratar NULL corretamente.
minutes: 14

## Combinando condições

```sql
SELECT nome FROM clientes
WHERE cidade = 'São Paulo' AND idade > 30;

SELECT nome FROM clientes
WHERE cidade = 'Curitiba' OR cidade = 'Belo Horizonte';
```

`AND` tem **precedência maior** que `OR`. Use parênteses para deixar claro:

```sql
WHERE (cidade = 'Curitiba' OR cidade = 'São Paulo') AND idade < 30
```

## IN, BETWEEN e NOT

```sql
WHERE cidade IN ('Curitiba', 'Belo Horizonte')   -- igual a um da lista
WHERE preco BETWEEN 50 AND 150                   -- inclusivo: 50 <= preco <= 150
WHERE status NOT IN ('cancelado', 'pendente')
```

## LIKE — padrões de texto

| Curinga | Significa | Exemplo |
|---|---|---|
| `%` | qualquer sequência (inclusive vazia) | `'Livro%'` começa com "Livro" |
| `_` | exatamente um caractere | `'_na%'` segunda e terceira letras "na" |

```sql
SELECT nome FROM produtos WHERE nome LIKE 'Livro%';
```

No SQLite, `LIKE` ignora maiúsculas/minúsculas para letras ASCII. No PostgreSQL, `LIKE` diferencia; use `ILIKE` para ignorar.

## NULL: o valor "desconhecido"

`NULL` significa **ausência de valor**. Qualquer comparação com `NULL` usando `=` resulta em *desconhecido* (nem verdadeiro, nem falso), então a linha **não** aparece.

```sql
SELECT nome FROM clientes WHERE email = NULL;    -- ERRADO: nunca retorna nada
SELECT nome FROM clientes WHERE email IS NULL;   -- CERTO
SELECT nome FROM clientes WHERE email IS NOT NULL;
```

`COALESCE(email, 'sem e-mail')` devolve o primeiro valor não nulo — útil para exibir.

:::descomplica
- **AND** = "e": quero um sorvete que seja de chocolate **e** com granulado. Os dois precisam ser verdade.
- **OR** = "ou": chocolate **ou** morango, qualquer um serve.
- **IN** = "um desses aqui da lista".
- **BETWEEN** = "entre tal e tal", contando as pontas.
- **LIKE 'Livro%'** = "começa com *Livro*, o resto tanto faz".
- **NULL** é uma **caixa sem nada dentro**. Você não pode perguntar "a caixa é igual a nada?" — tem que perguntar "a caixa **está vazia**?" (`IS NULL`). 📦
:::

:::choice
? Por que `WHERE email = NULL` não retorna nenhuma linha?
- [ ] Porque o SQLite não aceita NULL
- [x] Porque comparar com NULL usando = dá "desconhecido", não verdadeiro
- [ ] Porque NULL é igual a zero
- [ ] Porque falta aspas em 'NULL'
> Use `IS NULL` / `IS NOT NULL`. Comparações com NULL via `=` nunca são verdadeiras.
:::

:::code sql
Liste o **nome** dos clientes que **não têm e-mail** cadastrado **ou** que moram em **'Belo Horizonte'**.
@@setup
#loja
@@solution
SELECT nome FROM clientes WHERE email IS NULL OR cidade = 'Belo Horizonte';
@@variant
UPDATE clientes SET email = NULL WHERE id = 2;
UPDATE clientes SET cidade = 'Belo Horizonte' WHERE id = 8;
:::

### LESSON sql-06 | Agregações: COUNT, SUM, AVG, GROUP BY e HAVING
goal: resumir dados em totais e médias, por grupo, e filtrar os grupos.
minutes: 15

## Funções de agregação

| Função | Retorna |
|---|---|
| `COUNT(*)` | número de linhas |
| `COUNT(coluna)` | número de valores **não nulos** da coluna |
| `SUM(x)` | soma |
| `AVG(x)` | média (ignora NULL) |
| `MIN(x)`, `MAX(x)` | menor e maior |

```sql
SELECT COUNT(*) AS total, AVG(preco) AS media FROM produtos;
```

## GROUP BY — um resultado por grupo

```sql
SELECT categoria, COUNT(*) AS qtd, SUM(estoque) AS estoque_total
FROM produtos
GROUP BY categoria;
```

Regra de ouro: toda coluna do `SELECT` que **não** está dentro de uma agregação deve estar no `GROUP BY`. (O SQLite é permissivo com isso, mas PostgreSQL e outros dão erro.)

## WHERE x HAVING

- `WHERE` filtra **linhas antes** de agrupar.
- `HAVING` filtra **grupos depois** de agregar.

```sql
SELECT cliente_id, COUNT(*) AS pedidos
FROM pedidos
WHERE status <> 'cancelado'      -- tira linhas
GROUP BY cliente_id
HAVING COUNT(*) >= 2;            -- tira grupos
```

## Ordem lógica de execução

Escrevemos `SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT`, mas o banco avalia logicamente:

**FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT**

Por isso um apelido criado no `SELECT` não pode ser usado no `WHERE` (ainda não existe ali), mas pode ser usado no `ORDER BY`.

:::descomplica
Imagine um pote cheio de balas coloridas. 🍬
- **COUNT** = contar quantas balas tem.
- **GROUP BY cor** = separar em montinhos: vermelhas aqui, azuis ali.
- Depois você conta cada montinho.
- **HAVING** = "só me mostra os montinhos que têm 5 balas ou mais".
- **WHERE** acontece **antes**: "tira as balas quebradas do pote antes de separar".
:::

:::choice
? Você quer apenas as categorias com **média de preço acima de 500**. Onde vai a condição `AVG(preco) > 500`?
- [ ] No WHERE
- [x] No HAVING
- [ ] No ORDER BY
- [ ] No FROM
> Condições sobre agregações filtram grupos, então ficam no HAVING.
:::

:::code sql
Para cada **cidade**, mostre a cidade e a **quantidade de clientes** (coluna com qualquer nome), mas **apenas** cidades com **2 ou mais** clientes.
@@setup
#loja
@@solution
SELECT cidade, COUNT(*) FROM clientes GROUP BY cidade HAVING COUNT(*) >= 2;
@@variant
INSERT INTO clientes (nome, cidade, idade) VALUES ('Iris', 'Belo Horizonte', 22), ('João', 'Recife', 30);
:::

### LESSON sql-07 | JOINs: juntando tabelas
goal: combinar tabelas relacionadas com INNER, LEFT, RIGHT, FULL e CROSS JOIN.
minutes: 18

## Por que várias tabelas?

Para não repetir dados, um banco relacional **normaliza** as informações: o pedido guarda só o `cliente_id`, e o nome do cliente fica em `clientes`. Para ver os dois juntos, usamos **JOIN**, ligando a **chave estrangeira** (`pedidos.cliente_id`) à **chave primária** (`clientes.id`).

## INNER JOIN — só o que casa nos dois lados

```sql
SELECT p.id, c.nome, p.status
FROM pedidos AS p
INNER JOIN clientes AS c ON c.id = p.cliente_id;
```

`p` e `c` são apelidos de tabela. Clientes **sem pedido** não aparecem.

## LEFT JOIN — tudo da esquerda, mesmo sem par

```sql
SELECT c.nome, p.id AS pedido
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id;
```

Clientes sem pedido aparecem com `pedido` = `NULL`. Para achar **só** quem não tem pedido:

```sql
... LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;
```

## Os tipos

| JOIN | Retorna |
|---|---|
| `INNER JOIN` | linhas com correspondência nos dois lados |
| `LEFT JOIN` | todas da esquerda + correspondentes da direita (ou NULL) |
| `RIGHT JOIN` | o espelho do LEFT (SQLite suporta desde a versão 3.39) |
| `FULL OUTER JOIN` | todas dos dois lados |
| `CROSS JOIN` | produto cartesiano: cada linha com cada linha |

## Juntando mais de duas tabelas

```sql
SELECT c.nome, pr.nome AS produto, i.quantidade
FROM itens i
JOIN pedidos  p  ON p.id  = i.pedido_id
JOIN clientes c  ON c.id  = p.cliente_id
JOIN produtos pr ON pr.id = i.produto_id;
```

`JOIN` sozinho significa `INNER JOIN`.

:::descomplica
Imagine duas listas de chamada: uma com **crianças** e outra com **lanches**, e em cada lanche está escrito o número da criança dona dele. 🥪
- **INNER JOIN**: junta cada lanche com sua criança. Criança sem lanche fica de fora.
- **LEFT JOIN**: chama **todas** as crianças; quem não trouxe lanche aparece com "nada" (NULL) do lado.
- O **ON** é a regra para combinar: "o número no lanche é igual ao número da criança".
:::

:::choice
? Qual JOIN mostra **todos os clientes**, inclusive os que nunca fizeram pedido?
- [ ] `clientes INNER JOIN pedidos`
- [x] `clientes LEFT JOIN pedidos`
- [ ] `pedidos LEFT JOIN clientes`
- [ ] `clientes CROSS JOIN pedidos`
> LEFT JOIN preserva todas as linhas da tabela da esquerda (clientes).
:::

:::code sql
Mostre o **nome do cliente** e o **valor total gasto** por ele em pedidos com status **'entregue'** (soma de `quantidade * preco_unit` dos itens). Uma linha por cliente que tenha pedido entregue.
@@setup
#loja
@@hint
Junte `itens` → `pedidos` → `clientes`, filtre o status no WHERE e agrupe pelo cliente.
@@solution
SELECT c.nome, SUM(i.quantidade * i.preco_unit) AS total
FROM itens i
JOIN pedidos p ON p.id = i.pedido_id
JOIN clientes c ON c.id = p.cliente_id
WHERE p.status = 'entregue'
GROUP BY c.id, c.nome;
@@variant
UPDATE pedidos SET status = 'entregue' WHERE id = 9;
UPDATE pedidos SET status = 'cancelado' WHERE id = 1;
:::

### LESSON sql-08 | Chaves e restrições: PK, FK, UNIQUE, CHECK
goal: garantir a integridade dos dados com restrições declaradas no banco.
minutes: 14

## Por que restrições?

Restrições (*constraints*) fazem o **banco** recusar dados inválidos, mesmo que a aplicação tenha um bug.

| Restrição | Garante |
|---|---|
| `PRIMARY KEY` | identificação única e não nula da linha |
| `FOREIGN KEY ... REFERENCES` | o valor existe na tabela referenciada |
| `UNIQUE` | não há valores repetidos (NULLs podem se repetir) |
| `NOT NULL` | sempre há valor |
| `CHECK (condição)` | a condição é verdadeira para a linha |
| `DEFAULT` | valor padrão (não restringe, mas completa) |

## Chave estrangeira e ações referenciais

```sql
CREATE TABLE avaliacoes (
    id INTEGER PRIMARY KEY,
    produto_id INTEGER NOT NULL
        REFERENCES produtos(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5)
);
```

- `ON DELETE CASCADE`: apagou o produto → apaga as avaliações dele.
- `ON DELETE SET NULL`: zera a referência.
- `ON DELETE RESTRICT` / `NO ACTION` (padrão): impede apagar o produto enquanto houver avaliações.

!> **No SQLite, chaves estrangeiras só são verificadas com `PRAGMA foreign_keys = ON;`** (vale por conexão). PostgreSQL e MySQL/InnoDB verificam sempre.

## Chave composta

```sql
PRIMARY KEY (pedido_id, produto_id)   -- a combinação não pode repetir
```

## Normalização em uma frase

Cada fato é guardado **em um só lugar** (ex.: o nome do cliente só em `clientes`). As formas normais (1FN, 2FN, 3FN) formalizam isso: valores atômicos, sem dependências parciais da chave e sem dependências transitivas.

:::descomplica
Restrições são as **regras do jogo** que o próprio banco fiscaliza, como um juiz. ⚽
- **PRIMARY KEY**: cada jogador tem um número de camisa só dele.
- **FOREIGN KEY**: só pode passar a bola para quem **está no time**.
- **CHECK (nota BETWEEN 1 AND 5)**: a nota tem que ser de 1 a 5 estrelinhas, nada de 7! ⭐
- **CASCADE**: se o time sai do campeonato, os jogos dele saem também.
:::

:::choice
? Com `PRAGMA foreign_keys = ON`, o que acontece ao inserir em `itens` um `produto_id` que **não existe** em `produtos`?
- [ ] O produto é criado automaticamente
- [x] O INSERT falha com erro de chave estrangeira
- [ ] O produto_id vira NULL
- [ ] O item é inserido normalmente
> A FK exige que o valor referenciado exista. Sem o PRAGMA, o SQLite não verificaria.
:::

:::code sql
Crie a tabela **`avaliacoes`** com:
- `id` inteiro chave primária;
- `produto_id` inteiro **obrigatório**, chave estrangeira para `produtos(id)` com **ON DELETE CASCADE**;
- `nota` inteiro obrigatório que só aceita valores de **1 a 5** (CHECK).

O verificador liga as FKs, insere avaliações válidas, tenta inserir inválidas e apaga um produto para testar o CASCADE.
@@setup
#loja
@@solution
CREATE TABLE avaliacoes (
    id INTEGER PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5)
);
@@query
PRAGMA foreign_keys = ON;
INSERT INTO avaliacoes (produto_id, nota) VALUES (1, 5), (1, 4), (2, 3), (6, 1);
INSERT OR IGNORE INTO avaliacoes (produto_id, nota) VALUES (2, 9);
INSERT OR IGNORE INTO avaliacoes (produto_id, nota) VALUES (2, 0);
INSERT OR IGNORE INTO avaliacoes (produto_id, nota) VALUES (3, NULL);
INSERT OR IGNORE INTO avaliacoes (produto_id, nota) VALUES (NULL, 3);
DELETE FROM itens WHERE produto_id = 1;
DELETE FROM produtos WHERE id = 1;
SELECT produto_id, nota FROM avaliacoes ORDER BY produto_id, nota;
:::

### EXAM
:::choice
? `SELECT COUNT(email) FROM clientes;` na tabela do curso (2 clientes sem e-mail, 8 no total) retorna:
- [ ] 8
- [x] 6
- [ ] 2
- [ ] NULL
> COUNT(coluna) ignora NULLs. COUNT(*) contaria 8.
:::

:::choice
? Qual é a ordem **lógica** de execução correta?
- [ ] SELECT → FROM → WHERE → GROUP BY
- [x] FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
- [ ] FROM → GROUP BY → WHERE → SELECT → HAVING
- [ ] WHERE → FROM → SELECT → ORDER BY
> Por isso apelidos do SELECT não existem no WHERE, mas existem no ORDER BY.
:::

:::choice
? `WHERE preco BETWEEN 80 AND 150` inclui produtos com preço exatamente 80 e 150?
- [x] Sim, os dois limites são inclusivos
- [ ] Só o 80
- [ ] Só o 150
- [ ] Nenhum dos dois
> BETWEEN a AND b equivale a `>= a AND <= b`.
:::

:::choice
? Para listar clientes que **nunca** fizeram pedido, a forma clássica é:
- [ ] `INNER JOIN pedidos ... WHERE p.id IS NULL`
- [x] `LEFT JOIN pedidos p ON ... WHERE p.id IS NULL`
- [ ] `CROSS JOIN pedidos WHERE p.id = NULL`
- [ ] `LEFT JOIN pedidos WHERE p.id = 0`
> O LEFT JOIN mantém clientes sem par (com colunas de pedidos nulas); o filtro IS NULL deixa só esses.
:::

:::text
? Qual cláusula filtra **grupos** depois da agregação?
= HAVING
> WHERE filtra linhas antes; HAVING filtra grupos depois.
:::

:::choice
? Qual padrão LIKE encontra nomes que **terminam** com "ia"?
- [ ] `'ia%'`
- [x] `'%ia'`
- [ ] `'_ia_'`
- [ ] `'%ia%'`
> `%` antes significa "qualquer coisa antes"; sem nada depois, o texto tem que terminar em "ia".
:::

:::choice
? Uma FK com `ON DELETE CASCADE` faz o quê quando a linha "pai" é apagada?
- [ ] Impede a exclusão
- [ ] Coloca NULL nos filhos
- [x] Apaga também as linhas "filhas" que a referenciam
- [ ] Nada
> CASCADE propaga a exclusão. SET NULL zeraria; RESTRICT impediria.
:::

:::choice
? Uma coluna `UNIQUE` (sem NOT NULL) pode ter várias linhas com NULL?
- [x] Sim, na maioria dos bancos (SQLite, PostgreSQL) NULLs não conflitam entre si
- [ ] Não, NULL só pode aparecer uma vez
- [ ] Não, UNIQUE implica NOT NULL
- [ ] Só se houver um índice
> NULL não é igual a NULL, então não viola UNIQUE. (O SQL Server é uma exceção histórica, permitindo apenas um NULL.)
:::

## MODULE m3 | SELECTs avançados
desc: Subconsultas, CTEs (inclusive recursivas), window functions, CASE, operações de conjunto e funções de texto e data.

### LESSON sql-09 | Subconsultas: escalares, IN, EXISTS e correlacionadas
goal: usar o resultado de uma consulta dentro de outra.
minutes: 15

## Subconsulta escalar (retorna 1 valor)

```sql
SELECT nome, preco
FROM produtos
WHERE preco > (SELECT AVG(preco) FROM produtos);
```

## Subconsulta de lista com IN

```sql
SELECT nome FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'enviado');
```

## EXISTS — "existe pelo menos uma linha?"

```sql
SELECT c.nome FROM clientes c
WHERE NOT EXISTS (
    SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id
);
```

Essa subconsulta é **correlacionada**: ela usa `c.id` da consulta de fora, então é avaliada (logicamente) para cada cliente.

!> **Armadilha do NOT IN com NULL**: se a subconsulta de um `NOT IN` retornar algum `NULL`, o resultado inteiro fica vazio (porque `x <> NULL` é desconhecido). `NOT EXISTS` não tem esse problema.

## Subconsulta no FROM (tabela derivada)

```sql
SELECT AVG(total) AS ticket_medio
FROM (
    SELECT pedido_id, SUM(quantidade * preco_unit) AS total
    FROM itens GROUP BY pedido_id
) AS t;
```

:::descomplica
Subconsulta é **uma pergunta dentro de outra pergunta**. 🪆
"Quais brinquedos custam mais que **a média dos brinquedos**?" — primeiro você descobre a média (pergunta de dentro), depois usa esse número para escolher os brinquedos (pergunta de fora).

**EXISTS** é perguntar: "esse amigo tem **pelo menos um** pedido? Sim ou não?"
:::

:::choice
? Por que `NOT EXISTS` costuma ser mais seguro que `NOT IN (subconsulta)`?
- [ ] Porque é sempre mais rápido
- [x] Porque NOT IN retorna vazio se a subconsulta tiver algum NULL
- [ ] Porque NOT IN não aceita subconsultas
- [ ] Porque EXISTS ignora o WHERE
> Um único NULL na lista faz `x NOT IN (...)` nunca ser verdadeiro.
:::

:::code sql
Liste **nome** e **preco** dos produtos cujo preço é **maior que a média de preço da sua própria categoria** (subconsulta correlacionada).
@@setup
#loja
@@solution
SELECT p.nome, p.preco FROM produtos p
WHERE p.preco > (SELECT AVG(p2.preco) FROM produtos p2 WHERE p2.categoria = p.categoria);
@@variant
INSERT INTO produtos (nome, categoria, preco, estoque) VALUES ('Livro IA', 'Livros', 200, 5), ('Vaso', 'Casa', 10, 3);
:::

### LESSON sql-10 | CTEs com WITH (e recursão)
goal: organizar consultas complexas em etapas nomeadas e percorrer hierarquias com WITH RECURSIVE.
minutes: 16

## CTE: uma "tabela temporária" com nome

Uma **CTE** (*Common Table Expression*) é uma consulta nomeada que existe só durante o comando.

```sql
WITH totais AS (
    SELECT pedido_id, SUM(quantidade * preco_unit) AS total
    FROM itens
    GROUP BY pedido_id
)
SELECT p.id, p.status, t.total
FROM pedidos p
JOIN totais t ON t.pedido_id = p.id
WHERE t.total > 1000;
```

Vantagens: legibilidade (cada etapa tem nome), reuso dentro da mesma consulta e encadeamento:

```sql
WITH a AS (...), b AS (SELECT ... FROM a) SELECT ... FROM b;
```

## CTE recursiva

Serve para **hierarquias** (organogramas, categorias, árvores) e sequências. Tem duas partes unidas por `UNION ALL`:

1. **âncora**: o ponto de partida;
2. **parte recursiva**: referencia a própria CTE para dar o próximo passo.

```sql
WITH RECURSIVE subordinados(id, nome, nivel) AS (
    SELECT id, nome, 0 FROM funcionarios WHERE id = 2      -- âncora: Paulo
    UNION ALL
    SELECT f.id, f.nome, s.nivel + 1
    FROM funcionarios f
    JOIN subordinados s ON f.gerente_id = s.id             -- passo recursivo
)
SELECT * FROM subordinados;
```

A recursão para quando a parte recursiva não retorna mais linhas.

Gerar uma sequência de 1 a 5:

```sql
WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 5)
SELECT x FROM n;
```

:::descomplica
Uma **CTE** é como fazer a lição em **rascunho** antes: "primeiro vou calcular os totais e chamar isso de *totais*; depois uso *totais* para a resposta final". ✏️

A **recursiva** é como uma **árvore genealógica**: começo pela vovó (âncora), depois procuro os filhos dela, depois os filhos dos filhos… até não achar mais ninguém. 🌳
:::

:::choice
? Numa CTE recursiva, o que faz a recursão parar?
- [ ] Um comando STOP
- [ ] O LIMIT obrigatório
- [x] A parte recursiva não produzir novas linhas
- [ ] Ela nunca para; é preciso cancelar
> Quando o passo recursivo retorna vazio, a CTE termina. Sem condição de parada (ex.: `WHERE x < 5`), pode virar laço infinito.
:::

:::code sql
Usando **WITH RECURSIVE**, liste o **nome** de **todos os subordinados** (diretos e indiretos) da funcionária **Renata** (id 3) — sem incluir a própria Renata.
@@setup
#empresa
@@solution
WITH RECURSIVE sub(id, nome) AS (
    SELECT id, nome FROM funcionarios WHERE gerente_id = 3
    UNION ALL
    SELECT f.id, f.nome FROM funcionarios f JOIN sub s ON f.gerente_id = s.id
)
SELECT nome FROM sub;
@@variant
INSERT INTO funcionarios VALUES (10, 'Yuri', 'Vendas', 4000, 7, '2024-02-01'), (11, 'Zoe', 'Vendas', 3800, 10, '2024-06-01');
:::

### LESSON sql-11 | Window functions: ROW_NUMBER, RANK, SUM OVER
goal: calcular rankings, totais acumulados e comparações sem perder o detalhe das linhas.
minutes: 18

## A ideia

Uma **função de janela** calcula algo sobre um conjunto de linhas relacionadas **sem agrupá-las**: cada linha continua no resultado.

```sql
SELECT nome, depto, salario,
       AVG(salario) OVER (PARTITION BY depto) AS media_depto
FROM funcionarios;
```

- `OVER (...)` define a janela.
- `PARTITION BY` divide em grupos (como GROUP BY, mas sem colapsar).
- `ORDER BY` dentro do OVER define a ordem dentro da janela.

## Funções de ranking

```sql
SELECT nome, depto, salario,
       ROW_NUMBER() OVER (PARTITION BY depto ORDER BY salario DESC) AS rn,
       RANK()       OVER (PARTITION BY depto ORDER BY salario DESC) AS rk,
       DENSE_RANK() OVER (PARTITION BY depto ORDER BY salario DESC) AS drk
FROM funcionarios;
```

| Salários | ROW_NUMBER | RANK | DENSE_RANK |
|---|---|---|---|
| 12000 | 1 | 1 | 1 |
| 8000 | 2 | 2 | 2 |
| 8000 | 3 | 2 | 2 |
| 6000 | 4 | 4 | 3 |

## Totais acumulados e vizinhos

```sql
SELECT data, id,
       SUM(id) OVER (ORDER BY data) AS acumulado,     -- soma corrente
       LAG(data)  OVER (ORDER BY data) AS anterior,   -- linha anterior
       LEAD(data) OVER (ORDER BY data) AS proxima     -- próxima linha
FROM pedidos;
```

Com `ORDER BY` e sem moldura explícita, o padrão é `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` (do início até a linha atual, incluindo empates). Você pode definir: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` (média móvel de 3).

## Top-N por grupo

Window functions não podem ir no WHERE; use uma CTE:

```sql
WITH r AS (
  SELECT nome, depto, salario,
         ROW_NUMBER() OVER (PARTITION BY depto ORDER BY salario DESC) AS rn
  FROM funcionarios
)
SELECT * FROM r WHERE rn = 1;   -- o maior salário de cada depto
```

:::descomplica
Imagine uma corrida na escola, com turmas diferentes. 🏃
- **PARTITION BY turma**: cada turma tem seu próprio pódio.
- **ROW_NUMBER**: dá 1º, 2º, 3º… mesmo se dois chegarem juntos (alguém fica na frente).
- **RANK**: se dois empatam em 2º, os dois são 2º e o próximo é 4º.
- **DENSE_RANK**: empatou em 2º? O próximo é 3º, sem pular.
- E ninguém some da lista: todo mundo continua lá, só ganhou uma medalha do lado! 🥇
:::

:::choice
? Salários 10, 9, 9, 7. Qual o `DENSE_RANK()` (decrescente) do salário 7?
- [ ] 4
- [x] 3
- [ ] 2
- [ ] 1
> DENSE_RANK não pula posições após empates: 10→1, 9→2, 9→2, 7→3. RANK daria 4.
:::

:::code sql ordered
Mostre **nome**, **depto**, **salario** e o **ranking do salário dentro do departamento** (maior salário = 1, empates com a mesma posição e **pulando** a seguinte, como o RANK). Ordene por **depto** e depois pelo **ranking** e por **nome**.
@@setup
#empresa
@@solution
SELECT nome, depto, salario,
       RANK() OVER (PARTITION BY depto ORDER BY salario DESC) AS posicao
FROM funcionarios
ORDER BY depto, posicao, nome;
@@variant
UPDATE funcionarios SET salario = 11000 WHERE id = 7;
:::

### LESSON sql-12 | CASE, UNION e funções de texto e data
goal: criar colunas condicionais, combinar resultados e manipular textos e datas.
minutes: 15

## CASE — o "se/senão" do SQL

```sql
SELECT nome, preco,
  CASE
    WHEN preco >= 1000 THEN 'caro'
    WHEN preco >= 100  THEN 'médio'
    ELSE 'barato'
  END AS faixa
FROM produtos;
```

A primeira condição verdadeira vence. Sem `ELSE`, o resultado é `NULL`. Dá para usar dentro de agregações ("contagem condicional"):

```sql
SELECT SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) AS entregues FROM pedidos;
```

## Operações de conjunto

| Operador | Resultado |
|---|---|
| `UNION` | junta e **remove duplicadas** |
| `UNION ALL` | junta **mantendo** duplicadas (mais rápido) |
| `INTERSECT` | só o que está nos dois |
| `EXCEPT` | o que está no primeiro e não no segundo (no Oracle: `MINUS`) |

As consultas precisam ter o **mesmo número de colunas** com tipos compatíveis.

```sql
SELECT cidade FROM clientes WHERE idade < 30
UNION
SELECT cidade FROM clientes WHERE idade > 45;
```

## Texto

| SQLite / padrão | Faz |
|---|---|
| `UPPER(x)`, `LOWER(x)` | maiúsculas / minúsculas |
| `LENGTH(x)` | tamanho |
| `SUBSTR(x, inicio, n)` | pedaço (começa em 1) |
| `TRIM(x)` | tira espaços das pontas |
| `REPLACE(x, de, para)` | substitui |
| `a || b` | concatena (padrão SQL; no MySQL use `CONCAT`) |

## Datas (SQLite)

```sql
SELECT date('2025-01-31', '+1 month');            -- soma de datas
SELECT strftime('%Y-%m', data) AS mes FROM pedidos; -- extrai ano-mês
SELECT julianday('2025-03-01') - julianday('2025-01-01'); -- diferença em dias
```

No PostgreSQL o equivalente seria `data + INTERVAL '1 month'`, `to_char(data, 'YYYY-MM')` e `EXTRACT(YEAR FROM data)`.

:::descomplica
**CASE** é como a regra do parquinho: "**se** tiver mais de 1 metro, vai no brinquedo grande; **senão, se** tiver mais de 80 cm, vai no médio; **senão**, no pequeno". 🎢

**UNION** é juntar duas pilhas de figurinhas jogando fora as repetidas. **UNION ALL** junta tudo, até as repetidas.
:::

:::choice
? Qual a diferença entre UNION e UNION ALL?
- [x] UNION remove linhas duplicadas; UNION ALL mantém todas
- [ ] UNION ALL remove duplicadas; UNION mantém
- [ ] UNION junta colunas; UNION ALL junta linhas
- [ ] Não há diferença
> UNION ALL é mais rápido justamente por não precisar eliminar duplicatas.
:::

:::code sql ordered
Para cada **mês** de 2025 (formato `'AAAA-MM'`, use `strftime('%Y-%m', data)`), mostre o mês, a **quantidade de pedidos** e quantos deles estão **'entregue'** (use `SUM(CASE ...)`). Ordene pelo mês.
@@setup
#loja
@@solution
SELECT strftime('%Y-%m', data) AS mes,
       COUNT(*) AS pedidos,
       SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) AS entregues
FROM pedidos
GROUP BY mes
ORDER BY mes;
@@variant
INSERT INTO pedidos VALUES (11, 4, '2025-05-03', 'entregue'), (12, 7, '2025-05-09', 'pendente');
:::

### EXAM
:::choice
? Qual consulta retorna o **maior salário de cada departamento** mantendo o nome do funcionário?
- [ ] `SELECT nome, MAX(salario) FROM funcionarios;`
- [x] Uma CTE com `ROW_NUMBER() OVER (PARTITION BY depto ORDER BY salario DESC)` filtrando `rn = 1`
- [ ] `SELECT nome FROM funcionarios WHERE salario = MAX(salario);`
- [ ] `SELECT * FROM funcionarios GROUP BY salario;`
> Agregações não podem ir no WHERE; o padrão top-N por grupo usa window function + filtro externo.
:::

:::choice
? Window functions diferem de GROUP BY porque:
- [x] Calculam sobre um conjunto de linhas sem colapsá-las em uma linha por grupo
- [ ] Só funcionam com números
- [ ] São executadas antes do WHERE
- [ ] Não aceitam ORDER BY
> Cada linha permanece no resultado, acompanhada do valor calculado sobre sua janela.
:::

:::choice
? Qual função devolve o valor da **linha anterior** na ordem da janela?
- [ ] LEAD
- [x] LAG
- [ ] FIRST
- [ ] PREV
> LAG olha para trás; LEAD olha para frente.
:::

:::choice
? Uma CTE recursiva é composta por:
- [ ] Duas consultas unidas por JOIN
- [x] Uma parte âncora e uma parte recursiva unidas por UNION ALL (ou UNION)
- [ ] Um laço FOR
- [ ] Uma subconsulta no WHERE
> A âncora inicia; a parte recursiva referencia a própria CTE até não gerar mais linhas.
:::

:::text
? Qual operador de conjunto retorna as linhas do primeiro SELECT que **não** aparecem no segundo (padrão SQL / SQLite / PostgreSQL)?
= EXCEPT
> No Oracle o equivalente se chama MINUS.
:::

:::choice
? Em `CASE WHEN x > 10 THEN 'A' WHEN x > 5 THEN 'B' END`, qual o resultado para x = 3?
- [ ] 'B'
- [ ] 'A'
- [x] NULL
- [ ] Erro
> Nenhuma condição é verdadeira e não há ELSE, então o resultado é NULL.
:::

:::choice
? Uma subconsulta **correlacionada** é aquela que:
- [ ] Fica no FROM
- [x] Referencia colunas da consulta externa
- [ ] Retorna exatamente uma linha
- [ ] Usa UNION
> Por depender da linha externa, ela é avaliada (logicamente) para cada linha da consulta de fora.
:::

:::choice
? `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` numa janela de `AVG` calcula:
- [ ] A média de toda a tabela
- [x] Uma média móvel das 3 últimas linhas (2 anteriores + a atual)
- [ ] A média das 2 próximas linhas
- [ ] A média do grupo inteiro
> A moldura (frame) define quais linhas entram no cálculo para cada linha atual.
:::

## MODULE m4 | Funcionalidades super avançadas
desc: Transações e isolamento, índices e planos de execução, views, triggers, UPSERT/RETURNING e segurança com GRANT e Row Level Security.

### LESSON sql-13 | Transações e ACID: BEGIN, COMMIT, ROLLBACK, SAVEPOINT
goal: agrupar comandos em unidades "tudo ou nada" e entender níveis de isolamento.
minutes: 18

## O problema

Transferir R$ 200 da Ana para o Bruno exige **dois** comandos. Se o sistema cair entre eles, o dinheiro "some". A solução é a **transação**: um bloco que acontece **inteiro ou não acontece**.

```sql
BEGIN;                                              -- inicia (BEGIN TRANSACTION)
UPDATE contas SET saldo = saldo - 200 WHERE id = 1;
UPDATE contas SET saldo = saldo + 200 WHERE id = 2;
COMMIT;                                             -- confirma tudo
```

Se algo der errado antes do `COMMIT`, `ROLLBACK;` desfaz tudo desde o `BEGIN`.

## ACID

| Letra | Propriedade | Significa |
|---|---|---|
| **A** | Atomicidade | tudo ou nada |
| **C** | Consistência | as regras (constraints) continuam válidas após a transação |
| **I** | Isolamento | transações simultâneas não enxergam o "meio do caminho" umas das outras (conforme o nível) |
| **D** | Durabilidade | após o COMMIT, os dados sobrevivem a quedas |

## SAVEPOINT — pontos de retorno parciais

```sql
BEGIN;
INSERT INTO movimentos (conta_id, valor) VALUES (1, -50);
SAVEPOINT antes_bonus;
INSERT INTO movimentos (conta_id, valor) VALUES (1, 999);
ROLLBACK TO antes_bonus;     -- desfaz só o que veio depois do savepoint
COMMIT;                      -- confirma o primeiro INSERT
```

## Níveis de isolamento (padrão SQL)

| Nível | Leitura suja | Leitura não repetível | Fantasma |
|---|---|---|---|
| READ UNCOMMITTED | possível | possível | possível |
| READ COMMITTED | não | possível | possível |
| REPEATABLE READ | não | não | possível (no padrão) |
| SERIALIZABLE | não | não | não |

- **Leitura suja**: ler dado ainda não confirmado por outra transação.
- **Não repetível**: ler a mesma linha duas vezes e obter valores diferentes.
- **Fantasma**: repetir uma consulta e aparecerem/sumirem linhas.

O PostgreSQL usa **READ COMMITTED** por padrão (e trata READ UNCOMMITTED como READ COMMITTED); o MySQL/InnoDB usa **REPEATABLE READ**. O SQLite oferece isolamento **serializável** entre conexões. Para evitar duas transações alterando a mesma linha ao mesmo tempo, bancos como PostgreSQL/MySQL têm `SELECT ... FOR UPDATE` (trava a linha lida).

:::descomplica
Transação é como **trocar figurinhas com um amigo**: você só solta a sua quando ele solta a dele. Se alguém desistir no meio, **cada um pega a sua de volta** (ROLLBACK). Se der certo, a troca está feita para sempre (COMMIT). 🤝

O **SAVEPOINT** é como o **checkpoint do videogame**: se você errar depois dele, volta para lá — e não para o começo da fase. 🎮
:::

:::choice
? Após `BEGIN; UPDATE ...; ROLLBACK;`, o que acontece com o UPDATE?
- [ ] Fica salvo
- [x] É desfeito
- [ ] Fica salvo só na memória
- [ ] Vira um SAVEPOINT
> ROLLBACK desfaz todas as alterações feitas desde o BEGIN.
:::

:::code sql
Faça uma **transferência de 300** da conta **1 (Ana)** para a conta **3 (Carla)** dentro de uma **transação**, registrando **dois movimentos** na tabela `movimentos` (`-300` para a conta 1 e `+300` para a conta 3) e confirmando no fim.

Em seguida, abra **outra transação** que tira **100** da conta **2 (Bruno)** e **desfaça** com ROLLBACK — no fim, o saldo do Bruno deve continuar 500.

O verificador confere saldos e movimentos no estado final.
@@setup
#banco
@@solution
BEGIN;
UPDATE contas SET saldo = saldo - 300 WHERE id = 1;
UPDATE contas SET saldo = saldo + 300 WHERE id = 3;
INSERT INTO movimentos (conta_id, valor, descricao) VALUES (1, -300, 'transferência'), (3, 300, 'transferência');
COMMIT;
BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 2;
ROLLBACK;
@@query
SELECT c.id, c.saldo, (SELECT COUNT(*) FROM movimentos m WHERE m.conta_id = c.id) AS movs, (SELECT COALESCE(SUM(valor), 0) FROM movimentos m WHERE m.conta_id = c.id) AS soma FROM contas c ORDER BY c.id;
:::

### LESSON sql-14 | Índices e planos de execução
goal: entender como índices aceleram consultas, quando ajudam, quando atrapalham, e ler o plano de execução.
minutes: 16

## O que é um índice

Um **índice** é uma estrutura auxiliar (normalmente uma **árvore B / B-tree**) que mantém os valores de uma ou mais colunas **ordenados**, com ponteiros para as linhas. Sem índice, o banco faz uma **varredura completa** (*full table scan*, no SQLite: `SCAN`); com índice, ele faz uma **busca** (*index seek*, no SQLite: `SEARCH ... USING INDEX`).

```sql
CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
CREATE UNIQUE INDEX idx_clientes_email ON clientes (email);
DROP INDEX idx_pedidos_cliente;
```

Chaves primárias e colunas `UNIQUE` já ganham índice automaticamente.

## Lendo o plano

```sql
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE cliente_id = 3;
```

- Sem índice: `SCAN pedidos`
- Com índice: `SEARCH pedidos USING INDEX idx_pedidos_cliente (cliente_id=?)`

No PostgreSQL usa-se `EXPLAIN` (estimativa) e `EXPLAIN ANALYZE` (executa e mostra tempos reais).

## Índices compostos e a regra do prefixo

Um índice em `(status, data)` ajuda filtros por `status` e por `status + data`, mas **não** ajuda um filtro só por `data` — a ordem das colunas importa (como uma lista telefônica ordenada por sobrenome e depois nome).

## Quando o índice não é usado

- Funções na coluna: `WHERE UPPER(nome) = 'ANA'` (a não ser que exista índice de expressão).
- `LIKE '%texto'` (curinga no começo).
- Colunas com pouquíssimos valores distintos, em que ler a tabela toda sai mais barato.

## O custo

Índices **aceleram leituras** mas **custam em escrita** (todo INSERT/UPDATE/DELETE precisa atualizá-los) e ocupam espaço. Crie índices para as consultas reais e frequentes, especialmente em colunas de `WHERE`, `JOIN` e `ORDER BY`.

:::descomplica
Um índice é igual ao **índice no final de um livro**. 📖
Sem ele, para achar "dinossauro" você lê **página por página** (isso é o SCAN). Com ele, você vai direto: "dinossauro → página 42" (isso é o SEARCH).

Mas toda vez que você escreve uma página nova, precisa **atualizar o índice** também — dá um trabalhinho a mais.
:::

:::choice
? Um índice em `(sobrenome, nome)` ajuda qual filtro?
- [x] `WHERE sobrenome = 'Silva'`
- [ ] `WHERE nome = 'Ana'` (sozinho)
- [ ] `WHERE LOWER(sobrenome) = 'silva'` (sem índice de expressão)
- [ ] `WHERE sobrenome LIKE '%va'`
> Índices compostos servem a partir da coluna mais à esquerda (regra do prefixo).
:::

:::code sql
A consulta `SELECT * FROM pedidos WHERE status = 'entregue' AND data >= '2025-03-01';` está lenta. Crie um índice chamado **`idx_pedidos_status_data`** sobre **(status, data)** — nessa ordem.

O verificador lê o plano de execução (`EXPLAIN QUERY PLAN`) e confere se o índice é usado.
@@setup
#loja
@@solution
CREATE INDEX idx_pedidos_status_data ON pedidos (status, data);
@@query
EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE status = 'entregue' AND data >= '2025-03-01';
:::

### LESSON sql-15 | Views, triggers, UPSERT e RETURNING
goal: encapsular consultas em views, automatizar regras com triggers e usar UPSERT e RETURNING.
minutes: 18

## VIEW — uma consulta com nome

```sql
CREATE VIEW vw_total_pedidos AS
SELECT p.id, c.nome AS cliente, SUM(i.quantidade * i.preco_unit) AS total
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
JOIN itens i ON i.pedido_id = p.id
GROUP BY p.id, c.nome;

SELECT * FROM vw_total_pedidos WHERE total > 1000;
```

A view **não guarda dados** (é recalculada a cada uso). Serve para simplificar consultas e para **segurança** (expor só algumas colunas). Uma **view materializada** (PostgreSQL: `CREATE MATERIALIZED VIEW`) guarda o resultado e precisa de `REFRESH MATERIALIZED VIEW`.

## TRIGGER — reação automática a eventos

```sql
CREATE TRIGGER trg_baixa_estoque
AFTER INSERT ON itens
FOR EACH ROW
BEGIN
    UPDATE produtos SET estoque = estoque - NEW.quantidade
    WHERE id = NEW.produto_id;
END;
```

- Momento: `BEFORE`, `AFTER` (ou `INSTEAD OF` em views).
- Evento: `INSERT`, `UPDATE`, `DELETE`.
- `NEW` = linha nova; `OLD` = linha antiga (em UPDATE/DELETE).
- No SQLite, `SELECT RAISE(ABORT, 'mensagem')` dentro do trigger cancela o comando.

No PostgreSQL a lógica do trigger fica numa **função** (`CREATE FUNCTION ... RETURNS trigger`) ligada com `CREATE TRIGGER ... EXECUTE FUNCTION`.

## UPSERT — inserir ou atualizar

```sql
INSERT INTO produtos (id, nome, categoria, preco, estoque)
VALUES (2, 'Mouse', 'Eletrônicos', 80, 10)
ON CONFLICT (id) DO UPDATE SET estoque = produtos.estoque + excluded.estoque;
```

`excluded` representa a linha que se tentou inserir. Sintaxe do PostgreSQL e do SQLite; no MySQL: `ON DUPLICATE KEY UPDATE`.

## RETURNING — o comando devolve linhas

```sql
INSERT INTO clientes (nome, cidade) VALUES ('Lia', 'Recife') RETURNING id, nome;
```

Evita um SELECT extra para descobrir o id gerado (PostgreSQL e SQLite ≥ 3.35).

:::descomplica
- **VIEW** é um **atalho na tela do celular**: não é o app de novo, só um jeito rápido de abrir a mesma coisa. 📱
- **TRIGGER** é uma **campainha automática**: toda vez que alguém entra (INSERT), *dim-dom*, algo acontece sozinho — tipo diminuir o estoque.
- **UPSERT**: "se o brinquedo já está na caixa, aumenta a quantidade; se não está, coloca ele lá".
:::

:::choice
? Num trigger `AFTER UPDATE`, como acessar o valor **antigo** de uma coluna `preco`?
- [ ] `NEW.preco`
- [x] `OLD.preco`
- [ ] `excluded.preco`
- [ ] `PREV.preco`
> OLD contém a linha antes da alteração; NEW, depois. `excluded` é do UPSERT.
:::

:::code sql
Crie um trigger chamado **`trg_baixa_estoque`** que, **depois de cada INSERT em `itens`**, **subtraia a quantidade** inserida do `estoque` do produto correspondente.

O verificador insere itens novos e confere o estoque.
@@setup
#loja
@@solution
CREATE TRIGGER trg_baixa_estoque
AFTER INSERT ON itens
FOR EACH ROW
BEGIN
    UPDATE produtos SET estoque = estoque - NEW.quantidade WHERE id = NEW.produto_id;
END;
@@query
INSERT INTO pedidos VALUES (20, 4, '2025-05-01', 'pendente');
INSERT INTO itens VALUES (20, 2, 10, 80), (20, 3, 5, 150), (20, 8, 1, 60);
SELECT id, estoque FROM produtos ORDER BY id;
:::

### LESSON sql-16 | Segurança: GRANT, REVOKE, Row Level Security e policies
goal: controlar quem pode fazer o quê no banco, até o nível de cada linha, com policies do PostgreSQL.
minutes: 20

## Usuários, papéis e privilégios

Em bancos cliente-servidor (PostgreSQL, MySQL, SQL Server…) existem **papéis** (*roles*) com **privilégios**:

```sql
-- PostgreSQL
CREATE ROLE analista LOGIN PASSWORD '...';
GRANT SELECT ON pedidos, clientes TO analista;        -- só leitura
GRANT INSERT, UPDATE ON pedidos TO app_backend;
REVOKE UPDATE ON pedidos FROM app_backend;
```

**Princípio do menor privilégio**: cada usuário/aplicação recebe só o que precisa. A aplicação não deveria se conectar como superusuário.

!> O **SQLite não tem usuários nem GRANT**: a segurança é a do arquivo no sistema operacional. Por isso esta aula mostra PostgreSQL e, na prática, simulamos o conceito.

## Row Level Security (RLS)

`GRANT` controla o acesso à **tabela inteira**. RLS controla **quais linhas** cada usuário enxerga ou altera.

```sql
-- 1. liga a RLS na tabela
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- 2. cria a policy: cada vendedor só vê/edita os próprios pedidos
CREATE POLICY pedidos_do_dono ON pedidos
    FOR ALL                       -- SELECT, INSERT, UPDATE, DELETE
    TO vendedores
    USING (vendedor = current_user)        -- filtra linhas existentes (leitura/UPDATE/DELETE)
    WITH CHECK (vendedor = current_user);  -- valida linhas novas/alteradas (INSERT/UPDATE)
```

Pontos importantes (PostgreSQL):

- Com RLS ligada e **nenhuma policy** aplicável, o acesso fica **negado por padrão** (nenhuma linha).
- `USING` decide quais linhas **existentes** são visíveis/afetadas; `WITH CHECK` decide se uma linha **nova ou modificada** é aceita.
- Várias policies **permissivas** (padrão) se combinam com **OR**; policies `AS RESTRICTIVE` se combinam com **AND**.
- O **dono da tabela** e superusuários ignoram a RLS, a menos que se use `ALTER TABLE ... FORCE ROW LEVEL SECURITY` (superusuários e papéis com `BYPASSRLS` continuam ignorando).
- Em aplicações multi-inquilino (*multi-tenant*), é comum guardar o inquilino numa configuração da sessão: `SET app.tenant_id = '42'` e usar `USING (tenant_id = current_setting('app.tenant_id')::int)`. Serviços como o Supabase usam RLS com funções como `auth.uid()`.

## SQL Injection

A maior falha de segurança em SQL é montar comandos **concatenando texto do usuário**:

```text
"SELECT * FROM usuarios WHERE nome = '" + entrada + "'"
entrada = ' OR '1'='1   →   ... WHERE nome = '' OR '1'='1'   (retorna tudo!)
```

A defesa é usar **consultas parametrizadas** (*prepared statements*): `WHERE nome = ?` com o valor passado separadamente. Veremos isso em Python no curso de Python.

:::descomplica
Imagine uma escola. 🏫
- **GRANT** é o diretor dando a chave de uma sala: "você pode **entrar na biblioteca**".
- **REVOKE** é pegar a chave de volta.
- **RLS** é mais detalhado: todo mundo entra na sala dos **armários**, mas cada criança só consegue abrir **o seu próprio armário**. A **policy** é a regra escrita na porta: "só abre se o nome no armário for o seu".
- **SQL Injection** é alguém escrever no papel do nome: "Joãozinho **ou qualquer um**" — e o porteiro bobo deixar abrir todos os armários. Por isso o porteiro nunca deve ler o papel como uma ordem!
:::

:::choice
? Em uma policy do PostgreSQL, qual cláusula valida as linhas que estão sendo **inseridas**?
- [ ] USING
- [x] WITH CHECK
- [ ] GRANT
- [ ] FILTER
> USING filtra linhas existentes; WITH CHECK valida as linhas novas ou modificadas.
:::

:::choice
? Tabela com `ENABLE ROW LEVEL SECURITY` e **nenhuma policy** criada. Um usuário comum (não dono) com GRANT SELECT consulta a tabela. O que ele vê?
- [ ] Todas as linhas
- [x] Nenhuma linha (negado por padrão)
- [ ] Um erro de sintaxe
- [ ] Só as linhas que ele inseriu
> Sem policy aplicável, a RLS nega tudo por padrão.
:::

:::code sql
**Simulação de RLS no SQLite.** A tabela `sessao` guarda o "usuário atual". Crie a view **`meus_pedidos`** que mostre `id`, `cliente_id` e `status` **apenas** dos pedidos dos clientes **da cidade do usuário logado**: use a coluna `cidade` da tabela `sessao` (equivalente a um `USING (cidade = current_setting(...))`).

O verificador troca o usuário da sessão e confere o que a view mostra.
@@setup
#loja
CREATE TABLE sessao (usuario TEXT, cidade TEXT);
INSERT INTO sessao VALUES ('vendedor_sp', 'São Paulo');
@@solution
CREATE VIEW meus_pedidos AS
SELECT p.id, p.cliente_id, p.status
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
WHERE c.cidade = (SELECT cidade FROM sessao);
@@query
UPDATE sessao SET usuario = 'vendedor_rj', cidade = 'Rio de Janeiro';
SELECT id, cliente_id, status FROM meus_pedidos ORDER BY id;
:::

### EXAM
:::choice
? Qual propriedade ACID garante que, após o COMMIT, os dados sobrevivem a uma queda de energia?
- [ ] Atomicidade
- [ ] Consistência
- [ ] Isolamento
- [x] Durabilidade
> Durabilidade: o que foi confirmado permanece.
:::

:::choice
? "Ler um dado alterado por outra transação que ainda não fez COMMIT" é chamado de:
- [x] Leitura suja (dirty read)
- [ ] Leitura fantasma
- [ ] Leitura não repetível
- [ ] Deadlock
> READ COMMITTED e níveis acima impedem leitura suja.
:::

:::choice
? Qual é o nível de isolamento padrão do PostgreSQL?
- [ ] READ UNCOMMITTED
- [x] READ COMMITTED
- [ ] REPEATABLE READ
- [ ] SERIALIZABLE
> PostgreSQL: READ COMMITTED. MySQL/InnoDB: REPEATABLE READ.
:::

:::choice
? Qual destes **impede** o uso de um índice B-tree comum na coluna `nome`?
- [ ] `WHERE nome = 'Ana'`
- [ ] `WHERE nome LIKE 'An%'`
- [x] `WHERE nome LIKE '%na'`
- [ ] `ORDER BY nome`
> Curinga no início impede usar a ordenação do índice; o banco precisa olhar todas as linhas.
:::

:::text
? No SQLite, qual comando mostra o plano de execução de uma consulta? (duas ou três palavras antes do SELECT)
= EXPLAIN QUERY PLAN | EXPLAIN
> `EXPLAIN QUERY PLAN` mostra SCAN (varredura) ou SEARCH ... USING INDEX (busca por índice).
:::

:::choice
? No UPSERT `INSERT ... ON CONFLICT (id) DO UPDATE SET estoque = excluded.estoque`, `excluded` representa:
- [ ] A linha que já estava na tabela
- [x] A linha que se tentou inserir
- [ ] As linhas apagadas
- [ ] Uma tabela temporária criada pelo usuário
> `excluded` é a linha proposta que gerou o conflito; a existente é referenciada pelo nome da tabela.
:::

:::choice
? Duas policies **permissivas** na mesma tabela e comando no PostgreSQL se combinam com:
- [x] OR — basta uma permitir
- [ ] AND — as duas precisam permitir
- [ ] Só a mais recente vale
- [ ] Gera erro
> Permissivas se somam com OR; restritivas (AS RESTRICTIVE) com AND.
:::

:::choice
? Qual é a defesa correta contra SQL Injection?
- [ ] Remover aspas da entrada manualmente
- [x] Usar consultas parametrizadas (prepared statements)
- [ ] Usar apenas SELECT
- [ ] Criptografar o banco
> Parâmetros são enviados separados do comando, então nunca são interpretados como SQL.
:::
