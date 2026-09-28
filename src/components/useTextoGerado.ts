"use client";

import type { ImagemPreparada } from "@/lib/imagem";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

export type FaseGeracao = "parado" | "esperando" | "gerando-nome" | "gerando-descricao" | "pronto" | "erro";

export type TextoGerado = { nome: string; descricao: string; fase: FaseGeracao };

const CARACTERES_POR_SEGUNDO = 30;

function limpar(linha: string, maximo: number) {
  return linha
    .replace(/^\s*(nome|descri[cç][aã]o)\s*:\s*/i, "")
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim()
    .slice(0, maximo);
}

function dividir(texto: string) {
  const [nome = "", ...resto] = texto.replace(/^\s+/, "").split("\n");
  return { nome, descricao: resto.join(" ").replace(/^\s+/, ""), temQuebra: texto.trim().includes("\n") };
}

/**
 * Lê o stream de /api/identify e revela o texto como se estivesse sendo escrito:
 * a chegada real manda, e um buffer segura o ritmo em ~30 caracteres por segundo
 * para o movimento ser perceptível mesmo quando o modelo responde em 1 segundo.
 */
export function useTextoGerado() {
  const reduzir = useReducedMotion();
  const [estado, setEstado] = useState<TextoGerado>({ nome: "", descricao: "", fase: "parado" });
  const recebido = useRef("");
  const revelados = useRef(0);
  const terminou = useRef(false);
  const falhou = useRef(false);
  const quadro = useRef<number | null>(null);
  const abortar = useRef<AbortController | null>(null);

  const pararAnimacao = () => {
    if (quadro.current !== null) cancelAnimationFrame(quadro.current);
    quadro.current = null;
  };

  const cancelar = useCallback(() => {
    abortar.current?.abort();
    abortar.current = null;
    pararAnimacao();
    setEstado({ nome: "", descricao: "", fase: "parado" });
  }, []);

  useEffect(() => () => cancelar(), [cancelar]);

  const iniciar = useCallback(
    async (img: ImagemPreparada) => {
      abortar.current?.abort();
      pararAnimacao();
      const controle = new AbortController();
      abortar.current = controle;
      recebido.current = "";
      revelados.current = 0;
      terminou.current = false;
      falhou.current = false;
      setEstado({ nome: "", descricao: "", fase: "esperando" });

      let ultimo = performance.now();
      const passo = (agora: number) => {
        if (controle.signal.aborted) return;
        const total = recebido.current.length;
        const ganho = reduzir ? total : Math.floor(((agora - ultimo) / 1000) * CARACTERES_POR_SEGUNDO);
        if (ganho > 0) {
          revelados.current = Math.min(total, revelados.current + ganho);
          ultimo = agora;
        }
        const visivel = recebido.current.slice(0, revelados.current);
        const { nome, descricao, temQuebra } = dividir(visivel);
        const acabou = terminou.current && revelados.current >= total;

        if (acabou) {
          const final = dividir(recebido.current);
          const nomeFinal = limpar(final.nome, 40);
          setEstado(
            falhou.current || !nomeFinal
              ? { nome: "", descricao: "", fase: "erro" }
              : { nome: nomeFinal, descricao: limpar(final.descricao, 60), fase: "pronto" },
          );
          quadro.current = null;
          return;
        }
        setEstado({
          nome,
          descricao,
          fase: total === 0 ? "esperando" : temQuebra ? "gerando-descricao" : "gerando-nome",
        });
        quadro.current = requestAnimationFrame(passo);
      };
      quadro.current = requestAnimationFrame(passo);

      try {
        const res = await fetch("/api/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagem: img.base64, mediaType: img.mediaType }),
          signal: controle.signal,
        });
        if (!res.ok || !res.body) throw new Error(`Erro ${res.status}`);
        const leitor = res.body.getReader();
        const decodificador = new TextDecoder();
        for (;;) {
          const { value, done } = await leitor.read();
          if (done) break;
          recebido.current += decodificador.decode(value, { stream: true });
        }
      } catch {
        if (controle.signal.aborted) return;
        falhou.current = true;
      }
      terminou.current = true;
    },
    [reduzir],
  );

  return { ...estado, iniciar, cancelar };
}
