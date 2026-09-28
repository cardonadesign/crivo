"use client";

import { formatarRazao, type Verificacao } from "@/lib/contraste";
import { CheckCircleIcon, CircleHalfIcon, QuestionIcon, XCircleIcon } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { AchadoNumerado } from "./tipos";
import { BadgeSeveridade, ChipLente, corLente, estiloPin } from "./ui";

const ROTULO_CONFIANCA = { alta: "confiança alta", media: "confiança média", baixa: "confiança baixa" };

export function SeloVerificacao({ v, confianca }: { v: Verificacao; confianca: AchadoNumerado["confianca"] }) {
  const base = "inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-badge px-2 py-1 text-[12px]";

  if (v.status === "julgamento") {
    return (
      <span className={`${base} bg-superficie-2 text-tinta-2`}>
        <CircleHalfIcon size={14} aria-hidden />
        Julgamento da IA, {ROTULO_CONFIANCA[confianca]}
      </span>
    );
  }
  if (v.status === "nao_mensuravel") {
    return (
      <span className={`${base} bg-superficie-2 text-tinta-2`}>
        <QuestionIcon size={14} aria-hidden />
        Não mensurável: {v.motivo.replace(/\.$/, "").toLowerCase()}
      </span>
    );
  }
  const confirmado = v.status === "confirmado";
  return (
    <span
      className={`${base} font-medium ${confirmado ? "bg-ok-fundo text-ok" : "bg-erro-fundo text-erro"}`}
      title={`Contraste medido nos pixels da imagem: ${formatarRazao(v.medido)} (mínimo ${formatarRazao(v.limite)})`}
    >
      {confirmado ? <CheckCircleIcon size={14} weight="fill" aria-hidden /> : <XCircleIcon size={14} weight="fill" aria-hidden />}
      {confirmado ? "Confirmado na medição" : "A IA errou"}
      <span className="num font-normal">
        {formatarRazao(v.medido)} {confirmado ? "<" : "≥"} {formatarRazao(v.limite)}
      </span>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        <i className="h-3 w-3 rounded-[2px] border border-black/10" style={{ background: v.texto }} />
        <i className="h-3 w-3 rounded-[2px] border border-black/10" style={{ background: v.fundo }} />
      </span>
    </span>
  );
}

/** Um achado como linha de lista (sem card): o destaque vem do fundo quando ativo. */
export const CardAchado = forwardRef<
  HTMLElement,
  { a: AchadoNumerado; ativo: boolean; onAtivar: (n: number | null) => void }
>(function CardAchado({ a, ativo, onAtivar }, ref) {
  const contestado = a.verificacao.status === "nao_confirmado";
  return (
    <article
      ref={ref}
      tabIndex={0}
      onMouseEnter={() => onAtivar(a.n)}
      onMouseLeave={() => onAtivar(null)}
      onFocus={() => onAtivar(a.n)}
      onBlur={() => onAtivar(null)}
      className="-mx-3 scroll-mt-24 rounded-painel px-3 py-5 outline-none transition-colors"
      style={ativo ? { background: corLente(a.lente).fundo } : undefined}
    >
      <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
        <span
          className="num mt-0.5 grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold"
          style={estiloPin(a, false)}
        >
          {a.n}
        </span>
        <div className="min-w-0">
          <h3 className={`text-[15px] font-semibold leading-snug ${contestado ? "text-tinta-2 line-through decoration-1" : ""}`}>
            {a.titulo}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-tinta-3">
            <ChipLente lente={a.lente} />
            <BadgeSeveridade severidade={a.severidade} />
          </div>
          <p className="mt-1.5 text-[12px] text-tinta-3">{a.principio}</p>

          <p className="mt-3 text-[14px] leading-relaxed text-tinta-2">{a.problema}</p>
          <blockquote className="mt-2.5 border-l-2 border-linha-forte pl-3 text-[13px] leading-relaxed text-tinta-3">
            {a.evidencia}
          </blockquote>
          <p className="mt-2.5 text-[14px] leading-relaxed">
            <span className="font-medium text-tinta">Sugestão. </span>
            <span className="text-tinta-2">{a.sugestao}</span>
          </p>
          <div className="mt-3">
            <SeloVerificacao v={a.verificacao} confianca={a.confianca} />
          </div>
        </div>
      </div>
    </article>
  );
});
