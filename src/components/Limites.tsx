import { LENTES_INFO } from "@/lib/lentes";
import { LENTES, type LenteId, type RespostaLente } from "@/lib/schema";

export function Limites({ respostas }: { respostas: Partial<Record<LenteId, RespostaLente>> }) {
  return (
    <div className="space-y-6 text-[14px] leading-relaxed text-tinta-2">
      <section>
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-tinta-3">O que cada lente disse que não consegue ver</h3>
        <ul className="mt-2 space-y-2">
          {LENTES.flatMap((l) =>
            (respostas[l]?.resultado.fora_do_alcance ?? []).map((t, i) => (
              <li key={`${l}-${i}`} className="flex gap-2.5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: LENTES_INFO[l].cor }} />
                <span>{t}</span>
              </li>
            )),
          )}
        </ul>
      </section>
      <section className="rounded-xl border border-linha bg-cartao p-4">
        <h3 className="font-medium text-tinta">Como ler os selos</h3>
        <ul className="mt-2 space-y-1.5">
          <li>
            <span className="font-medium text-ok">✓ Confirmado:</span> a IA afirmou contraste insuficiente e a medição nos pixels
            comprovou (razão WCAG abaixo de 4,5:1, ou 3:1 para texto grande).
          </li>
          <li>
            <span className="font-medium text-alerta">✕ A IA errou:</span> a medição contradisse a afirmação. O achado continua
            visível, riscado, e perde peso na priorização.
          </li>
          <li>
            <span className="font-medium text-tinta">◐ Julgamento da IA:</span> não há como medir só com um print. Vale como
            hipótese, com o nível de confiança que o próprio modelo declarou.
          </li>
        </ul>
      </section>
      <p className="text-[13px] text-tinta-3">
        Um print é uma foto de um instante. Estados de erro, carregamento, navegação por teclado, leitor de tela e comportamento
        real de uso ficam de fora. O Crivo é um ponto de partida para a conversa de design, não um substituto para teste com
        pessoas.
      </p>
    </div>
  );
}
