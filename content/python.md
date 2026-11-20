# COURSE python
name: Python
icon: 🐍
color: #22c55e
desc: Do primeiro print à POO, bibliotecas famosas (NumPy, Pandas), SQLite, APIs, FastAPI, Django, machine learning e integração com IA.
titles: Visitante | Filhote de Píton | Encantador de Listas | Artesão de Objetos | Domador de Frameworks | Pythonista Mestre

## MODULE m1 | Fundamentos
desc: Saída de dados, variáveis e tipos, condições, laços, coleções, funções e exceções.

### LESSON py-01 | Seja um programador: print, variáveis e tipos
goal: escrever seus primeiros programas, guardar valores em variáveis e conhecer os tipos primitivos.
minutes: 12

## O primeiro programa

```python
print('Olá, Mundo!')
```

`print()` é uma **função** que mostra algo na tela. O texto entre aspas é uma **string** (`str`). Aspas simples ou duplas funcionam igual.

## Variáveis

Uma **variável** é um nome que aponta para um valor. Em Python não se declara o tipo: ele vem do valor.

```python
nome = 'Ana'        # str  (texto)
idade = 28          # int  (inteiro)
altura = 1.68       # float (real; use ponto, não vírgula)
estudante = True    # bool (True ou False)
```

`=` é **atribuição** ("recebe"), não igualdade. Para saber o tipo: `type(idade)` → `<class 'int'>`.

## Operadores

| Operador | Exemplo | Resultado |
|---|---|---|
| `+ - *` | `7 + 2` | `9` |
| `/` divisão real | `7 / 2` | `3.5` |
| `//` divisão inteira | `7 // 2` | `3` |
| `%` resto | `7 % 2` | `1` |
| `**` potência | `2 ** 3` | `8` |

Ordem de precedência: `()` → `**` → `* / // %` → `+ -`.

## f-strings: juntando texto e valores

```python
nome = 'Ana'
nota = 8.456
print(f'Olá, {nome}! Sua nota foi {nota:.2f}')   # Olá, Ana! Sua nota foi 8.46
```

`{nota:.2f}` formata com 2 casas decimais. Outros formatos úteis: `{x:>10}` (alinha à direita em 10 espaços), `{n:,}` (separador de milhar).

## Conversão de tipos e entrada

```python
idade = int('28')       # str → int
preco = float('9.90')   # str → float
texto = str(42)         # int → str
resposta = input('Qual seu nome? ')   # input SEMPRE devolve str
```

!> Nos terminais deste site o `input()` não é usado: os exercícios já trazem as variáveis prontas, e o verificador roda seu código com **outros valores** para ter certeza de que ele funciona de verdade.

:::descomplica
Uma **variável** é uma **caixinha com etiqueta**. 📦 Na etiqueta está escrito `idade`, e dentro da caixa tem o número `28`. Quando você escreve `idade = 29`, você tira o 28 e coloca o 29.

Os **tipos** são o *tipo de coisa* que está na caixa: número inteiro (`int`), número com vírgula (`float`), palavra (`str`) ou um "sim/não" (`bool`).

O **print** é o computador **falando em voz alta** o que você mandou.
:::

:::choice
? Qual é o resultado de `print(7 // 2, 7 % 2)`?
- [ ] `3.5 1`
- [x] `3 1`
- [ ] `3 0`
- [ ] `4 1`
> `//` é a divisão inteira (3) e `%` é o resto (1).
:::

:::code python
As variáveis `nome` e `nota` já existem. Mostre na tela **exatamente** a frase:

`Aluno: <nome> | Nota: <nota com 1 casa decimal>`

Exemplo: com `nome = 'Ana'` e `nota = 7.25`, a saída deve ser `Aluno: Ana | Nota: 7.2`. (O verificador vai testar com outros nomes e notas.)
@@setup
nome = 'Ana'
nota = 7.25
@@starter
# use uma f-string
print()
@@solution
print(f'Aluno: {nome} | Nota: {nota:.1f}')
@@test
for n, v in [('Ana', 7.25), ('Bruno', 9.0), ('Carla', 4.56)]:
    out, _ = __rodar__(nome=n, nota=v)
    esperado = f'Aluno: {n} | Nota: {v:.1f}'
    assert out.strip() == esperado, f'Com nome={n!r} e nota={v}, esperado "{esperado}", veio "{out.strip()}"'
:::

### LESSON py-02 | Decisões e repetições: if, for e while
goal: fazer o programa tomar decisões e repetir tarefas.
minutes: 14

## Condições

```python
media = 6.5
if media >= 7:
    print('Aprovado')
elif media >= 5:
    print('Recuperação')
else:
    print('Reprovado')
```

- A **indentação** (4 espaços) define o bloco. Não há chaves `{}`.
- Comparações: `==`, `!=`, `>`, `<`, `>=`, `<=`.
- Lógicos: `and`, `or`, `not`. Ex.: `if idade >= 18 and tem_cnh:`
- Comparação encadeada: `if 0 <= nota <= 10:`

## for — repetir para cada item

```python
for i in range(1, 6):      # 1, 2, 3, 4, 5  (o fim não entra)
    print(i)

for letra in 'Python':
    print(letra)
```

`range(inicio, fim, passo)`: `range(10, 0, -2)` → 10, 8, 6, 4, 2.

## while — repetir enquanto for verdade

```python
contador = 3
while contador > 0:
    print(contador)
    contador -= 1          # mesmo que contador = contador - 1
print('Fogo!')
```

## break, continue e else

```python
for n in range(2, 20):
    if n % 7 == 0:
        print('primeiro múltiplo de 7:', n)
        break              # sai do laço
```

`continue` pula para a próxima volta. Um `else` depois do `for`/`while` roda se o laço terminou **sem** `break`.

:::descomplica
- **if** é como a mamãe dizendo: "**se** fizer a lição, pode brincar; **senão**, nada de videogame". 🎮
- **for** é como **distribuir um doce para cada amigo** da fila: você repete a mesma ação para cada um.
- **while** é como **comer pipoca enquanto tiver pipoca no pote**. Acabou? Para. 🍿
- **break** é sair da fila no meio porque já achou o que queria.
:::

:::choice
? Quantas vezes `print('oi')` é executado em `for i in range(2, 8, 2): print('oi')`?
- [ ] 2
- [x] 3
- [ ] 4
- [ ] 6
> range(2, 8, 2) gera 2, 4 e 6 (o 8 não entra).
:::

:::code python
A variável `n` já existe (um inteiro positivo). Usando um laço, calcule a **soma dos números pares de 1 até `n`** (incluindo `n` se ele for par) e guarde em uma variável chamada **`soma`**. Depois, mostre `soma` na tela.
@@setup
n = 10
@@starter
soma = 0
# seu laço aqui

print(soma)
@@solution
soma = 0
for i in range(1, n + 1):
    if i % 2 == 0:
        soma += i
print(soma)
@@test
for valor in [10, 7, 1, 100]:
    out, ns = __rodar__(n=valor)
    esp = sum(i for i in range(1, valor + 1) if i % 2 == 0)
    assert ns.get('soma') == esp, f'Para n={valor}, a soma esperada era {esp}, mas soma={ns.get("soma")}'
    assert out.strip() == str(esp), f'Para n={valor}, o print deveria mostrar {esp}'
:::

### LESSON py-03 | Coleções: listas, tuplas, dicionários e conjuntos
goal: guardar vários valores em estruturas e usar compreensões de lista.
minutes: 16

## Listas — sequência mutável

```python
frutas = ['maçã', 'banana', 'uva']
frutas.append('kiwi')      # adiciona no fim
frutas[0]                  # 'maçã' (índice começa em 0)
frutas[-1]                 # 'kiwi' (último)
frutas[1:3]                # ['banana', 'uva'] (fatiamento: fim não entra)
len(frutas)                # 4
'uva' in frutas            # True
frutas.sort()              # ordena a própria lista
sorted(frutas, reverse=True)  # devolve uma NOVA lista ordenada
```

## Tuplas — sequência imutável

```python
ponto = (3, 4)
x, y = ponto               # desempacotamento
```

Não dá para alterar `ponto[0]`. Use tuplas para dados que não devem mudar.

## Dicionários — pares chave: valor

```python
aluno = {'nome': 'Ana', 'nota': 8.5}
aluno['nome']              # 'Ana'
aluno['idade'] = 28        # adiciona/atualiza
aluno.get('email', '-')    # '-' se a chave não existir (sem erro)
for chave, valor in aluno.items():
    print(chave, valor)
```

## Conjuntos — sem repetição, sem ordem

```python
cores = {'azul', 'verde', 'azul'}   # {'azul', 'verde'}
a, b = {1, 2, 3}, {2, 3, 4}
a | b   # união {1, 2, 3, 4}
a & b   # interseção {2, 3}
a - b   # diferença {1}
```

## Compreensões

Forma curta de construir coleções:

```python
quadrados = [n ** 2 for n in range(1, 6)]           # [1, 4, 9, 16, 25]
pares = [n for n in range(10) if n % 2 == 0]        # [0, 2, 4, 6, 8]
precos = {'pão': 1.0, 'leite': 5.0}
com_aumento = {k: v * 1.1 for k, v in precos.items()}
```

!> **Cópia x referência**: `b = a` não copia a lista — as duas variáveis apontam para a mesma lista. Para copiar: `b = a.copy()` ou `b = list(a)`.

:::descomplica
- **Lista** é um **trem**: cada vagão tem um número (começando do 0!) e dá para colocar e tirar vagões. 🚂
- **Tupla** é um trem **soldado**: não muda nunca.
- **Dicionário** é uma **agenda**: você procura pelo nome (chave) e acha o telefone (valor). 📒
- **Conjunto** é um **saco de bolinhas** onde não entram duas iguais.
:::

:::choice
? Qual o resultado de `[1, 2, 3, 4, 5][1:4]`?
- [ ] `[1, 2, 3, 4]`
- [x] `[2, 3, 4]`
- [ ] `[2, 3, 4, 5]`
- [ ] `[1, 2, 3]`
> O fatiamento começa no índice 1 (valor 2) e para antes do índice 4.
:::

:::code python
A lista `vendas` contém dicionários com `produto` e `valor`. Crie um dicionário chamado **`total_por_produto`** em que cada chave é um produto e o valor é a **soma** das vendas daquele produto.

Ex.: `[{'produto': 'pão', 'valor': 2}, {'produto': 'pão', 'valor': 3}]` → `{'pão': 5}`
@@setup
vendas = [
    {'produto': 'pão', 'valor': 2.5},
    {'produto': 'leite', 'valor': 5.0},
    {'produto': 'pão', 'valor': 3.0},
    {'produto': 'café', 'valor': 12.0},
    {'produto': 'leite', 'valor': 4.5},
]
@@starter
total_por_produto = {}

@@solution
total_por_produto = {}
for v in vendas:
    total_por_produto[v['produto']] = total_por_produto.get(v['produto'], 0) + v['valor']
