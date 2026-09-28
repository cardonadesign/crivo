// Verificação determinística: mede nos pixels reais a razão de contraste que a IA afirmou.
// Não usa IA. Serve para separar o que o modelo percebeu do que dá para comprovar.

import type { Achado } from "./schema";

export type Verificacao =
  | { status: "confirmado"; medido: number; limite: number; texto: string; fundo: string }
  | { status: "nao_confirmado"; medido: number; limite: number; texto: string; fundo: string }
  | { status: "nao_mensuravel"; motivo: string }
  | { status: "julgamento" };

type RGB = [number, number, number];

function canal(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminancia([r, g, b]: RGB) {
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function razaoContraste(a: RGB, b: RGB) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function hex([r, g, b]: RGB) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function lerHex(h: string): RGB | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function distancia(a: RGB, b: RGB) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * Extrai a cor de fundo (a mais frequente) e a cor do texto dentro da região, e calcula a razão WCAG.
 * Cor do texto: entre as cores com presença relevante, a mais contrastante dentre as que estão perto
 * da cor que a IA apontou. Isso evita medir outro elemento que caiu na mesma caixa. Se nenhuma cor
 * da região se parece com a apontada, mede a mais contrastante da região.
 */
export function medirRegiao(
  canvas: HTMLCanvasElement,
  regiao: Achado["regiao"],
  textoEstimado?: string,
): { texto: RGB; fundo: RGB; razao: number } | { erro: string } {
  const pad = 3;
  const x = Math.max(0, Math.floor(regiao.x - pad));
  const y = Math.max(0, Math.floor(regiao.y - pad));
  const w = Math.min(canvas.width - x, Math.ceil(regiao.largura + pad * 2));
  const h = Math.min(canvas.height - y, Math.ceil(regiao.altura + pad * 2));
  if (w < 4 || h < 4) return { erro: "Região pequena ou fora da imagem." };

  const { data } = canvas.getContext("2d", { willReadFrequently: true })!.getImageData(x, y, w, h);
  const total = w * h;

  // Histograma com 5 bits por canal, guardando a soma para achar a cor média de cada caixa.
  const caixas = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const chave = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
    const c = caixas.get(chave) ?? { n: 0, r: 0, g: 0, b: 0 };
    c.n++;
    c.r += data[i];
    c.g += data[i + 1];
    c.b += data[i + 2];
    caixas.set(chave, c);
  }
  const cores = [...caixas.values()]
    .map((c) => ({ n: c.n, cor: [c.r / c.n, c.g / c.n, c.b / c.n] as RGB }))
    .sort((a, b) => b.n - a.n);

  const fundo = cores[0].cor;
  // Texto pequeno e fino ocupa poucos pixels "puros"; o resto é antisserrilhado.
  const minimo = Math.max(4, total * 0.005);
  const todas = cores.slice(1).filter((c) => c.n >= minimo);
  if (todas.length === 0) return { erro: "Não há texto distinguível na região marcada." };
  const alvo = textoEstimado ? lerHex(textoEstimado) : null;
  // Perto da cor apontada, aceita presença menor: em caixas grandes o texto ocupa poucos pixels.
  const minimoProximas = Math.max(4, total * 0.0008);
  const proximas = alvo
    ? cores.slice(1).filter((c) => c.n >= minimoProximas && distancia(c.cor, alvo) <= 80)
    : [];
  const candidatas = proximas.length > 0 ? proximas : todas;

  let melhor = candidatas[0];
  let melhorRazao = razaoContraste(melhor.cor, fundo);
  for (const c of candidatas) {
    const r = razaoContraste(c.cor, fundo);
    if (r > melhorRazao) {
      melhor = c;
      melhorRazao = r;
    }
  }
  if (melhorRazao < 1.08) return { erro: "Região sem variação de cor suficiente." };
  return { texto: melhor.cor, fundo, razao: melhorRazao };
}

export function verificar(achado: Achado, canvas: HTMLCanvasElement | null): Verificacao {
  if (!achado.contraste.aplica) return { status: "julgamento" };
  if (!canvas) return { status: "nao_mensuravel", motivo: "Imagem indisponível para medição." };
  const m = medirRegiao(canvas, achado.regiao, achado.contraste.texto_hex);
  if ("erro" in m) return { status: "nao_mensuravel", motivo: m.erro };
  const limite = achado.contraste.texto_grande ? 3 : 4.5;
  const base = { medido: m.razao, limite, texto: hex(m.texto), fundo: hex(m.fundo) };
  return m.razao < limite ? { status: "confirmado", ...base } : { status: "nao_confirmado", ...base };
}

export function formatarRazao(r: number) {
  return r.toFixed(2).replace(".", ",") + ":1";
}
