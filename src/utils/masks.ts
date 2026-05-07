export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const maskPhone = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length < 11) {
    return cleanValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
  return cleanValue
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const maskPlate = (value: string) => {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .replace(/^([A-Z]{3})(\d[A-Z0-9]\d{2})/, '$1-$2') // Mercosul or standard
    .replace(/^([A-Z]{3})(\d{4})/, '$1-$2') // Standard fallback
    .substring(0, 8);
};

export const maskCurrency = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';
  const amount = parseInt(cleanValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const parseCurrency = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue ? parseInt(cleanValue) / 100 : 0;
};
