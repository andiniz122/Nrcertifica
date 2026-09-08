# Simulador de Comandos Elétricos — NR Certifica

Documento de continuidade. Descreve o que já está pronto, o que falta, e as
decisões que não podem ser desfeitas sem quebrar a coerência pedagógica.

**Projeto:** `/NRCERTIFICA/nrcertifica` (Next.js 14 App Router, TypeScript, MongoDB/Mongoose, PM2 porta 3002)
**Curso:** Comandos Elétricos e Acionamento de Motores — slug `comandos-eletricos-40h`, `_id` `6a8b6bcdb5102032c4dd42bd`
**Onde entra:** Módulo 3 — "Diagramas de Comando e Força" (12h)

---

## 1. O que é isso

Uma bancada onde o aluno monta circuitos de comando ligando fio a fio, e o
sistema corrige **por comportamento**: roda uma sequência de acionamentos no
circuito que ele montou e verifica se o motor liga, sela, para e protege como
deveria. Não compara com um desenho-gabarito — o aluno pode traçar como quiser,
desde que funcione.

Isso resolve o problema central do EAD de comandos elétricos: prática à
distância que não é vídeo assistido passivamente.

**O que o simulador pega e prova escrita não pega:** os erros em que o circuito
*funciona*. Aluno que pula o disjuntor, que esquece o terra, que liga o selo
antes da botoeira de parada, que tira o relé térmico do ramo manual — em todos
esses casos o circuito liga e desliga normalmente. Só quebra na condição
específica. O simulador testa essa condição.

---

## 2. Estado atual

Tudo abaixo esta no repositorio, compila (`npm run build`) e tem teste.

| Arquivo | Conteudo |
|---|---|
| `lib/simulador/types.ts` | tipos base e uniao `TipoComponente` |
| `lib/simulador/library.ts` | definicao eletrica de cada componente |
| `lib/simulador/engine.ts` | motor de varredura |
| `lib/simulador/avaliador.ts` | correcao por vetores de teste |
| `lib/simulador/exercicios.ts` | os 7 exercicios com bancada, enunciado e gabarito |
| `components/ava/simulador/simbolos.tsx` | simbolos IEC 60617 em SVG |
| `components/ava/simulador/NoSimbolo.tsx` | no do React Flow que renderiza os simbolos |
| `components/ava/SimuladorPratica.tsx` | prancha + painel + carimbo |
| `components/ava/PraticaModulo.tsx` | lista dos exercicios com destravamento |
| `app/api/matriculas/pratica/route.ts` | GET de progresso e POST de correcao |
| `models/Course.ts` | subdocumento `praticas[]` no modulo |
| `models/Enrollment.ts` | `tentativas_pratica[]` |
| `components/ava/CursoAVAClient.tsx` | aba "Pratica" |
| `scripts/seed-pratica-comandos.ts` | seed dos 7 exercicios no Modulo 3 |

Dependencia nova: `@xyflow/react` (React Flow v12).

### Nao regredir

Tres defeitos custaram caro e tem teste ou comentario guardando cada um:

1. **A uniao `TipoComponente` precisa espelhar as chaves de `BIBLIOTECA`.**
   Quando o contator passou a ser representado em partes (`bobina` +
   `contato_forca` + `contato_aux`) e os tipos novos nao subiram para
   `types.ts`, o runtime continuou certo e o build quebrou com TS2367 em
   `engine.ts` — comparacao sem sobreposicao.

2. **O `data` do no tem de ser objeto novo a cada render.** `NoSimbolo` e
   `memo()`. A primeira versao mutava `estado` dentro do `useMemo`, no lugar:
   a referencia nao mudava, o memo cortava o redesenho, e o simbolo ficava
   congelado enquanto o fio mudava de cor. O aluno via metade do feedback.
   Hoje a varredura devolve `visual` e o `nosDesenhados` mescla no `data`.

3. **Fixar o gabarito ANTES de validar.** `config` e `estado` chegam no
   payload do aluno. Validando o payload cru, um `config` adulterado era
   julgado como se fosse dele — o disjuntor bipolar do exercicio 2 submetido
   como unipolar virava "borne inexistente" em vez de simplesmente voltar a
   ser bipolar. `fixarGabarito()` restaura tipo, config e estado de todo id
   que ja existe no `circuito_inicial`; o que o aluno acrescenta continua
   valendo, desde que o tipo esteja na bancada.

