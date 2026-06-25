import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Requesting reset for:', email);
      // Actual POST call to Better Auth recovery server endpoint
      await axios.post('http://localhost:7447/api/auth/password-recovery/requestPasswordReset', { email });
      setSubmitted(true);
      toast.success('Password recovery link dispatched!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to dispatch reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ width: '400px', padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Recover Password</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
          Enter email to request a 15-minute reset token
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@enterprise.pki"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                boxSizing: 'border-box'
              }}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', height: '42px', marginTop: '0.5rem' }}
          >
            {loading ? 'Sending Request...' : 'Send Recovery Link'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-interactive)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#ECFDF5',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto 1.5rem auto',
            border: '1px solid #A7F3D0'
          }}>
            ✓
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>Check your email</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            A secure password reset link has been sent to <strong style={{ color: '#0F172A' }}>{email}</strong>. It will expire in 15 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-interactive)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Re-enter email address
          </button>
        </div>
      )}
    </div>
  );
};
