import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { saveContactConsent } from '../lib/consent';
import { trackLead } from '../lib/meta';
import { maskCPF, maskPhone, maskCurrency, maskDate, parseCurrency, parseDateToISO } from '../utils/masks';
import { CheckCircle2, Loader2 } from 'lucide-react';
import './LeadForm.css';

export default function LeadFormImovel() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    data_nascimento: '',
    tipo_imovel: 'Casa',
    ano_imovel: '',
    valor_desejado: '',
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'cpf') formattedValue = maskCPF(value);
    if (name === 'telefone') formattedValue = maskPhone(value);
    if (name === 'valor_desejado') formattedValue = maskCurrency(value);
    if (name === 'data_nascimento') formattedValue = maskDate(value);
    if (name === 'ano_imovel') formattedValue = value.replace(/\D/g, '').substring(0, 4);
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!termsAccepted) {
      setError('Você precisa aceitar os termos para continuar.');
      return;
    }

    saveContactConsent();
    setIsSubmitting(true);

    try {
      // Mapeando para o mesmo banco de dados sem quebrar nada
      // placa recebe o tipo_imovel, ano recebe ano_imovel
      const dados = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        data_nascimento: parseDateToISO(formData.data_nascimento),
        placa: `IMOVEL-${formData.tipo_imovel}`.substring(0, 20),
        ano: formData.ano_imovel ? Number(formData.ano_imovel) : 0,
        valor_desejado: parseCurrency(formData.valor_desejado),
      };

      const { error: supabaseError } = await supabase
        .from('leads_financiamento')
        .insert([dados]);

      if (supabaseError) {
        throw supabaseError;
      }

      trackLead({
        contentName: 'Simulação garantia de imóvel',
        fullName: formData.nome,
        phone: formData.telefone,
        cpf: formData.cpf,
        value: dados.valor_desejado,
        productType: 'imovel',
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao enviar sua solicitação. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="lead-form-container success-message" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <CheckCircle2 size={64} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h3 className="form-title" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
          Muito obrigado por escolher a Averbai!
        </h3>
        <p className="form-subtitle" style={{ color: 'var(--color-text-light)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Recebemos sua solicitação com sucesso. Em breve, um de nossos especialistas entrará em contato com uma proposta de crédito com garantia do seu imóvel.
        </p>

        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', textAlign: 'left', marginBottom: '2rem' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#25D366', flexShrink: 0, marginTop: '2px' }}>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', margin: 0, lineHeight: '1.4' }}>
            Usamos o <strong>WhatsApp</strong> como uma das nossas formas de contato com você, prometemos não enviar spam.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              nome: '', cpf: '', telefone: '', data_nascimento: '',
              tipo_imovel: 'Casa', ano_imovel: '', valor_desejado: ''
            });
            setTermsAccepted(false);
          }}
        >
          Fazer nova simulação
        </button>
      </div>
    );
  }

  return (
    <div className="lead-form-container">
      <h2 className="form-title">Dados para Garantia de Imóvel</h2>
      <p className="form-subtitle">E receba uma proposta personalizada sem compromisso.</p>

      {error && <div className="form-error mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label className="form-label">Nome completo</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="form-input"
            placeholder="Digite seu nome completo"
            required
          />
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className="form-input"
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone (WhatsApp)</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="form-input"
              placeholder="(00) 00000-0000"
              maxLength={15}
              required
            />
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Data de nascimento</label>
            <input
              type="text"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              className="form-input"
              placeholder="dd/mm/aaaa"
              inputMode="numeric"
              maxLength={10}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Valor desejado</label>
            <input
              type="text"
              name="valor_desejado"
              value={formData.valor_desejado}
              onChange={handleChange}
              className="form-input"
              placeholder="R$ 0,00"
              required
            />
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">Tipo de Imóvel</label>
            <select
              name="tipo_imovel"
              value={formData.tipo_imovel}
              onChange={handleChange}
              className="form-input"
              required
              style={{ backgroundColor: '#fff' }}
            >
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Comercial">Sala Comercial</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ano de construção (aprox.)</label>
            <input
              type="text"
              name="ano_imovel"
              value={formData.ano_imovel}
              onChange={handleChange}
              className="form-input"
              placeholder="Ex: 2010"
              maxLength={4}
              required
            />
          </div>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="checkbox-input"
          />
          <label htmlFor="terms" className="checkbox-label">
            Li e concordo com os <Link to="/termos-de-uso">Termos de Uso</Link> e com a{' '}
            <Link to="/politica-de-privacidade">Política de Privacidade</Link>, autorizando a Averbai a me contatar por telefone ou WhatsApp sobre esta simulação.
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {isSubmitting ? 'Enviando...' : 'Simular Imóvel'}
        </button>
      </form>

      <div className="terms-text">
        Ao continuar, você autoriza a análise das suas informações para contato e oferta de crédito relacionada à sua solicitação. Seus dados serão tratados conforme a LGPD.
      </div>
    </div>
  );
}
