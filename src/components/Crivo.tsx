"use client";

import { verificar } from "@/lib/contraste";
import { lerHistorico, removerDoHistorico, salvarNoHistorico, type AnaliseLocal } from "@/lib/historico";
import { arquivoParaDataUrl, prepararImagem, type ImagemPreparada } from "@/lib/imagem";
import { LENTES_INFO } from "@/lib/lentes";
import { LENTES, type AnaliseSalva, type LenteId, type RespostaLente, type RespostaSintese } from "@/lib/schema";
import { EXEMPLOS, type Exemplo } from "@/lib/site";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarraApp } from "./BarraApp";
import { Canvas } from "./Canvas";
import { Inspetor } from "./Inspetor";
import { ListaAnalises } from "./ListaAnalises";
import { PESO_SEVERIDADE, type Aba, type AchadoNumerado, type Atual, type EstadoLente, type EstadoSintese } from "./tipos";

const lentesVazias = (): Record<LenteId, EstadoLente> =>
  Object.fromEntries(LENTES.map((l) => [l, { estado: "aguardando" }])) as Record<LenteId, EstadoLente>;

const lentesDe = (salvas: Partial<Record<LenteId, RespostaLente>>) => {
  const est = lentesVazias();
  for (const l of LENTES) if (salvas[l]) est[l] = { estado: "ok", resp: salvas[l] };
  return est;
};

async function postJson<T>(url: string, corpo: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const dados = await r.json().catch(() => ({ erro: "Resposta inválida do servidor." }));
  if (!r.ok) throw new Error(dados.erro ?? `Erro ${r.status}`);
  return dados as T;
}

