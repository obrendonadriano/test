export const LEAD_TABLES = {
  veiculo: 'leads_veiculo',
  imovel: 'leads_imovel',
} as const;

export type LeadProductType = keyof typeof LEAD_TABLES;
