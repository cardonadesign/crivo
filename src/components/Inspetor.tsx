"use client";

import type { ImagemPreparada } from "@/lib/imagem";
import { LENTES_INFO } from "@/lib/lentes";
import { LENTES, type LenteId, type RespostaLente } from "@/lib/schema";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleHalfIcon,
  CopySimpleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { CardAchado } from "./CardAchado";
import { Limites } from "./Limites";
import { PainelSintese } from "./PainelSintese";
import {
  BOTAO,
  formatarSeg,
  formatarUsd,
  type Aba,
  type AchadoNumerado,
  type Atual,
  type EstadoLente,
  type EstadoSintese,
} from "./tipos";
import { corLente, IconeLente } from "./ui";

function Ajuda() {
  return (
    <div className="space-y-8 p-5 text-[14px] leading-relaxed text-tinta-2">
      <div>
        <h2 className="text-[15px] font-semibold text-tinta">Nenhuma tela aberta</h2>
        <p className="mt-1.5">Envie um print ou abra um exemplo na lista de análises.</p>
      </div>
      <ol className="space-y-3">
        {[
          "Quatro lentes revisam a tela em paralelo: usabilidade, acessibilidade, hierarquia e produto.",
          "Afirmações de contraste são medidas nos pixels reais da imagem.",
          "Um quinto agente prioriza os achados e escreve hipótese e métrica para cada prioridade.",
        ].map((t, i) => (
          <li key={i} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2">
            <span className="num text-tinta-3">{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
      <dl className="space-y-2.5 border-t border-linha pt-6 text-[13px]">
        <div className="flex items-start gap-2">
          <dt className="shrink-0 text-ok">
            <CheckCircleIcon size={16} weight="fill" aria-label="Confirmado" />
          </dt>
          <dd>Confirmado pela medição.</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="shrink-0 text-erro">
            <XCircleIcon size={16} weight="fill" aria-label="A IA errou" />
          </dt>
          <dd>A medição contradisse a IA.</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="shrink-0 text-tinta-2">
            <CircleHalfIcon size={16} aria-label="Julgamento" />
          </dt>
          <dd>Julgamento da IA, sem como medir num print.</dd>
        </div>
      </dl>
    </div>
  );
}

function Preparar(props: {
  imagem: ImagemPreparada;
  contexto: string;
  onContexto: (v: string) => void;
  onAnalisar: () => void;
}) {
  return (
    <div className="flex flex-col p-5">
      <h2 className="text-[15px] font-semibold">Pronto para analisar</h2>
      <p className="mt-1 text-[13px] text-tinta-3">
        <span className="num">
          {props.imagem.largura}×{props.imagem.altura}
        </span>{" "}
        px enviados ao modelo. A imagem fica só neste navegador.
      </p>

      <label htmlFor="contexto" className="mt-6 text-[13px] font-medium">
        Contexto da tela <span className="font-normal text-tinta-3">(opcional)</span>
      </label>
      <textarea
        id="contexto"
        value={props.contexto}
        onChange={(e) => props.onContexto(e.target.value.slice(0, 300))}
        rows={5}
        placeholder="Ex.: pagamento de um app de delivery, público de 25 a 40 anos, mobile."
        className="mt-2 w-full resize-none rounded-controle border border-linha-forte bg-superficie p-3 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-tinta-3 focus:border-acento"
      />
      <p className="num mt-1 text-right text-[12px] text-tinta-3">{props.contexto.length}/300</p>
      <p className="mt-1 text-[13px] leading-relaxed text-tinta-2">
        Produto, público e objetivo da etapa deixam as lentes mais precisas.
      </p>

      <button type="button" onClick={props.onAnalisar} className={`${BOTAO.primario} mt-6 w-full py-3`}>
        Analisar a tela
        <ArrowRightIcon size={16} aria-hidden />
      </button>
      <p className="mt-3 text-center text-[12px] text-tinta-3">Leva cerca de 1 minuto e custa cerca de US$ 0,40.</p>
    </div>
  );
}

export function Inspetor(props: {
  atual: Atual;
  imagem: ImagemPreparada | null;
  contexto: string;
  onContexto: (v: string) => void;
  onAnalisar: () => void;
  lentes: Record<LenteId, EstadoLente>;
  sintese: EstadoSintese;
  achados: AchadoNumerado[];
  aba: Aba;
  onAba: (a: Aba) => void;
  ativo: number | null;
  onAtivar: (n: number | null) => void;
  onIrPara: (n: number) => void;
  filtro: LenteId | "todas";
  onFiltro: (f: LenteId | "todas") => void;
  refs: React.RefObject<Map<number, HTMLElement>>;
  onRodarAoVivo: () => void;
  onTentarLente: (l: LenteId) => void;
  onSalvarExemplo: () => void;
}) {
  const { atual, imagem, lentes, sintese, achados, aba } = props;
  const [agora, setAgora] = useState(() => Date.now());
  const [copiado, setCopiado] = useState(false);

  const iniciada = LENTES.some((l) => lentes[l].estado !== "aguardando");
  const lentesRodando = LENTES.some((l) => lentes[l].estado === "rodando");
  const rodando = lentesRodando || sintese.estado === "rodando";

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setAgora(Date.now()), 200);
    return () => clearInterval(t);
  }, [rodando]);

  if (!imagem) return <Ajuda />;
  if (!iniciada)
    return <Preparar imagem={imagem} contexto={props.contexto} onContexto={props.onContexto} onAnalisar={props.onAnalisar} />;

  const respostas = LENTES.map((l) => lentes[l].resp).filter(Boolean) as RespostaLente[];
  const custo = respostas.reduce((s, r) => s + r.uso.custoUsd, 0) + (sintese.resp?.uso.custoUsd ?? 0);
  const tempo = Math.max(0, ...respostas.map((r) => r.uso.ms)) + (sintese.resp?.uso.ms ?? 0);
  const modelo = respostas[0]?.uso.modelo;
  const terminou = !rodando && respostas.length > 0 && sintese.estado !== "aguardando";
  const visiveis = props.filtro === "todas" ? achados : achados.filter((a) => a.lente === props.filtro);
  const comErro = LENTES.filter((l) => lentes[l].estado === "erro");

  const titulo = atual.tipo === "exemplo" ? atual.exemplo.nome : atual.tipo === "local" ? atual.nome : "Sua tela";
  const subtitulo =
    atual.tipo === "exemplo"
      ? atual.exemplo.tipo
      : atual.tipo === "local"
        ? new Date(atual.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
        : "";

  const copiarRelatorio = async () => {
    const linhas = [`# ${titulo}: revisão de interface (Crivo)`, ""];
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

  return (
    <div>
      {/* cabeçalho da análise */}
      <div className="border-b border-linha p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold tracking-tight">{titulo}</h1>
            {subtitulo && <p className="truncate text-[13px] text-tinta-3">{subtitulo}</p>}
          </div>
          {terminou && (
            <button type="button" onClick={copiarRelatorio} className={`${BOTAO.secundario} px-2.5 py-1.5 text-[13px]`}>
              {copiado ? <CheckIcon size={15} aria-hidden /> : <CopySimpleIcon size={15} aria-hidden />}
              {copiado ? "Copiado" : "Copiar relatório"}
            </button>
          )}
        </div>

        {terminou && (
          <dl className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
            <div>
              <dt className="text-tinta-3">Custo</dt>
              <dd className="num text-tinta">{formatarUsd(custo)}</dd>
            </div>
            <div>
              <dt className="text-tinta-3">Tempo</dt>
              <dd className="num text-tinta">{formatarSeg(tempo)}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-tinta-3">Modelo</dt>
              <dd className="num truncate text-tinta">{modelo}</dd>
            </div>
          </dl>
        )}

        {atual.tipo === "exemplo" && atual.salvo && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-controle bg-superficie-2 px-3 py-2 text-[12px] text-tinta-2">
            <span>
              Resultado salvo
              {atual.geradoEm ? ` em ${new Date(atual.geradoEm).toLocaleDateString("pt-BR")}` : ""}, sem custo.
            </span>
            <button
              type="button"
              onClick={props.onRodarAoVivo}
              className="inline-flex shrink-0 items-center gap-1 font-medium text-acento hover:underline"
            >
              <ArrowClockwiseIcon size={14} aria-hidden />
              Rodar ao vivo
            </button>
          </div>
        )}

        {process.env.NODE_ENV === "development" && atual.tipo === "exemplo" && !atual.salvo && terminou && (
          <button
            type="button"
            onClick={props.onSalvarExemplo}
            className="mt-3 rounded-controle border border-dashed border-tinta-3 px-3 py-1 text-xs"
          >
            [dev] salvar como exemplo
          </button>
        )}

        {/* status das lentes */}
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
          {LENTES.map((l) => {
            const s = lentes[l];
            return (
              <li key={l} className="flex min-w-0 items-center gap-2 text-[12px]">
                <IconeLente lente={l} size={15} colorido className={`shrink-0 ${s.estado === "rodando" ? "pulso" : ""}`} />
                <span className="truncate font-medium" style={{ color: corLente(l).cor }}>
                  {LENTES_INFO[l].nome.split(" ")[0]}
                </span>
                <span className="num ml-auto shrink-0 text-tinta-3">
                  {s.estado === "rodando" && formatarSeg(agora - (s.inicio ?? agora))}
                  {s.estado === "ok" && s.resp!.resultado.achados.length}
                  {s.estado === "aguardando" && "na fila"}
                  {s.estado === "erro" && (
                    <button type="button" className="font-sans font-medium text-erro underline" onClick={() => props.onTentarLente(l)}>
                      repetir
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* abas fixas no topo do painel */}
      <div role="tablist" aria-label="Resultado da análise" className="sticky top-0 z-10 flex gap-5 border-b border-linha bg-superficie px-5">
        {(
          [
            ["prioridades", "Prioridades"],
            ["achados", "Achados"],
            ["limites", "Limites"],
          ] as [Aba, string][]
        ).map(([id, rotulo]) => (
          <button
            key={id}
            role="tab"
            aria-selected={aba === id}
            type="button"
            onClick={() => props.onAba(id)}
            className={`-mb-px inline-flex items-center gap-1.5 border-b-2 py-3 text-[13px] transition-colors ${
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

      <div className="p-5">
        {aba === "prioridades" && (
          <PainelSintese
            sintese={sintese.resp?.sintese ?? null}
            carregando={sintese.estado === "rodando"}
            erro={sintese.erro}
            achados={achados}
            ativo={props.ativo}
            onAtivar={props.onAtivar}
            onIrPara={props.onIrPara}
          />
        )}

        {aba === "achados" && (
          <div>
            <div role="group" aria-label="Filtrar por lente" className="flex flex-wrap gap-1">
              {(["todas", ...LENTES] as const).map((f) => {
                const on = props.filtro === f;
                const c = f === "todas" ? null : corLente(f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => props.onFiltro(f)}
                    className={`inline-flex items-center gap-1 rounded-controle px-2 py-1 text-[12px] font-medium transition-colors ${
                      on && !c ? "bg-tinta text-fundo" : !c ? "bg-superficie-2 text-tinta-2 hover:text-tinta" : ""
                    }`}
                    style={c ? (on ? { background: c.cor, color: c.sobre } : { background: c.fundo, color: c.cor }) : undefined}
                  >
                    {f !== "todas" && <IconeLente lente={f} size={13} />}
                    {f === "todas" ? "Todas" : LENTES_INFO[f].nome.split(" ")[0]}
                  </button>
                );
              })}
            </div>

            {comErro.length > 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-controle bg-erro-fundo px-3 py-2.5 text-[13px] text-erro">
                <WarningCircleIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
                {comErro.map((l) => LENTES_INFO[l].nome).join(", ")}: {lentes[comErro[0]].erro}
              </p>
            )}

            <div className="mt-1 divide-y divide-linha">
              {visiveis.map((a) => (
                <CardAchado
                  key={a.n}
                  a={a}
                  ativo={props.ativo === a.n}
                  onAtivar={props.onAtivar}
                  ref={(el) => {
                    if (el) props.refs.current.set(a.n, el);
                    else props.refs.current.delete(a.n);
                  }}
                />
              ))}
            </div>
            {lentesRodando && (
              <div aria-hidden className="divide-y divide-linha">
                {[0, 1].map((i) => (
                  <div key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-5">
                    <div className="esqueleto h-6 w-6 rounded-full" />
                    <div className="space-y-2.5">
                      <div className="esqueleto h-4 w-2/3" />
                      <div className="esqueleto h-3.5 w-full" />
                      <div className="esqueleto h-3.5 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === "limites" && <Limites respostas={Object.fromEntries(respostas.map((r) => [r.lente, r]))} />}
      </div>
    </div>
  );
}
