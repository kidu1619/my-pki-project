import React from 'react';

interface PasswordStrengthMeterProps {
  value: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ value }) => {
  const criteria = [
    { label: 'At least 12 characters', met: value.length >= 12 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(value) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(value) },
    { label: 'At least one number', met: /[0-9]/.test(value) },
    { label: 'At least one special character (@, $, !, %, etc.)', met: /[@$!%*?&#^()_+=\[\]{}|\\;:',.<>\/-]/.test(value) },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  const getStrengthLabel = () => {
    if (value.length === 0) return 'Not Entered';
    if (metCount <= 2) return 'Weak';
    if (metCount <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (value.length === 0) return 'bg-slate-200';
    if (metCount <= 2) return 'bg-red-500';
    if (metCount <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div style={{ marginTop: '0.75rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginBottom: '0.5rem' }}>
        <span>Password Strength</span>
        <span style={{
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          backgroundColor: 
            getStrengthLabel() === 'Strong' ? '#D1FAE5' :
            getStrengthLabel() === 'Medium' ? '#FEF3C7' :
            getStrengthLabel() === 'Weak' ? '#FEE2E2' : '#F1F5F9',
          color: 
            getStrengthLabel() === 'Strong' ? '#065F46' :
            getStrengthLabel() === 'Medium' ? '#92400E' :
            getStrengthLabel() === 'Weak' ? '#991B1B' : '#475569'
        }}>
          {getStrengthLabel()}
        </span>
      </div>

      <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.75rem' }}>
        <div
          className={getStrengthColor()}
          style={{ width: `${(metCount / criteria.length) * 100}%`, height: '100%', transition: 'all 0.3s ease' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.375rem' }}>
        {criteria.map((c, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              backgroundColor: c.met ? '#D1FAE5' : '#F1F5F9',
              color: c.met ? '#059669' : '#94A3B8',
              border: c.met ? '1px solid #A7F3D0' : '1px solid #E2E8F0'
            }}>
              {c.met ? '✓' : '✗'}
            </span>
            <span style={{ color: c.met ? '#1E293B' : '#94A3B8', fontWeight: c.met ? 500 : 400 }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
