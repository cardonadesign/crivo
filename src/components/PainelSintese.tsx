"use client";

import { LENTES_INFO } from "@/lib/lentes";
import type { Sintese } from "@/lib/schema";
import type { AchadoNumerado } from "./tipos";

const NIVEL = { baixo: 0, medio: 1, alto: 2 } as const;
const ROTULO = { baixo: "baixo", medio: "médio", alto: "alto" } as const;

function Matriz({
  sintese,
  achados,
  ativo,
  onAtivar,
}: {
  sintese: Sintese;
  achados: AchadoNumerado[];
  ativo: number | null;
  onAtivar: (n: number | null) => void;
}) {
  const porN = new Map(achados.map((a) => [String(a.n), a]));
  // células: linha = impacto (alto em cima), coluna = esforço (baixo à esquerda)
  const celulas: AchadoNumerado[][][] = [0, 1, 2].map(() => [[], [], []]);
  for (const m of sintese.matriz) {
    const a = porN.get(m.id.replace(/\D/g, ""));
    if (!a) continue;
    celulas[2 - NIVEL[m.impacto]][NIVEL[m.esforco]].push(a);
  }
  const quadrante = (l: number, c: number) =>
    l === 0 && c === 0 ? "Faça já" : l === 0 && c === 2 ? "Planeje" : l === 2 && c === 2 ? "Evite" : "";

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex w-5 shrink-0 items-center justify-center self-stretch">
          <span className="-rotate-90 whitespace-nowrap text-[11px] uppercase tracking-wider text-tinta-3">
            Impacto →
          </span>
        </div>
        <div className="grid flex-1 grid-cols-3 grid-rows-3 gap-1">
          {celulas.map((linha, l) =>
            linha.map((itens, c) => (
              <div
                key={`${l}-${c}`}
                className={`relative min-h-[64px] rounded-md border p-1.5 ${
                  l === 0 && c === 0 ? "border-acento/40 bg-[#FFF3EC]" : "border-linha bg-cartao"
                }`}
              >
                {quadrante(l, c) && (
                  <span className="absolute right-1.5 top-1 text-[10px] uppercase tracking-wider text-tinta-3">
                    {quadrante(l, c)}
                  </span>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {itens.map((a) => (
                    <button
                      key={a.n}
                      type="button"
                      onMouseEnter={() => onAtivar(a.n)}
                      onMouseLeave={() => onAtivar(null)}
                      aria-label={`Achado ${a.n}: ${a.titulo}`}
                      className="grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] font-semibold text-white transition-transform"
                      style={{
                        background: LENTES_INFO[a.lente].cor,
                        transform: ativo === a.n ? "scale(1.25)" : undefined,
                        opacity: a.verificacao.status === "nao_confirmado" ? 0.4 : 1,
                      }}
                    >
                      {a.n}
                    </button>
                  ))}
                </div>
              </div>
            )),
          )}
        </div>
      </div>
      <div className="ml-7 mt-1 text-center text-[11px] uppercase tracking-wider text-tinta-3">Esforço →</div>
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

  if (erro) {
    return <p className="rounded-xl border border-linha bg-cartao p-4 text-sm text-tinta-2">Síntese indisponível: {erro}</p>;
  }
  if (!sintese) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-tinta-3">
          {carregando
            ? "Um quinto agente está cruzando os achados das quatro lentes para decidir o que corrigir primeiro…"
            : "A priorização aparece quando as quatro lentes terminarem."}
        </p>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-28 rounded-xl border border-linha bg-cartao ${carregando ? "pulso" : ""}`} />
        ))}
      </div>
    );
  }

  const porN = new Map(achados.map((a) => [String(a.n), a]));

  return (
    <div className="space-y-6">
      <section className="surgir">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-tinta-3">Veredito</h3>
        <p className="titulo-serif mt-1 text-[26px] leading-[1.15] text-tinta">{sintese.veredito}</p>
      </section>

      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-tinta-3">Corrija nesta ordem</h3>
        <ol className="mt-2 space-y-3">
          {sintese.prioridades.map((p, i) => {
            const relacionados = p.ids.map((id) => porN.get(id.replace(/\D/g, ""))).filter(Boolean) as AchadoNumerado[];
            const lentes = new Set(relacionados.map((a) => a.lente));
            return (
              <li key={i} className="surgir rounded-xl border border-linha bg-cartao p-4" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start gap-3">
                  <span className="titulo-serif text-[34px] leading-none text-acento">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-semibold leading-snug">{p.titulo}</h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-tinta-2">{p.por_que_primeiro}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                      {relacionados.map((a) => (
                        <button
                          key={a.n}
                          type="button"
                          onMouseEnter={() => props.onAtivar(a.n)}
                          onMouseLeave={() => props.onAtivar(null)}
                          onClick={() => props.onIrPara(a.n)}
                          className="grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                          style={{ background: LENTES_INFO[a.lente].cor }}
                          aria-label={`Ver achado ${a.n}`}
                        >
                          {a.n}
                        </button>
                      ))}
                      {lentes.size > 1 && (
                        <span className="rounded-full bg-[#FFF3EC] px-2 py-0.5 font-medium text-acento-texto">
                          apontado por {lentes.size} de 4 lentes
                        </span>
                      )}
                      <span className="text-tinta-3">
                        impacto {ROTULO[p.impacto]} · esforço {ROTULO[p.esforco]}
                      </span>
                    </div>
                    <div className="mt-3 rounded-lg bg-papel p-3">
                      <p className="text-[13px] leading-relaxed">
                        <span className="font-medium">Hipótese: </span>
                        <span className="text-tinta-2">{p.hipotese}</span>
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed">
                        <span className="font-medium">Métrica: </span>
                        <span className="text-tinta-2">{p.metrica}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-tinta-3">Impacto × esforço, todos os achados</h3>
        <Matriz sintese={sintese} achados={achados} ativo={props.ativo} onAtivar={props.onAtivar} />
      </section>
    </div>
  );
}