export function Crivo() {
  const [atual, setAtual] = useState<Atual>({ tipo: "vazio" });
  const [imagem, setImagem] = useState<ImagemPreparada | null>(null);
  const [contexto, setContexto] = useState("");
  const [lentes, setLentes] = useState(lentesVazias);
  const [sintese, setSintese] = useState<EstadoSintese>({ estado: "aguardando" });
  const [aba, setAba] = useState<Aba>("prioridades");
  const [abaManual, setAbaManual] = useState(false);
  const [ativo, setAtivo] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<LenteId | "todas">("todas");
  const [historico, setHistorico] = useState<AnaliseLocal[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [arrastando, setArrastando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const execucao = useRef(0);
  const refs = useRef(new Map<number, HTMLElement>());
  const nomeArquivo = useRef("Print colado");

  // Achados numerados + verificação por pixel
  const achados: AchadoNumerado[] = useMemo(() => {
    const lista: AchadoNumerado[] = [];
    let n = 1;
    for (const l of LENTES) {
      const r = lentes[l].resp?.resultado;
      if (!r) continue;
      const ordenados = [...r.achados].sort((a, b) => PESO_SEVERIDADE[a.severidade] - PESO_SEVERIDADE[b.severidade]);
      for (const a of ordenados) lista.push({ ...a, n: n++, lente: l, verificacao: verificar(a, imagem?.canvas ?? null) });
    }
    return lista;
  }, [lentes, imagem]);

  const limparVista = () => {
    setAtivo(null);
    setFiltro("todas");
    setAbaManual(false);
    setMenuAberto(false);
    setErro(null);
  };

  // ---------- abrir ----------
  const abrirExemplo = useCallback(async (ex: Exemplo) => {
    const id = ++execucao.current;
    limparVista();
    setCarregando(true);
    try {
      const [img, salvo] = await Promise.all([
        prepararImagem(`/samples/${ex.id}.png`),
        fetch(`/samples/${ex.id}.json`).then((r) => (r.ok ? (r.json() as Promise<AnaliseSalva>) : null)),
      ]);
      if (execucao.current !== id) return;
      setImagem(img);
      setContexto(ex.contexto);
      setLentes(salvo ? lentesDe(salvo.lentes) : lentesVazias());
      setSintese(salvo?.sintese ? { estado: "ok", resp: salvo.sintese } : { estado: "aguardando" });
      setAtual({ tipo: "exemplo", exemplo: ex, geradoEm: salvo?.geradoEm, salvo: !!salvo });
      setAba("prioridades");
      history.replaceState(null, "", `?exemplo=${ex.id}`);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      if (execucao.current === id) setCarregando(false);
    }
  }, []);

  const abrirLocal = useCallback(async (a: AnaliseLocal) => {
    const id = ++execucao.current;
    limparVista();
    setCarregando(true);
    try {
      const img = await prepararImagem(a.imagem.src);
      if (execucao.current !== id) return;
      setImagem(img);
      setContexto(a.contexto);
      setLentes(lentesDe(a.lentes));
      setSintese(a.sintese ? { estado: "ok", resp: a.sintese } : { estado: "aguardando" });
      setAtual({ tipo: "local", id: a.id, nome: a.nome, criadoEm: a.criadoEm });
      setAba(a.sintese ? "prioridades" : "achados");
      history.replaceState(null, "", "/");
    } finally {
      if (execucao.current === id) setCarregando(false);
    }
  }, []);

  const novaAnalise = useCallback(() => {
    execucao.current++;
    limparVista();
    setImagem(null);
    setContexto("");
    setLentes(lentesVazias());
    setSintese({ estado: "aguardando" });
    setAtual({ tipo: "vazio" });
    setCarregando(false);
    history.replaceState(null, "", "/");
  }, []);

  // Primeira visita: abre um exemplo (ou o indicado na URL), como um arquivo de demonstração.
  useEffect(() => {
    setHistorico(lerHistorico());
    const pedido = new URLSearchParams(location.search).get("exemplo");
    abrirExemplo(EXEMPLOS.find((e) => e.id === pedido) ?? EXEMPLOS[0]);
  }, [abrirExemplo]);

  const receberArquivo = useCallback(async (arquivo: File | undefined | null) => {
    setErro(null);
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) return setErro("Envie uma imagem (PNG, JPG ou WebP).");
    if (arquivo.size > 15 * 1024 * 1024) return setErro("Imagem muito grande. O limite é 15 MB.");
    try {
      const img = await prepararImagem(await arquivoParaDataUrl(arquivo));
      execucao.current++;
      limparVista();
      nomeArquivo.current = arquivo.name ? arquivo.name.replace(/\.[a-z0-9]+$/i, "") : "Print colado";
      setImagem(img);
      setContexto("");
      setLentes(lentesVazias());
      setSintese({ estado: "aguardando" });
      setAtual({ tipo: "vazio" });
      setCarregando(false);
      history.replaceState(null, "", "/");
    } catch (e) {
      setErro((e as Error).message);
    }
  }, []);

  // Colar com Ctrl+V em qualquer lugar (menos dentro do campo de texto).
  useEffect(() => {
    const colar = (ev: ClipboardEvent) => {
      if ((ev.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const item = [...(ev.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (item) receberArquivo(item.getAsFile());
    };
    window.addEventListener("paste", colar);
    return () => window.removeEventListener("paste", colar);
  }, [receberArquivo]);

  // ---------- executar ----------
  const rodarLente = useCallback(async (l: LenteId, img: ImagemPreparada, ctx: string, id: number) => {
    setLentes((s) => ({ ...s, [l]: { estado: "rodando", inicio: Date.now() } }));
    try {
      const resp = await postJson<RespostaLente>("/api/critique", {
        lente: l,
        imagem: img.base64,
        mediaType: img.mediaType,
        largura: img.largura,
        altura: img.altura,
        contexto: ctx || undefined,
      });
      if (execucao.current === id) setLentes((s) => ({ ...s, [l]: { estado: "ok", resp } }));
    } catch (e) {
      if (execucao.current === id) setLentes((s) => ({ ...s, [l]: { estado: "erro", erro: (e as Error).message } }));
    }
  }, []);

  const analisar = useCallback(() => {
    if (!imagem) return;
    const id = ++execucao.current;
    setLentes(lentesVazias());
    setSintese({ estado: "aguardando" });
    setAba("achados");
    setAbaManual(false);
    setFiltro("todas");
    if (atual.tipo === "vazio") {
      setAtual({
        tipo: "local",
        id: `a${Date.now().toString(36)}`,
        nome: contexto.trim() ? contexto.trim().split(/[,.]/)[0].slice(0, 40) : nomeArquivo.current,
        criadoEm: new Date().toISOString(),
      });
    } else if (atual.tipo === "exemplo") {
      setAtual({ ...atual, salvo: false });
    }
    LENTES.forEach((l) => rodarLente(l, imagem, contexto, id));
  }, [imagem, contexto, atual, rodarLente]);

  // Quando as quatro lentes terminam, o agente de síntese entra.
  useEffect(() => {
    if (!imagem || sintese.estado !== "aguardando") return;
    if (LENTES.some((l) => lentes[l].estado === "rodando" || lentes[l].estado === "aguardando")) return;
    if (achados.length === 0) return;
    const id = execucao.current;
    setSintese({ estado: "rodando" });
    postJson<RespostaSintese>("/api/synthesize", {
      achados: achados.map((a) => ({
        id: String(a.n),
        lente: LENTES_INFO[a.lente].nome,
        titulo: a.titulo,
        problema: a.problema,
        severidade: a.severidade,
        confianca: a.confianca,
        verificacao: a.verificacao.status,
      })),
    })
      .then((resp) => execucao.current === id && setSintese({ estado: "ok", resp }))
      .catch((e) => execucao.current === id && setSintese({ estado: "erro", erro: (e as Error).message }));
  }, [imagem, lentes, sintese.estado, achados]);

  useEffect(() => {
    if (sintese.estado === "ok" && !abaManual) setAba("prioridades");
  }, [sintese.estado, abaManual]);

  // Análise própria concluída: entra no histórico deste navegador.
  useEffect(() => {
    if (atual.tipo !== "local" || !imagem || (sintese.estado !== "ok" && sintese.estado !== "erro")) return;
    const respostas = Object.fromEntries(LENTES.filter((l) => lentes[l].resp).map((l) => [l, lentes[l].resp!]));
    setHistorico(
      salvarNoHistorico({
        id: atual.id,
        nome: atual.nome,
        criadoEm: atual.criadoEm,
        contexto,
        imagem: { src: `data:${imagem.mediaType};base64,${imagem.base64}`, largura: imagem.largura, altura: imagem.altura },
        lentes: respostas,
        sintese: sintese.resp ?? null,
      }),
    );
  }, [atual, imagem, lentes, sintese, contexto]);

  const irPara = (n: number) => {
    setAba("achados");
    setAbaManual(true);
    setFiltro("todas");
    setAtivo(n);
    setTimeout(() => refs.current.get(n)?.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
  };

  const salvarExemplo = async () => {
    if (atual.tipo !== "exemplo" || !imagem) return;
    const analise: AnaliseSalva = {
      imagem: { src: `/samples/${atual.exemplo.id}.png`, largura: imagem.largura, altura: imagem.altura },
      lentes: Object.fromEntries(LENTES.filter((l) => lentes[l].resp).map((l) => [l, lentes[l].resp!])),
      sintese: sintese.resp ?? null,
      geradoEm: new Date().toISOString(),
    };
    await postJson("/api/dev/salvar", { id: atual.exemplo.id, analise }).catch(() => {});
  };

  const visiveis = filtro === "todas" ? achados : achados.filter((a) => a.lente === filtro);

  const lista = (
    <ListaAnalises
      atual={atual}
      historico={historico}
      onExemplo={abrirExemplo}
      onLocal={abrirLocal}
      onRemover={(id) => {
        setHistorico(removerDoHistorico(id));
        if (atual.tipo === "local" && atual.id === id) novaAnalise();
      }}
    />
  );

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col lg:h-[100dvh] lg:overflow-hidden"
      onDragOver={(e) => {
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setArrastando(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        receberArquivo(e.dataTransfer.files?.[0]);
      }}
    >
      <BarraApp onNova={novaAnalise} menuAberto={menuAberto} onMenu={setMenuAberto} />

      {menuAberto && (
        <div className="absolute inset-x-0 top-12 z-40 max-h-[70dvh] overflow-y-auto border-b border-linha bg-superficie shadow-painel lg:hidden">
          {lista}
        </div>
      )}

      {arrastando && (
        <div className="pointer-events-none absolute inset-2 z-50 grid place-items-center rounded-painel border-2 border-dashed border-acento bg-fundo/85 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-[16px] font-medium text-acento">
            <UploadSimpleIcon size={20} aria-hidden />
            Solte para analisar
          </p>
        </div>
      )}

      <main
        id="conteudo"
        className="flex-1 lg:grid lg:min-h-0 lg:grid-cols-[240px_minmax(0,1fr)_minmax(360px,420px)] xl:grid-cols-[256px_minmax(0,1fr)_440px]"
      >
        <aside className="hidden border-r border-linha bg-superficie lg:block lg:overflow-y-auto">{lista}</aside>

        <section aria-label="Tela" className="bg-fundo lg:min-h-0 lg:overflow-y-auto">
          <Canvas
            imagem={imagem}
            achados={visiveis}
            ativo={ativo}
            onAtivar={setAtivo}
            onSelecionar={irPara}
            erro={erro}
            onArquivo={receberArquivo}
            carregando={carregando}
          />
        </section>

        <aside aria-label="Inspetor" className="border-t border-linha bg-superficie lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <Inspetor
            atual={atual}
            imagem={carregando ? null : imagem}
            contexto={contexto}
            onContexto={setContexto}
            onAnalisar={analisar}
            lentes={lentes}
            sintese={sintese}
            achados={achados}
            aba={aba}
            onAba={(a) => {
              setAba(a);
              setAbaManual(true);
            }}
            ativo={ativo}
            onAtivar={setAtivo}
            onIrPara={irPara}
            filtro={filtro}
            onFiltro={setFiltro}
            refs={refs}
            onRodarAoVivo={analisar}
            onTentarLente={(l) => imagem && rodarLente(l, imagem, contexto, execucao.current)}
            onSalvarExemplo={salvarExemplo}
          />
        </aside>
      </main>
    </div>
  );
}
