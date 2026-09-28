import { z } from "zod";
import { chamarEstruturado, limitar, respostaDeErro } from "@/lib/claude";
import { PROMPT_SINTESE } from "@/lib/lentes";
import { SinteseSchema, type RespostaSintese } from "@/lib/schema";

export const maxDuration = 120;

const Entrada = z.object({
  achados: z
    .array(
      z.object({
        id: z.string(),
        lente: z.string(),
        titulo: z.string(),
        problema: z.string(),
        severidade: z.string(),
        confianca: z.string(),
        verificacao: z.string(),
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(req: Request) {
  if (!limitar(req)) {
    return Response.json({ erro: "Limite de análises por hora atingido." }, { status: 429 });
  }
  const parsed = Entrada.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  try {
    const { dados, uso } = await chamarEstruturado({
      sistema: PROMPT_SINTESE,
      schema: SinteseSchema,
      conteudo: [{ type: "text", text: "Achados:\n" + JSON.stringify(parsed.data.achados, null, 1) }],
    });
    const corpo: RespostaSintese = { sintese: dados, uso };
    return Response.json(corpo);
  } catch (e) {
    return respostaDeErro(e);
  }
}
