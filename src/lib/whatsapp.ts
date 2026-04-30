const FALLBACK_NUMBER = '5519940028922';

export interface WhatsAppPayload {
  nome: string;
  papel: string;
  empresa: string;
  faturamento: string;
  setor: string;
  erp: string;
  momento: string;
  abertura_exito: string;
  email: string;
  telefone?: string;
  fitParcial?: boolean;
}

export function getWhatsAppNumber(): string {
  const fromEnv = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
  if (fromEnv && /^\d{12,13}$/.test(fromEnv)) {
    return fromEnv;
  }
  return FALLBACK_NUMBER;
}

export function buildWhatsAppMessage(payload: WhatsAppPayload): string {
  const lines = [
    'Olá! Quero agendar uma Sessão Estratégica.',
    '',
    `— Nome: ${payload.nome}`,
    `— Papel: ${payload.papel}`,
    `— Empresa: ${payload.empresa}`,
    `— Faturamento: ${payload.faturamento}`,
    `— Setor: ${payload.setor}`,
    `— ERP: ${payload.erp}`,
    `— Momento atual: ${payload.momento}`,
    `— Abertura ao êxito: ${payload.abertura_exito}`,
    `— E-mail: ${payload.email}`,
  ];

  if (payload.telefone) {
    lines.push(`— Telefone: ${payload.telefone}`);
  }

  lines.push('');
  lines.push('[Origem: site Sessão Estratégica]');

  if (payload.fitParcial) {
    lines.push('[FIT PARCIAL — revisar antes de agendar]');
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(payload: WhatsAppPayload): string {
  const number = getWhatsAppNumber();
  const message = buildWhatsAppMessage(payload);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
