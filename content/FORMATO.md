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
