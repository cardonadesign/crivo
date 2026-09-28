"use client";

import { LENTES_INFO } from "@/lib/lentes";
import type { AchadoNumerado } from "./tipos";

export function Visor(props: {
  src: string;
  largura: number;
  altura: number;
  achados: AchadoNumerado[];
  ativo: number | null;
  analisando: boolean;
  onAtivar: (n: number | null) => void;
  onSelecionar: (n: number) => void;
}) {
  const { src, largura, altura, achados, ativo, analisando } = props;
  const pct = (v: number, total: number) => `${Math.max(0, Math.min(100, (v / total) * 100))}%`;

  // Afasta pins que cairiam um em cima do outro (as caixas não mudam).
  const passo = largura * 0.024;
  const pins = new Map<number, { x: number; y: number }>();
  for (const a of achados) {
    let x = Math.max(a.regiao.x, passo / 2);
    const y = Math.max(a.regiao.y, passo / 2);
    const colide = () => [...pins.values()].some((p) => Math.abs(p.x - x) < passo && Math.abs(p.y - y) < passo);
    while (colide() && x < largura - passo) x += passo;
    pins.set(a.n, { x, y });
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-linha bg-cartao shadow-[0_1px_0_rgba(0,0,0,0.03),0_12px_32px_-18px_rgba(22,20,15,0.35)]">
      <div className="relative w-full" style={{ aspectRatio: `${largura} / ${altura}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Tela em análise" className="absolute inset-0 h-full w-full select-none" draggable={false} />

        {ativo !== null && <div className="pointer-events-none absolute inset-0 bg-tinta/25 transition-opacity" />}

        {achados.map((a) => {
          const cor = LENTES_INFO[a.lente].cor;
          const on = ativo === a.n;
          return (
            <div
              key={a.n}
              className="pointer-events-none absolute rounded-[3px] transition-all duration-150"
              style={{
                left: pct(a.regiao.x, largura),
                top: pct(a.regiao.y, altura),
                width: pct(a.regiao.largura, largura),
                height: pct(a.regiao.altura, altura),
                outline: on ? `2px solid ${cor}` : "1px dashed transparent",
                boxShadow: on ? `0 0 0 9999px rgba(22,20,15,0.0), 0 0 0 4px ${cor}33` : "none",
                background: on ? "rgba(255,255,255,0.08)" : "transparent",
                opacity: ativo === null || on ? 1 : 0,
              }}
            />
          );
        })}

        {achados.map((a) => {
          const cor = LENTES_INFO[a.lente].cor;
          const on = ativo === a.n;
          return (
            <button
              key={`pin-${a.n}`}
              type="button"
              aria-label={`Achado ${a.n}: ${a.titulo}`}
              onMouseEnter={() => props.onAtivar(a.n)}
              onMouseLeave={() => props.onAtivar(null)}
              onFocus={() => props.onAtivar(a.n)}
              onBlur={() => props.onAtivar(null)}
              onClick={() => props.onSelecionar(a.n)}
              className="aparecer absolute z-10 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-[11px] font-semibold text-white ring-2 ring-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4"
              style={{
                left: pct(pins.get(a.n)!.x, largura),
                top: pct(pins.get(a.n)!.y, altura),
                background: cor,
                transform: `translate(-50%,-50%) scale(${on ? 1.2 : 1})`,
                opacity: ativo === null || on ? 1 : 0.35,
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              {a.n}
            </button>
          );
        })}

        {analisando && <div className="linha-varredura" />}
      </div>
    </div>
  );
}
