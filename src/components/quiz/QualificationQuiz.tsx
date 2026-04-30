import { useMemo, useState } from 'preact/hooks';
import {
  QUIZ_QUESTIONS,
  evaluateAnswers,
  findOptionLabel,
  type QuizResult,
} from './quiz-config';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

type Stage = 'intro' | 'questions' | 'contact' | 'result';

interface ContactData {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  consentimento: boolean;
}

const initialContact: ContactData = {
  nome: '',
  empresa: '',
  email: '',
  telefone: '',
  consentimento: false,
};

export default function QualificationQuiz() {
  const [stage, setStage] = useState<Stage>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState<ContactData>(initialContact);
  const [honeypot, setHoneypot] = useState('');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactData, string>>>({});

  const currentQuestion = QUIZ_QUESTIONS[stepIndex];
  const totalSteps = QUIZ_QUESTIONS.length;
  const progressPct = useMemo(() => {
    if (stage === 'intro') return 0;
    if (stage === 'questions') return Math.round(((stepIndex + 1) / (totalSteps + 1)) * 100);
    if (stage === 'contact') return Math.round((totalSteps / (totalSteps + 1)) * 100) + 10;
    return 100;
  }, [stage, stepIndex, totalSteps]);

  const start = () => {
    setStage('questions');
    setStepIndex(0);
  };

  const selectOption = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const advance = () => {
    if (!answers[currentQuestion.id]) return;

    if (stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Avalia e decide próximo passo
      const evaluation = evaluateAnswers(answers);
      if (evaluation.status === 'rejected') {
        // Rejeição imediata — pula contato
        setResult(evaluation);
        setStage('result');
      } else {
        setStage('contact');
      }
    }
  };

  const goBack = () => {
    if (stage === 'contact') {
      setStage('questions');
      return;
    }
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else {
      setStage('intro');
    }
  };

  const validateContact = (): boolean => {
    const errors: Partial<Record<keyof ContactData, string>> = {};
    if (!contact.nome.trim()) errors.nome = 'Informe o seu nome';
    if (!contact.empresa.trim()) errors.empresa = 'Informe o nome da empresa';
    if (!contact.email.trim()) {
      errors.email = 'Informe um e-mail corporativo';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.email = 'E-mail inválido';
    }
    if (!contact.consentimento) errors.consentimento = 'É necessário concordar com a Política de Privacidade';
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitContact = (e: Event) => {
    e.preventDefault();
    if (honeypot) return; // honeypot acionado, abortar silenciosamente
    if (!validateContact()) return;

    const evaluation = evaluateAnswers(answers);
    setResult(evaluation);
    setStage('result');

    if (evaluation.status === 'approved' || evaluation.status === 'partial') {
      const url = buildWhatsAppUrl({
        nome: contact.nome.trim(),
        papel: findOptionLabel('papel', answers.papel ?? ''),
        empresa: contact.empresa.trim(),
        faturamento: findOptionLabel('faturamento', answers.faturamento ?? ''),
        setor: findOptionLabel('setor', answers.setor ?? ''),
        erp: findOptionLabel('erp', answers.erp ?? ''),
        momento: findOptionLabel('momento', answers.momento ?? ''),
        abertura_exito: findOptionLabel('exito', answers.exito ?? ''),
        email: contact.email.trim(),
        telefone: contact.telefone.trim() || undefined,
        fitParcial: evaluation.status === 'partial',
      });

      // Pequeno delay para o usuário ver a tela de sucesso antes do redirect
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 800);
    }
  };

  const reset = () => {
    setStage('intro');
    setStepIndex(0);
    setAnswers({});
    setContact(initialContact);
    setContactErrors({});
    setResult(null);
  };

  const rejectionPath = (reason: string) => `/nao-elegivel?motivo=${reason}`;

  return (
    <div class="bg-gray-50 border border-gray-200 rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      {/* Progress bar */}
      <div class="h-1 bg-gray-200 relative" aria-hidden="true">
        <div
          class="absolute left-0 top-0 h-full bg-copper-500 transition-all duration-500 ease-out"
          style={`width: ${progressPct}%`}
        />
      </div>

      <div class="p-6 sm:p-10 md:p-12">
        {/* Honeypot - hidden from real users */}
        <div
          aria-hidden="true"
          style="position:absolute;left:-9999px;top:-9999px;height:1px;width:1px;overflow:hidden;"
        >
          <label>
            Não preencha este campo
            <input
              type="text"
              tabIndex={-1}
              autocomplete="off"
              value={honeypot}
              onInput={(e) => setHoneypot((e.currentTarget as HTMLInputElement).value)}
            />
          </label>
        </div>

        {stage === 'intro' && <IntroStage onStart={start} />}

        {stage === 'questions' && currentQuestion && (
          <QuestionStage
            question={currentQuestion}
            selectedValue={answers[currentQuestion.id]}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            onSelect={(value) => selectOption(currentQuestion.id, value)}
            onAdvance={advance}
            onBack={goBack}
          />
        )}

        {stage === 'contact' && (
          <ContactStage
            contact={contact}
            errors={contactErrors}
            onChange={(field, value) => setContact((prev) => ({ ...prev, [field]: value }))}
            onSubmit={submitContact}
            onBack={goBack}
          />
        )}

        {stage === 'result' && result && (
          <ResultStage result={result} contact={contact} onReset={reset} rejectionPath={rejectionPath} />
        )}
      </div>
    </div>
  );
}

