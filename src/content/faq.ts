export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Meu contador já cuida disso. Por que precisaria de vocês?',
    answer:
      'O contador opera o dia a dia: apuração, guias, obrigações acessórias. A Sessão Estratégica diagnostica oportunidades estruturais — créditos não aproveitados, regimes mal aplicados, NCM equivocada, repactuação de cláusulas, parametrização do ERP — que escapam do operacional. O bom contador é nosso aliado, não substituto.',
  },
  {
    question: 'Quanto custa o êxito? Não fica caro se eu economizar muito?',
    answer:
      'Nosso honorário é um percentual da economia mensurada — definido em contrato, sem surpresa. Quanto maior a captura, maior o ganho líquido para a sua empresa também. A lógica é simples: se você ganhou muito, é porque destravamos algo grande. Risco zero, ganho compartilhado.',
  },
  {
    question: 'Posso esperar 2027 para reagir à Reforma?',
    answer:
      '2026 já é ano de teste de alíquotas. Quem reorganiza cadeia, contratos e parametrização antes captura. Quem espera, paga mais — e ainda absorve impacto de margem que poderia ter sido protegido. A janela útil é agora.',
  },
  {
    question: 'Já tenho contrato com Big4. Faz sentido somar?',
    answer:
      'Sim, em muitos casos. Big4 entrega volume e estrutura; nós entregamos profundidade técnica em pontos específicos com risco financeiro do nosso lado. Costumamos atuar de forma complementar — sem conflito de escopo.',
  },
  {
    question: 'Que dado preciso fornecer para o diagnóstico?',
    answer:
      'Acesso aos arquivos SPED Fiscal, SPED Contribuições, EFD-ICMS/IPI dos últimos 12 meses, balancete contábil sintético e, idealmente, acesso de leitura ao ERP. Tudo sob acordo de confidencialidade. Não fazemos diagnóstico cego.',
  },
  {
    question: 'Quanto tempo leva da Sessão à primeira economia?',
    answer:
      'O diagnóstico leva cerca de duas semanas. Recuperações administrativas e parametrização entram em até 60 dias. Teses que dependem de medida judicial ou processo administrativo têm prazo próprio. Tudo é sinalizado no Plano de Captura.',
  },
  {
    question: 'Como é a confidencialidade dos meus dados fiscais?',
    answer:
      'Acordo de confidencialidade (NDA) assinado antes de qualquer acesso. Dados tratados conforme a LGPD, em ambiente controlado. Equipe envolvida é a mínima necessária. Após o projeto, dados podem ser devolvidos ou destruídos a seu critério.',
  },
  {
    question: 'Vocês atendem empresas fora de SP?',
    answer:
      'Sim. Atuação nacional. Nossa metodologia é remota-first — toda análise técnica é feita em cima do dado fiscal eletrônico. Reuniões presenciais quando o caso pede.',
  },
];
