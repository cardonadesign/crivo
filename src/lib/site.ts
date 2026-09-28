export const SITE = {
  autor: "Marlon Cardona",
  repo: "https://github.com/cardonadesign/crivo",
};

export type Exemplo = {
  id: string;
  nome: string;
  tipo: string;
  contexto: string;
};

export const EXEMPLOS: Exemplo[] = [
  {
    id: "checkout",
    nome: "Brisa Café",
    tipo: "Checkout no desktop",
    contexto: "Etapa de pagamento de uma loja online de cafés especiais.",
  },
  {
    id: "cadastro",
    nome: "Rotina",
    tipo: "Cadastro no celular",
    contexto: "Tela de criação de conta de um app de hábitos.",
  },
  {
    id: "dashboard",
    nome: "Norte",
    tipo: "Dashboard de SaaS",
    contexto: "Painel inicial de uma ferramenta de gestão de vendas para pequenas equipes.",
  },
];
