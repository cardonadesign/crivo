"use client";

import { verificar } from "@/lib/contraste";
import { prepararImagem, type ImagemPreparada } from "@/lib/imagem";
import { LENTES, type AnaliseSalva } from "@/lib/schema";
import { EXEMPLOS, type Exemplo } from "@/lib/site";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CircleHalfIcon,
  ScalesIcon,
  StackIcon,
  UploadSimpleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SeloVerificacao } from "./CardAchado";
import { BOTAO, PESO_SEVERIDADE, type AchadoNumerado } from "./tipos";
import { BadgeSeveridade } from "./ui";
import { Visor } from "./Visor";

type Previa = { imagem: ImagemPreparada; achados: AchadoNumerado[]; destaque: number };

function numerar(salvo: AnaliseSalva, canvas: HTMLCanvasElement): AchadoNumerado[] {
  const lista: AchadoNumerado[] = [];
  let n = 1;
  for (const l of LENTES) {
    const r = salvo.lentes[l]?.resultado;
    if (!r) continue;
    for (const a of [...r.achados].sort((x, y) => PESO_SEVERIDADE[x.severidade] - PESO_SEVERIDADE[y.severidade]))
      lista.push({ ...a, n: n++, lente: l, verificacao: verificar(a, canvas) });
  }
  return lista;
}

/** Prévia real: o mesmo Visor da análise, com o resultado salvo do exemplo de checkout. */
function PreviaReal() {
  const [previa, setPrevia] = useState<Previa | null>(null);
  const reduzir = useReducedMotion();

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [imagem, salvo] = await Promise.all([
        prepararImagem("/samples/checkout.png"),
        fetch("/samples/checkout.json").then((r) => r.json() as Promise<AnaliseSalva>),
      ]);
      const achados = numerar(salvo, imagem.canvas);
      const destaque =
        achados.find((a) => a.verificacao.status === "confirmado" && a.severidade !== "baixa")?.n ?? achados[0]?.n ?? 1;
      if (vivo) setPrevia({ imagem, achados, destaque });
    })().catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  if (!previa) {
    return <div className="esqueleto aspect-[1280/800] w-full rounded-painel" aria-hidden />;
  }
  const selecionado = previa.achados.find((a) => a.n === previa.destaque)!;
  const visiveis = previa.achados.filter((a) => a.severidade === "critica" || a.n === previa.destaque).slice(0, 7);

  return (
    <figure className="relative">
      <Visor
        src={previa.imagem.src}
        largura={previa.imagem.largura}
        altura={previa.imagem.altura}
        achados={visiveis}
        ativo={previa.destaque}
        alt="Exemplo real: checkout analisado pelo Crivo, com achados marcados sobre a tela"
      />
      <motion.figcaption
        initial={reduzir ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative -mt-10 ml-4 mr-4 rounded-painel border border-linha bg-superficie p-4 shadow-painel sm:-mt-16 sm:ml-auto sm:mr-6 sm:max-w-[380px]"
      >
        <div className="flex items-center gap-2">
          <span className="num grid h-5 w-5 place-items-center rounded-full bg-acento text-[10px] font-semibold text-sobre-acento">
            {selecionado.n}
          </span>
          <BadgeSeveridade severidade={selecionado.severidade} />
        </div>
        <p className="mt-2 text-[14px] font-semibold leading-snug">{selecionado.titulo}</p>
        <div className="mt-3">
          <SeloVerificacao v={selecionado.verificacao} confianca={selecionado.confianca} />
        </div>
      </motion.figcaption>
    </figure>
  );
}

