import { z } from "zod";
import { chamarEstruturado, limitar, respostaDeErro } from "@/lib/claude";
import { LENTES_INFO, promptSistema, promptUsuario } from "@/lib/lentes";
import { LENTES, LenteResultadoSchema, type RespostaLente } from "@/lib/schema";

export const maxDuration = 120;

const Entrada = z.object({
  lente: z.enum(LENTES),
  imagem: z.string().max(4_000_000),
  mediaType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  largura: z.number().int().positive().max(4000),
  altura: z.number().int().positive().max(8000),
  contexto: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  if (!limitar(req)) {
    return Response.json({ erro: "Limite de análises por hora atingido." }, { status: 429 });
  }
  const parsed = Entrada.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ erro: "Requisição inválida." }, { status: 400 });
  }
  const { lente, imagem, mediaType, largura, altura, contexto } = parsed.data;

  try {
    const { dados, uso } = await chamarEstruturado({
      sistema: promptSistema(LENTES_INFO[lente]),
      schema: LenteResultadoSchema,
      conteudo: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: imagem } },
        { type: "text", text: promptUsuario(largura, altura, contexto) },
      ],
    });
    const corpo: RespostaLente = { lente, resultado: dados, uso };
    return Response.json(corpo);
  } catch (e) {
    return respostaDeErro(e);
  }
}
