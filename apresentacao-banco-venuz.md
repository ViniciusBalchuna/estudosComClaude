# Apresentação: Banco de dados do Venuz

**Tempo total:** 5 minutos
**Base:** `banco/schema.sql` (branch `integracao`) — PostgreSQL no Supabase

> **Como usar:** o texto principal de cada tópico é o que **sempre** deve ser falado.
> As **informações extras** só entram se o tempo estiver sobrando. Se estiver curto, pule direto para o próximo tópico.

| # | Tópico | Tempo |
|---|--------|-------|
| 1 | Abertura | 0:20 |
| 2 | Estrutura das tabelas | 1:15 |
| 3 | Regras da lógica | 1:00 |
| 4 | Segurança (RLS e `auth`) | 1:30 |
| 5 | Integração com o site | 0:45 |
| 6 | Encerramento | 0:10 |

---

## 1. Abertura (0:20)

- O Venuz ajuda bandas independentes a organizar os **locais onde podem tocar** (bares, casas de show, festivais).
- O banco é um **PostgreSQL hospedado no Supabase**, que também cuida do login e do armazenamento de fotos.
- Vou mostrar quatro coisas: **as tabelas, as regras, a segurança e a ligação com o site.**

**Informações extras:**
- Todo o banco está em um único arquivo, o `schema.sql`, dividido em 9 partes que podem ser executadas em ordem.
- Convenções: nomes em português, sem acento, em `snake_case`; ids em `uuid`; datas em `timestamptz`.

---

## 2. Estrutura das tabelas (1:15)

- **`perfis`**: o usuário. Cada perfil é uma banda.
- **`pastas`**: agrupam os locais do perfil (ex.: "Circuito do litoral").
- **`locais`**: a tabela central. Guarda nome, lotação, se tem camarim e o custo (fixo ou percentual).
- **Tabelas filhas de `locais`**: `enderecos`, `contatos`, `horarios_funcionamento` e `equipamentos`.
- **`favoritos`**: locais (próprios ou de outras pessoas) marcados pelo usuário.
- **Tabelas de apoio (catálogos)**: `tipos_conta`, `tipos_pasta` e `catalogo_equipamentos`.

Resumo das relações: **perfil → pastas → locais → detalhes do local**.

**Informações extras:**
- Os tipos de conta e de pasta ficam em **tabelas**, e não em uma lista fixa. Assim, para criar um tipo novo (ex.: "casa de show"), basta um `insert`, sem mexer na estrutura.
- O custo fica dentro de `locais`, porque cada local tem um único custo (relação 1:1).
- O `catalogo_equipamentos` já vem com 12 itens (mesa de som, bateria, técnico de luz etc.) e vai servir para filtros como "locais que têm mesa de som".
- O CEP é guardado como **texto**, para não perder o zero à esquerda. O `codigo_ibge` permite filtrar por cidade sem depender de como o nome foi escrito.

---

## 3. Regras da lógica (1:00)

- **Apagar em cascata:** se um local é apagado, endereços, contatos, horários e equipamentos dele somem junto. Se uma pasta é apagada, os locais **não** somem: só ficam sem pasta.
- **Um horário por dia:** cada local tem no máximo uma linha por dia da semana.
- **Uma pasta Favoritos por perfil**, e nenhuma pasta comum pode se chamar "Favoritos" (o banco recusa, mesmo com acento ou maiúscula).
- **Favorito só entra na pasta Favoritos**: o próprio banco impede salvar um favorito numa pasta comum.

**Informações extras:**
- A regra do nome reservado é feita por um **trigger** (`pastas_validar_nome`). Ele remove acentos, espaços e pontuação antes de comparar o nome.
- A regra "favorito só na pasta Favoritos" usa uma **chave estrangeira composta** `(pasta_id, tipo_pasta)`, que só aceita pastas do tipo `favoritos`.
- `camarim` e `hostess` aceitam três valores: sim, não e "não sei" (`null`).
- Existem **índices** nas colunas usadas pelos filtros e pela segurança (cidade, UF, lotação, dono). Isso deixa as buscas mais rápidas.

---

## 4. Segurança: RLS e tabelas `auth` (1:30)

- **E-mail e senha não ficam nas nossas tabelas.** Eles ficam em `auth.users`, uma tabela privada do Supabase, com a senha criptografada (hash).
- `perfis.id` é **o mesmo id** de `auth.users`. É assim que o perfil é ligado ao login.
- **RLS (Row Level Security)** está ligada em **todas** as tabelas: o banco só entrega as linhas que uma regra (policy) permitir.
- As regras usam `auth.uid()`, que é o id de quem está logado:
  - **Locais e seus detalhes:** qualquer pessoa pode **ler**, mas só o **dono** cria, altera ou apaga.
  - **Perfis, pastas e favoritos:** são **privados**. Cada usuário só vê e altera os seus.
  - **Catálogos:** só leitura. Quem altera é o administrador, pelo painel.

**Informações extras:**
- Quando alguém se cadastra, um **trigger** (`handle_new_user`) cria o perfil automaticamente, usando o nome enviado pelo site ou, se não houver, a parte do e-mail antes do `@`.
- O usuário **não consegue mudar o próprio tipo de conta**: a permissão de alteração na tabela `perfis` só vale para as colunas `nome_exibicao` e `avatar_path`.
- Há dois papéis: `anon` (visitante sem login) e `authenticated` (logado). Visitantes só leem; gravar exige login.
- **Foto de perfil:** fica no Storage (bucket `avatares`), não no banco. Limite de 200 KB, apenas JPEG, PNG ou WebP, e cada usuário só grava na pasta com o próprio id.

---

## 5. Integração com o site (0:45)

- O site conversa com o banco direto do navegador, pela biblioteca **supabase-js** (`js/supabase.js`).
- **Login e cadastro** (`js/auth.js`): e-mail e senha ou conta Google, usando o Supabase Auth.
- **Dados** (`js/remoto.js`): ao entrar, o site carrega as pastas, os locais do usuário, os locais de outras pessoas e os favoritos. Ao salvar, envia **só o que mudou**.
- A chave usada no site é a **pública**. Isso é seguro porque **quem protege os dados é a RLS**, não o site.

**Informações extras:**
- Ao carregar, o site busca um local já com todos os detalhes em **uma única consulta** (locais + endereços + contatos + horários + equipamentos).
- Locais de outras pessoas aparecem só para leitura (os 200 mais recentes). Se alguém tentar gravar neles, a RLS recusa.
- Ponto de melhoria conhecido: salvar um local **não é uma transação**. Se uma etapa falhar, o local é regravado inteiro na próxima tentativa. Dá para resolver no futuro com uma função SQL (RPC).
- O site também reduz a foto antes de enviar, mas a trava de verdade é o limite do bucket, que vale até para quem chama a API direto.

---

## 6. Encerramento (0:10)

- Resumindo: **tabelas organizadas em torno do local, regras garantidas pelo próprio banco, e segurança feita pela RLS ligada ao login do Supabase.**
- Obrigado! Perguntas?

**Informações extras:**
- Próximos passos citados no próprio schema: adicionar mais validações (`check`) e novos tipos de conta, como casa de show e espectador.
