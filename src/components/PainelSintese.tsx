"use client";

import { LENTES, type Sintese } from "@/lib/schema";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import type { AchadoNumerado } from "./tipos";
import { estiloPin, IconeLente } from "./ui";

const NIVEL = { baixo: 0, medio: 1, alto: 2 } as const;
const ROTULO = { baixo: "baixo", medio: "médio", alto: "alto" } as const;

function PinMini({
  a,
  ativo,
  onAtivar,
  onClick,
}: {
  a: AchadoNumerado;
  ativo: boolean;
  onAtivar: (n: number | null) => void;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onAtivar(a.n)}
      onMouseLeave={() => onAtivar(null)}
      onFocus={() => onAtivar(a.n)}
      onBlur={() => onAtivar(null)}
      onClick={onClick}
      aria-label={`Achado ${a.n}: ${a.titulo}`}
      className={`num grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold transition-transform ${
        ativo ? "scale-110" : ""
      }`}
      style={estiloPin(a, ativo)}
    >
      {a.n}
    </button>
  );
}

function Matriz(props: {
  sintese: Sintese;
  porN: Map<string, AchadoNumerado>;
  ativo: number | null;
  onAtivar: (n: number | null) => void;
  onIrPara: (n: number) => void;
}) {
  // linha = impacto (alto em cima), coluna = esforço (baixo à esquerda)
  const celulas: AchadoNumerado[][][] = [0, 1, 2].map(() => [[], [], []]);
  for (const m of props.sintese.matriz) {
    const a = props.porN.get(m.id.replace(/\D/g, ""));
    if (a) celulas[2 - NIVEL[m.impacto]][NIVEL[m.esforco]].push(a);
  }
  const rotuloLinha = ["Impacto alto", "Impacto médio", "Impacto baixo"];
  const rotuloColuna = ["Esforço baixo", "Esforço médio", "Esforço alto"];

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[330px] grid-cols-[76px_repeat(3,minmax(0,1fr))] text-[12px]">
        <div />
        {rotuloColuna.map((r) => (
          <div key={r} className="px-2 pb-2 text-tinta-3">
            {r}
          </div>
        ))}
        {celulas.map((linha, l) => (
          <div key={l} className="contents">
            <div className="flex items-start border-t border-linha py-2 pr-2 text-tinta-3">{rotuloLinha[l]}</div>
            {linha.map((itens, c) => (
              <div
                key={c}
                className={`min-h-[52px] border-l border-t border-linha p-2 ${l === 0 && c === 0 ? "bg-acento-suave" : ""}`}
              >
                {l === 0 && c === 0 && <p className="mb-1.5 text-[11px] font-medium text-acento">Faça já</p>}
                <div className="flex flex-wrap gap-1">
                  {itens.map((a) => (
                    <PinMini key={a.n} a={a} ativo={props.ativo === a.n} onAtivar={props.onAtivar} onClick={() => props.onIrPara(a.n)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PainelSintese(props: {
  sintese: Sintese | null;
  carregando: boolean;
  erro?: string;
  achados: AchadoNumerado[];
  ativo: number | null;
  onAtivar: (n: number | null) => void;
  onIrPara: (n: number) => void;
}) {
  const { sintese, carregando, erro, achados } = props;
  const reduzir = useReducedMotion();

  if (erro) {
    return (
      <p className="flex items-start gap-2 rounded-painel bg-erro-fundo p-4 text-[14px] text-erro">
        <WarningCircleIcon size={18} className="mt-0.5 shrink-0" aria-hidden />
        A priorização não pôde ser gerada: {erro}
      </p>
    );
  }

  if (!sintese) {
    return (
      <div aria-busy={carregando}>
        <p className="text-[14px] text-tinta-2">
          {carregando
            ? "Um quinto agente está cruzando os achados das quatro lentes para decidir o que corrigir primeiro."
            : "A priorização aparece quando as quatro lentes terminarem."}
        </p>
        <div className="mt-6 space-y-3">
          <div className="esqueleto h-6 w-11/12" />
          <div className="esqueleto h-6 w-8/12" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="mt-8 grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
            <div className="esqueleto h-8 w-8" />
            <div className="space-y-2.5">
              <div className="esqueleto h-4 w-2/3" />
              <div className="esqueleto h-3.5 w-full" />
              <div className="esqueleto h-3.5 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const porN = new Map(achados.map((a) => [String(a.n), a]));

  return (
    <div className="space-y-8">
      <p className="text-[16px] font-medium leading-[1.55] tracking-tight text-tinta">{sintese.veredito}</p>

      <section aria-labelledby="titulo-ordem">
        <h3 id="titulo-ordem" className="text-[15px] font-semibold">
          Corrija nesta ordem
        </h3>
        <ol className="mt-2 divide-y divide-linha">
          {sintese.prioridades.map((p, i) => {
            const relacionados = p.ids
              .map((id) => porN.get(id.replace(/\D/g, "")))
              .filter(Boolean) as AchadoNumerado[];
            const lentesEnvolvidas = LENTES.filter((l) => relacionados.some((a) => a.lente === l));
            const lentes = lentesEnvolvidas.length;
            return (
              <motion.li
                key={i}
                initial={reduzir ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 py-5"
              >
                <span className="num text-[20px] font-medium leading-none text-tinta-3">{i + 1}</span>
                <div className="min-w-0">
                  <h4 className="text-[15px] font-semibold leading-snug">{p.titulo}</h4>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-tinta-2">{p.por_que_primeiro}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-tinta-3">
                    <span className="flex flex-wrap gap-1">
                      {relacionados.map((a) => (
                        <PinMini
                          key={a.n}
                          a={a}
                          ativo={props.ativo === a.n}
                          onAtivar={props.onAtivar}
                          onClick={() => props.onIrPara(a.n)}
                        />
                      ))}
                    </span>
                    {lentes > 1 && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-tinta-2">
                        <span className="inline-flex items-center gap-0.5">
                          {lentesEnvolvidas.map((l) => (
                            <IconeLente key={l} lente={l} size={14} colorido />
                          ))}
                        </span>
                        Apontado por {lentes} de 4 lentes
                      </span>
                    )}
                    <span>
                      Impacto {ROTULO[p.impacto]}, esforço {ROTULO[p.esforco]}
                    </span>
                  </div>

                  <dl className="mt-4 space-y-3 rounded-controle bg-superficie-2 p-3.5 text-[13px] leading-relaxed">
                    <div>
                      <dt className="text-[12px] font-medium text-tinta-3">Hipótese</dt>
                      <dd className="mt-0.5 text-tinta">{p.hipotese}</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] font-medium text-tinta-3">Métrica</dt>
                      <dd className="mt-0.5 text-tinta">{p.metrica}</dd>
                    </div>
                  </dl>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="titulo-matriz">
        <h3 id="titulo-matriz" className="mb-3 text-[15px] font-semibold">
          Todos os achados por impacto e esforço
        </h3>
        <Matriz sintese={sintese} porN={porN} ativo={props.ativo} onAtivar={props.onAtivar} onIrPara={props.onIrPara} />
      </section>
    </div>
  );
}
