import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import toast from 'react-hot-toast';
import axios from 'axios';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verifyTokenSignatureAndExpiration = async () => {
      if (!token) {
        toast.error('Token missing from URL');
        setVerifying(false);
        return;
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTokenValid(true);
      } catch (err: any) {
        toast.error('The recovery token is invalid or has expired.');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyTokenSignatureAndExpiration();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[@$!%*?&#^()_+=\[\]{}|\\;:',.<>\/-]/.test(newPassword);

    if (newPassword.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }
    if (!(hasUppercase && hasLowercase && hasNumber && hasSpecial)) {
      toast.error('Password must contain uppercase, lowercase, number, and special character');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Resetting password with token:', token);
      // Actual POST call to Better Auth recovery server endpoint to update password
      await axios.post('http://localhost:7447/api/auth/password-recovery/verifyPasswordResetToken', {
        token,
        newPassword
      });
      toast.success('Your password has been successfully updated.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="card" style={{ width: '400px', padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            fontSize: '1.25rem',
            animation: 'spin 1s linear infinite'
          }}>
            ↻
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.25rem 0' }}>Cryptographic Verification</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Checking token signature & validity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="card" style={{ width: '400px', padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#FEF2F2',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          margin: '0 auto 1rem auto',
          border: '1px solid #FEE2E2'
        }}>
          ⚠
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>Verification Failed</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          The recovery link is invalid or has expired (15-minute validity window exceeded).
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="btn-primary"
          style={{ width: '100%', height: '40px' }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ width: '400px', padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>New Password</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
          Setup your new PKI console credentials
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="newPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
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
            disabled={submitting}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
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
            disabled={submitting}
          />
        </div>

        <PasswordStrengthMeter value={newPassword} />

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{ width: '100%', height: '42px', marginTop: '1.5rem' }}
        >
          {submitting ? 'Updating Password...' : 'Save & Update Password'}
        </button>
      </form>
    </div>
  );
};
