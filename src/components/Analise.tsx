"use client";

import type { ImagemPreparada } from "@/lib/imagem";
import { LENTES_INFO } from "@/lib/lentes";
import { LENTES, type AnaliseSalva, type LenteId, type RespostaLente, type RespostaSintese } from "@/lib/schema";
import type { Exemplo } from "@/lib/site";
import { useEffect, useRef, useState } from "react";
import { CardAchado } from "./CardAchado";
import { Limites } from "./Limites";
import { PainelSintese } from "./PainelSintese";
import { formatarSeg, formatarUsd, type AchadoNumerado } from "./tipos";
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
    const linhas = ["# Crivo · revisão de interface", ""];
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
      linhas.push(`${a.n}. [${LENTES_INFO[a.lente].nome} · ${a.severidade}] **${a.titulo}**${v}: ${a.problema} Sugestão: ${a.sugestao}`);
    }
    await navigator.clipboard.writeText(linhas.join("\n"));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const abas: [Aba, string][] = [
    ["prioridades", "Prioridades"],
    ["achados", `Achados${achados.length ? ` (${achados.length})` : ""}`],
    ["limites", "Limites"],
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={props.onVoltar}
            className="shrink-0 rounded-full border border-linha-forte px-3 py-1.5 text-[13px] text-tinta-2 hover:border-tinta hover:text-tinta"
          >
            ← Nova análise
          </button>
          <h2 className="truncate text-[15px] font-medium">
            {origem?.tipo === "exemplo" ? `${origem.exemplo.nome} · ${origem.exemplo.tipo}` : "Sua tela"}
          </h2>
        </div>
        {terminou && (
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-tinta-3">
            <span className="font-mono" title="Custo e tempo desta análise">
              {formatarUsd(custo)} · {formatarSeg(tempo)} · {modelo}
            </span>
            <button
              type="button"
              onClick={copiarRelatorio}
              className="rounded-full border border-linha-forte px-3 py-1.5 text-tinta-2 hover:border-tinta hover:text-tinta"
            >
              {copiado ? "Copiado ✓" : "Copiar relatório"}
            </button>
          </div>
        )}
      </div>

      {origem?.tipo === "exemplo" && origem.salvo && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-linha bg-cartao px-4 py-3 text-[13px] text-tinta-2">
          <span>
            Resultado salvo de uma execução real
            {origem.geradoEm ? ` em ${new Date(origem.geradoEm).toLocaleDateString("pt-BR")}` : ""}, para abrir na hora e sem
            custo.
          </span>
          <button
            type="button"
            onClick={props.onRodarAoVivo}
            className="rounded-full bg-tinta px-4 py-1.5 font-medium text-white hover:bg-black"
          >
            Rodar ao vivo ↻
          </button>
        </div>
      )}

      {process.env.NODE_ENV === "development" && origem?.tipo === "exemplo" && !origem.salvo && terminou && (
        <button type="button" onClick={salvarExemplo} className="mt-3 rounded border border-dashed border-tinta-3 px-3 py-1 text-xs">
          [dev] salvar como exemplo
        </button>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {LENTES.map((l) => {
          const s = lentes[l];
          const info = LENTES_INFO[l];
          return (
            <div key={l} className="flex items-center gap-2.5 rounded-lg border border-linha bg-cartao px-3 py-2.5">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.estado === "rodando" ? "pulso" : ""}`}
                style={{ background: info.cor }}
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{info.nome}</p>
                <p className="truncate font-mono text-[11px] text-tinta-3">
                  {s.estado === "rodando" && `analisando… ${formatarSeg(agora - (s.inicio ?? agora))}`}
                  {s.estado === "ok" && `${s.resp!.resultado.achados.length} achados · ${formatarSeg(s.resp!.uso.ms)}`}
                  {s.estado === "aguardando" && "na fila"}
                  {s.estado === "erro" && (
                    <button type="button" className="text-acento-texto underline" onClick={() => props.onTentarLente(l)}>
                      falhou · tentar de novo
                    </button>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Visor
            src={imagem.src}
            largura={imagem.largura}
            altura={imagem.altura}
            achados={visiveis}
            ativo={ativo}
            analisando={lentesRodando}
            onAtivar={setAtivo}
            onSelecionar={irPara}
          />
          {medidos.length > 0 && (
            <p className="mt-3 text-[13px] leading-relaxed text-tinta-2">
              <span className="font-medium text-tinta">Verificação por pixel:</span> {medidos.length}{" "}
              {medidos.length === 1 ? "afirmação de contraste medida" : "afirmações de contraste medidas"}.{" "}
              <span className="text-ok">
                {confirmados} confirmada{confirmados === 1 ? "" : "s"}
              </span>
              {contestados > 0 && (
                <>
                  ,{" "}
                  <span className="text-alerta">
                    {contestados} contestada{contestados === 1 ? "" : "s"}
                  </span>
                </>
              )}
              .
            </p>
          )}
        </div>

        <div className="min-w-0">
          <div role="tablist" className="flex gap-1 border-b border-linha">
            {abas.map(([id, rotulo]) => (
              <button
                key={id}
                role="tab"
                aria-selected={aba === id}
                type="button"
                onClick={() => props.onAba(id)}
                className={`-mb-px border-b-2 px-3 py-2 text-[14px] transition-colors ${
                  aba === id ? "border-tinta font-medium text-tinta" : "border-transparent text-tinta-3 hover:text-tinta"
                }`}
              >
                {rotulo}
                {id === "prioridades" && sintese.estado === "rodando" && (
                  <span className="pulso ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-acento align-middle" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-5">
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
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(["todas", ...LENTES] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFiltro(f)}
                      className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                        filtro === f ? "border-tinta bg-tinta text-white" : "border-linha-forte text-tinta-2 hover:border-tinta"
                      }`}
                    >
                      {f === "todas" ? "Todas" : LENTES_INFO[f].nome}
                    </button>
                  ))}
                </div>
                {visiveis.length === 0 && lentesRodando && (
                  <p className="pulso py-6 text-sm text-tinta-3">
                    As lentes estão olhando a tela. Os achados aparecem aqui conforme cada uma termina.
                  </p>
                )}
                {comErro.length > 0 && (
                  <p className="rounded-lg bg-alerta-fundo px-3 py-2 text-[13px] text-alerta">
                    {comErro.map((l) => LENTES_INFO[l].nome).join(", ")}: {lentes[comErro[0]].erro}
                  </p>
                )}
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
            )}

            {aba === "limites" && <Limites respostas={Object.fromEntries(respostas.map((r) => [r.lente, r]))} />}
          </div>
        </div>
      </div>
    </div>
  );
}
