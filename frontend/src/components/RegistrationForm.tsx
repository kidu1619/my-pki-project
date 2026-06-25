import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import toast from 'react-hot-toast';
import api from '../services/api';

export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.username.trim() || !formData.fullName.trim()) {
        toast.error('Please fill in username and full name');
        return false;
      }
    } else if (step === 2) {
      if (!formData.email.trim() || !formData.phone.trim() || !formData.department.trim()) {
        toast.error('Please fill in email, phone, and department');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Invalid email address format');
        return false;
      }
    } else if (step === 3) {
      const password = formData.password;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[@$!%*?&#^()_+=\[\]{}|\\;:',.<>\/-]/.test(password);
      
      if (password.length < 12) {
        toast.error('Password must be at least 12 characters');
        return false;
      }
      if (!(hasUppercase && hasLowercase && hasNumber && hasSpecial)) {
        toast.error('Password must contain uppercase, lowercase, number, and special character');
        return false;
      }
      if (password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      const loadToast = toast.loading('Submitting registration request...');
      try {
        await api.post('/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          roles: ['ROLE_USER', 'ROLE_HSM']
        });
        toast.dismiss(loadToast);
        toast.success('Registration submitted successfully! Awaiting Super Admin approval.');
        console.log('Registered User Details:', formData);
        navigate('/login');
      } catch (err: any) {
        toast.dismiss(loadToast);
        const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
        toast.error(errorMsg);
      }
    }
  };

  const stepsList = ['User Info', 'Contact Details', 'Security Setup'];

  return (
    <div className="card" style={{ width: '420px', padding: '2.5rem', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Register Administrator</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
          Onboarding Request Console
        </p>
      </div>

      {/* Progress Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: '2px', backgroundColor: '#E2E8F0', zIndex: 1 }} />
        <div 
          style={{ 
            position: 'absolute', 
            left: 0, 
            top: '50%', 
            transform: 'translateY(-50%)', 
            height: '2px', 
            backgroundColor: 'var(--color-interactive)', 
            transition: 'all 0.3s ease',
            width: `${((step - 1) / (stepsList.length - 1)) * 100}%`,
            zIndex: 1
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', zIndex: 2 }}>
          {stepsList.map((stepName, index) => {
            const stepNum = index + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  backgroundColor: isCompleted ? 'var(--color-interactive)' : isActive ? '#FFFFFF' : '#F1F5F9',
                  border: isActive ? '2px solid var(--color-interactive)' : '2px solid transparent',
                  color: isCompleted ? '#FFFFFF' : isActive ? 'var(--color-interactive)' : '#64748B',
                }}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span style={{
                  fontSize: '0.625rem',
                  marginTop: '0.5rem',
                  fontWeight: 500,
                  color: isActive || isCompleted ? '#0F172A' : '#94A3B8'
                }}>
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forms Content */}
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. admin_pki"
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="fullName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Alexander Pierce"
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
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@enterprise.pki"
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 019-2834"
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="department" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Department / Scope</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Infrastructure Security / CA Ops"
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
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Secret Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              />
            </div>
            
            <PasswordStrengthMeter value={formData.password} />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                color: '#64748B',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ flex: 1, height: '40px' }}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, height: '40px' }}
            >
              Register & Setup
            </button>
          )}
        </div>

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
    </div>
  );
};
