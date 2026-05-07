import { Link } from 'react-router-dom';
import './Legal.css';

export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="container">
        <article className="legal-card">
          <Link to="/" className="legal-back">Voltar para o site</Link>
          <h1>Política de Privacidade</h1>
          <p className="legal-updated">Última atualização: 07 de maio de 2026</p>

          <p>
            Esta Política explica como a Averbai coleta, usa e protege os dados informados por você ao solicitar uma simulação de crédito com garantia de veículo ou imóvel.
          </p>

          <h2>1. Dados que coletamos</h2>
          <p>Podemos coletar os dados preenchidos nos formulários, incluindo nome, CPF, telefone, data de nascimento, valor desejado e informações da garantia indicada.</p>

          <h2>2. Finalidades do tratamento</h2>
          <ul>
            <li>Analisar sua solicitação de crédito e identificar opções compatíveis com seu perfil.</li>
            <li>Entrar em contato por telefone, WhatsApp ou canais informados por você sobre a simulação solicitada.</li>
            <li>Cumprir obrigações legais, regulatórias e de segurança.</li>
            <li>Melhorar nossos fluxos de atendimento e prevenção a fraude.</li>
          </ul>

          <h2>3. WhatsApp e comunicações</h2>
          <p>
            Ao enviar o formulário, você autoriza que a Averbai use o telefone informado, inclusive WhatsApp, para tratar da sua simulação, tirar dúvidas e apresentar proposta relacionada ao crédito solicitado. Você pode pedir a interrupção do contato a qualquer momento.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para lembrar seu aceite de cookies e preferências básicas do site. O aceite fica armazenado no navegador por prazo limitado.
          </p>

          <h2>5. Compartilhamento</h2>
          <p>
            Seus dados podem ser compartilhados com parceiros financeiros, prestadores de tecnologia, atendimento, segurança e autoridades públicas quando necessário para análise da solicitação, cumprimento legal ou exercício regular de direitos.
          </p>

          <h2>6. Segurança e retenção</h2>
          <p>
            Adotamos medidas razoáveis para proteger os dados contra acesso não autorizado, perda ou alteração. Os dados são mantidos pelo tempo necessário para as finalidades desta Política, cumprimento legal, prevenção a fraude e defesa de direitos.
          </p>

          <h2>7. Seus direitos</h2>
          <p>
            Você pode solicitar confirmação de tratamento, acesso, correção, exclusão, portabilidade, informação sobre compartilhamento e revogação de consentimento, conforme a LGPD.
          </p>

          <h2>8. Contato</h2>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato pelos canais oficiais da Averbai informados no atendimento.
          </p>
        </article>
      </div>
    </main>
  );
}
