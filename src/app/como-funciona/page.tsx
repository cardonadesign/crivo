import { Cabecalho, Rodape } from "@/components/Cabecalho";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  BrowserIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  CircleHalfIcon,
  CursorClickIcon,
  EyeIcon,
  RulerIcon,
  ScalesIcon,
  TextAaIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Arquitetura, método de verificação, decisões de produto e limites do Crivo.",
};

const LENTES = [
  { Icone: CursorClickIcon, nome: "Usabilidade", crit: "Heurísticas de Nielsen" },
  { Icone: EyeIcon, nome: "Acessibilidade", crit: "WCAG 2.2 AA" },
  { Icone: TextAaIcon, nome: "Hierarquia & Texto", crit: "Peso visual e UX writing" },
  { Icone: ChartLineUpIcon, nome: "Produto & Conversão", crit: "Atrito, valor e confiança" },
];

function Etapa({ Icone, titulo, texto }: { Icone: typeof BrowserIcon; titulo: string; texto: string }) {
  return (
    <div className="flex gap-3 rounded-painel border border-linha bg-superficie p-4">
      <Icone size={20} className="mt-0.5 shrink-0 text-tinta" aria-hidden />
      <div>
        <p className="text-[14px] font-semibold">{titulo}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-tinta-2">{texto}</p>
      </div>
    </div>
  );
}

function Seta() {
  return (
    <div className="flex justify-center py-2 text-tinta-3" aria-hidden>
      <ArrowDownIcon size={16} />
    </div>
  );
}

