# Crivo

**Crítica de interface com IA, com prova.**

Você envia o print de uma tela. Quatro agentes revisam em paralelo, cada um com uma lente: usabilidade, acessibilidade, hierarquia & texto, e produto & conversão. Um quinto agente cruza tudo e decide o que corrigir primeiro. O que dá para medir, o Crivo mede nos pixels, sem confiar no modelo.

🔗 **Demo:** _link da Vercel_

---

## Por que existe

Ferramentas de crítica de design com IA costumam ter dois problemas:

1. **Respostas genéricas.** Um prompt único do tipo "critique esta tela" cobre tudo pela metade.
2. **Confiança cega.** O modelo afirma coisas que parecem certas e não são, como "este texto tem contraste 2:1", e nada separa percepção de fato.

O Crivo é um experimento para resolver as duas coisas, e para terminar numa decisão em vez de numa lista.

## O que ele faz de diferente

| | |
|---|---|
| **Quatro lentes em paralelo** | Cada lente é uma chamada independente ao modelo, com escopo, critérios (Nielsen, WCAG 2.2, hierarquia/UX writing, funil) e schema de resposta próprios. Quando lentes diferentes apontam o mesmo problema sem combinar, isso vira sinal de prioridade. |
| **Verificação por pixel** | Toda afirmação de contraste vem com coordenadas e cores estimadas. O navegador extrai as cores reais da região e calcula a razão WCAG. O selo mostra se a medição **confirmou** ou se **a IA errou**. O resto é marcado como julgamento, com a confiança que o próprio modelo declarou. |
| **Da crítica à decisão** | Um agente de síntese agrupa achados repetidos, prioriza por impacto × esforço e transforma o top 3 em hipóteses testáveis ("se… então… porque…") com a métrica que leria o resultado. |
| **Honestidade sobre limites** | Cada lente é obrigada a listar o que *não* consegue avaliar num print (estados, fluxo, teclado, leitor de tela). |
| **Custo visível** | Cada análise mostra custo em US$ e tempo, calculados a partir do uso real de tokens. |

## Como funciona

```
Navegador ── reduz a imagem (≤ 1,15 MP) e guarda a mesma versão para medir
    │
    ├──► /api/critique  lente: usabilidade     ┐
    ├──► /api/critique  lente: acessibilidade  │  4 chamadas em paralelo
    ├──► /api/critique  lente: hierarquia      │  Claude (visão) + structured outputs
    └──► /api/critique  lente: produto         ┘  resposta validada com Zod
    │
    ├── verificação de contraste por pixel (sem IA, no navegador)
    │
    └──► /api/synthesize  recebe achados + resultado da medição
                          → veredito, top 3 com hipótese e métrica, matriz impacto × esforço
```

**Arquivos principais**

- `src/lib/lentes.ts`: definição e prompts de cada lente e da síntese
- `src/lib/schema.ts`: schemas Zod da saída estruturada (achado, lente, síntese)
- `src/lib/contraste.ts`: medição de contraste WCAG nos pixels (histograma de cores → fundo dominante × cor mais contrastante)
- `src/lib/claude.ts`: chamada ao modelo, cálculo de custo, tratamento de erros e limite por IP
- `src/components/`: interface (visor com pins, cards, painel de prioridades, matriz)
- `exemplos/`: telas fictícias usadas como exemplo, **com problemas plantados de propósito**

## Decisões de produto

**Para quem e qual problema.** Designers e PMs de times pequenos que não têm alguém sênior revisando cada tela antes de ir para teste ou desenvolvimento. O trabalho a ser feito não é "receber críticas". É **decidir o que corrigir primeiro** com alguma segurança de que a crítica procede.

**Como eu mediria sucesso**

| Métrica | Por quê |
|---|---|
| **Taxa de aceitação dos achados** (a pessoa marca "procede") | É a métrica principal: mede utilidade, não volume. Meta inicial: ≥ 70%. |
| % de afirmações de contraste contestadas pela medição | Termômetro de alucinação da lente de acessibilidade. |
| % de análises em que o relatório é copiado | Sinal de que a saída virou ação fora da ferramenta. |
| Custo e tempo por análise | Hoje ~US$ 0,40 e ~70s. Define se o modelo de negócio fecha. |

**Trade-offs que escolhi**

- **Opus em vez de Sonnet.** Nos testes, a precisão das coordenadas e a especificidade dos achados valeram o custo maior. O modelo é configurável por variável de ambiente, e a troca deve ser decidida com base no conjunto de avaliação abaixo, não no gosto.
- **Quatro chamadas em vez de uma.** Custa ~4× em tokens de entrada, mas melhora a especificidade e cria um sinal de convergência entre lentes, que alimenta a priorização.
- **Verificar só contraste, por enquanto.** É a afirmação mais frequente e a mais barata de checar de forma determinística. Comecei pelo que tinha melhor relação entre valor e esforço.
- **Exemplos pré-computados.** Quem chega pelo link vê o resultado na hora e sem custo; rodar ao vivo é opcional.
- **O que deixei de fora de propósito:** gerar o "redesign" da tela (aumentaria a confiança do usuário numa saída que ainda não foi validada), login e armazenamento de imagens.

**Plano de instrumentação (próximo passo)**

`analise_iniciada` (origem: upload | exemplo) → `lente_concluida` (lente, ms, custo, n_achados) → `sintese_concluida` → `achado_avaliado` (procede | não procede, lente, severidade, status da verificação) → `relatorio_copiado`.
Com isso dá para ver a precisão por lente, onde as pessoas abandonam a espera e se achados verificados são mais aceitos que os de julgamento.

**Quando eu mudaria de rumo.** Se, num conjunto de 30 telas avaliadas por designers, a aceitação de uma lente ficar abaixo de 50%, essa lente sai ou é reescrita antes de qualquer outra feature.

## Rodando localmente

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

Variáveis opcionais: `CRIVO_MODEL` (padrão `claude-opus-5`) e `CRIVO_EFFORT` (`low` | `medium` | `high`, padrão `medium`).

## Limites conhecidos

- As caixas (coordenadas) vêm do modelo e podem ficar deslocadas. Quando isso acontece, a medição tende a retornar "não mensurável" em vez de um falso positivo.
- Texto sobre foto ou gradiente confunde a extração de cores.
- Um print é um instante. O Crivo é um ponto de partida para a conversa de design, não substitui teste com pessoas.

## Próximos passos

- Medir tamanho de alvo de toque e tamanho de fonte pelos pixels, estendendo a verificação além do contraste
- Aceitar sequência de telas (fluxo) em vez de uma tela isolada
- Conjunto de avaliação com telas anotadas por designers, para medir a precisão de cada lente e calibrar os prompts

## Como construí

Desenhei o produto (problema, lentes, método de verificação, interface) e construí com **Claude Code** como par de programação, em um dia. Stack: Next.js, TypeScript, Tailwind, Claude API (Anthropic), Vercel.

— Marlon Cardona