### No banco

O Modulo 3 do curso `comandos-eletricos-40h` recebe os sete exercicios por
`npx tsx scripts/seed-pratica-comandos.ts`. O script le direto de
`exercicios.ts` — nao existe uma segunda copia do gabarito para sair de
sincronia — e remove o campo `pratica` do formato antigo.

## 3. Como o motor funciona

Modelo booleano de continuidade. **Não é SPICE** — comando elétrico é lógica, não
análise nodal. Ciclo de varredura, análogo ao scan de um CLP:

1. Agrupa terminais interligados por fios em *nets* (union-find)
2. Injeta as fases da fonte nas nets correspondentes
3. Propaga potencial através de todo contato fechado, até estabilizar
4. Detecta curto: net que recebe duas fontes distintas sem carga no meio →
   desarma disjuntor / queima fusível a montante
5. Avalia cargas: há d.d.p. entre os dois bornes? → energiza
6. Atualiza contatos das bobinas e repete até o estado congelar

**O selo de retenção emerge do passo 6.** Não foi programado como regra especial:
K1 energiza, fecha 13/14, realimenta a própria bobina, e na iteração seguinte o
estado se mantém mesmo com a botoeira solta. Igual ao circuito real.

O motor não importa React, DOM nem rede. Por isso o **mesmo** `avaliar()` roda no
navegador (feedback ao vivo) e no servidor (correção oficial).

### Componentes disponíveis

`fonte` `fusivel` `disjuntor` `rele_termico` `contato_termico` `bobina`
`contato_forca` `contato_aux` `contator` `botoeira_na` `botoeira_nf`
`emergencia` `boia` `seletora` `temporizador` `sinaleiro` `motor`

Bornes conforme IEC 60947 / EN 50005: `1/2, 3/4, 5/6` principais; `13/14`
auxiliar NA; `21/22` auxiliar NF; `A1/A2` bobina; `95/96` (NF) e `97/98` (NA) do
relé; `15/16` e `15/18` do temporizador.

**Na prancha real o contator aparece duas vezes** — bobina no comando, contatos
na força. Por isso `bobina`, `contato_forca` e `contato_aux` são componentes
independentes ligados por `config.vinculo`. O tipo `contator` (bloco único)
existe só para exercícios introdutórios.

A `seletora` usa tabela de camos: cada contato declara em quais posições fecha.
Isso cobre 2 posições, 3 posições e Manual-0-Automático sem código específico:

```ts
camos: [
  { a: '13', b: '14', posicoes: [0] },   // fecha em Manual
  { a: '23', b: '24', posicoes: [2] },   // fecha em Automático
]
```

O `PE` existe como borne mas **não injeta potencial**. Serve para verificar
aterramento via `sim.mesmaNet()`, exposto no gabarito como
`esperado.continuidade`.

---

## 4. Como a correção funciona

O exercício declara vetores de teste. Cada vetor tem ações, resultado esperado,
e opcionalmente `critico: true`.

```ts
{
  descricao: 'Ao soltar -S1, o motor CONTINUA em marcha pelo selo de retenção.',
  acoes: [{ tipo: 'soltar', alvo: 'S1' }],
  esperado: { energizados: ['K1', 'M1'] },
  critico: true,
}
```

### Duas regras que custaram caro para descobrir

**1. Vetor crítico reprova sozinho, independente da nota.**
Sem isso, um aluno cujo circuito *não desliga o motor* era aprovado com 8,8 —
acertava 7 de 8 vetores. Não existe média que compense um circuito que não
desliga. Vetores de segurança (parada, proteção, emergência) e o objetivo do
exercício são sempre críticos.

**2. Exercício curto exige nota 10.**
Com poucos vetores, um circuito morto acerta metade por acidente: "a lâmpada
está apagada" é verdade num circuito que nunca acende. Todos os 7 exercícios
usam `nota_minima: 10`.

**3. Uma varredura por ação, não uma no fim do vetor.**
`for (const a of v.acoes) { aplicar(sim, a); sim.run() }`. Sem isso, um vetor com
`pressionar` seguido de `soltar` nunca chegaria a energizar a bobina, e o selo
não seria testável.

### Segurança

