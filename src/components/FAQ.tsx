import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Posso continuar sem autorizar?',
      answer: 'Não. A autorização é necessária para dar continuidade à sua solicitação, pois precisamos analisar seu perfil de crédito de forma segura.'
    },
    {
      question: 'O que é o SCR?',
      answer: 'É o Sistema de Informações de Crédito do Banco Central, utilizado por instituições financeiras para análise de crédito, garantindo que as propostas estejam alinhadas à sua realidade financeira.'
    }
  ];

  return (
    <div className="mt-8 mb-8">
      <h3 className="form-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Perguntas frequentes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem', background: 'var(--color-white)', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontWeight: 500, color: 'var(--color-text)'
              }}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {faq.question}
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openIndex === index && (
              <div style={{ padding: '0 1rem 1rem 1rem', background: 'var(--color-white)', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
