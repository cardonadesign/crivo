import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { HORIZONTES, ROADMAP, type Horizonte } from "@/lib/roadmap";
import { SITE } from "@/lib/site";
import { ArrowUpRightIcon, CheckCircleIcon, TargetIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "O que já foi entregue, o que está em construção e o que vem depois no Crivo.",
};

const COLUNAS: Exclude<Horizonte, "entregue">[] = ["agora", "proximo", "depois"];

export default function Roadmap() {
  const entregues = ROADMAP.filter((i) => i.horizonte === "entregue");

  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-12 sm:px-6 lg:pt-16">
        <header className="max-w-2xl">
          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[42px]">Roadmap</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-tinta-2">
            O que já está no ar, o que estou construindo agora e o que vem depois. Sem datas: cada item diz por que existe e
            como vou saber se funcionou.
          </p>
        </header>

        {/* entregue */}
        <section aria-labelledby="t-entregue" className="mt-12 rounded-painel border border-linha bg-superficie p-5">
          <h2 id="t-entregue" className="flex items-center gap-1.5 text-[14px] font-semibold text-ok">
            <CheckCircleIcon size={16} weight="fill" aria-hidden />
            Entregue
          </h2>
          <ul className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-3">
            {entregues.map((i) => (
              <li key={i.titulo}>
                <p className="text-[14px] font-semibold leading-snug">{i.titulo}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-tinta-2">{i.porque}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* agora, próximo, depois */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {COLUNAS.map((h) => {
            const itens = ROADMAP.filter((i) => i.horizonte === h);
            const agora = h === "agora";
            return (
              <section
                key={h}
                aria-labelledby={`t-${h}`}
                className={`rounded-painel border p-5 ${agora ? "border-acento/30 bg-acento-suave" : "border-linha"}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id={`t-${h}`} className={`text-[18px] font-semibold tracking-tight ${agora ? "text-acento" : ""}`}>
                    {HORIZONTES[h].titulo}
                  </h2>
                  <span className="num text-[12px] text-tinta-3">
                    {itens.length} {itens.length === 1 ? "item" : "itens"}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-tinta-2">{HORIZONTES[h].tema}</p>

                <ul className="mt-4 divide-y divide-linha">
                  {itens.map((i) => (
                    <li key={i.titulo} className="py-4 first:pt-2 last:pb-0">
                      <h3 className="text-[15px] font-semibold leading-snug">{i.titulo}</h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-tinta-2">{i.porque}</p>
                      {i.sinal && (
                        <p className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-tinta-3">
                          <TargetIcon size={14} className="mt-0.5 shrink-0" aria-hidden />
                          <span>
                            <span className="font-medium text-tinta-2">Sinal de sucesso: </span>
                            {i.sinal}
                          </span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <footer className="mt-12 flex flex-col gap-4 border-t border-linha pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[14px] leading-relaxed text-tinta-2">
            O roadmap muda com o que os dados mostrarem. Os itens de <span className="font-medium text-tinta">Agora</span>{" "}
            decidem o que acontece com o resto.
          </p>
          <a
            href={`${SITE.repo}/issues/new`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-controle border border-linha-forte bg-superficie px-3.5 py-2 text-[14px] font-medium transition-colors hover:border-tinta-3"
          >
            Sugerir uma ideia
            <ArrowUpRightIcon size={15} aria-hidden />
          </a>
        </footer>
      </main>
      <Rodape />
    </>
  );
}