@@test
casos = [
    [{'produto': 'pão', 'valor': 2.5}, {'produto': 'leite', 'valor': 5.0}, {'produto': 'pão', 'valor': 3.0}],
    [{'produto': 'a', 'valor': 1}, {'produto': 'b', 'valor': 2}, {'produto': 'a', 'valor': 10}, {'produto': 'c', 'valor': 0}],
    [],
]
for vs in casos:
    esp = {}
    for v in vs:
        esp[v['produto']] = esp.get(v['produto'], 0) + v['valor']
    _, ns = __rodar__(vendas=vs)
    got = ns.get('total_por_produto')
    assert isinstance(got, dict), 'total_por_produto precisa ser um dicionário'
    assert {k: round(x, 6) for k, x in got.items()} == {k: round(x, 6) for k, x in esp.items()}, f'Para {vs} esperado {esp}, veio {got}'
:::

### LESSON py-04 | Funções e tratamento de erros
goal: organizar o código em funções reutilizáveis e lidar com erros usando try/except.
minutes: 16

## Definindo funções

```python
def area_retangulo(base, altura):
    """Calcula a área de um retângulo."""   # docstring
    return base * altura

print(area_retangulo(3, 4))   # 12
```

- `return` devolve o valor e encerra a função. Sem `return`, a função devolve `None`.
- **Parâmetros padrão**: `def saudacao(nome, msg='Olá'):`
- **Argumentos nomeados**: `saudacao(msg='Oi', nome='Ana')`
- **Type hints** documentam tipos (não são verificados em tempo de execução): `def soma(a: int, b: int) -> int:`

## *args e **kwargs

```python
def total(*numeros):            # recebe uma tupla
    return sum(numeros)
total(1, 2, 3)                  # 6

def ficha(**dados):             # recebe um dicionário
    for k, v in dados.items():
        print(k, '=', v)
ficha(nome='Ana', idade=28)
```

## Escopo

Variáveis criadas dentro da função são **locais**. Evite alterar variáveis globais dentro de funções; prefira receber parâmetros e retornar resultados.

!> **Armadilha clássica**: não use lista/dicionário como valor padrão (`def f(x=[])`): o mesmo objeto é reaproveitado em todas as chamadas. Use `def f(x=None): x = [] if x is None else x`.

## Lambda

Função anônima de uma expressão: `ordenados = sorted(alunos, key=lambda a: a['nota'])`

## Exceções: try / except / else / finally

```python
try:
    n = int('abc')
except ValueError as e:
    print('Valor inválido:', e)
else:
    print('Deu certo')          # só se não houve exceção
finally:
    print('Sempre executa')     # com ou sem erro
```

Capture **exceções específicas** (`ValueError`, `KeyError`, `ZeroDivisionError`…), não um `except:` genérico. Para sinalizar um erro: `raise ValueError('idade não pode ser negativa')`.

:::descomplica
Uma **função** é como uma **receita de bolo**: você escreve uma vez ("misture farinha, ovos...") e usa sempre que quiser um bolo. Os **parâmetros** são os ingredientes que você entrega, e o **return** é o bolo pronto que sai do forno. 🎂

O **try/except** é a **rede de segurança do trapezista**: "tenta fazer o salto; **se cair**, a rede segura e ninguém se machuca". 🤸
:::

:::choice
? O que `def f(): x = 1` (sem return) devolve quando chamada?
- [ ] 1
- [ ] 0
- [x] None
- [ ] Um erro
> Funções sem return devolvem None.
:::

:::code python
Crie a função **`dividir(a, b)`** que:
- retorna `a / b` normalmente;
- se `b` for zero, retorna a string **`'erro: divisão por zero'`** (use `try/except ZeroDivisionError`);
- se `a` ou `b` não forem números (ex.: texto), retorna **`'erro: valores inválidos'`** (capture `TypeError`).
@@starter
def dividir(a, b):
    pass
