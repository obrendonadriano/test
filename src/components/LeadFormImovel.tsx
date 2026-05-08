import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LEAD_TABLES } from '../lib/leadTables';
import { saveContactConsent } from '../lib/consent';
import { trackLead } from '../lib/meta';
import { buildLeadWhatsAppMessage, openLeadWhatsApp } from '../lib/whatsapp';
import { maskCPF, maskPhone, maskCurrency, maskDate, parseCurrency, parseDateToISO } from '../utils/masks';
import { CheckCircle2, Loader2, MessageCircle, X } from 'lucide-react';
import './LeadForm.css';

export default function LeadFormImovel() {
  const [step, setStep] = useState(1);
  const [draftLeadId, setDraftLeadId] = useState<string | null>(null);
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
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishPopup, setShowFinishPopup] = useState(false);
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);
  const [whatsAppError, setWhatsAppError] = useState('');
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
        placa: 'IMOVEL-PENDENTE',
        ano: 0,
        valor_desejado: parseCurrency(formData.valor_desejado),
      };

      if (draftLeadId) {
        const { error: updateError } = await supabase
          .from(LEAD_TABLES.imovel)
          .update(draftData)
          .eq('id', draftLeadId);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from(LEAD_TABLES.imovel)
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

      const { error: supabaseError } = draftLeadId
        ? await supabase
            .from(LEAD_TABLES.imovel)
            .update(dados)
            .eq('id', draftLeadId)
        : await supabase
            .from(LEAD_TABLES.imovel)
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

      setShowFinishPopup(true);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err) || 'Erro ao enviar sua solicitação. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishOnWhatsApp = async () => {
    setWhatsAppError('');
    setIsOpeningWhatsApp(true);

    try {
      const message = buildLeadWhatsAppMessage({
        productLabel: 'Crédito com garantia de imóvel',
        nome: formData.nome,
        telefone: formData.telefone,
        cpf: formData.cpf,
        dataNascimento: formData.data_nascimento,
        valorDesejado: formData.valor_desejado,
        garantia: formData.tipo_imovel,
        ano: formData.ano_imovel,
      });

      await openLeadWhatsApp(message);
    } catch (err) {
      setWhatsAppError(getErrorMessage(err));
    } finally {
      setIsOpeningWhatsApp(false);
    }
  };

  return (
    <>
    <div className="lead-form-container">
      <div className="form-step-header">
        <div>
          <h2 className="form-title">{step === 1 ? 'Comece sua simulação' : 'Complete seus dados'}</h2>
          <p className="form-subtitle">
            {step === 1
              ? 'Receba uma análise rápida e sem compromisso.'
              : 'Falta pouco para receber sua proposta de imóvel.'}
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

          </>
        )}
      </form>

      <div className="terms-text">
        Ao continuar, você autoriza a análise das suas informações para contato e oferta de crédito relacionada à sua solicitação. Seus dados serão tratados conforme a LGPD.
      </div>
    </div>
    {showFinishPopup && (
      <div className="lead-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="lead-popup-title">
        <div className="lead-popup">
          <button className="lead-popup-close" type="button" onClick={() => setShowFinishPopup(false)} aria-label="Fechar">
            <X size={18} />
          </button>
          <div className="lead-popup-icon">
            <CheckCircle2 size={34} />
          </div>
          <h3 id="lead-popup-title">Sua simulação está quase finalizada</h3>
          <p>
            Para acelerar sua análise, finalize pelo WhatsApp com seus dados já preenchidos.
            Assim nossa equipe consegue continuar seu atendimento mais rápido.
          </p>
          {whatsAppError && <div className="form-error lead-popup-error">{whatsAppError}</div>}
          <button className="btn btn-primary lead-popup-whatsapp" type="button" onClick={handleFinishOnWhatsApp} disabled={isOpeningWhatsApp}>
            {isOpeningWhatsApp ? <Loader2 className="animate-spin mr-2" size={20} /> : <MessageCircle size={20} />}
            {isOpeningWhatsApp ? 'Abrindo WhatsApp...' : 'Finalizar pelo WhatsApp'}
          </button>
        </div>
      </div>
    )}
    </>
  );
}