export default function ComoFunciona() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="flex-1">
        <article>
          {/* abertura */}
          <header className="mx-auto w-full max-w-4xl px-4 pb-12 pt-14 sm:px-6 lg:pt-20">
            <h1 className="max-w-[26ch] text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
              IA para ampliar o olhar. Código para checar o que dá para checar.
            </h1>
            <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-tinta-2">
              O Crivo nasceu de uma pergunta: dá para confiar numa crítica de design feita por IA? A resposta honesta é
              &quot;em parte&quot;. Então o produto deixa claro o que é percepção do modelo e o que foi comprovado.
            </p>
          </header>

          {/* fluxo */}
          <section aria-labelledby="t-fluxo" className="border-y border-linha bg-superficie-2">
            <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
              <h2 id="t-fluxo" className="text-[22px] font-semibold tracking-tight">
                O caminho de uma análise
              </h2>
              <div className="mt-8">
                <Etapa
                  Icone={BrowserIcon}
                  titulo="Navegador"
                  texto="Reduz a imagem para até 1,15 MP. A mesma versão é enviada ao modelo e usada na medição, para as coordenadas baterem."
                />
                <Seta />
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {LENTES.map(({ Icone, nome, crit }) => (
                    <div key={nome} className="rounded-painel border border-linha bg-superficie p-3">
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold">
                        <Icone size={16} aria-hidden />
                        {nome}
                      </p>
                      <p className="mt-1 text-[12px] text-tinta-3">{crit}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-center text-[12px] text-tinta-3">
                  Quatro chamadas em paralelo ao Claude, com visão e resposta validada por schema
                </p>
                <Seta />
                <Etapa
                  Icone={RulerIcon}
                  titulo="Verificação por pixel, sem IA"
                  texto="Para cada afirmação de contraste, extrai as cores reais da região apontada e calcula a razão WCAG."
                />
                <Seta />
                <Etapa
                  Icone={ScalesIcon}
                  titulo="Agente de síntese"
                  texto="Recebe os achados já com o resultado da medição, agrupa o que as lentes repetem, prioriza por impacto e esforço e escreve hipóteses testáveis."
                />
              </div>
            </div>
          </section>

          {/* princípios em duas colunas */}
          <section aria-labelledby="t-principios" className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
            <h2 id="t-principios" className="sr-only">
              Princípios
            </h2>
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h3 className="text-[19px] font-semibold tracking-tight">Por que quatro agentes e não um</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-tinta-2">
                  Um prompt único do tipo &quot;critique esta tela&quot; tende a respostas genéricas. Separar em lentes dá a cada
                  agente um critério claro. As quatro rodam em paralelo, então o tempo é o da mais lenta, e quando lentes
                  diferentes apontam o mesmo problema sem combinar, isso vira sinal de prioridade.
                </p>
              </div>
              <div>
                <h3 className="text-[19px] font-semibold tracking-tight">Separar percepção de fato</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-tinta-2">
                  Modelos de visão percebem bem que um texto &quot;parece claro demais&quot;, mas erram números. Por isso toda
                  afirmação de contraste vem com coordenadas e cores estimadas, e o navegador mede a região: a cor mais
                  frequente é o fundo, e a cor do texto é buscada perto da que a IA apontou.
                </p>
              </div>
            </div>

            <dl className="mt-12 grid gap-px overflow-hidden rounded-painel border border-linha bg-linha sm:grid-cols-3">
              <div className="bg-superficie p-5">
                <dt className="flex items-center gap-1.5 text-[14px] font-semibold text-ok">
                  <CheckCircleIcon size={16} weight="fill" aria-hidden />
                  Confirmado
                </dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-tinta-2">A medição comprovou o problema.</dd>
              </div>
              <div className="bg-superficie p-5">
                <dt className="flex items-center gap-1.5 text-[14px] font-semibold text-erro">
                  <XCircleIcon size={16} weight="fill" aria-hidden />A IA errou
                </dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-tinta-2">
                  A medição contradisse. O achado fica riscado e perde peso na síntese.
                </dd>
              </div>
              <div className="bg-superficie p-5">
                <dt className="flex items-center gap-1.5 text-[14px] font-semibold">
                  <CircleHalfIcon size={16} aria-hidden />
                  Julgamento
                </dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-tinta-2">
                  Não mensurável num print, com a confiança que o próprio modelo declarou.
                </dd>
              </div>
            </dl>
          </section>

          {/* decisões de produto: blocos agrupados */}
          <section aria-labelledby="t-decisoes" className="border-t border-linha">
            <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
              <h2 id="t-decisoes" className="text-[22px] font-semibold tracking-tight">
                Decisões de produto
              </h2>
              <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-tinta-2">
                O trabalho a ser feito não é receber críticas, é decidir o que corrigir primeiro com segurança de que a crítica
                procede. A métrica principal seria a <strong className="font-semibold text-tinta">taxa de aceitação dos achados</strong>{" "}
                (meta inicial de 70%), não quantos achados a ferramenta gera.
              </p>

              <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
                {[
                  [
                    "Opus em vez de Sonnet",
                    "Nos testes, coordenadas mais precisas e achados mais específicos valeram o custo, cerca de US$ 0,40 por análise. A troca deve ser decidida por avaliação, não por gosto.",
                  ],
                  [
                    "Quatro chamadas em vez de uma",
                    "Cerca de quatro vezes mais tokens de entrada, em troca de especificidade e de um sinal de convergência entre lentes.",
                  ],
                  [
                    "Verificar só contraste, por enquanto",
                    "É a afirmação mais frequente e a mais barata de checar sem IA. Comecei pela melhor relação entre valor e esforço.",
                  ],
                  [
                    "Fora de propósito",
                    "Gerar redesign automático aumentaria a confiança numa saída que ainda não foi validada.",
                  ],
                ].map(([t, d]) => (
                  <div key={t}>
                    <h3 className="text-[15px] font-semibold">{t}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-tinta-2">{d}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-painel bg-acento-suave p-5 text-[14px] leading-relaxed text-tinta">
                <p className="font-semibold">Quando eu mudaria de rumo</p>
                <p className="mt-1.5 text-tinta-2">
                  Próximo passo: registrar se cada achado procede e montar um conjunto de 30 telas avaliadas por designers. Se uma
                  lente ficar abaixo de 50% de aceitação, ela é reescrita ou sai antes de qualquer nova feature.
                </p>
              </div>
            </div>
          </section>

          {/* técnica e limites: lista curta lado a lado */}
          <section aria-labelledby="t-tecnica" className="border-t border-linha">
            <div className="mx-auto grid w-full max-w-4xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
              <div>
                <h2 id="t-tecnica" className="text-[19px] font-semibold tracking-tight">
                  Decisões técnicas
                </h2>
                <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-tinta-2">
                  <li>Next.js e TypeScript na Vercel. A chave da API fica só no servidor.</li>
                  <li>
                    Claude com visão e saída estruturada, validada por schema Zod. Se a resposta não vier no formato, a lente falha de
                    forma visível.
                  </li>
                  <li>Custo e tempo reais de cada análise na tela. Exemplos abrem o resultado salvo, sem custo.</li>
                  <li>A imagem não é armazenada. Há limite de tamanho e de análises por hora.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-[19px] font-semibold tracking-tight">Limites conhecidos</h2>
                <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-tinta-2">
                  <li>As caixas vêm do modelo e podem ficar deslocadas. Aí a medição tende a dar &quot;não mensurável&quot;.</li>
                  <li>Texto sobre foto ou gradiente confunde a extração de cores.</li>
                  <li>Um print não mostra estados, fluxo, teclado ou leitor de tela. Não substitui teste com pessoas.</li>
                </ul>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-acento underline-offset-4 hover:underline"
                >
                  Testar com um print
                  <ArrowRightIcon size={16} aria-hidden />
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Rodape />
    </>
  );
}
