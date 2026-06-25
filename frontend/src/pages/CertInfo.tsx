import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CertType {
  icon: string;
  label: string;
  desc: string;
  color: string;
  useCases: string[];
}

export const CertInfo: React.FC = () => {
  const navigate = useNavigate();
  const [zoomed, setZoomed] = useState<CertType | null>(null);

  const certTypes: CertType[] = [
    {
      icon: '🌐',
      label: 'SSL/TLS Certificates',
      desc: 'Secure web server authentication and encrypted HTTPS connections. Issued to government web services, portals, and APIs to ensure data confidentiality and server identity verification through X.509 certificates with Subject Alternative Names (SANs).',
      color: '#3B82F6',
      useCases: ['Government web portals', 'API endpoints', 'Internal services', 'Wildcard domains'],
    },
    {
      icon: '✉️',
      label: 'S/MIME Email Certificates',
      desc: 'Enable digitally signed and encrypted email communication. S/MIME certificates bind an email address to a public key, allowing recipients to verify sender authenticity and ensuring message confidentiality through end-to-end encryption.',
      color: '#8B5CF6',
      useCases: ['Official communications', 'Document signing', 'Encrypted attachments', 'Non-repudiation'],
    },
    {
      icon: '💻',
      label: 'Code Signing Certificates',
      desc: "Guarantee software integrity by digitally signing executables, drivers, and scripts. Code signing certificates ensure that software has not been tampered with after publication and verifies the publisher's identity to end users and operating systems.",
      color: '#10B981',
      useCases: ['Application executables', 'Driver packages', 'Script authentication', 'Update verification'],
    },
    {
      icon: '🪪',
      label: 'Personal Identity Certificates',
      desc: 'Citizen and employee digital identity certificates for secure authentication. Personal ID certificates enable smart-card based login, digital document signing, and identity verification in e-government services and enterprise systems.',
      color: '#F59E0B',
      useCases: ['Smart card login', 'Digital signatures', 'e-Government services', 'Employee authentication'],
    },
    {
      icon: '🕒',
      label: 'Time Stamping Certificates',
      desc: 'Trusted timestamp authority certificates that prove a document or transaction existed at a specific point in time. Critical for legal compliance, audit trails, and ensuring the long-term validity of digital signatures beyond certificate expiration.',
      color: '#EC4899',
      useCases: ['Legal document timestamping', 'Audit trail integrity', 'Long-term signature validity', 'Regulatory compliance'],
    },
  ];

  const lifecycle = [
    { step: '1', title: 'Key Generation', desc: 'RSA or EC key pair generated inside the HSM boundary', icon: '🔑' },
    { step: '2', title: 'CSR Creation', desc: 'Certificate Signing Request with subject details and extensions', icon: '📝' },
    { step: '3', title: 'CA Signing', desc: 'CSR approved and signed by the appropriate Issuing CA', icon: '✍️' },
    { step: '4', title: 'Certificate Issuance', desc: 'X.509 certificate issued with proper validity and extensions', icon: '📜' },
    { step: '5', title: 'OCSP & CRL', desc: 'Real-time validation via OCSP and periodic CRL publication', icon: '🔄' },
    { step: '6', title: 'Renewal / Revocation', desc: 'Certificate renewed before expiry or revoked when compromised', icon: '🛡️' },
  ];

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
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Certificates</h1>
            <p style={{ fontSize: '0.68rem', color: '#5a93d4', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Digital Certificate Types & Lifecycle · <span style={{ color: '#f59e0b' }}>Click any card to zoom</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/insa_logo.png" alt="INSA" style={{ height: '36px', opacity: 0.8 }} />
          <span style={{ fontSize: '0.75rem', color: '#5a93d4', fontWeight: 700 }}>ENRCA</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.5s ease-out' }}>
          <p style={{ color: '#7a9ec7', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '700px' }}>
            ENRCA issues multiple types of digital certificates to provide identity assurance, data integrity, and encrypted communications across Ethiopian government services and organizations.
          </p>
        </div>

        {/* Certificate type cards — clickable to zoom */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {certTypes.map((cert, i) => (
            <div
              key={cert.label}
              onClick={() => setZoomed(cert)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: `3px solid ${cert.color}`,
                borderRadius: '0.75rem',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                animation: `slideUp 0.5s ease-out ${0.1 + i * 0.08}s both`,
                cursor: 'zoom-in',
                position: 'relative',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px ${cert.color}30`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLDivElement).style.transform = '';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
              }}
            >
              {/* Zoom hint badge */}
              <div style={{
                position: 'absolute', top: '0.65rem', right: '0.65rem',
                fontSize: '0.58rem', color: cert.color, opacity: 0.7,
                background: `${cert.color}12`, border: `1px solid ${cert.color}25`,
                padding: '0.15rem 0.4rem', borderRadius: '9999px', fontWeight: 600,
              }}>🔍 Click to read</div>

              <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{cert.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>{cert.label}</h3>
              <p style={{ fontSize: '0.8rem', color: '#8aa4c4', lineHeight: 1.6, margin: '0 0 1rem' }}>{cert.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {cert.useCases.map(u => (
                  <span key={u} style={{
                    background: `${cert.color}12`,
                    border: `1px solid ${cert.color}25`,
                    color: cert.color,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: '0.18rem 0.5rem',
                    borderRadius: '9999px',
                  }}>{u}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lifecycle section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '4px', height: '1.5rem', background: 'linear-gradient(180deg, #f59e0b, #3b82f6)', borderRadius: '2px' }} />
            Certificate Lifecycle
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
            {lifecycle.map((step, i) => (
              <div key={step.title} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.65rem',
                padding: '1rem 0.75rem',
                textAlign: 'center',
                animation: `slideUp 0.5s ease-out ${0.4 + i * 0.08}s both`,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{step.icon}</div>
                <div style={{ fontSize: '0.55rem', color: '#f59e0b', fontWeight: 800, marginBottom: '0.2rem', letterSpacing: '0.1em' }}>STEP {step.step}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.6rem', color: '#6b8ab5', lineHeight: 1.4 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ZOOM MODAL ═══ */}
      {zoomed && (
        <div
          onClick={() => setZoomed(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(2,6,20,0.88)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #0d1f50 0%, #101e4a 100%)',
              border: `1px solid ${zoomed.color}35`,
              borderTop: `4px solid ${zoomed.color}`,
              borderRadius: '1.25rem',
              padding: '2.5rem 3rem',
              maxWidth: '680px',
              width: '100%',
              boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${zoomed.color}18`,
              animation: 'zoomIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setZoomed(null)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#94a3b8', width: '34px', height: '34px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
            >✕</button>

            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{zoomed.icon}</div>
            <h2 style={{
              fontSize: '1.75rem', fontWeight: 900, color: '#fff',
              margin: '0 0 1rem', letterSpacing: '-0.02em',
            }}>{zoomed.label}</h2>
            <p style={{
              fontSize: '1.05rem', color: '#c8ddf5', lineHeight: 1.8,
              margin: '0 0 1.75rem', fontWeight: 400,
            }}>{zoomed.desc}</p>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: zoomed.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                Use Cases
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {zoomed.useCases.map(u => (
                  <span key={u} style={{
                    background: `${zoomed.color}15`,
                    border: `1px solid ${zoomed.color}35`,
                    color: zoomed.color,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0.4rem 0.9rem',
                    borderRadius: '9999px',
                  }}>{u}</span>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '0.7rem', color: '#334155', margin: '2rem 0 0', textAlign: 'center' }}>
              Click anywhere outside to close
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CertInfo;
