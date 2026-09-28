"use client";

import type { ImagemPreparada } from "@/lib/imagem";

export function Preparar(props: {
  imagem: ImagemPreparada;
  contexto: string;
  onContexto: (v: string) => void;
  onAnalisar: () => void;
  onTrocar: () => void;
}) {
  const { imagem } = props;
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:py-12">
      <div className="relative overflow-hidden rounded-xl border border-linha bg-cartao">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagem.src} alt="Pré-visualização da tela" className="max-h-[70vh] w-full object-contain" />
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-tinta-3">Antes de começar</p>
          <h2 className="titulo-serif mt-1 text-4xl leading-tight">O que é essa tela?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-tinta-2">
            Opcional, mas ajuda as lentes a julgarem com contexto: produto, público, objetivo da etapa.
          </p>
        </div>
        <textarea
          value={props.contexto}
          onChange={(e) => props.onContexto(e.target.value.slice(0, 300))}
          rows={3}
          placeholder="Ex.: tela de pagamento de um app de delivery, público 25–40 anos, mobile."
          className="w-full resize-none rounded-lg border border-linha-forte bg-cartao p-3 text-[15px] outline-none placeholder:text-tinta-3 focus:border-tinta"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={props.onAnalisar}
            className="rounded-full bg-tinta px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
          >
            Analisar com 4 lentes →
          </button>
          <button
            type="button"
            onClick={props.onTrocar}
            className="rounded-full border border-linha-forte px-5 py-3 text-[15px] text-tinta-2 hover:border-tinta hover:text-tinta"
          >
            Trocar imagem
          </button>
        </div>
        <p className="text-[13px] text-tinta-3">
          Dimensões enviadas ao modelo: {imagem.largura}×{imagem.altura}px. A imagem não é armazenada.
        </p>
      </div>
    </div>
  );
}
