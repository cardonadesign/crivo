"use client";

import { formatarRazao, type Verificacao } from "@/lib/contraste";
import { LENTES_INFO } from "@/lib/lentes";
import { forwardRef } from "react";
import { COR_SEVERIDADE, ROTULO_SEVERIDADE, type AchadoNumerado } from "./tipos";

const ROTULO_CONFIANCA = { alta: "confiança alta", media: "confiança média", baixa: "confiança baixa" };

export function SeloVerificacao({ v, confianca }: { v: Verificacao; confianca: AchadoNumerado["confianca"] }) {
  if (v.status === "julgamento") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutro-fundo px-2 py-0.5 text-[11px] text-tinta-2">
        <span aria-hidden>◐</span> Julgamento da IA · {ROTULO_CONFIANCA[confianca]}
      </span>
    );
  }
  if (v.status === "nao_mensuravel") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutro-fundo px-2 py-0.5 text-[11px] text-tinta-2">
        <span aria-hidden>?</span> Contraste não mensurável · {v.motivo}
      </span>
    );
  }
  const confirmado = v.status === "confirmado";
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        confirmado ? "bg-ok-fundo text-ok" : "bg-alerta-fundo text-alerta"
      }`}
    >
      <span aria-hidden>{confirmado ? "✓" : "✕"}</span>
      {confirmado ? "Medido nos pixels: confirmado" : "Medido nos pixels: a IA errou"}
      <span className="font-mono">
        {formatarRazao(v.medido)} {confirmado ? "<" : "≥"} {formatarRazao(v.limite)}
      </span>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        <i className="h-2.5 w-2.5 rounded-sm border border-black/10" style={{ background: v.texto }} />
        <i className="h-2.5 w-2.5 rounded-sm border border-black/10" style={{ background: v.fundo }} />
      </span>
    </span>
  );
}

export const CardAchado = forwardRef<
  HTMLElement,
  { a: AchadoNumerado; ativo: boolean; onAtivar: (n: number | null) => void }
>(function CardAchado({ a, ativo, onAtivar }, ref) {
  const lente = LENTES_INFO[a.lente];
  const sev = COR_SEVERIDADE[a.severidade];
  const contestado = a.verificacao.status === "nao_confirmado";
  return (
    <article
      ref={ref}
      tabIndex={0}
      onMouseEnter={() => onAtivar(a.n)}
      onMouseLeave={() => onAtivar(null)}
      onFocus={() => onAtivar(a.n)}
      onBlur={() => onAtivar(null)}
      className={`surgir scroll-mt-24 rounded-xl border bg-cartao p-4 outline-none transition-all ${
        ativo ? "border-tinta/40 shadow-[0_8px_24px_-16px_rgba(22,20,15,0.5)]" : "border-linha"
      } ${contestado ? "opacity-75" : ""}`}
    >
      <header className="flex items-start gap-3">
        <span
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
          style={{ background: lente.cor }}
        >
          {a.n}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className={`text-[15px] font-semibold leading-snug ${contestado ? "line-through decoration-1" : ""}`}>
              {a.titulo}
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-full px-2 py-0.5 font-medium" style={{ color: sev.texto, background: sev.fundo }}>
              {ROTULO_SEVERIDADE[a.severidade]}
            </span>
            <span className="text-tinta-3">
              {lente.nome} · {a.principio}
            </span>
          </div>
        </div>
      </header>

      <p className="mt-3 text-[14px] leading-relaxed text-tinta-2">{a.problema}</p>
      <p className="mt-2 border-l-2 border-linha-forte pl-3 text-[13px] leading-relaxed text-tinta-3">
        <span className="font-medium text-tinta-2">Evidência: </span>
        {a.evidencia}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed">
        <span className="font-medium">Sugestão: </span>
        <span className="text-tinta-2">{a.sugestao}</span>
      </p>
      <div className="mt-3">
        <SeloVerificacao v={a.verificacao} confianca={a.confianca} />
      </div>
    </article>
  );
});
