"use client";

import { motion, useReducedMotion } from "motion/react";
import type { AchadoNumerado } from "./tipos";

export function Visor(props: {
  src: string;
  largura: number;
  altura: number;
  achados: AchadoNumerado[];
  ativo: number | null;
  onAtivar?: (n: number | null) => void;
  onSelecionar?: (n: number) => void;
  alt?: string;
}) {
  const { src, largura, altura, achados, ativo } = props;
  const reduzir = useReducedMotion();
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
  const selecionado = achados.find((a) => a.n === ativo);

  return (
    <div className="relative w-full overflow-hidden rounded-painel border border-linha bg-superficie shadow-painel">
      <div className="relative w-full" style={{ aspectRatio: `${largura} / ${altura}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={props.alt ?? "Tela em análise"}
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />

        {/* foco: escurece o resto e recorta a região do achado ativo */}
        {selecionado && (
          <div
            className="pointer-events-none absolute rounded-[3px] outline-2 outline-acento transition-all duration-150"
            style={{
              left: pct(selecionado.regiao.x, largura),
              top: pct(selecionado.regiao.y, altura),
              width: pct(selecionado.regiao.largura, largura),
              height: pct(selecionado.regiao.altura, altura),
              outlineStyle: "solid",
              boxShadow: "0 0 0 9999px rgb(12 12 14 / 0.38)",
            }}
          />
        )}

        {achados.map((a, i) => {
          const on = ativo === a.n;
          const contestado = a.verificacao.status === "nao_confirmado";
          const p = pins.get(a.n)!;
          return (
            <motion.button
              key={a.n}
              type="button"
              aria-label={`Achado ${a.n}: ${a.titulo}`}
              initial={reduzir ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: ativo === null || on ? 1 : 0.45, scale: on ? 1.15 : 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 26, delay: reduzir ? 0 : Math.min(i, 12) * 0.03 }}
              onMouseEnter={() => props.onAtivar?.(a.n)}
              onMouseLeave={() => props.onAtivar?.(null)}
              onFocus={() => props.onAtivar?.(a.n)}
              onBlur={() => props.onAtivar?.(null)}
              onClick={() => props.onSelecionar?.(a.n)}
              className={`num absolute z-10 -ml-2.5 -mt-2.5 grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold ring-2 ring-superficie sm:-ml-3 sm:-mt-3 sm:h-6 sm:w-6 sm:text-[11px] ${
                on
                  ? "bg-acento text-sobre-acento"
                  : contestado
                    ? "border border-tinta-3 bg-superficie text-tinta-3"
                    : "bg-tinta text-fundo"
              }`}
              style={{ left: pct(p.x, largura), top: pct(p.y, altura) }}
            >
              {a.n}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