- O gabarito (`vetores`) tem **`select: false`** no schema. Todas as rotas que já
  fazem `Course.findOne()` continuam funcionando e nunca devolvem o gabarito.
  A página do AVA serializa o curso inteiro para o cliente — sem isso, o aluno
  leria as condições de teste no HTML.
  A rota de correção lê com `.select('+modulos.praticas.vetores')`.
  `gabarito.test.ts` verifica isso direto no schema, sem precisar de banco.
- `validarCircuito()` rejeita payload com componente fora da bancada declarada,
  excesso de componentes (60) ou fios (200), id duplicado, e fio ligado a borne
  que o componente não tem (`K1.99` criava silenciosamente uma net fantasma:
  não dava erro, não conduzia nada, e o aluno ficava sem entender por quê).
- `fixarGabarito()` restaura `tipo`, `config` e `estado` de todo id que já vem
  no `circuito_inicial`. Sem isso o aluno mandava o disjuntor bipolar do
  exercício 2 como unipolar, e passava: nenhum vetor testa a comutação do
  neutro. Roda **antes** de validar, e sobre uma cópia — a varredura muta
  `estado`, e o subdocumento do Mongo é reusado entre tentativas.
- A página do AVA lê a matrícula com `.select('-tentativas_pratica')`: cada
  tentativa guarda o circuito inteiro, e isso não precisa ir para o HTML.
- O circuito submetido fica gravado em `tentativas_pratica[].circuito`. Se um
  certificado assinado sob o CREA for questionado, existe a evidência do que o
  aluno efetivamente montou — não só uma nota.
- A rota de correção **não** chama `/api/matriculas/modulo`. Aquela rota aceita
  qualquer `modulo_id` do cliente sem verificar nada; a prática grava
  `modulos_concluidos` por conta própria, só após aprovar.

---

## 5. Os sete exercícios

Progressão em que cada um acrescenta **um** conceito, e o aluno só recebe a
solução depois de sentir o problema. O exercício 3 (selo) só faz sentido depois
que ele viveu o 2 e viu o motor parar ao soltar o botão.

| # | Título | Acrescenta | Obrigatório |
|---|---|---|---|
| 1 | Acender uma lâmpada com botoeira | disjuntor, botoeira, carga | sim |
| 2 | Ligar o motor enquanto o botão estiver pressionado | contator, motor, PE | sim |
| 3 | Manter o motor ligado depois de soltar o botão | selo de retenção | sim |
| 4 | Partida e parada com duas botoeiras | botoeira NF, posição do selo | não |
| 5 | Proteger o motor contra sobrecarga | relé térmico, contato 95/96 | não |
| 6 | Sinalizar marcha e falha | contato 97/98, sinaleiros | não |
| 7 | Bomba com boia e chave manual/automático | boia, seletora, fusível | não |

**Regra de conclusão:** os três primeiros são obrigatórios para concluir o
módulo; os quatro restantes são aprofundamento. Isso garante que ninguém se
forma sem montar um selo funcionando, sem afastar quem quer o básico.

**Sequencial com folga:** o próximo destrava ao aprovar o anterior, mas os
anteriores continuam abertos para refazer.

**Tentativas:** 10 por exercício. Prática é aprendizado, não avaliação — o valor
está em errar, ver o motor não desligar, e consertar.

---

## 6. Design da interface

Conceito: **prancha e painel**, duas superfícies com materialidade oposta, como
na vida do eletricista. Ele projeta no papel e opera no painel.

**Prancha** (área de desenho): papel técnico `#FBFAF7`, grid de pontos
`#DCE3EC` a cada 20px, borda 1px `#CBD5E1`, canto vivo, sem sombra.

**Painel** (acionamentos): navy `#0E1D2E` com botões `#16283C`, LEDs redondos
que acendem. Botoeiras funcionam com `onPointerDown/Up` — agem enquanto
pressionadas, como na bancada.

**Carimbo**: canto inferior direito da prancha, como prancha técnica de verdade —
título, número do exercício, contagem de ligações, estado da montagem. É o
elemento memorável; o resto fica quieto.

**Cor com função normativa.** Os condutores se colorem conforme o potencial que
carregam, seguindo a NBR 5410. O aluno aprende cor de condutor montando, sem
que ninguém precise dizer:

```
fase    #C2410C     neutro  #1D4ED8
terra   #15803D     morto   #94A3B8      curto  #B91C1C
```

Verde nos símbolos só onde há corrente. Em repouso a prancha é monocromática,
como prancha de verdade.

**Simbologia**: IEC 60617, monocromática, identificação com hífen à esquerda
(`-Q1`, `-Km`), bornes numerados ao lado de cada terminal. A distinção que mais
importa é a marca no contato fixo: seccionador sem marca, disjuntor com os
disparadores térmico e magnético explícitos, contator com arco côncavo. Sem
foto de produto de marca — além de mais seguro juridicamente, é
pedagogicamente melhor: o aluno precisa ler o símbolo, não reconhecer a marca.

---

## 7. O que falta fazer

### a) Deploy e seed

O codigo esta no repositorio, mas o VPS ainda roda a versao antiga. Depois de
subir: `npm i`, `npm run build && pm2 restart nrcertifica --update-env`, e
`npx tsx scripts/seed-pratica-comandos.ts`.

### b) Ajustes conhecidos

- **Falta de fase nao e detectada.** O motor trifasico tem as cargas U-V, V-W
  e U-W, e basta *um* par com d.d.p. para ele contar como energizado: um motor
  rodando com duas fases le como girando normalmente. O tipo `Falha` ja declara
  `falta_fase`, mas nada o emite. Nao afeta os 7 exercicios (todos usam motor
  monofasico), mas precisa existir antes de entrar reversao ou
  estrela-triangulo, que sao justamente onde single-phasing queima motor.
- **`off_delay` do temporizador nao esta implementado** — so `on_delay`. Mesma
  situacao: so importa quando o temporizador entrar em cena.
- **O disjuntor so desarma pelo lado de saida** (bornes pares). Ligado ao
  contrario, nao protege. Nao e explorabilidade, e realismo.
- **Mobile: ligar arrastando exige zoom.** Remover fio ja funciona no toque
  (`onEdgeClick`, com `interactionWidth` de 18px). Falta avaliar o modo
  toque-a-toque para *criar* a ligacao: tocar o borne A, depois o borne B.
- **Tooltip nos bornes** explicando a numeracao IEC (conteudo do Modulo 2).

## 8. Ambiente e convenções

- Edições de arquivo por **script Python com `str.replace()`** e `assert` guard.
  Nunca colar JSX direto no terminal, nunca `nano`, nunca heredoc com código —
  corrompe.
- Para transferir arquivos novos, o método confiável foi
  `gzip -9nc arquivo | base64 -w 76` e no destino `base64 -d | gunzip`. O `-n` do
  gzip é obrigatório: sem ele o timestamp entra no cabeçalho e o md5 muda a cada
  compressão. O CRC do gzip detecta corrupção da colagem.
- Deploy: `npm run build && pm2 restart nrcertifica --update-env`.
  **Sem o restart o site fica sem CSS** — o `.next` novo tem hashes que o
  processo antigo não serve.
- `tsconfig` do projeto tem target abaixo de ES2015: **não se pode iterar
  `Map`/`Set` diretamente** com `for...of` nem espalhar com `[...]`. Usar
  `Array.from()`. Isso já foi corrigido no engine; manter a regra em código novo.
- Manutenção fora do horário de estudo dos alunos.
- **Não commitar `.env.local*`** — já está no `.gitignore`.

## 9. Testes

71 verificacoes passando. Rodam com `npx tsx <arquivo>`:

| Arquivo | O que prova |
|---|---|
| `engine.test.ts` | 21 — selo, parada, termico, curto, borne solto, defeito reproduzido |
| `avaliador.test.ts` | 17 — nota, reprovacao critica, payload adulterado, gabarito fixado, borne inexistente |
| `bomba.test.ts` | 6 — boia, seletora, aterramento, protecao no ramo manual |
| `exercicios.test.ts` | 13 — os 7 corretos tiram 10; 6 erros tipicos reprovam |
| `gabarito.test.ts` | 14 — `select:false` no schema, circuito inicial sem fios, regras pedagogicas |

Os testes nao vao para producao, mas **devem ser mantidos**: eles sao a prova
de que a correcao e confiavel, e a correcao alimenta um certificado assinado
sob responsabilidade tecnica (CREA 254516/MG).
