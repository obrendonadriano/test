import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './Admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Hardcoded login as requested by user
      if (email === 'Adm.BD' && password === 'Senha@2026@') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        navigate('/admin');
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err: any) {
      setError('Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-wrapper admin-login-container">
      <div className="admin-login-card">
        <div className="text-center mb-8">
          <div className="logo justify-center text-primary" style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={`${import.meta.env.BASE_URL}1.png`} alt="Averbai Logo" style={{ height: '150px', marginBottom: '0.5rem' }} />
          </div>
          <p className="mt-2" style={{ color: 'var(--color-text-light)' }}>Área restrita</p>
        </div>

        {error && <div className="form-error mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Usuário ou E-mail</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-submit flex items-center justify-center" disabled={loading}>
            <Lock size={18} style={{ marginRight: '8px' }} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
