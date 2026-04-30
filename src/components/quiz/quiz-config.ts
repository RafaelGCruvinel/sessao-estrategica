export type RejectionReason = 'porte' | 'dado' | 'preco';

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  score: number;
  reject?: RejectionReason;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  helper?: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'faturamento',
    prompt: 'Qual o faturamento anual da empresa?',
    helper: 'Faixa aproximada — usamos para validar o porte do produto.',
    options: [
      {
        value: 'ate-4-8',
        label: 'Até R$ 4,8 milhões',
        description: 'Microempresa ou empresa de pequeno porte',
        score: 0,
        reject: 'porte',
      },
      {
        value: '4-8-a-80',
        label: 'R$ 4,8 milhões a R$ 80 milhões',
        score: 1,
      },
      {
        value: '80-a-300',
        label: 'R$ 80 milhões a R$ 300 milhões',
        description: 'Faixa central do nosso atendimento',
        score: 3,
      },
      {
        value: 'acima-300',
        label: 'Acima de R$ 300 milhões',
        score: 2,
      },
    ],
  },
  {
    id: 'setor',
    prompt: 'Qual é o setor principal da sua empresa?',
    helper: 'O impacto da Reforma varia muito por setor — ajuda a calibrar a Sessão.',
    options: [
      { value: 'industria', label: 'Indústria / Manufatura', score: 3 },
      { value: 'varejo', label: 'Comércio / Varejo', score: 3 },
      { value: 'distribuicao', label: 'Distribuição / Atacado', score: 2 },
      { value: 'servicos', label: 'Serviços', score: 1 },
      { value: 'outros', label: 'Outros', score: 0 },
    ],
  },
  {
    id: 'erp',
    prompt: 'Qual ERP / sistema fiscal a empresa utiliza?',
    helper: 'O diagnóstico depende de baseline de dado fiscal estruturado.',
    options: [
      {
        value: 'erp-grande',
        label: 'TOTVS, SAP, Oracle, Sankhya, Senior, Microsiga',
        score: 3,
      },
      {
        value: 'erp-nacional',
        label: 'Outro ERP nacional com SPED estruturado',
        score: 2,
      },
      {
        value: 'planilhas',
        label: 'Planilhas + contador externo',
        description: 'Sem ERP estruturado — modelo de êxito requer baseline mensurável',
        score: 0,
        reject: 'dado',
      },
      {
        value: 'nao-sei',
        label: 'Não tenho certeza',
        score: 0,
      },
    ],
  },
  {
    id: 'papel',
    prompt: 'Qual é o seu papel na empresa?',
    helper: 'Saber o seu papel ajuda a preparar a Sessão na linguagem certa.',
    options: [
      { value: 'cfo', label: 'CFO / Diretor Financeiro / Sócio', score: 3 },
      { value: 'controller', label: 'Controller / Coordenador Tributário / Contador interno', score: 2 },
      { value: 'analista', label: 'Analista fiscal', score: 1 },
      { value: 'outro', label: 'Outro', score: 0 },
    ],
  },
  {
    id: 'momento',
    prompt: 'O que melhor descreve o seu momento atual?',
    helper: 'O gatilho da conversa muda como conduzimos a Sessão.',
    options: [
      { value: 'planejando', label: 'Estamos planejando proativamente a transição da Reforma', score: 3 },
      { value: 'pressao', label: 'Sentimos pressão de margem e queremos diagnóstico', score: 3 },
      { value: 'autuacao', label: 'Tivemos autuação ou contingência recente', score: 2 },
      {
        value: 'preco',
        label: 'Estou pesquisando preço de soluções tributárias',
        description: 'Trabalhamos com modelo de êxito — não vendemos por tabela de preço',
        score: 0,
        reject: 'preco',
      },
    ],
  },
  {
    id: 'exito',
    prompt: 'Você está aberto a um modelo de honorário 100% atrelado à economia comprovada?',
    helper: 'Esse é o nosso formato padrão. Existem variações em casos específicos.',
    options: [
      { value: 'sim', label: 'Sim — faz total sentido', score: 3 },
      { value: 'entender', label: 'Preciso entender melhor antes', score: 2 },
      { value: 'fixo', label: 'Prefiro fee fixo sempre', score: 1 },
    ],
  },
];

export const APPROVAL_THRESHOLD_FULL = 12;
export const APPROVAL_THRESHOLD_PARTIAL = 8;

export interface QuizResult {
  status: 'approved' | 'partial' | 'rejected';
  score: number;
  rejectionReason?: RejectionReason;
}

export function evaluateAnswers(answers: Record<string, string>): QuizResult {
  let score = 0;
  let rejectionReason: RejectionReason | undefined;

  for (const question of QUIZ_QUESTIONS) {
    const answerValue = answers[question.id];
    if (!answerValue) continue;
    const option = question.options.find((o) => o.value === answerValue);
    if (!option) continue;

    if (option.reject && !rejectionReason) {
      rejectionReason = option.reject;
    }

    score += option.score;
  }

  if (rejectionReason) {
    return { status: 'rejected', score, rejectionReason };
  }

  if (score >= APPROVAL_THRESHOLD_FULL) {
    return { status: 'approved', score };
  }

  if (score >= APPROVAL_THRESHOLD_PARTIAL) {
    return { status: 'partial', score };
  }

  return { status: 'rejected', score, rejectionReason: 'porte' };
}

export function findOptionLabel(questionId: string, value: string): string {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return value;
  const option = question.options.find((o) => o.value === value);
  return option?.label ?? value;
}
