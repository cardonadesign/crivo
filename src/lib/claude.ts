import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import type { Uso } from "./schema";

export const MODELO = process.env.CRIVO_MODEL || "claude-opus-5";
const ESFORCO = (process.env.CRIVO_EFFORT || "medium") as "low" | "medium" | "high";

// US$ por milhão de tokens (entrada, saída)
const PRECOS: Record<string, [number, number]> = {
  "claude-opus-5": [5, 25],
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5": [2, 10],
  "claude-haiku-4-5": [1, 5],
};

const client = new Anthropic();

/** Travessão (U+2014) e meia-risca (U+2013), montados por código para não aparecerem no fonte. */
const TRAVESSOES = new RegExp(`\\s*[${String.fromCharCode(0x2014, 0x2013)}]\\s*`, "g");

/** Troca travessões por vírgula em todo texto devolvido pelo modelo (padrão de escrita do produto). */
export function limparTexto<T>(valor: T): T {
  if (typeof valor === "string") return valor.replace(TRAVESSOES, ", ") as T;
  if (Array.isArray(valor)) return valor.map(limparTexto) as T;
  if (valor && typeof valor === "object")
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, limparTexto(v)])) as T;
  return valor;
}

/** Modelo rápido para tarefas pequenas e em tempo real (nomear a tela). */
export const MODELO_RAPIDO = "claude-haiku-4-5";
const TRAVESSAO_SOLTO = new RegExp(`[${String.fromCharCode(0x2014, 0x2013)}]`, "g");

/**
 * Texto em stream do modelo rápido, já como bytes para uma Response.
 * O primeiro evento é aguardado aqui: erro de chave, limite ou rede estoura antes de responder,
 * e a rota devolve um JSON de erro normal em vez de um stream quebrado.
 */
export async function transmitirTexto(opts: {
  sistema: string;
  conteudo: Anthropic.ContentBlockParam[];
}): Promise<ReadableStream<Uint8Array>> {
  const stream = client.messages.stream({
    model: MODELO_RAPIDO,
    max_tokens: 200,
    system: opts.sistema,
    messages: [{ role: "user", content: opts.conteudo }],
  });
  const iterador = stream[Symbol.asyncIterator]();
  const primeiro = await iterador.next();
  const codificador = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controle) {
      const emitir = (ev: Anthropic.MessageStreamEvent) => {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
          controle.enqueue(codificador.encode(ev.delta.text.replace(TRAVESSAO_SOLTO, ",")));
        }
      };
      try {
        if (!primeiro.done) emitir(primeiro.value);
        for (let r = await iterador.next(); !r.done; r = await iterador.next()) emitir(r.value);
        controle.close();
      } catch (e) {
        controle.error(e);
      }
    },
    cancel() {
      stream.abort();
    },
  });
}

export class ErroModelo extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

type Conteudo = Anthropic.Beta.Messages.BetaContentBlockParam[];

/**
 * Uma chamada estruturada: a resposta volta validada contra o schema zod.
 * Fallback no servidor fica ligado caso o modelo recuse por política.
 */
export async function chamarEstruturado<S extends z.ZodType>(opts: {
  sistema: string;
  conteudo: Conteudo;
  schema: S;
}): Promise<{ dados: z.infer<S>; uso: Uso }> {
  const inicio = Date.now();
  const resposta = await client.beta.messages.parse({
    model: MODELO,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: ESFORCO, format: betaZodOutputFormat(opts.schema) },
    system: opts.sistema,
    messages: [{ role: "user", content: opts.conteudo }],
  });

  if (resposta.stop_reason === "refusal") {
    throw new ErroModelo("O modelo recusou analisar esta imagem.", 422);
  }
  if (resposta.stop_reason === "max_tokens") {
    throw new ErroModelo("A resposta excedeu o limite de tamanho. Tente de novo.");
  }
  if (!resposta.parsed_output) {
    throw new ErroModelo("A resposta não veio no formato esperado.");
  }

  const [pIn, pOut] = PRECOS[resposta.model] ?? PRECOS[MODELO] ?? [5, 25];
  const entrada = resposta.usage.input_tokens;
  const saida = resposta.usage.output_tokens;
  return {
    dados: limparTexto(resposta.parsed_output as z.infer<S>),
    uso: {
      entrada,
      saida,
      custoUsd: (entrada * pIn + saida * pOut) / 1_000_000,
      ms: Date.now() - inicio,
      modelo: resposta.model,
    },
  };
}

export function respostaDeErro(e: unknown): Response {
  if (e instanceof ErroModelo) return Response.json({ erro: e.message }, { status: e.status });
  if (e instanceof Anthropic.RateLimitError)
    return Response.json({ erro: "Muita gente usando agora. Tente em alguns segundos." }, { status: 429 });
  if (e instanceof Anthropic.AuthenticationError)
    return Response.json({ erro: "Chave da API ausente ou inválida no servidor." }, { status: 500 });
  if (e instanceof Anthropic.BadRequestError)
    return Response.json({ erro: "A API recusou a requisição: " + e.message }, { status: 400 });
  if (e instanceof Anthropic.APIError)
    return Response.json({ erro: `Falha na API (${e.status}). Tente de novo.` }, { status: 502 });
  console.error(e);
  return Response.json({ erro: "Erro inesperado." }, { status: 500 });
}

/** Limite simples por IP (best effort, por instância). Uma análise = 5 chamadas. */
const janelas = new Map<string, number[]>();
export function limitar(req: Request, maxPorHora = 30): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const agora = Date.now();
  const lista = (janelas.get(ip) ?? []).filter((t) => agora - t < 3_600_000);
  if (lista.length >= maxPorHora) return false;
  lista.push(agora);
  janelas.set(ip, lista);
  return true;
}
