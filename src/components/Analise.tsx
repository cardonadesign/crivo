"use client";

import type { ImagemPreparada } from "@/lib/imagem";
import { LENTES_INFO } from "@/lib/lentes";
import { LENTES, type AnaliseSalva, type LenteId, type RespostaLente, type RespostaSintese } from "@/lib/schema";
import type { Exemplo } from "@/lib/site";
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  CheckIcon,
  CopySimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { CardAchado } from "./CardAchado";
import { Limites } from "./Limites";
import { PainelSintese } from "./PainelSintese";
import { BOTAO, formatarSeg, formatarUsd, type AchadoNumerado } from "./tipos";
import { IconeLente } from "./ui";
import { Visor } from "./Visor";

export type EstadoLente = {
  estado: "aguardando" | "rodando" | "ok" | "erro";
  resp?: RespostaLente;
  erro?: string;
  inicio?: number;
};
export type EstadoSintese = { estado: "aguardando" | "rodando" | "ok" | "erro"; resp?: RespostaSintese; erro?: string };
export type Origem = { tipo: "exemplo"; exemplo: Exemplo; geradoEm?: string; salvo: boolean } | { tipo: "upload" };
export type Aba = "prioridades" | "achados" | "limites";

function EsqueletoAchados() {
  return (
    <div aria-hidden className="divide-y divide-linha">
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-5">
          <div className="esqueleto h-6 w-6 rounded-full" />
          <div className="space-y-2.5">
            <div className="esqueleto h-4 w-1/2" />
            <div className="esqueleto h-3 w-1/3" />
            <div className="esqueleto h-3.5 w-full" />
            <div className="esqueleto h-3.5 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Analise(props: {
  imagem: ImagemPreparada;
  lentes: Record<LenteId, EstadoLente>;
  sintese: EstadoSintese;
  achados: AchadoNumerado[];
  origem: Origem | null;
  aba: Aba;
  onAba: (a: Aba) => void;
  onVoltar: () => void;
  onRodarAoVivo: () => void;
  onTentarLente: (l: LenteId) => void;
}) {
  const { imagem, lentes, sintese, achados, origem, aba } = props;
  const [ativo, setAtivo] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<LenteId | "todas">("todas");
  const [agora, setAgora] = useState(() => Date.now());
  const [copiado, setCopiado] = useState(false);
  const refs = useRef(new Map<number, HTMLElement>());

  const lentesRodando = LENTES.some((l) => lentes[l].estado === "rodando");
  const rodando = lentesRodando || sintese.estado === "rodando";

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setAgora(Date.now()), 200);
    return () => clearInterval(t);
  }, [rodando]);

  const respostas = LENTES.map((l) => lentes[l].resp).filter(Boolean) as RespostaLente[];
  const custo = respostas.reduce((s, r) => s + r.uso.custoUsd, 0) + (sintese.resp?.uso.custoUsd ?? 0);
  const tempo = Math.max(0, ...respostas.map((r) => r.uso.ms)) + (sintese.resp?.uso.ms ?? 0);
  const modelo = respostas[0]?.uso.modelo;
  const terminou = !rodando && respostas.length > 0 && sintese.estado !== "aguardando";

  const medidos = achados.filter((a) => a.verificacao.status === "confirmado" || a.verificacao.status === "nao_confirmado");
  const confirmados = medidos.filter((a) => a.verificacao.status === "confirmado").length;
  const contestados = medidos.length - confirmados;
  const visiveis = filtro === "todas" ? achados : achados.filter((a) => a.lente === filtro);
  const comErro = LENTES.filter((l) => lentes[l].estado === "erro");

  const irPara = (n: number) => {
    props.onAba("achados");
    setFiltro("todas");
    setAtivo(n);
    setTimeout(() => refs.current.get(n)?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
  };

  const salvarExemplo = async () => {
    if (origem?.tipo !== "exemplo") return;
    const analise: AnaliseSalva = {
      imagem: { src: `/samples/${origem.exemplo.id}.png`, largura: imagem.largura, altura: imagem.altura },
      lentes: Object.fromEntries(respostas.map((r) => [r.lente, r])),
      sintese: sintese.resp ?? null,
      geradoEm: new Date().toISOString(),
    };
    const r = await fetch("/api/dev/salvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: origem.exemplo.id, analise }),
    });
    console.info(r.ok ? "Exemplo salvo." : "Falha ao salvar.");
  };

  const copiarRelatorio = async () => {
    const linhas = ["# Crivo, revisão de interface", ""];
    if (sintese.resp) {
      const s = sintese.resp.sintese;
      linhas.push(`**Veredito:** ${s.veredito}`, "", "## Corrija nesta ordem");
      s.prioridades.forEach((p, i) =>
        linhas.push(`${i + 1}. **${p.titulo}**: ${p.por_que_primeiro}`, `   - Hipótese: ${p.hipotese}`, `   - Métrica: ${p.metrica}`),
      );
      linhas.push("");
    }
    linhas.push("## Achados");
    for (const a of achados) {
      const v =
        a.verificacao.status === "confirmado"
          ? " (contraste confirmado por medição)"
          : a.verificacao.status === "nao_confirmado"
            ? " (contraste não confirmado pela medição)"
            : "";
      linhas.push(`${a.n}. [${LENTES_INFO[a.lente].nome}, ${a.severidade}] **${a.titulo}**${v}: ${a.problema} Sugestão: ${a.sugestao}`);
    }
    await navigator.clipboard.writeText(linhas.join("\n"));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const abas: [Aba, string][] = [
    ["prioridades", "Prioridades"],
    ["achados", "Achados"],
    ["limites", "Limites"],
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6">
      {/* barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={props.onVoltar} className={BOTAO.secundario} aria-label="Voltar e fazer nova análise">
            <ArrowLeftIcon size={16} aria-hidden />
            Nova análise
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold tracking-tight">
              {origem?.tipo === "exemplo" ? origem.exemplo.nome : "Sua tela"}
            </h1>
            {origem?.tipo === "exemplo" && <p className="truncate text-[13px] text-tinta-3">{origem.exemplo.tipo}</p>}
          </div>
        </div>

        {terminou && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <dl className="flex gap-x-5 text-[12px]">
              <div>
                <dt className="text-tinta-3">Custo</dt>
                <dd className="num text-tinta">{formatarUsd(custo)}</dd>
              </div>
              <div>
                <dt className="text-tinta-3">Tempo</dt>
                <dd className="num text-tinta">{formatarSeg(tempo)}</dd>
              </div>
              <div>
                <dt className="text-tinta-3">Modelo</dt>
                <dd className="num text-tinta">{modelo}</dd>
              </div>
            </dl>
            <button type="button" onClick={copiarRelatorio} className={BOTAO.secundario}>
              {copiado ? <CheckIcon size={16} aria-hidden /> : <CopySimpleIcon size={16} aria-hidden />}
              {copiado ? "Copiado" : "Copiar relatório"}
            </button>
          </div>
        )}
      </div>

      {origem?.tipo === "exemplo" && origem.salvo && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-painel border border-linha bg-superficie px-4 py-3 text-[14px] text-tinta-2">
          <p>
            Resultado salvo de uma execução real
            {origem.geradoEm ? ` em ${new Date(origem.geradoEm).toLocaleDateString("pt-BR")}` : ""}. Abre na hora e sem custo.
          </p>
          <button type="button" onClick={props.onRodarAoVivo} className={BOTAO.primario}>
            <ArrowClockwiseIcon size={16} aria-hidden />
            Rodar ao vivo
          </button>
        </div>
      )}

      {process.env.NODE_ENV === "development" && origem?.tipo === "exemplo" && !origem.salvo && terminou && (
        <button type="button" onClick={salvarExemplo} className="mt-3 rounded-controle border border-dashed border-tinta-3 px-3 py-1 text-xs">
          [dev] salvar como exemplo
        </button>
      )}

      {/* status das lentes: uma faixa, divisórias finas */}
      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-painel border border-linha bg-superficie lg:grid-cols-4">
        {LENTES.map((l, i) => {
          const s = lentes[l];
          return (
            <div
              key={l}
              className={`flex items-center gap-3 px-4 py-3 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${
                i === 2 ? "lg:border-l" : ""
              } border-linha`}
            >
              <IconeLente lente={l} size={18} className={s.estado === "rodando" ? "pulso text-acento" : "text-tinta-2"} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{LENTES_INFO[l].nome}</p>
                <p className="num truncate text-[12px] text-tinta-3">
                  {s.estado === "rodando" && `analisando ${formatarSeg(agora - (s.inicio ?? agora))}`}
                  {s.estado === "ok" && `${s.resp!.resultado.achados.length} achados em ${formatarSeg(s.resp!.uso.ms)}`}
                  {s.estado === "aguardando" && "na fila"}
                  {s.estado === "erro" && (
                    <button
                      type="button"
                      className="font-sans font-medium text-erro underline underline-offset-2"
                      onClick={() => props.onTentarLente(l)}
                    >
                      Falhou. Tentar de novo
                    </button>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Visor
            src={imagem.src}
            largura={imagem.largura}
            altura={imagem.altura}
            achados={visiveis}
            ativo={ativo}
            onAtivar={setAtivo}
            onSelecionar={irPara}
          />
          {medidos.length > 0 && (
            <p className="mt-3 text-[13px] leading-relaxed text-tinta-2">
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

        <div className="min-w-0">
          <div role="tablist" aria-label="Resultado da análise" className="flex gap-6 border-b border-linha">
            {abas.map(([id, rotulo]) => (
              <button
                key={id}
                role="tab"
                aria-selected={aba === id}
                type="button"
                onClick={() => props.onAba(id)}
                className={`-mb-px inline-flex items-center gap-1.5 border-b-2 pb-2.5 text-[14px] transition-colors ${
                  aba === id ? "border-tinta font-medium text-tinta" : "border-transparent text-tinta-3 hover:text-tinta"
                }`}
              >
                {rotulo}
                {id === "achados" && achados.length > 0 && <span className="num text-[12px] text-tinta-3">{achados.length}</span>}
                {id === "prioridades" && sintese.estado === "rodando" && (
                  <span className="pulso h-1.5 w-1.5 rounded-full bg-acento" aria-label="gerando" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-6">
            {aba === "prioridades" && (
              <PainelSintese
                sintese={sintese.resp?.sintese ?? null}
                carregando={sintese.estado === "rodando"}
                erro={sintese.erro}
                achados={achados}
                ativo={ativo}
                onAtivar={setAtivo}
                onIrPara={irPara}
              />
            )}

            {aba === "achados" && (
              <div>
                <div role="group" aria-label="Filtrar por lente" className="inline-flex max-w-full flex-wrap rounded-controle bg-superficie-2 p-0.5">
                  {(["todas", ...LENTES] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={filtro === f}
                      onClick={() => setFiltro(f)}
                      className={`inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-[13px] transition-colors ${
                        filtro === f ? "bg-superficie font-medium text-tinta shadow-painel" : "text-tinta-2 hover:text-tinta"
                      }`}
                    >
                      {f !== "todas" && <IconeLente lente={f} size={14} />}
                      {f === "todas" ? "Todas" : LENTES_INFO[f].nome.split(" ")[0]}
                    </button>
                  ))}
                </div>

                {comErro.length > 0 && (
                  <p className="mt-4 flex items-start gap-2 rounded-painel bg-erro-fundo px-3 py-2.5 text-[13px] text-erro">
                    <WarningCircleIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
                    {comErro.map((l) => LENTES_INFO[l].nome).join(", ")}: {lentes[comErro[0]].erro}
                  </p>
                )}

                <div className="mt-2 divide-y divide-linha">
                  {visiveis.map((a) => (
                    <CardAchado
                      key={a.n}
                      a={a}
                      ativo={ativo === a.n}
                      onAtivar={setAtivo}
                      ref={(el) => {
                        if (el) refs.current.set(a.n, el);
                        else refs.current.delete(a.n);
                      }}
                    />
                  ))}
                </div>
                {lentesRodando && <EsqueletoAchados />}
              </div>
            )}

            {aba === "limites" && <Limites respostas={Object.fromEntries(respostas.map((r) => [r.lente, r]))} />}
          </div>
        </div>
      </div>
    </div>
  );
}
