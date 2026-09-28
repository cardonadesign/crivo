// Histórico de análises do próprio visitante, guardado só no navegador dele (localStorage).
// Pode falhar (modo privado, cota cheia): toda leitura e escrita é tolerante a erro.

import type { LenteId, RespostaLente, RespostaSintese } from "./schema";

export type AnaliseLocal = {
  id: string;
  nome: string;
  /** Tipo de tela e plataforma (gerado pela IA ou editado). Opcional: análises antigas não têm. */
  descricao?: string;
  criadoEm: string;
  contexto: string;
  imagem: { src: string; largura: number; altura: number };
  lentes: Partial<Record<LenteId, RespostaLente>>;
  sintese: RespostaSintese | null;
};

const CHAVE = "crivo:historico:v1";
const MAXIMO = 6;

export function lerHistorico(): AnaliseLocal[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as AnaliseLocal[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: AnaliseLocal[]): AnaliseLocal[] {
  let atual = lista.slice(0, MAXIMO);
  while (atual.length > 0) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(atual));
      return atual;
    } catch {
      atual = atual.slice(0, -1); // cota cheia: descarta a mais antiga e tenta de novo
    }
  }
  try {
    localStorage.removeItem(CHAVE);
  } catch {}
  return [];
}

export function salvarNoHistorico(item: AnaliseLocal): AnaliseLocal[] {
  return gravar([item, ...lerHistorico().filter((a) => a.id !== item.id)]);
}

export function removerDoHistorico(id: string): AnaliseLocal[] {
  return gravar(lerHistorico().filter((a) => a.id !== id));
}
