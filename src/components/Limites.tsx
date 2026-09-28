import { LENTES_INFO } from "@/lib/lentes";
import { LENTES, type LenteId, type RespostaLente } from "@/lib/schema";
import { CheckCircleIcon, CircleHalfIcon, XCircleIcon } from "@phosphor-icons/react";
import { corLente, IconeLente } from "./ui";

export function Limites({ respostas }: { respostas: Partial<Record<LenteId, RespostaLente>> }) {
  const grupos = LENTES.map((l) => ({ l, itens: respostas[l]?.resultado.fora_do_alcance ?? [] })).filter(
    (g) => g.itens.length > 0,
  );

  return (
    <div className="space-y-10 text-[14px] leading-relaxed text-tinta-2">
      <section aria-labelledby="titulo-limites">
        <h3 id="titulo-limites" className="text-[15px] font-semibold text-tinta">
          O que cada lente disse que não consegue ver
        </h3>
        {grupos.length === 0 ? (
          <p className="mt-2 text-tinta-3">Os limites declarados aparecem aqui quando as lentes terminarem.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {grupos.map(({ l, itens }) => (
              <div key={l} className="border-l-2 pl-3" style={{ borderColor: corLente(l).cor }}>
                <p className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: corLente(l).cor }}>
                  <IconeLente lente={l} size={15} />
                  {LENTES_INFO[l].nome}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {itens.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-selos" className="border-t border-linha pt-8">
        <h3 id="titulo-selos" className="text-[15px] font-semibold text-tinta">
          Como ler os selos
        </h3>
        <dl className="mt-4 space-y-1">
          <dt className="flex items-center gap-1.5 font-medium text-ok">
            <CheckCircleIcon size={16} weight="fill" aria-hidden />
            Confirmado
          </dt>
          <dd className="pb-3 last:pb-0">A IA afirmou contraste insuficiente e a medição nos pixels comprovou (abaixo de 4,5:1, ou 3:1 para texto grande).</dd>
          <dt className="flex items-center gap-1.5 font-medium text-erro">
            <XCircleIcon size={16} weight="fill" aria-hidden />A IA errou
          </dt>
          <dd className="pb-3 last:pb-0">A medição contradisse a afirmação. O achado continua visível, riscado, e perde peso na priorização.</dd>
          <dt className="flex items-center gap-1.5 font-medium text-tinta">
            <CircleHalfIcon size={16} aria-hidden />
            Julgamento da IA
          </dt>
          <dd className="pb-3 last:pb-0">Não há como medir só com um print. Vale como hipótese, com a confiança que o próprio modelo declarou.</dd>
        </dl>
      </section>

      <p className="border-t border-linha pt-8 text-[13px] text-tinta-3">
        Um print é uma foto de um instante. Estados de erro, carregamento, navegação por teclado, leitor de tela e uso real
        ficam de fora. O Crivo é um ponto de partida para a conversa de design, não substitui teste com pessoas.
      </p>
    </div>
  );
}
