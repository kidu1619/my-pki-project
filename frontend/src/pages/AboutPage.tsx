import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

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
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>About</h1>
            <p style={{ fontSize: '0.68rem', color: '#5a93d4', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Information Network Security Administration</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/insa_logo.png" alt="INSA" style={{ height: '36px', opacity: 0.8 }} />
          <span style={{ fontSize: '0.75rem', color: '#5a93d4', fontWeight: 700 }}>ENRCA</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.5s ease-out' }}>
          <p style={{ color: '#7a9ec7', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '700px' }}>
            The <strong style={{ color: '#93c5fd' }}>Information Network Security Administration (INSA)</strong> is Ethiopia's
            premier institution for safeguarding national information infrastructure. INSA operates the Ethiopian National
            Root Certificate Authority (ENRCA), providing the foundation of digital trust for the nation.
          </p>
        </div>

        {/* Mission, Vision, Values cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Mission */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: '3px solid #f59e0b',
            borderRadius: '0.875rem',
            padding: '1.75rem',
            transition: 'all 0.3s ease',
            animation: 'slideUp 0.5s ease-out 0.1s both',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎯</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>Mission</h3>
            <p style={{ fontSize: '0.85rem', color: '#8aa4c4', lineHeight: 1.7, margin: 0 }}>
              Building a capacity that ensures the country's security of information and information infrastructure to safeguard the national interest.
            </p>
          </div>

          {/* Vision */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: '3px solid #60a5fa',
            borderRadius: '0.875rem',
            padding: '1.75rem',
            transition: 'all 0.3s ease',
            animation: 'slideUp 0.5s ease-out 0.2s both',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👁️</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>Vision</h3>
            <p style={{ fontSize: '0.85rem', color: '#8aa4c4', lineHeight: 1.7, margin: 0 }}>
              To see a globally competent and threat-resilient professional information security institution ensuring Ethiopia's digital sovereignty.
            </p>
          </div>

          {/* Values */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: '3px solid #34d399',
            borderRadius: '0.875rem',
            padding: '1.75rem',
            transition: 'all 0.3s ease',
            animation: 'slideUp 0.5s ease-out 0.3s both',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💎</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>Values</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Trustworthiness', 'Professionalism', 'Excellence', 'Innovation', 'Integrity', 'Collaboration'].map(v => (
                <span key={v} style={{
                  background: 'rgba(52,211,153,0.12)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  color: '#6ee7b7',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                }}>{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.875rem',
          padding: '2rem',
          marginBottom: '2rem',
          animation: 'slideUp 0.5s ease-out 0.4s both',
        }}>
          <h2 style={{
            fontSize: '1.2rem', fontWeight: 800, color: '#fff',
            display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem',
          }}>
            <div style={{ width: '4px', height: '1.5rem', background: 'linear-gradient(180deg, #f59e0b, #3b82f6)', borderRadius: '2px' }} />
            Web PKI Management Console — System Overview
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#7a9ec7', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
            The ENRCA Web PKI Management Console is a comprehensive certificate authority management platform built with
            a Java Spring Boot backend and React TypeScript frontend. It provides:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { title: 'User & Role Management', desc: 'Seven specialized roles — Super Admin, CA Operator (Admin), Auditor, HSM Operator, OCSP Operator, Key Escrow Agent, and End User — each with precisely scoped permissions.', icon: '👥' },
              { title: 'HSM Integration', desc: 'SoftHSM v2 via PKCS#11 for secure key generation and storage. All CA private keys remain within HSM boundaries with slot-based isolation.', icon: '🔐' },
              { title: 'Certificate Lifecycle', desc: 'Full lifecycle management from key generation → CSR creation → CA signing → certificate issuance → OCSP validation → revocation/CRL publishing.', icon: '📜' },
              { title: 'Audit & Compliance', desc: 'HMAC-secured audit trails ensuring tamper-proof logging of all cryptographic operations. Export capabilities in PDF, CSV, and JSON formats.', icon: '🔍' },
              { title: 'Key Escrow & Recovery', desc: 'Secure key backup with multi-party recovery workflows. Key Escrow Agents manage backup keys while Super Admins and CA Operators verify recovery requests.', icon: '🔑' },
              { title: 'OCSP Validation', desc: 'Online Certificate Status Protocol (OCSP) responder for real-time certificate validation. OCSP Operators manage the validation service.', icon: '✅' },
              { title: 'Multi-Factor Authentication', desc: 'TOTP-based MFA using Google Authenticator. Enforced across all operator and administrator accounts for enhanced access security.', icon: '🛡️' },
              { title: 'Publishing & Distribution', desc: 'LDAP publishing targets for certificate and CRL distribution. Automated CRL generation and publication to configured endpoints.', icon: '📡' },
            ].map((item) => (
              <div key={item.title} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.6rem',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.73rem', color: '#6b8ab5', lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INSA logo */}
        <div style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          animation: 'slideUp 0.5s ease-out 0.5s both',
        }}>
          <img
            src="/insa_logo.png"
            alt="INSA - Information Network Security Administration"
            style={{ height: '72px', width: 'auto', filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
          />
          <p style={{ color: '#4a6d94', fontSize: '0.78rem', marginTop: '0.75rem' }}>
            Information Network Security Administration (INSA), FDRE
          </p>
          <p style={{ color: '#334155', fontSize: '0.68rem', marginTop: '0.25rem' }}>
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
