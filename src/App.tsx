
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SimulacaoVeiculo from './pages/SimulacaoVeiculo';
import SimulacaoImovel from './pages/SimulacaoImovel';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import CookieConsent from './components/CookieConsent';
import MetaPixel from './components/MetaPixel';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/veiculo" element={<SimulacaoVeiculo />} />
        <Route path="/imovel" element={<SimulacaoImovel />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MetaPixel />
      <CookieConsent />
    </Router>
  );
}

export default App;