@@solution
def dividir(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return 'erro: divisão por zero'
    except TypeError:
        return 'erro: valores inválidos'
@@test
assert 'dividir' in dir() or 'dividir' in globals(), 'Defina a função dividir'
assert dividir(10, 4) == 2.5, 'dividir(10, 4) deveria ser 2.5'
assert dividir(-9, 3) == -3, 'dividir(-9, 3) deveria ser -3.0'
assert dividir(1, 0) == 'erro: divisão por zero', 'dividir(1, 0) deveria retornar "erro: divisão por zero"'
assert dividir('a', 2) == 'erro: valores inválidos', 'dividir("a", 2) deveria retornar "erro: valores inválidos"'
assert dividir(5, None) == 'erro: valores inválidos', 'dividir(5, None) deveria retornar "erro: valores inválidos"'
:::

### EXAM
:::choice
? Qual é o tipo de `x` em `x = 10 / 2`?
- [ ] int
- [x] float
- [ ] str
- [ ] bool
> A divisão `/` sempre devolve float em Python 3 (5.0).
:::

:::choice
? O que imprime `print(f'{3.14159:.2f}')`?
- [x] `3.14`
- [ ] `3.15`
- [ ] `3.1`
- [ ] `{3.14159:.2f}`
> `.2f` formata com duas casas decimais, arredondando (3.14159 → 3.14).
:::

:::choice
? `nomes = ['Ana', 'Bia']; outra = nomes; outra.append('Caio')`. Quanto vale `len(nomes)`?
- [ ] 2
- [x] 3
- [ ] Erro
- [ ] 1
> `outra = nomes` não copia: as duas variáveis apontam para a mesma lista.
:::

:::text
? Qual método de dicionário devolve um valor padrão quando a chave não existe, sem gerar erro?
= get | .get | get()
> `d.get('chave', padrao)` evita KeyError.
:::

:::choice
? Qual o resultado de `[x * 2 for x in range(4) if x % 2 == 1]`?
- [ ] `[0, 2, 4, 6]`
- [x] `[2, 6]`
- [ ] `[1, 3]`
- [ ] `[2, 4, 6]`
> range(4) = 0,1,2,3; ímpares 1 e 3; dobrados: 2 e 6.
:::

:::choice
? Quando o bloco `else` de um `try` é executado?
- [ ] Sempre
- [ ] Quando ocorre exceção
- [x] Quando NÃO ocorre exceção no try
- [ ] Depois do finally
> `else` roda só se o try terminou sem exceção; `finally` roda sempre.
:::

:::choice
? Qual estrutura **não** permite elementos repetidos?
- [ ] list
- [ ] tuple
- [x] set
- [ ] str
> Conjuntos (set) guardam cada elemento uma única vez.
:::

:::choice
? Em `def f(*args)`, o que é `args` dentro da função?
- [ ] Uma lista
- [x] Uma tupla
- [ ] Um dicionário
- [ ] Um conjunto
> `*args` empacota os argumentos posicionais em uma tupla; `**kwargs` em um dicionário.
:::

## MODULE m2 | POO e bibliotecas famosas
desc: Classes, objetos, herança, polimorfismo, encapsulamento, métodos especiais, biblioteca padrão, NumPy e Pandas.

### LESSON py-05 | POO: classes, objetos, atributos e métodos
goal: modelar o mundo com classes e criar objetos com estado e comportamento.
minutes: 16

## Classe x objeto

Uma **classe** é o molde; um **objeto** (instância) é algo criado a partir dele.

```python
class ContaBancaria:
    taxa_saque = 1.0                      # atributo de CLASSE (compartilhado)

    def __init__(self, titular, saldo=0):  # construtor
        self.titular = titular            # atributos de INSTÂNCIA
        self.saldo = saldo

    def depositar(self, valor):           # método
        if valor <= 0:
            raise ValueError('valor deve ser positivo')
        self.saldo += valor

    def sacar(self, valor):
        total = valor + self.taxa_saque
        if total > self.saldo:
            raise ValueError('saldo insuficiente')
        self.saldo -= total

conta = ContaBancaria('Ana', 100)   # cria o objeto
conta.depositar(50)
print(conta.saldo)                   # 150
```

- `__init__` roda automaticamente ao criar o objeto.
- `self` é o próprio objeto: `conta.depositar(50)` vira `ContaBancaria.depositar(conta, 50)`.
- Atributos de instância (`self.saldo`) são de cada objeto; atributos de classe são compartilhados.

## Métodos de classe e estáticos

```python
class Temperatura:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def de_fahrenheit(cls, f):          # construtor alternativo
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def valida(c):                      # não usa self nem cls
        return c >= -273.15
```

## Os 4 pilares da POO

1. **Abstração**: representar só o que importa do mundo real.
2. **Encapsulamento**: esconder detalhes internos e expor uma interface.
3. **Herança**: reaproveitar e especializar classes.
4. **Polimorfismo**: objetos diferentes respondendo à mesma mensagem.

Os três últimos vêm na próxima aula.

:::descomplica
A **classe** é a **forma de biscoito**; os **objetos** são os **biscoitos** feitos com ela. 🍪 Todos têm o mesmo formato, mas cada um pode ter uma cobertura diferente (os atributos).

Os **métodos** são as coisas que o objeto **sabe fazer**: um cachorro (objeto) sabe `latir()` e `correr()`. O `self` é o cachorro falando de si mesmo: "**eu** estou correndo".
:::

:::choice
? Para que serve o parâmetro `self` em um método?
- [ ] É uma palavra reservada obrigatória do Python que não tem valor
- [x] Referencia o próprio objeto em que o método foi chamado
- [ ] Referencia a classe
- [ ] Serve para métodos estáticos
> `self` é o objeto; `cls` (em @classmethod) é a classe.
:::

:::code python
Crie a classe **`Carrinho`** com:
- `__init__` que cria `self.itens` como **lista vazia**;
- `adicionar(nome, preco, qtd=1)` que guarda o item (pode guardar como tupla ou dicionário);
- `total()` que retorna a soma de `preco * qtd` de todos os itens;
- `quantidade_itens()` que retorna a soma das quantidades.

Cada carrinho deve ter a **sua própria** lista.
@@starter
class Carrinho:
    pass
@@solution
class Carrinho:
    def __init__(self):
        self.itens = []

    def adicionar(self, nome, preco, qtd=1):
        self.itens.append({'nome': nome, 'preco': preco, 'qtd': qtd})

    def total(self):
        return sum(i['preco'] * i['qtd'] for i in self.itens)

    def quantidade_itens(self):
        return sum(i['qtd'] for i in self.itens)
@@test
c = Carrinho()
assert c.total() == 0, 'Carrinho novo deve ter total 0'
c.adicionar('caneta', 2.5, 4)
c.adicionar('caderno', 20)
assert abs(c.total() - 30) < 1e-9, f'Total esperado 30, veio {c.total()}'
assert c.quantidade_itens() == 5, f'Quantidade esperada 5, veio {c.quantidade_itens()}'
d = Carrinho()
assert d.total() == 0 and d.quantidade_itens() == 0, 'Cada carrinho precisa ter sua própria lista (não compartilhe a lista entre objetos)'
:::

### LESSON py-06 | POO: herança, polimorfismo, encapsulamento e métodos especiais
goal: especializar classes, usar polimorfismo, proteger atributos com property e criar dataclasses.
minutes: 18

## Herança

```python
class Animal:
    def __init__(self, nome):
        self.nome = nome
    def falar(self):
        return '...'

class Cachorro(Animal):          # Cachorro HERDA de Animal
    def falar(self):             # sobrescreve (override)
        return 'Au au'

class Gato(Animal):
    def __init__(self, nome, indoor=True):
        super().__init__(nome)   # chama o construtor da classe-mãe
        self.indoor = indoor
    def falar(self):
        return 'Miau'
```

`isinstance(rex, Animal)` → `True`. Python permite **herança múltipla**; a ordem de busca de métodos é a MRO (`Classe.__mro__`).

## Polimorfismo

```python
for bicho in [Cachorro('Rex'), Gato('Mia')]:
    print(bicho.nome, bicho.falar())   # cada um responde do seu jeito
```

Em Python vale o *duck typing*: "se anda como pato e grasna como pato, é pato" — basta o objeto ter o método.

## Encapsulamento

Python não tem `private` de verdade; usa **convenções**:

- `_saldo`: "interno, não mexa" (convenção).
- `__saldo`: o nome é alterado (*name mangling*) para `_Classe__saldo`, dificultando acesso acidental.
- `@property`: expõe um atributo controlado.

```python
class Produto:
    def __init__(self, preco):
        self.preco = preco           # passa pelo setter!

    @property
    def preco(self):
        return self._preco

    @preco.setter
    def preco(self, valor):
        if valor < 0:
            raise ValueError('preço negativo')
        self._preco = valor
```

## Métodos especiais (dunder)

| Método | Usado por |
|---|---|
| `__str__` | `print(obj)`, `str(obj)` (para humanos) |
| `__repr__` | depuração, `repr(obj)` |
| `__len__` | `len(obj)` |
| `__eq__`, `__lt__` | `==`, `<` |
| `__add__` | `+` |
| `__iter__` | `for x in obj` |

## Classes abstratas e dataclasses

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass

class Forma(ABC):
    @abstractmethod
    def area(self): ...            # obriga as filhas a implementar

@dataclass
class Ponto:
    x: float
    y: float = 0.0                 # gera __init__, __repr__ e __eq__ automaticamente
```

:::descomplica
- **Herança** é como **herdar o jeito da família**: o filho já nasce sabendo o que os pais sabem, e pode aprender coisas novas. 👨‍👦
- **Polimorfismo**: você diz "**fale!**" para o cachorro e para o gato. Os dois obedecem, mas um faz *au au* e o outro faz *miau*. 🐶🐱
- **Encapsulamento** é o **cofrinho**: você não mexe no dinheiro direto, usa a fendinha. A `property` é a fendinha que não deixa colocar dinheiro "negativo".
:::

:::choice
? O que `super().__init__(nome)` faz dentro do `__init__` de uma classe filha?
- [ ] Cria uma nova classe
- [x] Executa o construtor da classe-mãe
- [ ] Apaga os atributos da mãe
- [ ] Torna os atributos privados
> Assim a filha reaproveita a inicialização da mãe e só acrescenta o que é dela.
:::

:::code python
Crie a classe abstrata **`Forma`** (com `ABC` e o método abstrato `area`) e as classes **`Retangulo(largura, altura)`** e **`Circulo(raio)`** que herdam dela e implementam `area()` (use `math.pi`).

Implemente também `__str__` em cada uma, retornando, por exemplo, `Retangulo 3x4` e `Circulo r=2`.

Por fim, a função **`area_total(formas)`** deve somar as áreas de uma lista de formas (polimorfismo!).
@@starter
from abc import ABC, abstractmethod
import math

class Forma(ABC):
    pass
@@solution
from abc import ABC, abstractmethod
import math

class Forma(ABC):
    @abstractmethod
    def area(self):
        ...

class Retangulo(Forma):
    def __init__(self, largura, altura):
        self.largura = largura
        self.altura = altura
    def area(self):
        return self.largura * self.altura
    def __str__(self):
        return f'Retangulo {self.largura}x{self.altura}'

class Circulo(Forma):
    def __init__(self, raio):
        self.raio = raio
    def area(self):
        return math.pi * self.raio ** 2
    def __str__(self):
        return f'Circulo r={self.raio}'

def area_total(formas):
    return sum(f.area() for f in formas)
@@test
import math
try:
    Forma()
    assert False, 'Forma deve ser abstrata (não pode ser instanciada)'
except TypeError:
    pass
r, c = Retangulo(3, 4), Circulo(2)
assert isinstance(r, Forma) and isinstance(c, Forma), 'Retangulo e Circulo devem herdar de Forma'
assert r.area() == 12, 'Área do Retangulo(3, 4) deve ser 12'
assert abs(c.area() - math.pi * 4) < 1e-9, 'Área do Circulo(2) deve ser pi * 4'
assert str(r) == 'Retangulo 3x4', f'str(Retangulo(3,4)) deveria ser "Retangulo 3x4", veio "{r}"'
assert str(c) == 'Circulo r=2', f'str(Circulo(2)) deveria ser "Circulo r=2", veio "{c}"'
assert abs(area_total([r, c, Retangulo(1, 1)]) - (13 + math.pi * 4)) < 1e-9, 'area_total não confere'
:::

### LESSON py-07 | Biblioteca padrão, módulos, pip e ambientes virtuais
goal: usar módulos prontos do Python (collections, itertools, datetime, json, pathlib) e gerenciar pacotes.
minutes: 15

## Importando módulos

```python
import math                       # math.sqrt(16)
from datetime import date         # date.today()
import json as js                 # apelido
```

Um **módulo** é um arquivo `.py`; um **pacote** é uma pasta de módulos. O bloco `if __name__ == '__main__':` só roda quando o arquivo é executado diretamente (não quando importado).

## Joias da biblioteca padrão

```python
from collections import Counter, defaultdict, deque
Counter('banana')                      # Counter({'a': 3, 'n': 2, 'b': 1})
Counter('banana').most_common(1)       # [('a', 3)]
grupos = defaultdict(list)             # cria a lista sozinho na 1ª vez
grupos['frutas'].append('maçã')

import itertools
list(itertools.combinations([1, 2, 3], 2))   # [(1, 2), (1, 3), (2, 3)]

from datetime import datetime, timedelta
amanha = datetime(2025, 1, 31) + timedelta(days=1)   # 2025-02-01 00:00:00
amanha.strftime('%d/%m/%Y')                          # '01/02/2025'

import json
texto = json.dumps({'nome': 'Ana', 'ativo': True})   # dict → str JSON
dados = json.loads(texto)                            # str JSON → dict

from pathlib import Path
p = Path('dados') / 'notas.txt'
# p.write_text('8.5'); p.read_text(); p.exists(); p.suffix → '.txt'
```

Outros: `random`, `statistics`, `re` (expressões regulares), `csv`, `os`, `sys`, `functools` (`lru_cache`, `reduce`), `typing`, `logging`, `unittest`.

## pip e ambientes virtuais

Pacotes de terceiros vêm do **PyPI** e são instalados com `pip`. Cada projeto deve ter seu **ambiente virtual** para não misturar versões:

```bash
python -m venv .venv            # cria o ambiente
source .venv/bin/activate       # Linux/macOS  (Windows: .venv\Scripts\activate)
pip install requests pandas     # instala dentro do ambiente
pip freeze > requirements.txt   # registra as versões
pip install -r requirements.txt # recria em outra máquina
```

:::descomplica
A **biblioteca padrão** é a **caixa de ferramentas que já vem com o Python**. 🧰 Precisa contar coisas? Tem o `Counter`. Precisa mexer com datas? Tem o `datetime`. Você só precisa dizer "**import**" — que é como abrir a gaveta certa.

O **pip** é a **loja** onde você busca ferramentas novas, e o **ambiente virtual** é uma **mochila separada para cada projeto**, para as ferramentas de um não se misturarem com as do outro. 🎒
:::

:::choice
? Qual é a função de um ambiente virtual (`venv`)?
- [ ] Deixar o Python mais rápido
- [x] Isolar os pacotes e versões de cada projeto
- [ ] Rodar Python no navegador
- [ ] Compilar o código
> Cada projeto tem suas dependências sem conflitar com outros projetos.
:::

:::code python
A variável `texto` contém uma frase. Usando **`collections.Counter`**, crie a variável **`top3`** com as **3 palavras mais frequentes** como uma lista de tuplas `(palavra, contagem)`, considerando as palavras em **minúsculas** e separadas por espaço (`texto.lower().split()`).

Use `most_common(3)`.
@@setup
texto = 'o rato roeu a roupa do rei de roma e o rei riu do rato'
@@starter
from collections import Counter

top3 = []
@@solution
from collections import Counter

top3 = Counter(texto.lower().split()).most_common(3)
@@test
from collections import Counter
for t in ['o rato roeu a roupa do rei de roma e o rei riu do rato', 'A a a B b C c c c d', 'um dois dois tres tres tres']:
    _, ns = __rodar__(texto=t)
    esp = Counter(t.lower().split()).most_common(3)
    got = ns.get('top3')
    assert got is not None and [tuple(x) for x in got] == esp, f'Para "{t}", esperado {esp}, veio {got}'
:::

### LESSON py-08 | NumPy e Pandas: dados em escala
goal: fazer contas vetorizadas com NumPy e analisar tabelas com Pandas.
minutes: 20

## NumPy — arrays numéricos rápidos

```python
import numpy as np

a = np.array([1, 2, 3, 4])
a * 2            # array([2, 4, 6, 8])  — operação vetorizada, sem laço
a.mean(), a.sum(), a.max()
m = np.array([[1, 2], [3, 4]])
m.shape          # (2, 2)
m @ m            # multiplicação de matrizes
a[a > 2]         # máscara booleana → array([3, 4])
np.arange(0, 1, 0.25)      # array([0.  , 0.25, 0.5 , 0.75])
np.zeros((2, 3)), np.ones(3), np.linspace(0, 1, 5)
```

Arrays têm **um único tipo** (`dtype`) e operações em C por baixo, por isso são muito mais rápidos que listas para cálculo.

## Pandas — tabelas (DataFrames)

```python
import pandas as pd

df = pd.DataFrame({
    'produto': ['pão', 'leite', 'pão', 'café'],
    'qtd':     [10, 5, 7, 2],
    'preco':   [0.5, 4.0, 0.5, 15.0],
})
df.head()                      # primeiras linhas
df['total'] = df['qtd'] * df['preco']     # nova coluna
df[df['qtd'] > 4]              # filtro
df.sort_values('total', ascending=False)
df.groupby('produto')['total'].sum()      # agregação por grupo
df.describe()                  # estatísticas
```

Ler e gravar arquivos: `pd.read_csv('vendas.csv')`, `df.to_csv('saida.csv', index=False)`, também `read_excel`, `read_json`, `read_sql`.

| Conceito | Pandas | Equivalente SQL |
|---|---|---|
| filtrar | `df[df.qtd > 4]` | `WHERE qtd > 4` |
| agrupar | `df.groupby('produto').sum()` | `GROUP BY produto` |
| juntar | `pd.merge(a, b, on='id')` | `JOIN ... ON` |
| ordenar | `df.sort_values('x')` | `ORDER BY x` |

Valores ausentes aparecem como `NaN`: `df.isna()`, `df.dropna()`, `df.fillna(0)`.

Outras bibliotecas famosas: **Matplotlib**/**Seaborn** (gráficos), **Requests** (HTTP), **SciPy** (científica), **Polars** (DataFrames muito rápidos), **Pydantic** (validação de dados).

:::descomplica
- O **NumPy** é uma **calculadora gigante**: em vez de fazer conta número por número, ele faz com **todos de uma vez**, tipo multiplicar uma fila inteira de figurinhas por 2 num piscar de olhos. ⚡
- O **Pandas** é uma **planilha dentro do Python**: linhas, colunas, filtros e somas — como no Excel, só que com código. 📊
:::

:::choice
? O que `np.array([1, 2, 3]) + 10` retorna?
- [ ] Erro
- [ ] `[1, 2, 3, 10]`
- [x] `array([11, 12, 13])`
- [ ] `16`
> Operações com arrays são aplicadas elemento a elemento (broadcasting).
:::

:::code python
O DataFrame `df` (já carregado) tem as colunas `vendedor`, `regiao` e `valor`. Crie a variável **`ranking`**: uma **Series** com a **soma de `valor` por `vendedor`**, ordenada do **maior para o menor**.

Dica: `groupby` + `sum` + `sort_values(ascending=False)`.
@@setup
import pandas as pd
df = pd.DataFrame({
    'vendedor': ['Ana', 'Bruno', 'Ana', 'Carla', 'Bruno', 'Carla', 'Carla'],
    'regiao':   ['Sul', 'Sul', 'Norte', 'Norte', 'Sul', 'Sul', 'Norte'],
    'valor':    [100.0, 250.0, 300.0, 50.0, 80.0, 120.0, 90.0],
})
@@starter
ranking = None
@@solution
ranking = df.groupby('vendedor')['valor'].sum().sort_values(ascending=False)
@@test
import pandas as pd
def esperado(d):
    return d.groupby('vendedor')['valor'].sum().sort_values(ascending=False)
outro = pd.DataFrame({'vendedor': ['X', 'Y', 'Z', 'Y'], 'regiao': ['a'] * 4, 'valor': [5.0, 1.0, 9.0, 2.0]})
for d in [df, outro]:
    _, ns = __rodar__(df=d)
    r = ns.get('ranking')
    assert isinstance(r, pd.Series), 'ranking deve ser uma Series do pandas'
    e = esperado(d)
    assert list(r.index) == list(e.index) and [round(x, 6) for x in r.values] == [round(x, 6) for x in e.values], f'Esperado {dict(e)}, veio {dict(r)}'
:::

### EXAM
:::choice
? Em uma classe, um atributo definido diretamente no corpo da classe (fora de métodos) é:
- [ ] De instância
- [x] De classe, compartilhado por todas as instâncias
- [ ] Privado
- [ ] Constante
> Atributos de classe são compartilhados; atributos `self.x` são de cada objeto.
:::

:::choice
? Qual método especial é chamado por `print(obj)`?
- [x] `__str__`
- [ ] `__init__`
- [ ] `__print__`
- [ ] `__len__`
> `print` usa `str(obj)`, que chama `__str__` (e cai em `__repr__` se não existir).
:::

:::choice
? Por que não se consegue instanciar uma classe que herda de `ABC` com um `@abstractmethod` não implementado?
- [ ] Porque ABC proíbe qualquer instância
- [x] Porque métodos abstratos precisam ser implementados nas subclasses concretas
- [ ] Porque falta o `__init__`
- [ ] Porque Python não suporta herança
> Ao tentar, o Python lança TypeError.
:::

:::choice
? Qual decorador transforma um método em um "atributo calculado", com getter/setter?
- [ ] `@staticmethod`
- [ ] `@classmethod`
- [x] `@property`
- [ ] `@dataclass`
> `@property` + `@x.setter` permitem validar ao atribuir.
:::

:::text
? Qual comando cria um ambiente virtual na pasta `.venv`? (`python -m ____ .venv`)
= venv
> `python -m venv .venv` e depois ativar o ambiente.
:::

:::choice
? `Counter('arara').most_common(1)` retorna:
- [x] `[('a', 3)]`
- [ ] `[('r', 2)]`
- [ ] `{'a': 3}`
- [ ] `3`
> 'arara' tem 3 'a' e 2 'r'.
:::

:::choice
? No Pandas, qual operação equivale a um `GROUP BY` do SQL?
- [ ] `df.merge`
- [x] `df.groupby`
- [ ] `df.pivot_table` é a única forma
- [ ] `df.sort_values`
> `groupby` agrupa; depois aplica-se uma agregação como `sum`, `mean`, `count`.
:::

:::choice
? "Duck typing" significa:
- [ ] Toda classe precisa herdar de `object` explicitamente
- [x] O que importa é o objeto ter os métodos/atributos usados, não o seu tipo declarado
- [ ] Usar type hints obrigatórios
- [ ] Polimorfismo só via herança
> Se o objeto tem `falar()`, ele pode ser usado onde se chama `falar()`.
:::

## MODULE m3 | Dados, APIs e frameworks web
desc: SQLite com sqlite3, consumo de APIs, criação de APIs com FastAPI e aplicações web com Django.

### LESSON py-09 | SQLite com Python: o módulo sqlite3
goal: criar e consultar um banco SQLite a partir do Python, com segurança contra SQL Injection.
minutes: 16

## Conectando

```python
import sqlite3

con = sqlite3.connect('loja.db')       # cria o arquivo se não existir
# con = sqlite3.connect(':memory:')    # banco só na memória
cur = con.cursor()
```

## Criando, inserindo e consultando

```python
cur.execute('''
    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        preco REAL NOT NULL
    )
''')

cur.execute('INSERT INTO produtos (nome, preco) VALUES (?, ?)', ('Mouse', 80.0))
cur.executemany('INSERT INTO produtos (nome, preco) VALUES (?, ?)',
                [('Teclado', 150.0), ('Monitor', 900.0)])
con.commit()                            # confirma a transação!

cur.execute('SELECT nome, preco FROM produtos WHERE preco > ?', (100,))
for nome, preco in cur.fetchall():      # fetchone() pega uma linha só
    print(nome, preco)

con.close()
```

## Parâmetros: nunca concatene!

```python
# ERRADO — vulnerável a SQL Injection
cur.execute(f"SELECT * FROM usuarios WHERE nome = '{entrada}'")

# CERTO — o valor vai separado do comando
cur.execute('SELECT * FROM usuarios WHERE nome = ?', (entrada,))
cur.execute('SELECT * FROM usuarios WHERE nome = :nome', {'nome': entrada})
```

Repare em `(entrada,)`: a vírgula faz dele uma **tupla** de 1 elemento.

## Boas práticas

- Use a conexão como **gerenciador de contexto** para transações: `with con:` faz `commit` se tudo der certo e `rollback` se houver exceção (mas **não** fecha a conexão).
- `con.row_factory = sqlite3.Row` permite acessar colunas pelo nome: `linha['nome']`.
- `cur.lastrowid` devolve o id da última linha inserida.

:::descomplica
O `sqlite3` é o **telefone** entre o Python e o banco de dados. ☎️ Você **liga** (`connect`), **fala** o pedido (`execute`), **ouve** a resposta (`fetchall`) e, se mudou algo, diz "**pode anotar!**" (`commit`).

Os pontos de interrogação `?` são **espaços em branco num formulário**: você entrega o valor separado, e assim ninguém consegue "escrever uma ordem" no lugar do nome. ✍️
:::

:::choice
? Por que usar `cur.execute('... WHERE nome = ?', (nome,))` em vez de uma f-string?
- [ ] É mais curto
- [x] Evita SQL Injection, pois o valor é enviado separado do comando
- [ ] f-strings não funcionam com SQL
- [ ] Para converter o tipo automaticamente
> Consultas parametrizadas tratam o valor como dado, nunca como código SQL.
:::

:::code python
Escreva a função **`cadastrar_e_listar(con, produtos, preco_min)`** que:
1. cria (se não existir) a tabela `produtos(id INTEGER PRIMARY KEY, nome TEXT NOT NULL, preco REAL NOT NULL)`;
2. insere a lista `produtos` (tuplas `(nome, preco)`) **usando parâmetros `?`**;
3. faz `commit`;
4. retorna a **lista de nomes** dos produtos com `preco >= preco_min`, em **ordem alfabética**.

O verificador usa um banco em memória e testa inclusive um nome com aspas (`"Cadeira D'água"`).
@@starter
import sqlite3

def cadastrar_e_listar(con, produtos, preco_min):
    cur = con.cursor()
    # seu código aqui
    return []
@@solution
import sqlite3

def cadastrar_e_listar(con, produtos, preco_min):
    cur = con.cursor()
    cur.execute('CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, preco REAL NOT NULL)')
    cur.executemany('INSERT INTO produtos (nome, preco) VALUES (?, ?)', produtos)
    con.commit()
    cur.execute('SELECT nome FROM produtos WHERE preco >= ? ORDER BY nome', (preco_min,))
    return [linha[0] for linha in cur.fetchall()]
@@test
import sqlite3
con = sqlite3.connect(':memory:')
r = cadastrar_e_listar(con, [('Mouse', 80.0), ('Teclado', 150.0), ("Cadeira D'água", 900.0), ('Cabo', 10.0)], 100)
assert r == ["Cadeira D'água", 'Teclado'], f'Esperado ["Cadeira D\'água", "Teclado"], veio {r}'
n = con.execute('SELECT COUNT(*) FROM produtos').fetchone()[0]
assert n == 4, f'A tabela deveria ter 4 produtos, tem {n}'
r2 = cadastrar_e_listar(con, [('Webcam', 250.0)], 200)
assert r2 == ["Cadeira D'água", 'Webcam'], f'Segunda chamada: esperado ["Cadeira D\'água", "Webcam"], veio {r2}'
con2 = sqlite3.connect(':memory:')
assert cadastrar_e_listar(con2, [], 0) == [], 'Com lista vazia deve retornar []'
:::

### LESSON py-10 | Consumindo APIs com Python
goal: fazer requisições HTTP, tratar status e JSON e lidar com erros de rede.
minutes: 16

## A biblioteca requests

`requests` é a biblioteca HTTP mais usada em Python (`pip install requests`).

```python
import requests

r = requests.get('https://api.exemplo.com/usuarios',
                 params={'ativo': 'true'},          # vira ?ativo=true
                 headers={'Accept': 'application/json'},
                 timeout=10)                         # SEMPRE use timeout
print(r.status_code)     # 200
dados = r.json()         # converte o corpo JSON em dict/list

novo = requests.post('https://api.exemplo.com/usuarios',
                     json={'nome': 'Ana'},           # envia JSON e o header Content-Type
                     timeout=10)
```

## Tratando erros

```python
try:
    r = requests.get(url, timeout=5)
    r.raise_for_status()          # lança HTTPError se status for 4xx/5xx
    dados = r.json()
except requests.exceptions.Timeout:
    print('A API demorou demais')
except requests.exceptions.HTTPError as e:
    print('Erro HTTP:', e.response.status_code)
except requests.exceptions.RequestException as e:
    print('Falha de rede:', e)
```

- `r.ok` é `True` para status < 400.
- `requests.Session()` reaproveita conexões e headers (ex.: token) entre chamadas.
- Para muitas chamadas em paralelo, existe o **httpx**, com suporte a `async`/`await`.

## Autenticação

```python
headers = {'Authorization': f'Bearer {token}'}
r = requests.get(url, headers=headers, timeout=10)
```

Nunca escreva chaves e tokens no código: leia de **variáveis de ambiente** (`os.environ['API_KEY']`).

!> No terminal deste site não há acesso à internet, então o exercício usa um objeto `http` **simulado**, com a mesma forma do `requests` (`http.get(url, params=..., timeout=...)` devolvendo um objeto com `status_code` e `.json()`). Tudo o que você aprender vale para o `requests` real.

:::descomplica
Usar uma API é como **pedir comida pelo aplicativo**. 🍕 Você faz o **pedido** (`get`), o restaurante responde com um **código** — 200 é "saiu para entrega!", 404 é "esse prato não existe" — e a **comida** vem numa caixinha (o JSON) que você abre com `.json()`.

O **timeout** é dizer: "se não chegar em 10 minutos, eu desisto e faço um miojo". 🍜
:::

:::choice
? O que `r.raise_for_status()` faz quando a resposta tem status 404?
- [ ] Retorna False
- [x] Lança uma exceção HTTPError
- [ ] Tenta de novo
- [ ] Converte para 200
> Ele transforma status de erro (4xx/5xx) em exceção, para você tratar com try/except.
:::

:::code python
Use o cliente simulado `http` (igual ao `requests`) para buscar `https://api.loja.exemplo/usuarios` com o parâmetro de consulta `ativo` = `'true'` e `timeout=5`.

Escreva a função **`nomes_ativos()`** que:
- retorna a **lista de nomes** (campo `nome`) dos usuários retornados, se o status for **200**;
- retorna **lista vazia** se o status for diferente de 200.
@@setup
import json as _json
class _Resp:
    def __init__(self, status, corpo):
        self.status_code = status
        self._corpo = corpo
        self.ok = status < 400
    def json(self):
        return _json.loads(_json.dumps(self._corpo))
class _Http:
    def __init__(self):
        self.chamadas = []
        self.falhar = False
        self.usuarios = [{'id': 1, 'nome': 'Ana', 'ativo': True}, {'id': 2, 'nome': 'Bruno', 'ativo': False}, {'id': 3, 'nome': 'Carla', 'ativo': True}]
    def get(self, url, params=None, headers=None, timeout=None):
        self.chamadas.append({'url': url, 'params': params or {}, 'timeout': timeout})
        if self.falhar:
            return _Resp(503, {'erro': 'indisponível'})
        if url != 'https://api.loja.exemplo/usuarios':
            return _Resp(404, {'erro': 'não encontrado'})
        lista = self.usuarios
        if (params or {}).get('ativo') == 'true':
            lista = [u for u in lista if u['ativo']]
        return _Resp(200, lista)
http = _Http()
@@starter
def nomes_ativos():
    resposta = http.get('...')
    return []
@@solution
def nomes_ativos():
    resposta = http.get('https://api.loja.exemplo/usuarios', params={'ativo': 'true'}, timeout=5)
    if resposta.status_code != 200:
        return []
    return [u['nome'] for u in resposta.json()]
@@test
http.chamadas.clear()
r = nomes_ativos()
assert r == ['Ana', 'Carla'], f'Esperado ["Ana", "Carla"], veio {r}'
ch = http.chamadas[-1]
assert ch['params'].get('ativo') == 'true', 'Envie o parâmetro ativo=true em params'
assert ch['timeout'] is not None, 'Sempre informe um timeout'
http.usuarios.append({'id': 4, 'nome': 'Diego', 'ativo': True})
assert nomes_ativos() == ['Ana', 'Carla', 'Diego'], 'A função deve usar os dados da API, não uma lista fixa'
http.falhar = True
assert nomes_ativos() == [], 'Com status 503 a função deve retornar []'
:::

### LESSON py-11 | Criando APIs com FastAPI
goal: criar endpoints com rotas, parâmetros, validação com Pydantic e códigos de status.
minutes: 18

## Por que FastAPI?

**FastAPI** é um framework para criar APIs HTTP em Python. Ele usa os **type hints** para validar dados automaticamente (via **Pydantic**) e gera **documentação interativa** (OpenAPI/Swagger em `/docs`).

```bash
pip install "fastapi[standard]"
fastapi dev main.py          # servidor de desenvolvimento (Uvicorn por baixo)
```

## Primeiro app

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class ProdutoIn(BaseModel):          # corpo esperado, validado pelo Pydantic
    nome: str
    preco: float
    estoque: int = 0

produtos = {1: {'id': 1, 'nome': 'Mouse', 'preco': 80.0, 'estoque': 10}}

@app.get('/produtos')
def listar(preco_max: float | None = None):          # parâmetro de QUERY: /produtos?preco_max=100
    itens = list(produtos.values())
    if preco_max is not None:
        itens = [p for p in itens if p['preco'] <= preco_max]
    return itens                                      # vira JSON automaticamente

@app.get('/produtos/{produto_id}')
def obter(produto_id: int):                           # parâmetro de CAMINHO, convertido para int
    if produto_id not in produtos:
        raise HTTPException(status_code=404, detail='Produto não encontrado')
    return produtos[produto_id]

@app.post('/produtos', status_code=201)
def criar(p: ProdutoIn):                              # corpo JSON validado
    novo_id = max(produtos) + 1
    produtos[novo_id] = {'id': novo_id, **p.model_dump()}
    return produtos[novo_id]
```

## O que o FastAPI faz por você

- `{produto_id}` na rota + `produto_id: int` → converte e, se vier `"abc"`, responde **422** com o erro.
- Parâmetros da função que **não** estão na rota viram **query string**; com valor padrão, são opcionais.
- Parâmetro do tipo `BaseModel` → lido do **corpo JSON** e validado.
- `HTTPException(status_code=404, detail=...)` → resposta de erro.
- Funções podem ser `async def` quando fazem I/O assíncrono.
- **Injeção de dependências** com `Depends` (ex.: obter a sessão do banco ou o usuário autenticado).

## Testando

```python
from fastapi.testclient import TestClient
cliente = TestClient(app)
assert cliente.get('/produtos/1').status_code == 200
assert cliente.get('/produtos/999').status_code == 404
```

!> O FastAPI real precisa de um servidor, então o exercício usa um **mini-framework didático** (`MiniAPI`) com a mesma forma de uso: decoradores `@app.get`/`@app.post`, parâmetros de caminho tipados, query string com padrão e `HTTPException`. O cliente de teste chama suas rotas.

:::descomplica
Criar uma API é como **abrir uma lanchonete**. 🍔
- Cada **rota** (`@app.get('/produtos')`) é um **item do cardápio**.
- O **parâmetro de caminho** (`/produtos/5`) é "quero o lanche **número 5**".
- O **parâmetro de query** (`?preco_max=100`) é "**só os que custam até 100**".
- O **Pydantic** é o **caixa conferindo o pedido**: se você pedir "três-e-meio hambúrgueres", ele responde "não dá!" (erro 422).
- O **404** é "esse lanche não existe no cardápio".
:::

:::choice
? Em `@app.get('/itens/{item_id}')` com `def obter(item_id: int, q: str | None = None)`, de onde vem `q`?
- [ ] Do caminho
- [x] Da query string (ex.: `/itens/3?q=abc`), sendo opcional
- [ ] Do corpo JSON
- [ ] De um header
> Parâmetros que não aparecem na rota e são tipos simples viram query parameters.
:::

:::code python
Usando o `app` (estilo FastAPI) já criado, implemente:

1. `GET /tarefas` com o parâmetro de query opcional **`feita: bool | None = None`**: retorna a lista de tarefas, filtrada por `feita` se ele for informado;
2. `GET /tarefas/{tarefa_id}` com `tarefa_id: int`: retorna a tarefa ou lança **`HTTPException(404, 'Tarefa não encontrada')`**;
3. `POST /tarefas` com **`status_code=201`**, recebendo `dados: dict` (o corpo) e criando a tarefa com `id` novo (maior id + 1), o `titulo` recebido e `feita=False`. Se não houver `titulo`, lance **`HTTPException(422, 'titulo é obrigatório')`**.

As tarefas estão no dicionário `tarefas` (chave = id).
@@setup
import inspect, re, json as _json

class HTTPException(Exception):
    def __init__(self, status_code, detail=None):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail

class MiniAPI:
    """Mini-framework didático no estilo FastAPI."""
    def __init__(self):
        self.rotas = []
    def _registrar(self, metodo, caminho, status_code):
        def deco(fn):
            padrao = '^' + re.sub(r'\{(\w+)\}', r'(?P<\1>[^/]+)', caminho) + '$'
            self.rotas.append((metodo, re.compile(padrao), fn, status_code))
            return fn
        return deco
    def get(self, caminho, status_code=200):
        return self._registrar('GET', caminho, status_code)
    def post(self, caminho, status_code=200):
        return self._registrar('POST', caminho, status_code)
    def _converter(self, valor, tipo):
        if tipo is bool or tipo == (bool | None):
            if str(valor).lower() in ('true', '1'):
                return True
            if str(valor).lower() in ('false', '0'):
                return False
            raise ValueError('bool inválido')
        if tipo is int:
            return int(valor)
        if tipo is float:
            return float(valor)
        return valor
    def requisitar(self, metodo, url, corpo=None):
        caminho, _, qs = url.partition('?')
        query = dict(p.split('=', 1) for p in qs.split('&') if '=' in p)
        for m, rx, fn, st in self.rotas:
            achou = rx.match(caminho)
            if m != metodo or not achou:
                continue
            args = {}
            assin = inspect.signature(fn)
            try:
                for nome, par in assin.parameters.items():
                    tipo = par.annotation
                    if nome in achou.groupdict():
                        args[nome] = self._converter(achou.group(nome), tipo)
                    elif tipo is dict or nome in ('dados', 'corpo'):
                        args[nome] = _json.loads(_json.dumps(corpo or {}))
                    elif nome in query:
                        args[nome] = self._converter(query[nome], tipo)
                    elif par.default is not inspect.Parameter.empty:
                        args[nome] = par.default
                    else:
                        return 422, {'detail': f'parâmetro {nome} obrigatório'}
            except ValueError:
                return 422, {'detail': 'tipo inválido'}
            try:
                return st, fn(**args)
            except HTTPException as e:
                return e.status_code, {'detail': e.detail}
        return 404, {'detail': 'Not Found'}

app = MiniAPI()
tarefas = {
    1: {'id': 1, 'titulo': 'Estudar SQL', 'feita': True},
    2: {'id': 2, 'titulo': 'Praticar Python', 'feita': False},
}
@@starter
@app.get('/tarefas')
def listar(feita: bool | None = None):
    return []
@@solution
@app.get('/tarefas')
def listar(feita: bool | None = None):
    itens = list(tarefas.values())
    if feita is not None:
        itens = [t for t in itens if t['feita'] == feita]
    return itens

@app.get('/tarefas/{tarefa_id}')
def obter(tarefa_id: int):
    if tarefa_id not in tarefas:
        raise HTTPException(404, 'Tarefa não encontrada')
    return tarefas[tarefa_id]

@app.post('/tarefas', status_code=201)
def criar(dados: dict):
    if not dados.get('titulo'):
        raise HTTPException(422, 'titulo é obrigatório')
    novo_id = max(tarefas) + 1 if tarefas else 1
    tarefas[novo_id] = {'id': novo_id, 'titulo': dados['titulo'], 'feita': False}
    return tarefas[novo_id]
@@test
st, corpo = app.requisitar('GET', '/tarefas')
assert st == 200 and len(corpo) == 2, f'GET /tarefas deveria retornar as 2 tarefas, veio {st} {corpo}'
st, corpo = app.requisitar('GET', '/tarefas?feita=false')
assert st == 200 and [t['id'] for t in corpo] == [2], f'GET /tarefas?feita=false deveria retornar só a tarefa 2, veio {corpo}'
st, corpo = app.requisitar('GET', '/tarefas/1')
assert st == 200 and corpo['titulo'] == 'Estudar SQL', f'GET /tarefas/1 falhou: {st} {corpo}'
st, corpo = app.requisitar('GET', '/tarefas/99')
assert st == 404, f'GET /tarefas/99 deveria dar 404, deu {st}'
st, corpo = app.requisitar('GET', '/tarefas/abc')
assert st == 422, f'GET /tarefas/abc deveria dar 422 (id não é int), deu {st}'
st, corpo = app.requisitar('POST', '/tarefas', {'titulo': 'Fazer o exame'})
assert st == 201, f'POST /tarefas deveria responder 201, respondeu {st}'
assert corpo == {'id': 3, 'titulo': 'Fazer o exame', 'feita': False}, f'Tarefa criada incorreta: {corpo}'
assert 3 in tarefas, 'A nova tarefa deve ser guardada no dicionário tarefas'
st, corpo = app.requisitar('POST', '/tarefas', {})
assert st == 422, f'POST sem titulo deveria dar 422, deu {st}'
:::

### LESSON py-12 | Django: o framework "baterias incluídas"
goal: entender a arquitetura MTV do Django, models e ORM, rotas, views, templates e admin.
minutes: 16

## Quando usar Django

**Django** é um framework web completo: ORM, migrações, autenticação, painel administrativo, formulários, templates e proteções de segurança prontas (CSRF, XSS, SQL Injection via ORM). Ótimo para sistemas com banco de dados e área administrativa. Para APIs REST com Django, usa-se o **Django REST Framework (DRF)**.

```bash
pip install django
django-admin startproject loja .
python manage.py startapp catalogo
python manage.py runserver
```

## Arquitetura MTV

| Camada | Papel | Arquivo |
|---|---|---|
| **Model** | dados e regras (tabelas) | `models.py` |
| **Template** | apresentação (HTML) | `templates/*.html` |
| **View** | recebe a requisição e devolve a resposta | `views.py` |
| URLconf | liga URLs às views | `urls.py` |

## Model e ORM

```python
# catalogo/models.py
from django.db import models

class Produto(models.Model):
    nome = models.CharField(max_length=100)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome
```

```bash
python manage.py makemigrations   # gera a migração a partir dos models
python manage.py migrate          # aplica no banco
```

O **ORM** traduz Python em SQL:

```python
Produto.objects.create(nome='Mouse', preco=80)
Produto.objects.filter(preco__gte=100).order_by('-preco')   # WHERE preco >= 100 ORDER BY preco DESC
Produto.objects.get(pk=1)                                   # um só (DoesNotExist se não achar)
Produto.objects.exclude(nome__icontains='livro').count()
```

QuerySets são **preguiçosos**: o SQL só roda quando o resultado é usado.

## View, URL e template

```python
# catalogo/views.py
from django.shortcuts import render
from .models import Produto

def lista(request):
    produtos = Produto.objects.all()
    return render(request, 'catalogo/lista.html', {'produtos': produtos})

# catalogo/urls.py
from django.urls import path
from . import views
urlpatterns = [path('', views.lista, name='lista')]
```

```html
<!-- templates/catalogo/lista.html -->
<ul>{% for p in produtos %}<li>{{ p.nome }} — R$ {{ p.preco }}</li>{% endfor %}</ul>
```

## Admin

Registre o model em `admin.py` (`admin.site.register(Produto)`), crie um usuário com `python manage.py createsuperuser` e acesse `/admin`.

## Django x FastAPI

| | Django | FastAPI |
|---|---|---|
| Foco | apps web completos | APIs |
| ORM/admin | inclusos | não (usa SQLAlchemy/SQLModel etc.) |
| Validação | forms / DRF serializers | Pydantic (type hints) |
| Assíncrono | suportado | nativo |

:::descomplica
O **Django** é como uma **casa de bonecas que já vem montada**, com cozinha, quarto e garagem. 🏠 Você só decora do seu jeito.
- **Model** é o **armário** onde ficam os brinquedos (os dados).
- **View** é a **pessoa** que vai buscar o brinquedo quando alguém pede.
- **Template** é a **vitrine** bonitinha onde o brinquedo é mostrado.
- O **ORM** é um **tradutor**: você fala Python e ele fala SQL com o banco.
:::

:::choice
? No Django, qual comando gera os arquivos de migração a partir das mudanças nos models?
- [ ] `python manage.py migrate`
- [x] `python manage.py makemigrations`
- [ ] `python manage.py runserver`
- [ ] `django-admin startapp`
> `makemigrations` cria as migrações; `migrate` aplica no banco.
:::

:::choice
? Qual consulta do ORM equivale a `SELECT * FROM produto WHERE preco < 50 ORDER BY nome`?
- [ ] `Produto.objects.get(preco < 50).sort('nome')`
- [x] `Produto.objects.filter(preco__lt=50).order_by('nome')`
- [ ] `Produto.objects.where('preco < 50').order('nome')`
- [ ] `Produto.filter(preco=50).order_by('-nome')`
> Lookups usam dois sublinhados: `__lt`, `__gte`, `__icontains`… e `order_by('-campo')` inverte.
:::

### EXAM
:::choice
? Depois de um INSERT com `sqlite3`, o que falta para a alteração ser gravada de vez?
- [ ] `cur.close()`
- [x] `con.commit()`
- [ ] `cur.fetchall()`
- [ ] Nada
> Sem commit, a transação é descartada ao fechar a conexão.
:::

:::choice
? Qual é o jeito correto de passar **um** parâmetro para `cur.execute` com `?`?
- [ ] `cur.execute(sql, nome)`
- [x] `cur.execute(sql, (nome,))`
- [ ] `cur.execute(sql, [nome][0])`
- [ ] `cur.execute(sql + nome)`
> Os parâmetros vão numa sequência; `(nome,)` é uma tupla de um elemento.
:::

:::choice
? Por que sempre passar `timeout` no `requests.get`?
- [ ] Para deixar a requisição mais rápida
- [x] Porque, sem ele, a chamada pode ficar esperando indefinidamente
- [ ] Porque é obrigatório
- [ ] Para evitar erros 404
> Sem timeout, o requests espera sem limite por uma resposta.
:::

:::text
? No FastAPI, qual biblioteca valida os dados do corpo da requisição com base nos type hints?
= Pydantic
> Modelos `BaseModel` do Pydantic validam e convertem os dados.
:::

:::choice
? No FastAPI, enviar `/produtos/abc` para uma rota com `produto_id: int` resulta em:
- [ ] 404
- [ ] 500
- [x] 422 com detalhes do erro de validação
- [ ] 200 com produto_id = 0
> A validação automática responde 422 Unprocessable Entity.
:::

:::choice
? Na arquitetura MTV do Django, quem decide **qual** view atende uma URL?
- [ ] O template
- [ ] O model
- [x] O URLconf (`urls.py`)
- [ ] O admin
> `urlpatterns` liga caminhos às views.
:::

:::choice
? QuerySets do Django são "preguiçosos" (lazy). Isso significa:
- [x] O SQL só é executado quando os dados são realmente usados
- [ ] Eles são lentos
- [ ] Eles não acessam o banco
- [ ] Eles cacheiam tudo para sempre
> Você pode encadear filter/order_by sem custo; a consulta roda ao iterar, fatiar, contar etc.
:::

:::choice
? Onde guardar a chave de uma API que seu script Python usa?
- [ ] No código, numa constante
- [ ] Num comentário
- [x] Numa variável de ambiente (ou cofre de segredos)
- [ ] No nome do arquivo
> Segredos no código acabam vazando em repositórios; use `os.environ`.
:::

## MODULE m4 | Machine learning e IA com Python
desc: Aprendizado de máquina com scikit-learn, avaliação de modelos, integração com modelos de IA (API da Anthropic) e embeddings/RAG.

### LESSON py-13 | Machine learning com scikit-learn
goal: entender o fluxo de um projeto de ML e treinar seu primeiro modelo.
minutes: 18

## O que é machine learning

Em vez de escrever regras à mão, o programa **aprende padrões a partir de exemplos**.

| Tipo | Dados | Exemplo |
|---|---|---|
| **Supervisionado** | exemplos com resposta (rótulo) | prever preço (regressão), spam ou não (classificação) |
| **Não supervisionado** | sem rótulo | agrupar clientes (clustering) |
| **Por reforço** | recompensas por ações | jogos, robótica |

Vocabulário: **features** (`X`, as entradas) e **alvo** (`y`, o que se quer prever).

## O fluxo

1. Obter e limpar os dados.
2. Separar **treino** e **teste** (o teste simula dados nunca vistos).
3. Escolher um modelo e **treinar** (`fit`).
4. **Prever** (`predict`) e **avaliar** no teste.

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)          # 150 flores, 4 medidas, 3 espécies
X_treino, X_teste, y_treino, y_teste = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

modelo = KNeighborsClassifier(n_neighbors=5)
modelo.fit(X_treino, y_treino)             # aprende
previsoes = modelo.predict(X_teste)        # prevê
print(accuracy_score(y_teste, previsoes))  # fração de acertos
```

Todo estimador do scikit-learn segue a mesma interface: `fit`, `predict` (e `predict_proba` em muitos classificadores). Por isso trocar de modelo é trocar uma linha:

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression, LinearRegression
```

## Pré-processamento

Muitos modelos (KNN, regressão logística, SVM) são sensíveis à escala. `StandardScaler` deixa cada feature com média 0 e desvio 1. **Ajuste o scaler só no treino** (`fit` no treino, `transform` no teste) para não vazar informação do teste — o `Pipeline` faz isso por você:

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
modelo = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
```

:::descomplica
Machine learning é como **ensinar uma criança a reconhecer frutas** mostrando muitas fotos: "isso é maçã, isso é banana…". 🍎🍌 Depois de ver muitas (o **treino**), você mostra fotos **novas** que ela nunca viu (o **teste**) para ver se ela aprendeu de verdade — e não só decorou as primeiras fotos.

O `fit` é a hora de **estudar**; o `predict` é a hora da **prova**.
:::

:::choice
? Por que separar dados de treino e de teste?
- [ ] Para treinar mais rápido
- [x] Para medir o desempenho em dados que o modelo não viu durante o treino
- [ ] Porque o scikit-learn exige
- [ ] Para aumentar a quantidade de dados
> Avaliar nos próprios dados de treino superestima o desempenho.
:::

:::code python
Treine um **`DecisionTreeClassifier(random_state=0)`** no conjunto **Iris** com `train_test_split(X, y, test_size=0.3, random_state=1, stratify=y)`.

Guarde:
- o modelo treinado em **`modelo`**;
- a acurácia no conjunto de **teste** em **`acuracia`** (um número entre 0 e 1).

(O pacote scikit-learn é baixado automaticamente no primeiro uso; pode demorar alguns segundos.)
@@starter
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)

modelo = None
acuracia = 0
@@solution
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)
X_treino, X_teste, y_treino, y_teste = train_test_split(X, y, test_size=0.3, random_state=1, stratify=y)
modelo = DecisionTreeClassifier(random_state=0)
modelo.fit(X_treino, y_treino)
acuracia = accuracy_score(y_teste, modelo.predict(X_teste))
print(f'Acurácia: {acuracia:.3f}')
@@test
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.utils.validation import check_is_fitted
from sklearn.tree import DecisionTreeClassifier
assert isinstance(modelo, DecisionTreeClassifier), 'modelo deve ser um DecisionTreeClassifier'
check_is_fitted(modelo)
X, y = load_iris(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=1, stratify=y)
real = (modelo.predict(Xte) == yte).mean()
assert abs(float(acuracia) - real) < 1e-9, f'acuracia ({acuracia}) não corresponde à acurácia real do modelo no teste ({real:.4f})'
assert real > 0.85, f'Acurácia muito baixa ({real:.3f}). Confira o split e o treino.'
:::

### LESSON py-14 | Avaliando modelos: métricas, overfitting e validação cruzada
goal: escolher a métrica certa, reconhecer overfitting e validar modelos de forma confiável.
minutes: 18

## Matriz de confusão (classificação binária)

| | Previsto positivo | Previsto negativo |
|---|---|---|
| **Real positivo** | VP (verdadeiro positivo) | FN (falso negativo) |
| **Real negativo** | FP (falso positivo) | VN (verdadeiro negativo) |

## Métricas

$$ Acurácia = (VP + VN) / total $$

$$ Precisão = VP / (VP + FP)    ·    Revocação (recall) = VP / (VP + FN) $$

$$ F1 = 2 · (Precisão · Recall) / (Precisão + Recall) $$

- **Precisão**: dos que eu disse "positivo", quantos eram? Importa quando o falso positivo é caro (ex.: bloquear um e-mail legítimo).
- **Recall**: dos positivos reais, quantos eu achei? Importa quando o falso negativo é caro (ex.: não detectar uma doença).
- **Acurácia engana em dados desbalanceados**: com 99% de e-mails normais, dizer "nunca é spam" dá 99% de acurácia e 0% de recall.

Em **regressão**: MAE (erro absoluto médio), MSE/RMSE (erro quadrático, pune erros grandes) e R² (proporção da variância explicada).

## Overfitting e underfitting

- **Overfitting**: o modelo decora o treino (acerto alto no treino, baixo no teste).
- **Underfitting**: o modelo é simples demais (ruim nos dois).
- Remédios para overfitting: mais dados, modelo mais simples, regularização, limitar profundidade de árvores (`max_depth`).

## Validação cruzada

Em vez de um único split, divide-se o treino em *k* partes ("folds"); treina-se em *k−1* e valida-se na restante, *k* vezes:

```python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(modelo, X, y, cv=5, scoring='f1_macro')
print(scores.mean(), scores.std())
```

Para escolher hiperparâmetros: `GridSearchCV` / `RandomizedSearchCV`. O conjunto de **teste** só deve ser usado **no final**.

:::descomplica
Imagine um **detector de lobos** para as ovelhas. 🐺🐑
- **Precisão**: quando o alarme toca, quantas vezes era **mesmo** um lobo? (Se toca por qualquer cachorro, a precisão é baixa.)
- **Recall**: de todos os lobos que apareceram, **quantos o alarme pegou**? (Se deixou um passar, o recall caiu.)
- **Overfitting** é o aluno que **decorou as respostas** da lista de exercícios e vai mal na prova com perguntas novas.
:::

:::choice
? Um teste de doença rara deve evitar ao máximo **não detectar** quem está doente. Qual métrica priorizar?
- [ ] Precisão
- [x] Recall (revocação)
- [ ] Acurácia
- [ ] R²
> Recall mede quantos positivos reais foram encontrados; falsos negativos o derrubam.
:::

:::code python
Implemente a função **`metricas(y_true, y_pred)`** (listas de 0 e 1, onde 1 = positivo) que retorna um **dicionário** com as chaves `'precisao'`, `'recall'` e `'f1'`, **sem usar o scikit-learn**.

Se um denominador for zero, a métrica correspondente vale **0.0**.
@@starter
def metricas(y_true, y_pred):
    vp = fp = fn = 0
    # conte aqui

    return {'precisao': 0.0, 'recall': 0.0, 'f1': 0.0}
@@solution
def metricas(y_true, y_pred):
    vp = fp = fn = 0
    for t, p in zip(y_true, y_pred):
        if p == 1 and t == 1:
            vp += 1
        elif p == 1 and t == 0:
            fp += 1
        elif p == 0 and t == 1:
            fn += 1
    precisao = vp / (vp + fp) if vp + fp else 0.0
    recall = vp / (vp + fn) if vp + fn else 0.0
    f1 = 2 * precisao * recall / (precisao + recall) if precisao + recall else 0.0
    return {'precisao': precisao, 'recall': recall, 'f1': f1}
@@test
def ref(t, p):
    vp = sum(1 for a, b in zip(t, p) if a == 1 and b == 1)
    fp = sum(1 for a, b in zip(t, p) if a == 0 and b == 1)
    fn = sum(1 for a, b in zip(t, p) if a == 1 and b == 0)
    pr = vp / (vp + fp) if vp + fp else 0.0
    rc = vp / (vp + fn) if vp + fn else 0.0
    f = 2 * pr * rc / (pr + rc) if pr + rc else 0.0
    return pr, rc, f
casos = [([1, 0, 1, 1, 0, 1], [1, 0, 0, 1, 1, 1]), ([0, 0, 0], [0, 0, 0]), ([1, 1, 0, 0], [0, 0, 1, 1]), ([1, 0, 1, 0, 1, 1, 1, 0], [1, 1, 1, 0, 0, 1, 1, 1])]
for t, p in casos:
    r = metricas(t, p)
    pr, rc, f = ref(t, p)
    assert isinstance(r, dict), 'Retorne um dicionário'
    for k, v in [('precisao', pr), ('recall', rc), ('f1', f)]:
        assert abs(float(r.get(k, -1)) - v) < 1e-9, f'Para y_true={t}, y_pred={p}: {k} esperado {v:.4f}, veio {r.get(k)}'
:::

### LESSON py-15 | Integrando IA: a API de modelos de linguagem com Python
goal: chamar um modelo de linguagem (Claude) pelo SDK oficial, usar system prompt, conversas e ferramentas (tool use).
minutes: 20

## Instalação e primeira chamada

```bash
pip install anthropic
export ANTHROPIC_API_KEY="sua-chave"     # nunca no código!
```

```python
import anthropic

client = anthropic.Anthropic()            # lê a chave do ambiente

resposta = client.messages.create(
    model='claude-opus-5-5',
    max_tokens=1024,
    system='Você é um professor de Python. Responda em português, de forma direta.',
    messages=[
        {'role': 'user', 'content': 'O que é uma list comprehension?'},
    ],
)
print(resposta.content[0].text)
print(resposta.stop_reason)               # 'end_turn', 'max_tokens', 'tool_use', ...
print(resposta.usage.input_tokens, resposta.usage.output_tokens)
```

- `messages` é a conversa: papéis `user` e `assistant` alternados. A API **não guarda memória**: para continuar o diálogo, você reenvia o histórico.
- `system` define o papel e as regras do modelo.
- `max_tokens` limita o tamanho da resposta (se atingir, `stop_reason == 'max_tokens'`).
- A resposta tem uma lista `content` de **blocos** (texto, uso de ferramenta…).

## Continuando a conversa

```python
historico = [{'role': 'user', 'content': 'Me dê um exemplo.'}]
r = client.messages.create(model='claude-opus-5-5', max_tokens=1024, messages=historico)
historico.append({'role': 'assistant', 'content': r.content})   # guarda a resposta
historico.append({'role': 'user', 'content': 'Agora com filtro.'})
```

## Ferramentas (tool use)

Você descreve ferramentas com **nome, descrição e um JSON Schema** dos parâmetros. O modelo decide quando usá-las; **quem executa é o seu código**.

```python
ferramentas = [{
    'name': 'consultar_estoque',
    'description': 'Retorna a quantidade em estoque de um produto pelo nome.',
    'input_schema': {
        'type': 'object',
        'properties': {'produto': {'type': 'string'}},
        'required': ['produto'],
    },
}]

mensagens = [{'role': 'user', 'content': 'Tem mouse em estoque?'}]
while True:
    r = client.messages.create(model='claude-opus-5-5', max_tokens=1024,
                               tools=ferramentas, messages=mensagens)
    if r.stop_reason != 'tool_use':
        break                                          # resposta final
    mensagens.append({'role': 'assistant', 'content': r.content})
    resultados = []
    for bloco in r.content:
        if bloco.type == 'tool_use':
            saida = consultar_estoque(**bloco.input)   # SEU código executa
            resultados.append({'type': 'tool_result',
                               'tool_use_id': bloco.id,   # liga ao pedido
                               'content': str(saida)})
    mensagens.append({'role': 'user', 'content': resultados})

print(''.join(b.text for b in r.content if b.type == 'text'))
```

Esse **laço agêntico** (chama → executa ferramenta → devolve resultado → chama de novo) é a base de todo agente de IA. O SDK também oferece um *tool runner* que automatiza esse laço.

## Boas práticas

- Trate erros da API (limite de taxa 429, sobrecarga) — o SDK já faz algumas tentativas automáticas.
- Valide e limite o que as ferramentas podem fazer: o modelo pede, **seu código decide** se executa.
- Respostas longas: use *streaming* (`client.messages.stream(...)`).
- Modelos e parâmetros mudam com o tempo; consulte a documentação oficial antes de colocar em produção.

!> O terminal não acessa a internet, então o exercício usa um **cliente simulado** com a mesma forma do SDK (`client.messages.create(...)` devolvendo `stop_reason` e blocos `text`/`tool_use` com `id`, `name` e `input`).

:::descomplica
Falar com a IA pelo Python é como **mandar uma carta para um amigo muito sabido**. ✉️ Você escreve a pergunta (`messages`), diz como ele deve responder (`system`: "responda como um professor") e ele manda a resposta de volta.

As **ferramentas** são como dar a ele um **telefone para ligar para a loja**: ele diz "preciso saber o estoque do mouse", **você** liga, conta o que a loja disse, e aí ele termina a resposta. Ele pede; **você** é quem faz a ligação. 📞
:::

:::choice
? Como a API de mensagens "lembra" o que foi dito antes numa conversa?
- [ ] Ela guarda automaticamente o histórico no servidor
- [x] Você reenvia o histórico completo na lista `messages` a cada chamada
- [ ] Pelo parâmetro `max_tokens`
- [ ] Pelo `system`
> A chamada é sem estado: o histórico vai junto em cada requisição.
:::

:::code python
Implemente a função **`responder(pergunta)`** que conversa com o cliente simulado `client` usando a ferramenta `calcular` (já definida em `ferramentas`) e **retorna o texto final** do modelo.

O laço deve:
1. chamar `client.messages.create(model='claude-opus-5-5', max_tokens=1024, tools=ferramentas, messages=mensagens)`;
2. enquanto `stop_reason == 'tool_use'`: adicionar a resposta do assistente ao histórico, executar `calcular(**bloco.input)` para cada bloco `tool_use` e devolver os resultados numa mensagem `user` com blocos `{'type': 'tool_result', 'tool_use_id': bloco.id, 'content': str(resultado)}`;
3. no fim, retornar a junção dos textos dos blocos `text`.

O cliente simulado confere se o `tool_use_id` e o resultado estão corretos.
@@setup
import itertools as _it
class _Bloco:
    def __init__(self, **kw):
        self.__dict__.update(kw)
class _Resp:
    def __init__(self, stop_reason, content):
        self.stop_reason = stop_reason
        self.content = content
def calcular(expressao):
    permitido = set('0123456789+-*/(). ')
    if not set(expressao) <= permitido:
        raise ValueError('expressão inválida')
    return eval(expressao)
ferramentas = [{
    'name': 'calcular',
    'description': 'Calcula uma expressão aritmética simples.',
    'input_schema': {'type': 'object', 'properties': {'expressao': {'type': 'string'}}, 'required': ['expressao']},
}]
class _Messages:
    def __init__(self):
        self.ids = _it.count(1)
        self.chamadas = 0
    def create(self, model, max_tokens, messages, tools=None, system=None):
        self.chamadas += 1
        if self.chamadas > 10:
            raise RuntimeError('Muitas chamadas: o laço não está terminando')
        ultima = messages[-1]
        pergunta = messages[0]['content']
        contas = [c.strip() for c in pergunta.split('|')]
        feitos = sum(1 for m in messages if m['role'] == 'user' and isinstance(m['content'], list))
        if feitos:
            anterior = messages[-2]
            assert anterior['role'] == 'assistant', 'Antes dos resultados, adicione a resposta do assistente ao histórico'
            pedidos = [b for b in anterior['content'] if getattr(b, 'type', None) == 'tool_use']
            res = ultima['content']
            assert isinstance(res, list) and len(res) == len(pedidos), 'Envie um tool_result para cada tool_use'
            for b, r in zip(pedidos, res):
                assert r.get('type') == 'tool_result', 'Cada resultado precisa de type="tool_result"'
                assert r.get('tool_use_id') == b.id, 'tool_use_id deve ser o id do bloco tool_use correspondente'
                assert str(r.get('content')) == str(calcular(**b.input)), 'O content do tool_result deve ser o resultado da ferramenta'
        if feitos < len(contas):
            conta = contas[feitos]
            return _Resp('tool_use', [_Bloco(type='text', text='Vou calcular.'), _Bloco(type='tool_use', id=f'toolu_{next(self.ids)}', name='calcular', input={'expressao': conta})])
        valores = [str(calcular(c)) for c in contas]
        return _Resp('end_turn', [_Bloco(type='text', text='Resultados: '), _Bloco(type='text', text=', '.join(valores))])
class _Client:
    def __init__(self):
        self.messages = _Messages()
client = _Client()
@@starter
def responder(pergunta):
    mensagens = [{'role': 'user', 'content': pergunta}]
    r = client.messages.create(model='claude-opus-5-5', max_tokens=1024, tools=ferramentas, messages=mensagens)
    # complete o laço agêntico
    return ''
@@solution
def responder(pergunta):
    mensagens = [{'role': 'user', 'content': pergunta}]
    while True:
        r = client.messages.create(model='claude-opus-5-5', max_tokens=1024, tools=ferramentas, messages=mensagens)
        if r.stop_reason != 'tool_use':
            break
        mensagens.append({'role': 'assistant', 'content': r.content})
        resultados = []
        for bloco in r.content:
            if bloco.type == 'tool_use':
                resultado = calcular(**bloco.input)
                resultados.append({'type': 'tool_result', 'tool_use_id': bloco.id, 'content': str(resultado)})
        mensagens.append({'role': 'user', 'content': resultados})
    return ''.join(b.text for b in r.content if b.type == 'text')
@@test
client.messages.chamadas = 0
r = responder('2 + 3')
assert r == 'Resultados: 5', f'Esperado "Resultados: 5", veio {r!r}'
client.messages.chamadas = 0
r = responder('10 * 4 | (7 - 2) * 3 | 100 / 8')
assert r == 'Resultados: 40, 15, 12.5', f'Esperado "Resultados: 40, 15, 12.5", veio {r!r}'
:::

### LESSON py-16 | Embeddings, busca semântica e RAG
goal: representar textos como vetores, medir similaridade e montar o esqueleto de um RAG.
minutes: 18

## Embeddings

Um **embedding** é um vetor de números que representa o **significado** de um texto (ou imagem). Textos parecidos geram vetores **próximos**. Eles são produzidos por modelos de embedding (por exemplo, `sentence-transformers` localmente, ou APIs de provedores como Voyage AI e OpenAI).

```python
# exemplo com sentence-transformers (roda localmente)
from sentence_transformers import SentenceTransformer
modelo = SentenceTransformer('all-MiniLM-L6-v2')
vetores = modelo.encode(['gato no sofá', 'felino no estofado', 'preço do dólar'])
```

## Similaridade de cosseno

$$ cos(A, B) = (A · B) / (‖A‖ · ‖B‖) $$

- `A · B` = produto escalar (soma de `a_i * b_i`); `‖A‖` = comprimento (raiz da soma dos quadrados).
- Vai de −1 a 1; quanto mais perto de 1, mais parecidos.

```python
import numpy as np
def cosseno(a, b):
    a, b = np.array(a), np.array(b)
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
```

## Busca semântica

1. Gere o embedding de cada documento e guarde (num **banco vetorial**: pgvector, Chroma, FAISS, Qdrant…).
2. Gere o embedding da pergunta.
3. Retorne os *k* documentos mais similares (**top-k**).

## RAG — Retrieval-Augmented Generation

Modelos de linguagem não conhecem seus documentos internos e podem inventar respostas. No **RAG**, você **busca** os trechos relevantes e os coloca no prompt:

```python
trechos = buscar(pergunta, k=3)
contexto = '\n\n'.join(f'<doc id="{t.id}">{t.texto}</doc>' for t in trechos)
prompt = (f'Use somente os documentos abaixo para responder. '
          f'Se a resposta não estiver neles, diga que não sabe.\n\n{contexto}\n\n'
          f'Pergunta: {pergunta}')
```

Etapas típicas: **dividir** os documentos em pedaços (*chunking*), indexar os embeddings, recuperar, opcionalmente **reordenar** (*reranking*) e gerar a resposta **citando as fontes**.

:::descomplica
Um **embedding** transforma cada frase num **endereço num mapa mágico**. 🗺️ Frases que falam da mesma coisa moram **no mesmo bairro**: "gato no sofá" e "felino no estofado" são vizinhas; "preço do dólar" mora longe.

A **busca semântica** é procurar os vizinhos mais próximos da sua pergunta. E o **RAG** é a IA fazer uma **prova com consulta**: antes de responder, ela pega os livros certos na estante e lê o pedaço importante. 📚
:::

:::choice
? Qual o valor da similaridade de cosseno entre dois vetores que apontam exatamente na mesma direção?
- [ ] 0
- [ ] -1
- [x] 1
- [ ] Depende do tamanho dos vetores
> Cosseno de 0° é 1. O comprimento não importa, só a direção.
:::

:::code python
Implemente **`top_k(consulta, documentos, k)`** (sem NumPy, só Python):
- `consulta` é um vetor (lista de floats);
- `documentos` é um dicionário `{nome: vetor}`;
- retorna a **lista dos `k` nomes** mais similares pela **similaridade de cosseno**, do mais para o menos similar.

Crie também a função auxiliar **`cosseno(a, b)`**.
@@starter
import math

def cosseno(a, b):
    return 0.0

def top_k(consulta, documentos, k):
    return []
@@solution
import math

def cosseno(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

def top_k(consulta, documentos, k):
    ordenados = sorted(documentos, key=lambda nome: cosseno(consulta, documentos[nome]), reverse=True)
    return ordenados[:k]
@@test
import math
assert abs(cosseno([1, 0], [1, 0]) - 1) < 1e-9, 'cosseno de vetores iguais deve ser 1'
assert abs(cosseno([1, 0], [0, 1])) < 1e-9, 'cosseno de vetores ortogonais deve ser 0'
assert abs(cosseno([1, 2, 3], [2, 4, 6]) - 1) < 1e-9, 'cosseno não depende do tamanho do vetor'
assert abs(cosseno([1, 0], [-1, 0]) + 1) < 1e-9, 'vetores opostos têm cosseno -1'
docs = {
    'gatos': [0.9, 0.1, 0.0],
    'cachorros': [0.7, 0.3, 0.1],
    'economia': [0.0, 0.2, 0.95],
    'bolsa': [0.1, 0.1, 0.9],
}
assert top_k([1.0, 0.0, 0.0], docs, 2) == ['gatos', 'cachorros'], f'top_k animais errado: {top_k([1.0, 0.0, 0.0], docs, 2)}'
assert top_k([0.0, 0.1, 1.0], docs, 1) == ['economia'] or top_k([0.0, 0.1, 1.0], docs, 1) == ['bolsa'], 'top_k economia errado'
q = [0.05, 0.15, 1.0]
esperado = sorted(docs, key=lambda n: sum(a * b for a, b in zip(q, docs[n])) / (math.sqrt(sum(a * a for a in q)) * math.sqrt(sum(b * b for b in docs[n]))), reverse=True)[:3]
assert top_k(q, docs, 3) == esperado, f'Esperado {esperado}, veio {top_k(q, docs, 3)}'
:::

### EXAM
:::choice
? No scikit-learn, qual método **treina** o modelo?
- [x] `fit`
- [ ] `predict`
- [ ] `train`
- [ ] `score`
> Todos os estimadores usam `fit(X, y)` para aprender e `predict(X)` para prever.
:::

:::choice
? Um modelo tem 99% de acurácia no treino e 60% no teste. Isso indica:
- [ ] Underfitting
- [x] Overfitting
- [ ] Modelo perfeito
- [ ] Erro na métrica
> Grande diferença treino/teste é o sinal clássico de que o modelo decorou o treino.
:::

:::choice
? VP = 8, FP = 2, FN = 8. Qual é a precisão?
- [x] 0,8
- [ ] 0,5
- [ ] 0,2
- [ ] 0,4
> Precisão = VP / (VP + FP) = 8 / 10 = 0,8. (O recall seria 8/16 = 0,5.)
:::

:::choice
? Por que o `StandardScaler` deve ser ajustado (`fit`) só nos dados de treino?
- [ ] Porque é mais rápido
- [x] Para não vazar informação do conjunto de teste para o treino
- [ ] Porque o teste não tem features
- [ ] Porque o scikit-learn não permite
> Ajustar no conjunto todo usa estatísticas do teste, inflando a avaliação (data leakage).
:::

:::choice
? Na API de mensagens, quando `stop_reason` é `'tool_use'`, o que seu código deve fazer?
- [ ] Encerrar e mostrar a resposta
- [x] Executar a ferramenta pedida e enviar um `tool_result` com o `tool_use_id` correspondente
- [ ] Aumentar o `max_tokens`
- [ ] Trocar de modelo
> O modelo pede a ferramenta; o seu código executa e devolve o resultado para ele continuar.
:::

:::text
? Qual técnica busca trechos relevantes em documentos e os insere no prompt antes de o modelo responder? (sigla)
= RAG | Retrieval-Augmented Generation
> Retrieval-Augmented Generation: recuperação + geração.
:::

:::choice
? Similaridade de cosseno entre `[1, 0]` e `[0, 1]`:
- [ ] 1
- [x] 0
- [ ] -1
- [ ] 0,5
> Vetores ortogonais têm produto escalar zero.
:::

:::choice
? A `validação cruzada` com cv=5 significa:
- [ ] Treinar 5 modelos diferentes ao mesmo tempo
- [x] Dividir os dados em 5 partes e treinar/validar 5 vezes, cada vez validando em uma parte diferente
- [ ] Usar 5% dos dados para teste
- [ ] Repetir o mesmo split 5 vezes
> Cada fold serve uma vez como validação; a média dá uma estimativa mais estável.
:::
