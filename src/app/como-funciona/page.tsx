import { Cabecalho, Rodape } from "@/components/Cabecalho";
import { LENTES_INFO } from "@/lib/lentes";
import { LENTES } from "@/lib/schema";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Como funciona · Crivo" };

function Secao({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-linha py-10 md:grid-cols-[180px_minmax(0,1fr)]">
      <div>
        <p className="font-mono text-[12px] text-acento-texto">{n}</p>
        <h2 className="mt-1 text-[19px] font-semibold leading-snug">{titulo}</h2>
      </div>
      <div className="space-y-4 text-[16px] leading-relaxed text-tinta-2">{children}</div>
    </section>
  );
}

function Caixa({ titulo, sub, cor }: { titulo: string; sub: string; cor?: string }) {
  return (
    <div className="rounded-lg border border-linha bg-cartao px-3 py-2.5">
      <p className="flex items-center gap-2 text-[14px] font-medium text-tinta">
        {cor && <span className="h-2 w-2 rounded-full" style={{ background: cor }} />}
        {titulo}
      </p>
      <p className="mt-0.5 text-[12px] leading-snug text-tinta-3">{sub}</p>
    </div>
  );
}

function Seta() {
  return (
    <div className="flex justify-center py-1 text-tinta-3" aria-hidden>
      ↓
    </div>
  );
}

