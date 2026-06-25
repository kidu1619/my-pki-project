import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const contactInfo = [
    { icon: '📧', label: 'PKI Center Email', value: 'npki@insa.gov.et', href: 'mailto:npki@insa.gov.et' },
    { icon: '📞', label: 'Main Office', value: '(+251)-113-71-71-14', href: 'tel:+251113717114' },
    { icon: '📍', label: 'Address', value: 'Information Network Security Administration, Addis Ababa, Ethiopia', href: null },
    { icon: '🌐', label: 'Website', value: 'www.insa.gov.et', href: 'https://www.insa.gov.et' },
  ];

  const departments = [
    { name: 'PKI Operations Center', email: 'npki@insa.gov.et', desc: 'Certificate issuance, revocation, and lifecycle inquiries', icon: '🔐' },
    { name: 'Technical Support', email: 'support@insa.gov.et', desc: 'Integration assistance, API support, and technical issues', icon: '🛠️' },
    { name: 'Audit & Compliance', email: 'audit@insa.gov.et', desc: 'Certificate Policy, CPS, and regulatory compliance', icon: '📋' },
    { name: 'General Enquiries', email: 'info@insa.gov.et', desc: 'General questions and partnership inquiries', icon: '💬' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      background: 'linear-gradient(180deg, #050d1f 0%, #0a1a3f 100%)',
      color: '#e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0b1d4e 0%, #132e6b 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#93c5fd',
              padding: '0.45rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#93c5fd'; }}
          >
            ← Back to Home
          </button>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Contact</h1>
            <p style={{ fontSize: '0.68rem', color: '#5a93d4', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Get in Touch with ENRCA / INSA
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/insa_logo.png" alt="INSA" style={{ height: '36px', opacity: 0.8 }} />
          <span style={{ fontSize: '0.75rem', color: '#5a93d4', fontWeight: 700 }}>ENRCA</span>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.5s ease-out' }}>
          <p style={{ color: '#7a9ec7', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '700px' }}>
            Reach the ENRCA team for PKI-related enquiries, technical support, certificate policy questions, or general information about Ethiopia's National Public Key Infrastructure.
          </p>
        </div>

        {/* Top row: Contact info + Departments */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginBottom: '2rem' }}>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'slideUp 0.5s ease-out 0.1s both' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '4px', height: '1.2rem', background: 'linear-gradient(180deg, #f59e0b, #3b82f6)', borderRadius: '2px' }} />
              Contact Information
            </h2>
            {contactInfo.map(c => (
              <div key={c.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.65rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.9rem',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#5a93d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{c.label}</div>
                  {c.href ? (
                    <a href={c.href} style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: 600, textDecoration: 'none' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#93c5fd'; }}
                    >{c.value}</a>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#a0b4cc' }}>{c.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Departments */}
          <div style={{ animation: 'slideUp 0.5s ease-out 0.2s both' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '4px', height: '1.2rem', background: 'linear-gradient(180deg, #10b981, #3b82f6)', borderRadius: '2px' }} />
              Departments
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {departments.map(dep => (
                <div key={dep.name} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.65rem',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  gap: '0.9rem',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{dep.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.15rem' }}>{dep.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b8ab5', marginBottom: '0.3rem' }}>{dep.desc}</div>
                    <a href={`mailto:${dep.email}`} style={{ fontSize: '0.72rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#7dd3fc'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#38bdf8'; }}
                    >
                      {dep.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.875rem',
          padding: '2rem',
          animation: 'slideUp 0.5s ease-out 0.3s both',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '4px', height: '1.2rem', background: 'linear-gradient(180deg, #8b5cf6, #ec4899)', borderRadius: '2px' }} />
            Send Us a Message
          </h2>

          {submitted ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '0.75rem',
              animation: 'slideUp 0.4s ease-out',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginBottom: '0.5rem' }}>Message Sent Successfully</div>
              <p style={{ fontSize: '0.85rem', color: '#6b8ab5', margin: '0 0 1.5rem' }}>
                Thank you for contacting ENRCA. Our team will respond within 2–3 business days.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34d399',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.15)'; }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Abebe Kebede' },
                  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'abebe@gov.et' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#5a93d4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0.5rem',
                        padding: '0.65rem 0.9rem',
                        color: '#e2e8f0',
                        fontSize: '0.85rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#38bdf8'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#5a93d4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Certificate Policy Inquiry / Technical Support / ..."
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '0.5rem',
                    padding: '0.65rem 0.9rem',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#5a93d4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  Message
                </label>
                <textarea
                  placeholder="Describe your inquiry in detail..."
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '0.5rem',
                    padding: '0.65rem 0.9rem',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#38bdf8'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? 'rgba(56,189,248,0.2)' : 'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(56,189,248,0.25)',
                }}
                onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
              >
                {submitting ? (
                  <>
                    <span style={{
                      width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Sending...
                  </>
                ) : (
                  <>📤 Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder, textarea::placeholder { color: #4a6d94; }
      `}</style>
    </div>
  );
};

export default ContactPage;
