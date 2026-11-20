# Formato dos arquivos de conteúdo

```text
# COURSE <id>
name: Nome
icon: 🗄️
color: #f59e0b
desc: descrição curta
titles: T0 | T1 | T2 | T3 | T4 | T5        (0, 200, 600, 1200, 1800, 2400 pts)

:::dataset <nome>          SQL reutilizável; use "#<nome>" sozinho numa linha de @@setup/@@variant
...
:::

## MODULE <id> | Título
desc: descrição

### LESSON <id> | Título
goal: objetivo
minutes: 12

Markdown da aula (##, ###, listas, tabelas, ```código```, > citação, !> dica, $$ fórmula $$)

:::descomplica
explicação "para criança"
:::

:::choice
? Pergunta
- [ ] errada
- [x] certa
> explicação mostrada após acertar
:::

:::code sql|python|js [ordered] [exports=f1,f2]
Enunciado em Markdown
@@setup      preparo (SQL de criação / código Python executado antes)
@@starter    código inicial do editor
@@solution   solução de referência
@@query      (SQL) consulta que verifica o estado final do banco
@@variant    (SQL) SQL extra que cria um 2º conjunto de dados para a verificação
@@test       (Python) asserts; use __saida__ (stdout) e __rodar__(**vars) para reexecutar
@@check      (JS) função (ctx) => true | 'mensagem'; ctx = {logs, result, exports, api, requests}
@@hint       dica mostrada após um erro
:::

### EXAM
:::choice ... :::
:::text
? Pergunta de resposta curta
= resposta | variação aceita
> explicação
:::
```

## Aprofundamento e exercícios extras (`content/<curso>.extra.md`)

O arquivo `<curso>.extra.md` é lido junto com `<curso>.md` (pode usar os mesmos `:::dataset`):

```text
### EXTRA <id-da-aula>
Markdown acrescentado ao fim da aula, sob o título "Aprofundando".

:::exercicio sql|python|js [ordered] [exports=f1,f2]
(mesmas seções de um :::code)
:::
```

Os `:::exercicio` aparecem na aba **💻 Exercícios** da aula (dificuldade crescente: o 1º é "Fácil", o último "Desafio").
`EXIGIR_EXERCICIOS=1 node tools/build.js` falha se alguma aula tiver menos de 3 exercícios ou menos de 4 exercícios de código no total.
