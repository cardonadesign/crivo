import { z } from "zod";
import { limitar, respostaDeErro, transmitirTexto } from "@/lib/claude";
import { PROMPT_IDENTIFICACAO } from "@/lib/lentes";

export const maxDuration = 30;

const Entrada = z.object({
  imagem: z.string().max(4_000_000),
  mediaType: z.enum(["image/png", "image/jpeg", "image/webp"]),
});

/** Nome e descrição da tela, em stream de texto: linha 1 = nome, linha 2 = descrição. */
export async function POST(req: Request) {
  if (!limitar(req)) {
    return Response.json({ erro: "Limite de análises por hora atingido." }, { status: 429 });
  }
  const parsed = Entrada.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ erro: "Requisição inválida." }, { status: 400 });
  }
  const { imagem, mediaType } = parsed.data;

  try {
    const corpo = await transmitirTexto({
      sistema: PROMPT_IDENTIFICACAO,
      conteudo: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: imagem } },
        { type: "text", text: "Dê nome e descrição a esta tela." },
      ],
    });
    return new Response(corpo, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
    });
  } catch (e) {
    return respostaDeErro(e);
  }
}
