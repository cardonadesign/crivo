"use client";

import type { ImagemPreparada } from "@/lib/imagem";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { BOTAO } from "./tipos";

export function Preparar(props: {
  imagem: ImagemPreparada;
  contexto: string;
  onContexto: (v: string) => void;
  onAnalisar: () => void;
  onTrocar: () => void;
}) {
  const { imagem } = props;
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:py-16">
      <div className="overflow-hidden rounded-painel border border-linha bg-superficie shadow-painel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagem.src} alt="Pré-visualização da tela enviada" className="max-h-[72vh] w-full object-contain" />
      </div>

      <div className="flex flex-col">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">O que é essa tela?</h1>
        <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-tinta-2">
          Contexto é opcional, mas deixa as lentes mais precisas: produto, público e objetivo da etapa.
        </p>

        <label htmlFor="contexto" className="mt-8 text-[14px] font-medium">
          Contexto da tela
        </label>
        <textarea
          id="contexto"
          aria-describedby="contexto-ajuda"
          value={props.contexto}
          onChange={(e) => props.onContexto(e.target.value.slice(0, 300))}
          rows={4}
          placeholder="Ex.: pagamento de um app de delivery, público de 25 a 40 anos, mobile."
          className="mt-2 w-full resize-none rounded-controle border border-linha-forte bg-superficie p-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-tinta-3 focus:border-acento"
        />
        <p id="contexto-ajuda" className="num mt-1.5 text-right text-[12px] text-tinta-3">
          {props.contexto.length}/300
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={props.onAnalisar} className={BOTAO.primario}>
            Analisar a tela
            <ArrowRightIcon size={16} aria-hidden />
          </button>
          <button type="button" onClick={props.onTrocar} className={BOTAO.texto}>
            <ArrowLeftIcon size={16} aria-hidden />
            Trocar imagem
          </button>
        </div>

        <p className="mt-auto pt-10 text-[13px] text-tinta-3">
          A imagem vai ao modelo com <span className="num">{imagem.largura}×{imagem.altura}</span> px e não é armazenada.
        </p>
      </div>
    </div>
  );
}
