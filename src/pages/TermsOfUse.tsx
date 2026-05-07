import { Link } from 'react-router-dom';
import './Legal.css';

export default function TermsOfUse() {
  return (
    <main className="legal-page">
      <div className="container">
        <article className="legal-card">
          <Link to="/" className="legal-back">Voltar para o site</Link>
          <h1>Termos de Uso</h1>
          <p className="legal-updated">Última atualização: 07 de maio de 2026</p>

          <p>
            Estes Termos regulam o uso do site da Averbai e dos formulários de simulação de crédito. Ao acessar o site ou enviar seus dados, você declara que leu e concorda com estas condições.
          </p>

          <h2>1. Objetivo do site</h2>
          <p>
            O site permite solicitar simulações de crédito com garantia de veículo ou imóvel. O envio do formulário não garante aprovação, contratação ou liberação de crédito.
          </p>

          <h2>2. Informações fornecidas</h2>
          <p>
            Você se compromete a fornecer dados verdadeiros, completos e atualizados. Informações incorretas podem impedir a análise ou o contato.
          </p>

          <h2>3. Contato sobre a simulação</h2>
          <p>
            Ao enviar o formulário, você autoriza a Averbai a entrar em contato por telefone, WhatsApp ou outros canais informados para tratar da solicitação, apresentar condições, solicitar documentos e prestar atendimento relacionado.
          </p>

          <h2>4. Análise de crédito</h2>
          <p>
            Para avaliar a solicitação, poderão ser analisadas informações cadastrais, financeiras, histórico de crédito e dados da garantia, respeitando a legislação aplicável e a Política de Privacidade.
          </p>

          <h2>5. Uso permitido</h2>
          <ul>
            <li>Não use o site para enviar dados falsos, de terceiros sem autorização ou informações fraudulentas.</li>
            <li>Não tente acessar áreas restritas, sistemas, bancos de dados ou recursos técnicos sem permissão.</li>
            <li>Não pratique atos que prejudiquem a disponibilidade, segurança ou funcionamento do site.</li>
          </ul>

          <h2>6. Limitação</h2>
          <p>
            A Averbai busca manter as informações atualizadas, mas condições comerciais, taxas, prazos e disponibilidade podem mudar conforme análise, parceiros e critérios de crédito.
          </p>

          <h2>7. Privacidade</h2>
          <p>
            O tratamento de dados pessoais é explicado na <Link to="/politica-de-privacidade">Política de Privacidade</Link>, que integra estes Termos.
          </p>

          <h2>8. Alterações</h2>
          <p>
            Estes Termos podem ser atualizados para refletir mudanças legais, operacionais ou comerciais. A versão vigente será publicada nesta página.
          </p>
        </article>
      </div>
    </main>
  );
}
