// Roadmap público do Crivo. Editar o roadmap é editar só este arquivo.
// Horizontes em vez de datas: o que entra em "Agora" decide o que acontece com o resto.

export type Horizonte = "entregue" | "agora" | "proximo" | "depois";

export type ItemRoadmap = {
  horizonte: Horizonte;
  titulo: string;
  porque: string;
  /** Como vamos saber que funcionou. */
  sinal?: string;
};

export const HORIZONTES: Record<Exclude<Horizonte, "entregue">, { titulo: string; tema: string }> = {
  agora: { titulo: "Agora", tema: "Provar que a crítica procede" },
  proximo: { titulo: "Próximo", tema: "Medir mais, olhar o fluxo" },
  depois: { titulo: "Depois", tema: "Levar para onde o time trabalha" },
};

export const ROADMAP: ItemRoadmap[] = [
  {
    horizonte: "entregue",
    titulo: "Quatro lentes em paralelo e síntese priorizada",
    porque: "Usabilidade, acessibilidade, hierarquia e produto, com top 3, hipótese e métrica.",
  },
  {
    horizonte: "entregue",
    titulo: "Verificação de contraste por pixel",
    porque: "A IA afirma, o código mede. Cada achado mostra se foi comprovado.",
  },
  {
    horizonte: "entregue",
    titulo: "Espaço de trabalho com histórico",
    porque: "Análises salvas no navegador, exemplos prontos e tema claro ou escuro.",
  },

  {
    horizonte: "agora",
    titulo: "\"Procede\" ou \"não procede\" em cada achado",
    porque: "Hoje não sabemos quanto da crítica é útil de verdade. Sem esse dado, o resto é palpite.",
    sinal: "Taxa de aceitação dos achados de 70% ou mais",
  },
  {
    horizonte: "agora",
    titulo: "Conjunto de avaliação com 30 telas anotadas por designers",
    porque: "Medir a precisão de cada lente antes de adicionar qualquer feature.",
    sinal: "Precisão por lente publicada. Abaixo de 50%, a lente é reescrita ou sai",
  },

  {
    horizonte: "proximo",
    titulo: "Verificar alvo de toque e tamanho de fonte",
    porque: "Levar o \"medido, não suposto\" para além do contraste.",
    sinal: "Dois novos tipos de afirmação verificáveis nos pixels",
  },
  {
    horizonte: "proximo",
    titulo: "Análise de fluxo, não só de tela",
    porque: "O atrito se acumula entre telas. Um cadastro em três passos precisa ser lido como um todo.",
    sinal: "Achados de fluxo com aceitação equivalente aos de tela única",
  },
  {
    horizonte: "proximo",
    titulo: "Comparar antes e depois",
    porque: "Fechar o ciclo: mostrar se a correção resolveu o problema apontado.",
    sinal: "Parcela de achados marcados como resolvidos na segunda versão",
  },

  {
    horizonte: "depois",
    titulo: "Plugin para Figma",
    porque: "Rodar o Crivo no frame selecionado, sem exportar print.",
  },
  {
    horizonte: "depois",
    titulo: "Enviar achados para o backlog",
    porque: "Linear e Jira, já com a hipótese e a métrica escritas.",
  },
  {
    horizonte: "depois",
    titulo: "Lentes com o design system do time",
    porque: "A crítica passa a considerar os tokens e padrões próprios de cada time.",
  },
];
