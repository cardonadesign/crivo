"use client";

import { SparkleIcon } from "@phosphor-icons/react";

/** Rótulo do campo com o estado da IA: "Gerando…" pulsando, depois o selo "Sugerido pela IA". */
export function RotuloIA({
  htmlFor,
  rotulo,
  estado,
}: {
  htmlFor: string;
  rotulo: string;
  estado: "gerando" | "sugerido" | "manual" | "espera";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-medium">
        {rotulo}
      </label>
      {estado === "gerando" && (
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-acento">
          <SparkleIcon size={13} weight="fill" className="pulso" aria-hidden />
          Gerando
        </span>
      )}
      {estado === "sugerido" && (
        <span className="inline-flex items-center gap-1 text-[12px] text-tinta-3">
          <SparkleIcon size={13} weight="fill" className="text-acento" aria-hidden />
          Sugerido pela IA
        </span>
      )}
    </div>
  );
}

/**
 * Caixa com o texto nascendo: brilho cobalto varrendo o trecho escrito e cursor piscando no fim.
 * Clicar assume o campo para edição manual (a IA não sobrescreve depois).
 */
export function CaixaGerando({
  id,
  texto,
  escrevendo,
  onAssumir,
}: {
  id: string;
  texto: string;
  escrevendo: boolean;
  onAssumir: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onAssumir}
      aria-busy={escrevendo}
      aria-label={escrevendo ? "Gerando com IA. Clique para escrever você mesmo" : "Aguardando a IA. Clique para escrever você mesmo"}
      className="mt-1.5 flex min-h-[42px] w-full items-center rounded-controle border border-acento/40 bg-acento-suave px-3 text-left text-[14px] font-medium"
    >
      {escrevendo ? (
        <span className="min-w-0">
          <span className="brilho-ia">{texto}</span>
          <span className="cursor-ia" aria-hidden />
        </span>
      ) : (
        <span className="esqueleto h-3.5 w-2/5" aria-hidden />
      )}
    </button>
  );
}
