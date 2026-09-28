import type { Verificacao } from "@/lib/contraste";
import type { Achado, LenteId } from "@/lib/schema";

export type AchadoNumerado = Achado & { n: number; lente: LenteId; verificacao: Verificacao };

export const ROTULO_SEVERIDADE: Record<Achado["severidade"], string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const COR_SEVERIDADE: Record<Achado["severidade"], { texto: string; fundo: string }> = {
  critica: { texto: "#A11A12", fundo: "#FDECEA" },
  alta: { texto: "#A23A08", fundo: "#FDEEE4" },
  media: { texto: "#7A4E05", fundo: "#FBF3DC" },
  baixa: { texto: "#475467", fundo: "#EEF0F3" },
};

export const PESO_SEVERIDADE: Record<Achado["severidade"], number> = { critica: 0, alta: 1, media: 2, baixa: 3 };

export function formatarUsd(v: number) {
  return "US$ " + v.toFixed(v < 0.1 ? 3 : 2).replace(".", ",");
}

export function formatarSeg(ms: number) {
  return (ms / 1000).toFixed(1).replace(".", ",") + "s";
}
