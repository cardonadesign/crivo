import { z } from "zod";

export const LENTES = ["usabilidade", "acessibilidade", "hierarquia", "produto"] as const;
export type LenteId = (typeof LENTES)[number];

export const AchadoSchema = z.object({
  titulo: z.string().describe("Nome curto do problema, até 8 palavras"),
  problema: z.string().describe("O que está errado e por que atrapalha a pessoa usuária, 1-2 frases"),
  evidencia: z
    .string()
    .describe("O que exatamente está visível no print que sustenta o achado. Cite textos da tela entre aspas."),
  sugestao: z.string().describe("Correção concreta e acionável, 1-2 frases"),
  principio: z.string().describe("Heurística, critério WCAG ou princípio que embasa o achado"),
  severidade: z.enum(["critica", "alta", "media", "baixa"]),
  confianca: z
    .enum(["alta", "media", "baixa"])
    .describe("Quão seguro dá para estar olhando só um print estático"),
  regiao: z
    .object({
      x: z.number().int(),
      y: z.number().int(),
      largura: z.number().int(),
      altura: z.number().int(),
    })
    .describe("Caixa em pixels da imagem enviada, origem no canto superior esquerdo, envolvendo o elemento"),
  contraste: z
    .object({
      aplica: z.boolean().describe("true somente se o achado afirma contraste insuficiente entre texto e fundo"),
      texto_hex: z.string().describe("Cor estimada do texto, ex. #9CA3AF. Vazio se não aplica"),
      fundo_hex: z.string().describe("Cor estimada do fundo, ex. #FFFFFF. Vazio se não aplica"),
      texto_grande: z.boolean().describe("true se o texto tem ≥ 24px, ou ≥ 18.66px em negrito"),
    })
    .describe("Afirmação verificável de contraste. A medição é feita depois, nos pixels reais."),
});
export type Achado = z.infer<typeof AchadoSchema>;

export const LenteResultadoSchema = z.object({
  resumo: z.string().describe("Leitura geral da tela sob esta lente, 1-2 frases"),
  achados: z.array(AchadoSchema).describe("De 2 a 6 achados, do mais grave ao menos grave"),
  fora_do_alcance: z
    .array(z.string())
    .describe("O que esta lente não consegue avaliar só com um print (estados, fluxo, dados reais etc.), 1-3 itens"),
});
export type LenteResultado = z.infer<typeof LenteResultadoSchema>;

export const SinteseSchema = z.object({
  veredito: z.string().describe("Diagnóstico da tela em 1-2 frases, direto, sem elogio vazio"),
  prioridades: z
    .array(
      z.object({
        titulo: z.string(),
        ids: z.array(z.string()).describe("IDs dos achados que tratam deste mesmo problema, de qualquer lente"),
        por_que_primeiro: z.string().describe("Por que atacar isso antes do resto, 1 frase"),
        hipotese: z
          .string()
          .describe("Hipótese testável no formato: Se [mudança], então [efeito no comportamento], porque [motivo]"),
        metrica: z.string().describe("Métrica principal para ler o resultado do teste"),
        impacto: z.enum(["alto", "medio", "baixo"]),
        esforco: z.enum(["alto", "medio", "baixo"]),
      }),
    )
    .describe("Exatamente 3 prioridades"),
  matriz: z
    .array(
      z.object({
        id: z.string(),
        impacto: z.enum(["alto", "medio", "baixo"]),
        esforco: z.enum(["alto", "medio", "baixo"]),
      }),
    )
    .describe("Classificação de impacto × esforço para TODOS os achados recebidos"),
});
export type Sintese = z.infer<typeof SinteseSchema>;

export type Uso = { entrada: number; saida: number; custoUsd: number; ms: number; modelo: string };

export type RespostaLente = { lente: LenteId; resultado: LenteResultado; uso: Uso };
export type RespostaSintese = { sintese: Sintese; uso: Uso };

/** Resultado salvo de uma execução real, usado nos exemplos. */
export type AnaliseSalva = {
  imagem: { src: string; largura: number; altura: number };
  lentes: Partial<Record<LenteId, RespostaLente>>;
  sintese: RespostaSintese | null;
  geradoEm: string;
};