// ---------- Stages ----------

function IntroStage({ onStart }: { onStart: () => void }) {
  return (
    <div class="text-center max-w-xl mx-auto py-4">
      <p class="eyebrow">Sessão Estratégica</p>
      <h3 class="mt-4 font-display text-3xl md:text-4xl text-navy-900 leading-tight text-balance">
        Vamos garantir que a Sessão faz sentido para a sua empresa
      </h3>
      <p class="mt-5 text-base text-gray-700 leading-relaxed text-pretty">
        São 6 perguntas rápidas — cerca de 90 segundos. O objetivo é entender o seu contexto antes
        de marcar a conversa, para que ela seja útil de verdade.
      </p>
      <button
        type="button"
        onClick={onStart}
        class="mt-8 inline-flex items-center justify-center gap-2 px-7 py-4 bg-copper-500 hover:bg-copper-400 active:bg-copper-600 text-navy-900 font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-copper-400 focus-visible:outline-offset-2"
      >
        Começar
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8H13M13 8L8 3M13 8L8 13"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <p class="mt-6 text-xs text-gray-500">
        Suas respostas não são armazenadas — elas só são enviadas via WhatsApp se você decidir
        prosseguir ao final.
      </p>
    </div>
  );
}

function QuestionStage({
  question,
  selectedValue,
  stepIndex,
  totalSteps,
  onSelect,
  onAdvance,
  onBack,
}: {
  question: (typeof QUIZ_QUESTIONS)[number];
  selectedValue: string | undefined;
  stepIndex: number;
  totalSteps: number;
  onSelect: (value: string) => void;
  onAdvance: () => void;
  onBack: () => void;
}) {
  return (
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-copper-600">
          Pergunta {stepIndex + 1} <span class="text-gray-400">de {totalSteps}</span>
        </p>
        <button
          type="button"
          onClick={onBack}
          class="text-xs font-medium text-gray-500 hover:text-navy-700 transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M11 7H3M3 7L6 4M3 7L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Voltar
        </button>
      </div>

      <h3 class="font-display text-2xl md:text-3xl text-navy-900 leading-tight text-balance">
        {question.prompt}
      </h3>
      {question.helper && (
        <p class="mt-3 text-sm text-gray-600 leading-relaxed">{question.helper}</p>
      )}

      <fieldset class="mt-7 space-y-3">
        <legend class="sr-only">{question.prompt}</legend>
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <label
              class={[
                'group relative flex items-start gap-4 p-4 md:p-5 rounded-lg border cursor-pointer transition-all',
                isSelected
                  ? 'border-copper-500 bg-copper-500/5 shadow-[0_0_0_1px_var(--color-copper-500)]'
                  : 'border-gray-200 bg-white hover:border-navy-700/40 hover:bg-gray-50',
              ].join(' ')}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={isSelected}
                onChange={() => onSelect(option.value)}
                class="sr-only"
              />
              <span
                aria-hidden="true"
                class={[
                  'mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSelected ? 'border-copper-500 bg-copper-500' : 'border-gray-300 group-hover:border-navy-700',
                ].join(' ')}
              >
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                )}
              </span>
              <span class="flex-1">
                <span class="block text-base font-medium text-navy-900 leading-snug">{option.label}</span>
                {option.description && (
                  <span class="block mt-1 text-xs text-gray-600 leading-snug">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div class="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onAdvance}
          disabled={!selectedValue}
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-700 hover:bg-navy-600 active:bg-navy-800 text-gray-50 font-medium rounded-md transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-copper-400 focus-visible:outline-offset-2"
        >
          {stepIndex === totalSteps - 1 ? 'Continuar' : 'Próxima'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ContactStage({
  contact,
  errors,
  onChange,
  onSubmit,
  onBack,
}: {
  contact: ContactData;
  errors: Partial<Record<keyof ContactData, string>>;
  onChange: <K extends keyof ContactData>(field: K, value: ContactData[K]) => void;
  onSubmit: (e: Event) => void;
  onBack: () => void;
}) {
  return (
    <form class="max-w-2xl mx-auto" onSubmit={onSubmit} novalidate>
      <div class="flex items-center justify-between mb-8">
        <p class="text-xs font-semibold uppercase tracking-widest text-copper-600">
          Quase lá <span class="text-gray-400">— última etapa</span>
        </p>
        <button
          type="button"
          onClick={onBack}
          class="text-xs font-medium text-gray-500 hover:text-navy-700 transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M11 7H3M3 7L6 4M3 7L6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Voltar
        </button>
      </div>

      <h3 class="font-display text-2xl md:text-3xl text-navy-900 leading-tight text-balance">
        Como podemos contatar você para marcar a Sessão?
      </h3>
      <p class="mt-3 text-sm text-gray-600 leading-relaxed">
        Você será redirecionado para o nosso WhatsApp com um resumo do contexto. O agendamento é
        feito ali mesmo.
      </p>

      <div class="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label="Nome completo"
          name="nome"
          value={contact.nome}
          onInput={(v) => onChange('nome', v)}
          error={errors.nome}
          autocomplete="name"
          required
        />
        <Field
          label="Empresa"
          name="empresa"
          value={contact.empresa}
          onInput={(v) => onChange('empresa', v)}
          error={errors.empresa}
          autocomplete="organization"
          required
        />
        <Field
          label="E-mail corporativo"
          name="email"
          type="email"
          value={contact.email}
          onInput={(v) => onChange('email', v)}
          error={errors.email}
          autocomplete="email"
          required
        />
        <Field
          label="Telefone (opcional)"
          name="telefone"
          type="tel"
          value={contact.telefone}
          onInput={(v) => onChange('telefone', v)}
          autocomplete="tel"
        />
      </div>

      <label class="mt-6 flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={contact.consentimento}
          onChange={(e) => onChange('consentimento', (e.currentTarget as HTMLInputElement).checked)}
          class="mt-1 h-4 w-4 rounded border-gray-300 text-copper-500 focus:ring-copper-500 cursor-pointer"
        />
        <span class="text-sm text-gray-700 leading-relaxed">
          Concordo com a{' '}
          <a href="/politica-privacidade" target="_blank" rel="noopener" class="text-navy-700 underline hover:text-copper-600">
            Política de Privacidade
          </a>{' '}
          e autorizo o contato comercial via WhatsApp para o agendamento desta Sessão Estratégica.
        </span>
      </label>
      {errors.consentimento && (
        <p class="mt-2 text-xs text-danger font-medium">{errors.consentimento}</p>
      )}

      <div class="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 px-7 py-4 bg-copper-500 hover:bg-copper-400 active:bg-copper-600 text-navy-900 font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-copper-400 focus-visible:outline-offset-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
          </svg>
          Enviar e abrir WhatsApp
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onInput,
  type = 'text',
  required,
  error,
  autocomplete,
}: {
  label: string;
  name: string;
  value: string;
  onInput: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  autocomplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
        {label}
        {required && <span class="text-copper-600 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        required={required}
        autocomplete={autocomplete}
        onInput={(e) => onInput((e.currentTarget as HTMLInputElement).value)}
        class={[
          'w-full px-4 py-3 bg-white border rounded-md text-base text-navy-900 placeholder:text-gray-400 transition-colors',
          'focus:outline-none focus:border-copper-500 focus:ring-2 focus:ring-copper-500/20',
          error ? 'border-danger' : 'border-gray-300 hover:border-gray-400',
        ].join(' ')}
      />
      {error && <p class="mt-1.5 text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}

function ResultStage({
  result,
  contact,
  onReset,
  rejectionPath,
}: {
  result: QuizResult;
  contact: ContactData;
  onReset: () => void;
  rejectionPath: (reason: string) => string;
}) {
  if (result.status === 'rejected' && result.rejectionReason) {
    // Redireciona para página de não-elegibilidade
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = rejectionPath(result.rejectionReason!);
      }, 1500);
    }
    return (
      <div class="text-center max-w-lg mx-auto py-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-warning/10 text-warning mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V13M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="font-display text-2xl text-navy-900 leading-tight">
          Vamos te direcionar para uma rota mais adequada
        </h3>
        <p class="mt-3 text-sm text-gray-700 leading-relaxed">
          Pelo seu contexto, a Sessão Estratégica padrão pode não ser o melhor primeiro passo.
          Estamos preparando uma resposta mais útil para você...
        </p>
      </div>
    );
  }

  const isPartial = result.status === 'partial';

  return (
    <div class="text-center max-w-lg mx-auto py-6">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L10 17L20 7" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="font-display text-2xl md:text-3xl text-navy-900 leading-tight text-balance">
        {contact.nome ? `${contact.nome.split(' ')[0]}, sua Sessão está` : 'Sessão'} pronta para ser agendada
      </h3>
      <p class="mt-4 text-base text-gray-700 leading-relaxed text-pretty">
        Estamos te redirecionando para o WhatsApp com um resumo do contexto.
        {isPartial && ' Vamos confirmar alguns detalhes antes de marcar.'}
      </p>

      <div class="mt-8 inline-flex items-center gap-2 text-sm text-gray-500">
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Abrindo WhatsApp em nova aba...
      </div>

      <p class="mt-8 text-xs text-gray-500">
        A janela não abriu?{' '}
        <a href="/obrigado" class="text-navy-700 underline hover:text-copper-600">
          Use o link alternativo
        </a>
        {' '}ou{' '}
        <button type="button" onClick={onReset} class="text-navy-700 underline hover:text-copper-600">
          refazer o quiz
        </button>
        .
      </p>
    </div>
  );
}
