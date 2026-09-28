import { writeFile } from "node:fs/promises";
import path from "node:path";

// Só em desenvolvimento: grava o resultado de uma execução real como exemplo em /public/samples.
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Não encontrado", { status: 404 });
  const { id, analise } = await req.json();
  if (!/^[a-z-]+$/.test(id)) return new Response("id inválido", { status: 400 });
  const pasta = process.env.SAMPLES_DIR || path.join(process.cwd(), "public", "samples");
  await writeFile(path.join(pasta, `${id}.json`), JSON.stringify(analise, null, 2));
  return Response.json({ ok: true });
}
