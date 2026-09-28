"use client";

import type { ImagemPreparada } from "@/lib/imagem";
import { ImageSquareIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { BOTAO, type AchadoNumerado } from "./tipos";
import { Visor } from "./Visor";

function EstadoVazio({ erro, onArquivo }: { erro: string | null; onArquivo: (f: File | null | undefined) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center p-6">
      <div className="flex w-full max-w-lg flex-col items-center rounded-painel border-2 border-dashed border-linha-forte px-6 py-14 text-center">
        <ImageSquareIcon size={32} className="text-tinta-3" aria-hidden />
        <p className="mt-4 text-[17px] font-semibold tracking-tight">Solte o print de uma tela</p>
        <p className="mt-1.5 text-[14px] text-tinta-2">
          ou cole com{" "}
          <kbd className="num rounded-badge border border-linha-forte bg-superficie px-1.5 py-0.5 text-[12px]">Ctrl</kbd> +{" "}
          <kbd className="num rounded-badge border border-linha-forte bg-superficie px-1.5 py-0.5 text-[12px]">V</kbd>
        </p>
        <button type="button" onClick={() => input.current?.click()} className={`${BOTAO.primario} mt-6`}>
          <UploadSimpleIcon size={16} aria-hidden />
          Escolher arquivo
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onArquivo(e.target.files?.[0])}
        />
        {erro && (
          <p role="alert" className="mt-4 text-[13px] text-erro">
            {erro}
          </p>
        )}
        <p className="mt-6 text-[12px] text-tinta-3">PNG, JPG ou WebP, até 15 MB.</p>
      </div>
    </div>
  );
}

export function Canvas(props: {
  imagem: ImagemPreparada | null;
  achados: AchadoNumerado[];
  ativo: number | null;
  onAtivar: (n: number | null) => void;
  onSelecionar: (n: number) => void;
  erro: string | null;
  onArquivo: (f: File | null | undefined) => void;
  carregando: boolean;
}) {
  const { imagem, achados } = props;

  if (props.carregando) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center p-6">
        <div className="esqueleto aspect-[16/10] w-full max-w-3xl rounded-painel" aria-label="Abrindo análise" />
      </div>
    );
  }
  if (!imagem) return <EstadoVazio erro={props.erro} onArquivo={props.onArquivo} />;

  const medidos = achados.filter((a) => a.verificacao.status === "confirmado" || a.verificacao.status === "nao_confirmado");
  const confirmados = medidos.filter((a) => a.verificacao.status === "confirmado").length;
  const contestados = medidos.length - confirmados;
  // Cabe na altura da área quando possível; telas altas (mobile) rolam.
  const proporcao = imagem.largura / imagem.altura;

  return (
    <div className="mx-auto flex w-full flex-col items-center p-4 sm:p-6 lg:p-10">
      <div className="w-full" style={{ maxWidth: `max(360px, min(100%, calc((100dvh - 190px) * ${proporcao})))` }}>
        <Visor
          src={imagem.src}
          largura={imagem.largura}
          altura={imagem.altura}
          achados={achados}
          ativo={props.ativo}
          onAtivar={props.onAtivar}
          onSelecionar={props.onSelecionar}
        />
        {medidos.length > 0 && (
          <p className="mt-3 text-[12px] leading-relaxed text-tinta-2">
            <span className="font-medium text-tinta">Verificação por pixel.</span> {medidos.length}{" "}
            {medidos.length === 1 ? "afirmação de contraste medida" : "afirmações de contraste medidas"}:{" "}
            <span className="font-medium text-ok">
              {confirmados} confirmada{confirmados === 1 ? "" : "s"}
            </span>
            {contestados > 0 && (
              <>
                {" "}e{" "}
                <span className="font-medium text-erro">
                  {contestados} contestada{contestados === 1 ? "" : "s"}
                </span>
              </>
            )}
            .
          </p>
        )}
      </div>
    </div>
  );
}
