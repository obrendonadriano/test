
import { Clock, ShieldCheck, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import LeadForm from '../components/LeadForm';
import FAQ from '../components/FAQ';
import './Simulacao.css';

export default function SimulacaoVeiculo() {
  return (
    <div className="home-wrapper">
      <main className="main-content">
        <div className="container hero-grid">
          <div className="hero-text">
            <div className="hero-brand">
              <img src={`${import.meta.env.BASE_URL}3.png`} alt="Averbai" className="hero-banner" />
            </div>
            <h1 className="hero-title">Simule seu crédito com seu carro em garantia</h1>
            <p className="hero-subtitle">Dinheiro rápido, taxas acessíveis e você continua usando seu veículo.</p>
            <p className="hero-support">Preencha seus dados e receba uma proposta personalizada sem nenhum compromisso. É rápido e 100% online.</p>

            <div className="features-list">
              <div className="feature-item">
                <DollarSign className="feature-icon" size={24} />
                <span>As melhores taxas do mercado</span>
              </div>
              <div className="feature-item">
                <Clock className="feature-icon" size={24} />
                <span>Análise rápida e sem burocracia</span>
              </div>
              <div className="feature-item">
                <ShieldCheck className="feature-icon" size={24} />
                <span>Processo 100% seguro e confidencial</span>
              </div>
            </div>
          </div>

          <div className="hero-form">
            <LeadForm />
            <FAQ />
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Averbai. Todos os direitos reservados.</p>
          <div className="footer-links">
            <Link to="/politica-de-privacidade">Política de Privacidade</Link>
            <Link to="/termos-de-uso">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