export default function ComoFunciona() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-acento-texto">Como funciona</p>
        <h1 className="titulo-serif mt-3 max-w-3xl text-[40px] leading-[1.05] sm:text-[56px]">
          IA para ampliar o olhar. Código para checar o que dá para checar.
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-tinta-2">
          O Crivo nasceu de uma pergunta simples: dá para confiar numa crítica de design feita por IA? A resposta honesta é
          &ldquo;em parte&rdquo;. Então o produto foi desenhado para deixar claro o que é percepção do modelo e o que foi
          comprovado.
        </p>

        <div className="mt-12 rounded-2xl border border-linha bg-papel p-5 sm:p-8">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-tinta-3">Fluxo de uma análise</p>
          <div className="mx-auto max-w-3xl">
            <Caixa titulo="Navegador" sub="Reduz a imagem para ≤ 1,15 MP. Essa mesma versão é enviada e medida, para as coordenadas baterem." />
            <Seta />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {LENTES.map((l) => (
                <Caixa key={l} titulo={LENTES_INFO[l].nome} sub="1 chamada · visão · JSON validado" cor={LENTES_INFO[l].cor} />
              ))}
            </div>
            <p className="mt-2 text-center text-[12px] text-tinta-3">4 agentes em paralelo, cada um com escopo e critérios próprios</p>
            <Seta />
            <Caixa
              titulo="Verificação por pixel (sem IA)"
              sub="Para cada afirmação de contraste, extrai as cores reais da região e calcula a razão WCAG. Confirma ou contesta."
            />
            <Seta />
            <Caixa
              titulo="Agente de síntese"
              sub="Recebe os achados já com o resultado da medição, agrupa o que as lentes repetem, prioriza por impacto × esforço e escreve hipóteses testáveis."
            />
          </div>
        </div>

        <Secao n="01" titulo="Por que quatro agentes e não um">
          <p>
            Um único prompt pedindo &ldquo;critique esta tela&rdquo; tende a respostas genéricas e a cobrir tudo pela metade.
            Separar em lentes dá a cada agente um critério claro de qualidade: heurísticas de Nielsen, WCAG 2.2, hierarquia e
            UX writing, e uma lente de produto que pergunta onde a pessoa desiste.
          </p>
          <p>
            As quatro rodam em paralelo, então o tempo total é o da lente mais lenta, não a soma. E quando lentes diferentes
            apontam o mesmo problema de forma independente, isso vira um sinal de prioridade.
          </p>
        </Secao>

        <Secao n="02" titulo="Separar o que a IA percebeu do que é fato">
          <p>
            Modelos de visão são bons em perceber que um texto &ldquo;parece claro demais&rdquo;, mas erram números. Então toda
            afirmação de contraste vem com uma caixa (coordenadas) e cores estimadas, e o navegador mede os pixels reais daquela
            região: separa a cor de fundo (a mais frequente) da cor do texto (a mais contrastante com presença relevante) e
            calcula a razão da WCAG.
          </p>
          <ul className="space-y-1.5">
            <li>
              <span className="font-medium text-ok">✓ Confirmado</span>: a medição comprovou o problema.
            </li>
            <li>
              <span className="font-medium text-alerta">✕ A IA errou</span>: a medição contradisse. O achado fica visível, riscado,
              e a síntese é instruída a dar menos peso a ele.
            </li>
            <li>
              <span className="font-medium text-tinta">◐ Julgamento</span>: não mensurável num print. Fica explícito, com a
              confiança que o próprio modelo declarou.
            </li>
          </ul>
          <p>
            Cada lente também é obrigada a listar o que <em>não</em> consegue avaliar a partir de um print, em vez de inventar.
          </p>
        </Secao>

        <Secao n="03" titulo="Da crítica à decisão">
          <p>
            Uma lista de 20 problemas não ajuda ninguém a decidir. O agente de síntese escolhe três prioridades e, para cada uma,
            escreve uma hipótese no formato &ldquo;se… então… porque…&rdquo; e a métrica que leria o resultado. É a ponte entre
            a revisão de design e o experimento.
          </p>
        </Secao>

        <Secao n="04" titulo="Decisões de produto">
          <p>
            O trabalho a ser feito não é &ldquo;receber críticas&rdquo;, é <strong className="text-tinta">decidir o que corrigir
            primeiro</strong> com segurança de que a crítica procede. Por isso a métrica principal seria a taxa de aceitação dos
            achados (meta inicial ≥ 70%), e não quantos achados a ferramenta gera.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-tinta">Opus em vez de Sonnet:</span> nos testes, coordenadas mais precisas e achados
              mais específicos valeram o custo (~US$ 0,40 por análise). A troca deve ser decidida por avaliação, não por gosto.
            </li>
            <li>
              <span className="font-medium text-tinta">Quatro chamadas em vez de uma:</span> ~4× mais tokens de entrada, em troca de
              especificidade e de um sinal de convergência entre lentes.
            </li>
            <li>
              <span className="font-medium text-tinta">Verificar só contraste, por enquanto:</span> é a afirmação mais frequente e a
              mais barata de checar sem IA.
            </li>
            <li>
              <span className="font-medium text-tinta">Fora de propósito:</span> gerar &ldquo;redesign&rdquo; automático, que
              aumentaria a confiança numa saída ainda não validada.
            </li>
          </ul>
          <p>
            Próximo passo: instrumentar a avaliação de cada achado (&ldquo;procede&rdquo; / &ldquo;não procede&rdquo;) e montar um
            conjunto de 30 telas avaliadas por designers. Se uma lente ficar abaixo de 50% de aceitação, ela é reescrita ou sai antes
            de qualquer nova feature.
          </p>
        </Secao>

        <Secao n="05" titulo="Decisões técnicas">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Next.js (App Router) + TypeScript, hospedado na Vercel. A chave da API fica só no servidor.</li>
            <li>
              Claude (Anthropic) com visão e <em>structured outputs</em>: a resposta é validada contra um schema Zod. Se não vier no
              formato, a lente falha de forma visível em vez de quebrar a tela.
            </li>
            <li>
              Custo e tempo de cada análise aparecem na tela, calculados a partir do uso real de tokens. Os exemplos abrem com o
              resultado salvo de uma execução real, sem custo, e podem ser reexecutados ao vivo.
            </li>
            <li>A imagem não é armazenada. Há limite de tamanho e de análises por hora.</li>
          </ul>
        </Secao>

        <Secao n="06" titulo="Limites conhecidos">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>As caixas vêm do modelo e podem ficar deslocadas; quando isso acontece, a medição tende a dar &ldquo;não mensurável&rdquo;.</li>
            <li>Texto sobre imagem ou gradiente pode confundir a extração de cores.</li>
            <li>Um print não mostra estados, fluxo, teclado ou leitor de tela. O Crivo não substitui teste com pessoas.</li>
          </ul>
          <p>
            <Link href="/" className="font-medium text-acento-texto underline underline-offset-4">
              Testar com um print →
            </Link>
          </p>
        </Secao>
      </main>
      <Rodape />
    </>
  );
}
