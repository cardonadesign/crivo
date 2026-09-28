import type { Verificacao } from "@/lib/contraste";
import type { Achado, LenteId, RespostaLente, RespostaSintese } from "@/lib/schema";
import type { Exemplo } from "@/lib/site";

export type AchadoNumerado = Achado & { n: number; lente: LenteId; verificacao: Verificacao };

export type EstadoLente = {
  estado: "aguardando" | "rodando" | "ok" | "erro";
  resp?: RespostaLente;
  erro?: string;
  inicio?: number;
};
export type EstadoSintese = { estado: "aguardando" | "rodando" | "ok" | "erro"; resp?: RespostaSintese; erro?: string };
export type Aba = "prioridades" | "achados" | "limites";

/** O que está aberto no espaço de trabalho. */
export type Atual =
  | { tipo: "vazio" }
  | { tipo: "exemplo"; exemplo: Exemplo; geradoEm?: string; salvo: boolean }
  | { tipo: "local"; id: string; nome: string; descricao: string; criadoEm: string };

export const ROTULO_SEVERIDADE: Record<Achado["severidade"], string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const PESO_SEVERIDADE: Record<Achado["severidade"], number> = { critica: 0, alta: 1, media: 2, baixa: 3 };

export function formatarUsd(v: number) {
  return "US$ " + v.toFixed(v < 0.1 ? 3 : 2).replace(".", ",");
}

export function formatarSeg(ms: number) {
  return (ms / 1000).toFixed(1).replace(".", ",") + "s";
}

/** Classes de botão compartilhadas. Controles usam raio de 6px, nunca pílula. */
export const BOTAO = {
  primario:
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-controle bg-acento px-4 py-2.5 text-[14px] font-medium text-sobre-acento transition-[background-color,transform] duration-150 hover:bg-acento-hover active:scale-[0.98] disabled:opacity-60",
  secundario:
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-controle border border-linha-forte bg-superficie px-3.5 py-2 text-[14px] font-medium text-tinta transition-[border-color,transform] duration-150 hover:border-tinta-3 active:scale-[0.98]",
  texto:
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-controle text-[14px] font-medium text-tinta-2 underline-offset-4 transition-colors hover:text-tinta hover:underline",
};
