export type StatusItemPlano = "disponivel" | "desenvolvimento";

export interface ItemPlano {
  texto: string;
  status: StatusItemPlano;
  /** O preço vem da API e entra no texto só quando a landing consegue carregá-lo. */
  adicional?: "pacote";
  /** Leva à seção da landing, como a demonstração da Jade. */
  demonstracao?: string;
}

export interface PlanoComercial {
  codigo: "essencial" | "profissional" | "ilimitado";
  nome: string;
  destaque: boolean;
  resumo: string;
  limites: string[];
  itens: ItemPlano[];
}

/** Limites e módulos seguem a API e o painel. Valores sob consulta. */
export const PLANOS: PlanoComercial[] = [
  {
    codigo: "essencial",
    nome: "Essencial",
    destaque: false,
    resumo: "Para o consultório operar agenda, pacientes, convênios e a equipe.",
    limites: ["Até 5 usuários", "1 unidade"],
    itens: [
      { texto: "Dashboard", status: "disponivel" },
      { texto: "Pacientes e acompanhamento de evolução", status: "disponivel" },
      { texto: "Agenda do dia, da semana e do mês, com bloqueio e lista de espera", status: "disponivel" },
      { texto: "Profissionais", status: "disponivel" },
      { texto: "Convênios, tabela de preços e autorização prévia", status: "disponivel" },
      { texto: "RH: ponto e holerites", status: "disponivel" },
      { texto: "Configurações, permissões, procedimentos e tema claro ou escuro", status: "disponivel" },
      {
        texto: "Implantação e importação de pacientes opcionais, só na primeira cobrança",
        status: "disponivel",
        adicional: "pacote",
      },
    ],
  },
  {
    codigo: "profissional",
    nome: "Profissional",
    destaque: true,
    resumo: "Para a clínica que fecha o caixa, controla estoque e lê os indicadores.",
    limites: ["Até 20 usuários", "Unidades sem limite", "Implantação e importação inclusas"],
    itens: [
      { texto: "Tudo do Essencial", status: "disponivel" },
      { texto: "Implantação inclusa", status: "disponivel" },
      { texto: "Importação de pacientes e agenda inclusa", status: "disponivel" },
      { texto: "Contas a receber e a pagar, fluxo de caixa e DRE simplificado", status: "disponivel" },
      { texto: "Baixa em PIX, dinheiro, cartão ou boleto", status: "disponivel" },
      { texto: "Lotes de convênio, glosa e comissões", status: "disponivel" },
      { texto: "Estoque com alerta de quantidade mínima", status: "disponivel" },
      { texto: "Relatórios com exportação CSV", status: "disponivel" },
    ],
  },
  {
    codigo: "ilimitado",
    nome: "Ilimitado",
    destaque: false,
    resumo: "Para confirmar a agenda sozinha e reservar os módulos avançados.",
    limites: ["Usuários sem limite", "Unidades sem limite", "Implantação e importação inclusas"],
    itens: [
      { texto: "Tudo do Profissional", status: "disponivel" },
      { texto: "Implantação inclusa", status: "disponivel" },
      { texto: "Importação de cadastro e agenda inclusa", status: "disponivel" },
      { texto: "Lembretes de consulta por WhatsApp e e-mail", status: "disponivel" },
      { texto: "Jade IA para administrador e gestor", status: "disponivel", demonstracao: "#jade" },
    ],
  },
];