export function Inicio(props: {
  erro: string | null;
  carregandoExemplo: string | null;
  onArquivo: (f: File | null | undefined) => void;
  onExemplo: (e: Exemplo) => void;
}) {
  const [arrastando, setArrastando] = useState(false);
  const [totais, setTotais] = useState<Record<string, number>>({});
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all(
      EXEMPLOS.map((ex) =>
        fetch(`/samples/${ex.id}.json`)
          .then((r) => r.json() as Promise<AnaliseSalva>)
          .then((s) => [ex.id, LENTES.reduce((n, l) => n + (s.lentes[l]?.resultado.achados.length ?? 0), 0)] as const),
      ),
    )
      .then((pares) => setTotais(Object.fromEntries(pares)))
      .catch(() => {});
  }, []);

  const [principal, ...outros] = EXEMPLOS;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setArrastando(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        props.onArquivo(e.dataTransfer.files?.[0]);
      }}
      className="relative"
    >
      {arrastando && (
        <div className="pointer-events-none fixed inset-3 z-40 grid place-items-center rounded-painel border-2 border-dashed border-acento bg-fundo/80 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-[18px] font-medium text-acento">
            <UploadSimpleIcon size={22} aria-hidden />
            Solte para analisar
          </p>
        </div>
      )}

      {/* hero: split assimétrico com prévia real */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pb-24 lg:pt-20">
        <div>
          <h1 className="text-[38px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[46px] lg:text-[46px] xl:text-[54px]">
            Crítica de interface que mostra a prova.
          </h1>
          <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-tinta-2">
            Arraste ou cole um print. Quatro agentes revisam em paralelo, e o que dá para medir é medido nos pixels.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="button" onClick={() => input.current?.click()} className={`${BOTAO.primario} px-5 py-3 text-[15px]`}>
              <UploadSimpleIcon size={18} aria-hidden />
              Enviar print
            </button>
            <button type="button" onClick={() => props.onExemplo(principal)} className={BOTAO.texto}>
              {props.carregandoExemplo === principal.id ? "Abrindo exemplo" : "Ver um exemplo"}
              <ArrowRightIcon size={16} aria-hidden />
            </button>
          </div>
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => props.onArquivo(e.target.files?.[0])}
          />
          {props.erro && (
            <p role="alert" className="mt-4 text-[14px] text-erro">
              {props.erro}
            </p>
          )}
        </div>
        <PreviaReal />
      </section>

      {/* exemplos: composição 2+1 */}
      <section aria-labelledby="titulo-exemplos" className="border-t border-linha">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="titulo-exemplos" className="text-[26px] font-semibold tracking-tight">
            Três telas, analisadas de verdade
          </h2>
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-tinta-2">
            Marcas fictícias com problemas plantados de propósito. Cada exemplo abre o resultado salvo de uma execução real.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            {[principal, ...outros].map((ex, i) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => props.onExemplo(ex)}
                disabled={props.carregandoExemplo !== null}
                className={`group flex flex-col overflow-hidden rounded-painel border border-linha bg-superficie text-left transition-[border-color,transform] duration-200 hover:border-tinta-3 active:scale-[0.995] disabled:opacity-60 ${
                  i === 0 ? "lg:row-span-2" : ""
                }`}
              >
                <div className={`overflow-hidden border-b border-linha bg-superficie-2 ${i === 0 ? "h-64 lg:h-auto lg:flex-1" : "h-44"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/samples/${ex.id}.png`}
                    alt={`Tela de exemplo: ${ex.nome}, ${ex.tipo}`}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-end justify-between gap-4 p-4">
                  <div>
                    <p className="text-[15px] font-semibold">{ex.nome}</p>
                    <p className="text-[13px] text-tinta-3">
                      {ex.tipo}
                      {totais[ex.id] ? `, ${totais[ex.id]} achados` : ""}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-tinta-2 group-hover:text-tinta">
                    {props.carregandoExemplo === ex.id ? "Abrindo" : "Abrir"}
                    <ArrowRightIcon size={14} aria-hidden />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* método: lista à esquerda, espécime dos selos à direita */}
      <section aria-labelledby="titulo-metodo" className="border-t border-linha">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 id="titulo-metodo" className="text-[26px] font-semibold tracking-tight">
              Verificar em vez de confiar
            </h2>
            <ul className="mt-8 space-y-7">
              {[
                {
                  Icone: StackIcon,
                  t: "Quatro lentes, em paralelo",
                  d: "Usabilidade, acessibilidade, hierarquia e produto. Cada agente tem escopo e critério próprios.",
                },
                {
                  Icone: CheckCircleIcon,
                  t: "O que é mensurável, é medido",
                  d: "Quando a IA aponta pouco contraste, o navegador mede os pixels reais e confirma ou contesta.",
                },
                {
                  Icone: ScalesIcon,
                  t: "Da crítica à decisão",
                  d: "Um quinto agente prioriza por impacto e esforço e escreve hipótese e métrica para o topo da lista.",
                },
              ].map(({ Icone, t, d }) => (
                <li key={t} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                  <Icone size={22} className="mt-0.5 text-tinta" aria-hidden />
                  <div>
                    <p className="text-[16px] font-semibold">{t}</p>
                    <p className="mt-1 max-w-[52ch] text-[15px] leading-relaxed text-tinta-2">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/como-funciona" className={`${BOTAO.texto} mt-8`}>
              Como funciona por dentro
              <ArrowRightIcon size={16} aria-hidden />
            </Link>
          </div>

          <div className="rounded-painel border border-linha bg-superficie p-6 sm:p-8">
            <p className="text-[15px] font-semibold">Todo achado diz de onde veio a certeza</p>
            <dl className="mt-6 divide-y divide-linha text-[14px]">
              <div className="grid gap-2 pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <dt className="text-tinta-2">Contraste medido e abaixo do mínimo WCAG</dt>
                <dd className="inline-flex items-center gap-1.5 justify-self-start rounded-badge bg-ok-fundo px-2 py-1 text-[12px] font-medium text-ok">
                  <CheckCircleIcon size={14} weight="fill" aria-hidden />
                  Confirmado <span className="num font-normal">1,83:1</span>
                </dd>
              </div>
              <div className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <dt className="text-tinta-2">A medição contradiz a IA; o achado perde peso</dt>
                <dd className="inline-flex items-center gap-1.5 justify-self-start rounded-badge bg-erro-fundo px-2 py-1 text-[12px] font-medium text-erro">
                  <XCircleIcon size={14} weight="fill" aria-hidden />A IA errou
                </dd>
              </div>
              <div className="grid gap-2 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <dt className="text-tinta-2">Não dá para medir num print; vale como hipótese</dt>
                <dd className="inline-flex items-center gap-1.5 justify-self-start rounded-badge bg-superficie-2 px-2 py-1 text-[12px] text-tinta-2">
                  <CircleHalfIcon size={14} aria-hidden />
                  Julgamento da IA
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
