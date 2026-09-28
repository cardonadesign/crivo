"use client";

import { EXEMPLOS, type Exemplo } from "@/lib/site";
import { useRef, useState } from "react";

export function Inicio(props: {
  erro: string | null;
  carregandoExemplo: string | null;
  onArquivo: (f: File | null | undefined) => void;
  onExemplo: (e: Exemplo) => void;
}) {
  const [arrastando, setArrastando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-acento-texto">Crítica de interface com IA</p>
      <h1 className="titulo-serif mt-3 max-w-4xl text-[44px] leading-[1.02] sm:text-[72px]">
        Uma segunda opinião de design. <em className="text-acento-texto">Com prova.</em>
      </h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-tinta-2">
        Envie o print de uma tela. Quatro agentes revisam em paralelo: usabilidade, acessibilidade, hierarquia e produto. Um
        quinto decide o que corrigir primeiro. E o que dá para medir, o Crivo mede nos pixels em vez de confiar no modelo.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          props.onArquivo(e.dataTransfer.files?.[0]);
        }}
        className={`mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          arrastando ? "border-acento bg-[#FFF3EC]" : "border-linha-forte bg-cartao"
        }`}
      >
        <p className="titulo-serif text-3xl">Solte o print aqui</p>
        <p className="mt-2 text-[15px] text-tinta-2">
          ou cole com{" "}
          <kbd className="rounded border border-linha-forte bg-papel px-1.5 py-0.5 font-mono text-[12px]">Ctrl</kbd> +{" "}
          <kbd className="rounded border border-linha-forte bg-papel px-1.5 py-0.5 font-mono text-[12px]">V</kbd>
        </p>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="mt-5 rounded-full bg-tinta px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black"
        >
          Escolher imagem
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => props.onArquivo(e.target.files?.[0])}
        />
        {props.erro && <p className="mt-4 text-[14px] text-alerta">{props.erro}</p>}
      </div>

      <div className="mt-12">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.14em] text-tinta-3">Sem print à mão? Veja um exemplo</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {EXEMPLOS.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => props.onExemplo(ex)}
              disabled={props.carregandoExemplo !== null}
              className="group overflow-hidden rounded-xl border border-linha bg-cartao text-left transition-all hover:-translate-y-0.5 hover:border-tinta/40 hover:shadow-[0_12px_28px_-18px_rgba(22,20,15,0.5)] disabled:opacity-60"
            >
              <div className="h-44 overflow-hidden border-b border-linha bg-papel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/samples/${ex.id}.png`}
                  alt=""
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-medium">{ex.nome}</p>
                  <p className="text-[13px] text-tinta-3">{ex.tipo}</p>
                </div>
                <span className="shrink-0 text-[13px] text-tinta-2">
                  {props.carregandoExemplo === ex.id ? "abrindo…" : "Ver análise →"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-16 grid gap-8 border-t border-linha pt-10 sm:grid-cols-3">
        {[
          ["01", "Quatro lentes, em paralelo", "Cada lente é um agente com escopo, critérios e formato de resposta próprios. Nenhuma tenta ver tudo."],
          ["02", "O que é mensurável, é medido", "Quando a IA diz que um texto tem pouco contraste, o Crivo mede os pixels reais e confirma ou contesta."],
          ["03", "Da crítica à decisão", "Um agente de síntese cruza as lentes, prioriza por impacto e esforço e transforma o topo da lista em hipóteses testáveis."],
        ].map(([n, t, d]) => (
          <div key={n}>
            <p className="font-mono text-[12px] text-acento-texto">{n}</p>
            <h3 className="mt-2 text-[17px] font-semibold">{t}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-tinta-2">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
