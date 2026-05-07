import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCookie, setConsentCookie } from '../lib/consent';
import './CookieConsent.css';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookie('averbai_cookie_consent') !== 'accepted');
  }, []);

  const acceptCookies = () => {
    setConsentCookie('averbai_cookie_consent');
    localStorage.setItem('averbai_cookie_consent', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <div>
        <strong>Usamos cookies essenciais</strong>
        <p>
          Eles ajudam o site a lembrar seu aceite e melhorar sua experiência. Ao continuar, você concorda com nossa{' '}
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>.
        </p>
      </div>
      <button type="button" className="btn btn-primary cookie-button" onClick={acceptCookies}>
        Aceitar
      </button>
    </div>
  );
}
