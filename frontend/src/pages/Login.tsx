import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (!username.trim()) {
      setAvatarUrl(null);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get(`/api/auth/avatar?username=${encodeURIComponent(username.trim())}`);
        if (response.data.profilePhoto) {
          setAvatarUrl(response.data.profilePhoto);
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        setAvatarUrl(null);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
        totpCode: showMfa ? totpCode : null,
      });

      await login(response.data.token);
      showToast('Authentication successful', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      showToast(errMsg, 'error');
      if (errMsg.toLowerCase().includes('mfa') || errMsg.toLowerCase().includes('code')) {
        setShowMfa(true);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', position: 'relative' }}>
      <button 
        type="button" 
        onClick={() => navigate('/')}
        style={{ 
          position: 'absolute', left: '2rem', top: '2rem', 
          background: 'none', border: 'none', color: '#64748B', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', 
          gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
      >
        ← Back to Welcome
      </button>
      <div className="card" style={{ width: '400px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #0F172A',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#64748B',
            fontWeight: 700,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              username ? username.substring(0, 2).toUpperCase() : '👤'
            )}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Web PKI Suite</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Enterprise Cryptographic Interface
          </p>
        </div>

        <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="tab-btn active"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderBottom: '2px solid var(--color-interactive)',
              backgroundColor: 'transparent',
              color: 'var(--color-interactive)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Login
          </button>
          <button
            type="button"
            className="tab-btn"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderBottom: 'none',
              backgroundColor: 'transparent',
              color: '#64748B',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--color-interactive)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          {showMfa && (
            <div className="form-group" style={{ animation: 'slide-in 0.2s ease-out' }}>
              <label htmlFor="totpCode">Multi-Factor Authenticator Code (TOTP)</label>
              <input
                type="text"
                id="totpCode"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="000000"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem', height: '40px' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
