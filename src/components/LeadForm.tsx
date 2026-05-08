import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LEAD_TABLES } from '../lib/leadTables';
import { saveContactConsent } from '../lib/consent';
import { trackLead } from '../lib/meta';
import { maskCPF, maskPhone, maskPlate, maskCurrency, maskDate, parseCurrency, parseDateToISO } from '../utils/masks';
import { CheckCircle2, Loader2 } from 'lucide-react';
import './LeadForm.css';

export default function LeadForm() {
  const [step, setStep] = useState(1);
  const [draftLeadId, setDraftLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    data_nascimento: '',
    placa: '',
    ano: '',
    valor_desejado: '',
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSaibaMais, setShowSaibaMais] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (err: unknown) => {
    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
      return err.message;
    }

    return err instanceof Error ? err.message : 'Erro ao salvar os dados. Tente novamente.';
  };

  const goToDetailsStep = async () => {
    setError('');

    if (!formData.nome.trim() || formData.telefone.replace(/\D/g, '').length < 10 || !parseCurrency(formData.valor_desejado)) {
      setError('Preencha nome, WhatsApp e valor desejado para continuar.');
      return;
    }

    setIsSavingDraft(true);

    try {
      const draftData = {
        nome: formData.nome,
        cpf: '',
        telefone: formData.telefone.replace(/\D/g, ''),
        data_nascimento: null,
        placa: 'PENDENTE-VEICULO',
        ano: 0,
        valor_desejado: parseCurrency(formData.valor_desejado),
      };

      if (draftLeadId) {
        const { error: updateError } = await supabase
          .from(LEAD_TABLES.veiculo)
          .update(draftData)
          .eq('id', draftLeadId);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from(LEAD_TABLES.veiculo)
          .insert([draftData])
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (data?.id) setDraftLeadId(data.id);
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'cpf') formattedValue = maskCPF(value);
    if (name === 'telefone') formattedValue = maskPhone(value);
    if (name === 'placa') formattedValue = maskPlate(value);
    if (name === 'valor_desejado') formattedValue = maskCurrency(value);
    if (name === 'data_nascimento') formattedValue = maskDate(value);
    if (name === 'ano') formattedValue = value.replace(/\D/g, '').substring(0, 4);
    
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
      const dados = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        data_nascimento: parseDateToISO(formData.data_nascimento),
        placa: formData.placa,
        ano: Number(formData.ano),
        valor_desejado: parseCurrency(formData.valor_desejado),
      };

      const { error: supabaseError } = draftLeadId
        ? await supabase
            .from(LEAD_TABLES.veiculo)
            .update(dados)
            .eq('id', draftLeadId)
        : await supabase
            .from(LEAD_TABLES.veiculo)
            .insert([dados]);

      if (supabaseError) {
        throw supabaseError;
      }

      trackLead({
        contentName: 'Simulação garantia de veículo',
        fullName: formData.nome,
        phone: formData.telefone,
        cpf: formData.cpf,
        value: dados.valor_desejado,
        productType: 'veiculo',
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err) || 'Erro ao enviar sua solicitação. Tente novamente mais tarde.');
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
          Recebemos sua solicitação com sucesso. Em breve, um de nossos especialistas entrará em contato com uma proposta personalizada para você.
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
              placa: '', ano: '', valor_desejado: ''
            });
            setTermsAccepted(false);
            setDraftLeadId(null);
            setStep(1);
          }}
        >
          Fazer nova simulação
        </button>
      </div>
    );
  }

  return (
    <div className="lead-form-container">
      <div className="form-step-header">
        <div>
          <h2 className="form-title">{step === 1 ? 'Comece sua simulação' : 'Complete seus dados'}</h2>
          <p className="form-subtitle">
            {step === 1
              ? 'Receba uma análise rápida e sem compromisso.'
              : 'Falta pouco para receber sua proposta personalizada.'}
          </p>
        </div>
        <span className="step-pill">Etapa {step} de 2</span>
      </div>

      {error && <div className="form-error mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        {step === 1 ? (
          <>
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

            <button type="button" className="btn btn-primary btn-submit" onClick={goToDetailsStep} disabled={isSavingDraft}>
              {isSavingDraft ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {isSavingDraft ? 'Salvando...' : 'Continuar'}
            </button>
          </>
        ) : (
          <>
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
            <label className="form-label">Placa do veículo</label>
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              className="form-input"
              placeholder="ABC-1234"
              maxLength={8}
              required
            />
          </div>

            <div className="form-group">
              <label className="form-label">Ano do veículo</label>
              <input
                type="text"
                name="ano"
                value={formData.ano}
                onChange={handleChange}
                className="form-input"
                placeholder="Ex: 2018"
                maxLength={4}
                required
              />
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
          {isSubmitting ? 'Enviando...' : 'Simular agora'}
        </button>

        <button type="button" className="btn-back-step" onClick={() => setStep(1)}>
          Voltar
        </button>
          </>
        )}
      </form>

      <div className="terms-text">
        Ao continuar, você autoriza a análise das suas informações para contato e oferta de crédito relacionada à sua solicitação. Seus dados serão tratados conforme a LGPD.
        
        <div>
          <button 
            type="button" 
            className="saiba-mais-btn"
            onClick={() => setShowSaibaMais(!showSaibaMais)}
          >
            {showSaibaMais ? 'Menos detalhes' : 'Saiba mais'}
          </button>
        </div>

        {showSaibaMais && (
          <div className="saiba-mais-content">
            Para oferecer as melhores condições de crédito, poderemos consultar informações relacionadas ao seu perfil financeiro e histórico de crédito, incluindo dados disponíveis em sistemas como o SCR do Banco Central. Estas informações são utilizadas exclusivamente para análise e oferta de produtos financeiros. Seus dados serão tratados com segurança e utilizados apenas para fins comerciais e legais.
          </div>
        )}
      </div>
    </div>
  );
}
