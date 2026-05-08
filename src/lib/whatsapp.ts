import { supabase } from './supabase';

export const WHATSAPP_DESTINATIONS_TABLE = 'whatsapp_destinations';

export type WhatsAppDestination = {
  id: string;
  label: string;
  phone: string;
  active: boolean;
  created_at?: string;
};

export type WhatsAppLeadMessage = {
  productLabel: string;
  nome: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  valorDesejado: string;
  garantia: string;
  ano: string;
};

export const normalizeWhatsAppPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('55')) return digits;

  return `55${digits}`;
};

export const buildLeadWhatsAppMessage = (lead: WhatsAppLeadMessage) => {
  return [
    'Olá, quero finalizar minha simulação na Averbai.',
    '',
    `Produto: ${lead.productLabel}`,
    `Nome: ${lead.nome}`,
    `Telefone: ${lead.telefone}`,
    `CPF: ${lead.cpf}`,
    `Data de nascimento: ${lead.dataNascimento}`,
    `Valor desejado: ${lead.valorDesejado}`,
    `Garantia: ${lead.garantia}`,
    `Ano: ${lead.ano}`,
  ].join('\n');
};

export const fetchActiveWhatsAppDestinations = async () => {
  const { data, error } = await supabase
    .from(WHATSAPP_DESTINATIONS_TABLE)
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []) as WhatsAppDestination[];
};

export const openLeadWhatsApp = async (message: string) => {
  const destinations = await fetchActiveWhatsAppDestinations();
  const destination = destinations[Math.floor(Math.random() * destinations.length)];

  if (!destination) {
    throw new Error('Nenhum WhatsApp ativo foi configurado no painel.');
  }

  const phone = normalizeWhatsAppPhone(destination.phone);

  if (!phone) {
    throw new Error('O WhatsApp ativo está sem número válido.');
  }

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
};
