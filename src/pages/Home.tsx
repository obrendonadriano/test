import { Car, Home as HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <main className="main-content" style={{ width: '100%' }}>
        <div className="container selection-grid">
          <div className="selection-text">

            <span className="selection-badge">EMPRÉSTIMO ONLINE</span>
            <h1 className="selection-title">Crédito inteligente para quem sabe usar seu patrimônio.</h1>
            <p className="selection-subtitle">
              Sua casa ou seu carro são garantias para você ter um crédito com taxas bem baixas, mais prazo e parcelas que consegue pagar. Faça uma simulação e comprove o que é um crédito saudável de verdade.
            </p>

            <div className="reputation-badge" aria-label="Compromisso de atendimento Averbai">
              <img
                src={`${import.meta.env.BASE_URL}badges/reclame-aqui.webp`}
                alt="Reclame Aqui"
                className="reputation-logo"
              />
              <p>
                <strong>Ganhamos o Prêmio Reclame Aqui 2026:</strong>
                <span>melhor empresa de empréstimo online.</span>
              </p>
            </div>
          </div>

          <div className="selection-cards">
            {/* Card Veículo */}
            <div className="product-card">
              <div className="product-icon-wrapper">
                <Car className="product-icon" size={32} />
              </div>
              <h2 className="product-title">Garantia de <strong>veículo</strong></h2>

              <div className="product-details">
                <p className="detail-label">De R$</p>
                <p className="detail-value">5 mil a R$ 150 mil</p>

                <p className="detail-label mt-3">Juros a partir de</p>
                <p className="detail-value">1,49% ao mês</p>
              </div>

              <Link to="/veiculo" className="btn btn-primary product-btn">
                Simule
              </Link>
            </div>

            {/* Card Imóvel */}
            <div className="product-card">
              <div className="product-icon-wrapper">
                <HomeIcon className="product-icon" size={32} />
              </div>
              <h2 className="product-title">Garantia de <strong>imóvel</strong></h2>

              <div className="product-details">
                <p className="detail-label">De R$</p>
                <p className="detail-value">50 mil a R$ 3 milhões</p>

                <p className="detail-label mt-3">Juros a partir de</p>
                <p className="detail-value">1% ao mês + IPCA</p>
              </div>

              <Link to="/imovel" className="btn btn-primary product-btn">
                Simule
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="home-legal-footer">
        <Link to="/politica-de-privacidade">Política de Privacidade</Link>
        <Link to="/termos-de-uso">Termos de Uso</Link>
      </footer>
    </div>
  );
}
