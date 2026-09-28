"use client";

import type { Achado, LenteId } from "@/lib/schema";
import {
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

export function IconeLente({ lente, size = 16, className }: { lente: LenteId; size?: number; className?: string }) {
  const Icone = ICONES[lente];
  return <Icone size={size} className={className} aria-hidden />;
}

export function BadgeSeveridade({ severidade }: { severidade: Achado["severidade"] }) {
  return (
    <span
      className="inline-flex items-center rounded-badge px-1.5 py-0.5 text-[11px] font-medium"
      style={{ color: `var(--sev-${severidade})`, background: `var(--sev-${severidade}-fundo)` }}
    >
      {ROTULO_SEVERIDADE[severidade]}
    </span>
  );
}
