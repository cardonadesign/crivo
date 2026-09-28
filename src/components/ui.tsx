"use client";

import { LENTES_INFO } from "@/lib/lentes";
import type { Achado, LenteId } from "@/lib/schema";
import {
  CellSignalFullIcon,
  CellSignalHighIcon,
  CellSignalLowIcon,
  CellSignalMediumIcon,
  ChartLineUpIcon,
  CursorClickIcon,
  EyeIcon,
  TextAaIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { ROTULO_SEVERIDADE } from "./tipos";

const ICONES: Record<LenteId, React.ComponentType<IconProps>> = {
  usabilidade: CursorClickIcon,
  acessibilidade: EyeIcon,
  hierarquia: TextAaIcon,
  produto: ChartLineUpIcon,
};

/** Cor categórica da lente (a única cor que codifica categoria na interface). */
export function corLente(l: LenteId) {
  return { cor: `var(--lente-${l})`, fundo: `var(--lente-${l}-fundo)`, sobre: "var(--sobre-lente)" };
}

export function IconeLente({
  lente,
  size = 16,
  className,
  colorido = false,
}: {
  lente: LenteId;
  size?: number;
  className?: string;
  colorido?: boolean;
}) {
  const Icone = ICONES[lente];
  return <Icone size={size} className={className} style={colorido ? { color: corLente(lente).cor } : undefined} aria-hidden />;
}

/** Identificação da lente: ícone + nome na cor da lente sobre o fundo tingido. */
export function ChipLente({ lente, curto = false }: { lente: LenteId; curto?: boolean }) {
  const c = corLente(lente);
  const nome = LENTES_INFO[lente].nome;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-badge px-1.5 py-0.5 text-[11px] font-medium"
      style={{ color: c.cor, background: c.fundo }}
    >
      <IconeLente lente={lente} size={13} />
      {curto ? nome.split(" ")[0] : nome}
    </span>
  );
}

const ICONE_SEVERIDADE: Record<Achado["severidade"], React.ComponentType<IconProps>> = {
  critica: CellSignalFullIcon,
  alta: CellSignalHighIcon,
  media: CellSignalMediumIcon,
  baixa: CellSignalLowIcon,
};

/** Severidade neutra: nível pelo ícone de sinal, sem cor (a cor fica reservada à lente). */
export function BadgeSeveridade({ severidade }: { severidade: Achado["severidade"] }) {
  const Icone = ICONE_SEVERIDADE[severidade];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-badge border border-linha px-1.5 py-0.5 text-[11px] font-medium text-tinta-2"
      title={`Severidade ${ROTULO_SEVERIDADE[severidade].toLowerCase()}`}
    >
      <Icone size={13} weight="fill" aria-hidden />
      {ROTULO_SEVERIDADE[severidade]}
    </span>
  );
}

/** Pin numerado na cor da lente. Contestado = vazado; ativo = anel de destaque. */
export function estiloPin(a: { lente: LenteId; verificacao: { status: string } }, ativo: boolean): React.CSSProperties {
  const c = corLente(a.lente);
  const contestado = a.verificacao.status === "nao_confirmado";
  return {
    background: contestado ? "var(--superficie)" : c.cor,
    color: contestado ? c.cor : c.sobre,
    boxShadow: contestado
      ? `inset 0 0 0 1.5px ${c.cor}, 0 0 0 2px var(--superficie)${ativo ? ", 0 0 0 4px var(--tinta)" : ""}`
      : `0 0 0 2px var(--superficie)${ativo ? ", 0 0 0 4px var(--tinta)" : ""}`,
  };
}
