"use client";

import { verificar } from "@/lib/contraste";
import { arquivoParaDataUrl, prepararImagem, type ImagemPreparada } from "@/lib/imagem";
import { LENTES_INFO } from "@/lib/lentes";
import { LENTES, type AnaliseSalva, type LenteId, type RespostaLente, type RespostaSintese } from "@/lib/schema";
import type { Exemplo } from "@/lib/site";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Analise, type Aba, type EstadoLente, type EstadoSintese, type Origem } from "./Analise";
import { Inicio } from "./Inicio";
import { Preparar } from "./Preparar";
import { PESO_SEVERIDADE, type AchadoNumerado } from "./tipos";

const lentesVazias = (): Record<LenteId, EstadoLente> =>
  Object.fromEntries(LENTES.map((l) => [l, { estado: "aguardando" }])) as Record<LenteId, EstadoLente>;

export async function postJson<T>(url: string, corpo: unknown): Promise<T> {
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
  const [fase, setFase] = useState<"inicio" | "preparar" | "analise">("inicio");
  const [imagem, setImagem] = useState<ImagemPreparada | null>(null);
  const [contexto, setContexto] = useState("");
  const [lentes, setLentes] = useState(lentesVazias);
  const [sintese, setSintese] = useState<EstadoSintese>({ estado: "aguardando" });
  const [origem, setOrigem] = useState<Origem | null>(null);
  const [aba, setAba] = useState<Aba>("achados");
  const [abaManual, setAbaManual] = useState(false);
  const [erroInicio, setErroInicio] = useState<string | null>(null);
  const [carregandoExemplo, setCarregandoExemplo] = useState<string | null>(null);
  const execucao = useRef(0);

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

  const rodarAnalise = useCallback(
    (img: ImagemPreparada, ctx: string) => {
      const id = ++execucao.current;
      setLentes(lentesVazias());
      setSintese({ estado: "aguardando" });
      setAba("achados");
      setAbaManual(false);
      setFase("analise");
      window.scrollTo({ top: 0 });
      LENTES.forEach((l) => rodarLente(l, img, ctx, id));
    },
    [rodarLente],
  );

  // Quando as quatro lentes terminam, o agente de síntese entra.
  useEffect(() => {
    if (fase !== "analise" || sintese.estado !== "aguardando") return;
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
  }, [fase, lentes, sintese.estado, achados]);

  useEffect(() => {
    if (sintese.estado === "ok" && !abaManual) setAba("prioridades");
  }, [sintese.estado, abaManual]);

  const receberArquivo = useCallback(async (arquivo: File | undefined | null) => {
    setErroInicio(null);
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) return setErroInicio("Envie uma imagem (PNG, JPG ou WebP).");
    if (arquivo.size > 15 * 1024 * 1024) return setErroInicio("Imagem muito grande. O limite é 15 MB.");
    try {
      const img = await prepararImagem(await arquivoParaDataUrl(arquivo));
      execucao.current++;
      setImagem(img);
      setOrigem({ tipo: "upload" });
      setContexto("");
      setLentes(lentesVazias());
      setSintese({ estado: "aguardando" });
      setFase("preparar");
    } catch (e) {
      setErroInicio((e as Error).message);
    }
  }, []);

  useEffect(() => {
    if (fase !== "inicio") return;
    const colar = (ev: ClipboardEvent) => {
      const item = [...(ev.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (item) receberArquivo(item.getAsFile());
    };
    window.addEventListener("paste", colar);
    return () => window.removeEventListener("paste", colar);
  }, [fase, receberArquivo]);

  const abrirExemplo = useCallback(
    async (ex: Exemplo) => {
      setCarregandoExemplo(ex.id);
      setErroInicio(null);
      try {
        const img = await prepararImagem(`/samples/${ex.id}.png`);
        setImagem(img);
        setContexto(ex.contexto);
        const salvo = await fetch(`/samples/${ex.id}.json`).then((r) =>
          r.ok ? (r.json() as Promise<AnaliseSalva>) : null,
        );
        if (salvo) {
          execucao.current++;
          const est = lentesVazias();
          for (const l of LENTES) if (salvo.lentes[l]) est[l] = { estado: "ok", resp: salvo.lentes[l] };
          setLentes(est);
          setSintese(salvo.sintese ? { estado: "ok", resp: salvo.sintese } : { estado: "aguardando" });
          setOrigem({ tipo: "exemplo", exemplo: ex, geradoEm: salvo.geradoEm, salvo: true });
          setAba(salvo.sintese ? "prioridades" : "achados");
          setAbaManual(false);
          setFase("analise");
          window.scrollTo({ top: 0 });
        } else {
          setOrigem({ tipo: "exemplo", exemplo: ex, salvo: false });
          rodarAnalise(img, ex.contexto);
        }
      } catch (e) {
        setErroInicio((e as Error).message);
      } finally {
        setCarregandoExemplo(null);
      }
    },
    [rodarAnalise],
  );

  const voltarAoInicio = () => {
    execucao.current++;
    setFase("inicio");
    setImagem(null);
    setOrigem(null);
    setLentes(lentesVazias());
    setSintese({ estado: "aguardando" });
  };

  if (fase === "inicio")
    return (
      <Inicio erro={erroInicio} carregandoExemplo={carregandoExemplo} onArquivo={receberArquivo} onExemplo={abrirExemplo} />
    );

  if (!imagem) return null;

  if (fase === "preparar")
    return (
      <Preparar
        imagem={imagem}
        contexto={contexto}
        onContexto={setContexto}
        onAnalisar={() => rodarAnalise(imagem, contexto)}
        onTrocar={voltarAoInicio}
      />
    );

  return (
    <Analise
      imagem={imagem}
      lentes={lentes}
      sintese={sintese}
      achados={achados}
      origem={origem}
      aba={aba}
      onAba={(a) => {
        setAba(a);
        setAbaManual(true);
      }}
      onVoltar={voltarAoInicio}
      onRodarAoVivo={() => {
        if (origem?.tipo === "exemplo") setOrigem({ ...origem, salvo: false });
        rodarAnalise(imagem, contexto);
      }}
      onTentarLente={(l) => rodarLente(l, imagem, contexto, execucao.current)}
    />
  );
}
