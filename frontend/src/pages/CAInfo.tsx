import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CALevel {
  level: string;
  name: string;
  desc: string;
  color: string;
  icon: string;
  details: string[];
}

export const CAInfo: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const caHierarchy: CALevel[] = [
    {
      level: 'Root CA',
      name: 'ENRCA Root Certificate Authority',
      desc: 'The ultimate trust anchor of the Ethiopian National PKI. The Root CA self-signs its own certificate and operates in an offline, air-gapped HSM environment. Its private key never leaves the HSM boundary.',
      color: '#f59e0b',
      icon: '👑',
      details: [
        'Key Algorithm: RSA-4096 or EC P-384',
        'Validity Period: 20 years',
        'Storage: Offline SoftHSM v2 (FIPS 140-2 Level 3)',
        'Signing: Only signs Intermediate CA certificates',
        'CRL Lifetime: 1 year',
        'Hash Algorithm: SHA-512',
      ],
    },
    {
      level: 'Intermediate CA',
      name: 'Issuing / Policy Certificate Authorities',
      desc: 'Subordinate CAs signed by the Root CA. Intermediate CAs are online entities that directly issue end-entity certificates. Each Intermediate CA is scoped to a specific certificate profile or organizational unit.',
      color: '#3b82f6',
      icon: '🏛️',
      details: [
        'Key Algorithm: RSA-2048 or EC P-256',
        'Validity Period: 5–10 years',
        'Storage: Online SoftHSM v2 slot',
        'Issues: SSL/TLS, S/MIME, Code Signing, Personal ID, TSA certificates',
        'CRL Lifetime: 7 days',
        'Hash Algorithm: SHA-256',
      ],
    },
    {
      level: 'End Entity',
      name: 'End-Entity Subscriber Certificates',
      desc: 'Final leaf certificates issued to subscribers — government web servers, employees, applications, and timestamping services. These certificates cannot sign other certificates (pathLenConstraint = 0).',
      color: '#10b981',
      icon: '📜',
      details: [
        'Key Algorithm: RSA-2048 or EC P-256',
        'Validity Period: 1–3 years',
        'Cannot issue: pathLenConstraint = 0',
        'Profiles: SSL/TLS, S/MIME, Code Signing, Personal ID, TSA',
        'OCSP: Real-time validation available',
        'Revocation: CRL + OCSP responder',
      ],
    },
  ];

  const standards = [
    { name: 'X.509 v3', desc: 'ITU-T standard for PKI certificate format', icon: '📐' },
    { name: 'RFC 5280', desc: 'Internet X.509 PKI Certificate and CRL Profile', icon: '📖' },
    { name: 'PKCS#11', desc: 'Cryptographic Token Interface for HSM access', icon: '🔌' },
    { name: 'PKCS#12', desc: 'Personal Information Exchange Syntax Standard', icon: '📦' },
    { name: 'OCSP RFC 6960', desc: 'Online Certificate Status Protocol standard', icon: '🔄' },
    { name: 'FIPS 140-2', desc: 'Security standard for cryptographic modules', icon: '🛡️' },
    { name: 'WebTrust', desc: 'Audit criteria for Certificate Authorities', icon: '✅' },
    { name: 'RFC 3161', desc: 'Time-Stamp Protocol (TSP) for trusted timestamping', icon: '🕒' },
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
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Certificate Authority</h1>
            <p style={{ fontSize: '0.68rem', color: '#5a93d4', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              PKI Hierarchy & Trust Architecture · <span style={{ color: '#f59e0b' }}>Click a level to expand</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/insa_logo.png" alt="INSA" style={{ height: '36px', opacity: 0.8 }} />
          <span style={{ fontSize: '0.75rem', color: '#5a93d4', fontWeight: 700 }}>ENRCA</span>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.5s ease-out' }}>
          <p style={{ color: '#7a9ec7', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '700px' }}>
            The Ethiopian National Root Certificate Authority (ENRCA) operates a hierarchical Public Key Infrastructure (PKI) 
            with three distinct trust levels — Root CA, Intermediate CAs, and End-Entity certificates — each with clearly 
            defined roles, key algorithms, and operational constraints.
          </p>
        </div>

        {/* Visual Hierarchy Tree */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '4px', height: '1.5rem', background: 'linear-gradient(180deg, #f59e0b, #3b82f6)', borderRadius: '2px' }} />
            PKI Trust Hierarchy
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {caHierarchy.map((ca, i) => (
              <div key={ca.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Connector line */}
                {i > 0 && (
                  <div style={{
                    width: '2px',
                    height: '24px',
                    background: `linear-gradient(180deg, ${caHierarchy[i - 1].color}60, ${ca.color}60)`,
                    flexShrink: 0,
                  }} />
                )}
                {/* CA Card */}
                <div
                  onClick={() => setExpanded(expanded === ca.level ? null : ca.level)}
                  style={{
                    width: `${100 - i * 10}%`,
                    background: expanded === ca.level
                      ? `linear-gradient(135deg, ${ca.color}15, ${ca.color}08)`
                      : 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${expanded === ca.level ? ca.color + '50' : 'rgba(255,255,255,0.08)'}`,
                    borderLeft: `4px solid ${ca.color}`,
                    borderRadius: '0.75rem',
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    animation: `slideUp 0.5s ease-out ${0.1 + i * 0.12}s both`,
                    boxShadow: expanded === ca.level ? `0 8px 32px ${ca.color}20` : 'none',
                  }}
                  onMouseEnter={e => {
                    if (expanded !== ca.level) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    if (expanded !== ca.level) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.8rem' }}>{ca.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: ca.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.15rem' }}>
                          {ca.level}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{ca.name}</div>
                        <p style={{ fontSize: '0.78rem', color: '#7a9ec7', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{ca.desc}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: ca.color, transition: 'transform 0.3s', transform: expanded === ca.level ? 'rotate(180deg)' : '' }}>
                      ▾
                    </span>
                  </div>

                  {/* Expanded details */}
                  {expanded === ca.level && (
                    <div style={{
                      marginTop: '1.25rem',
                      paddingTop: '1.25rem',
                      borderTop: `1px solid ${ca.color}25`,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '0.6rem',
                      animation: 'slideUp 0.3s ease-out',
                    }}>
                      {ca.details.map(d => (
                        <div key={d} style={{
                          background: `${ca.color}08`,
                          border: `1px solid ${ca.color}20`,
                          borderRadius: '0.4rem',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.72rem',
                          color: '#c8ddf5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          <span style={{ color: ca.color, fontWeight: 700 }}>▸</span>
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standards & Compliance */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '4px', height: '1.5rem', background: 'linear-gradient(180deg, #10b981, #3b82f6)', borderRadius: '2px' }} />
            Standards & Compliance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            {standards.map((s, i) => (
              <div key={s.name} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0.6rem',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease',
                animation: `slideUp 0.5s ease-out ${0.3 + i * 0.06}s both`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(56,189,248,0.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.2rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#6b8ab5', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
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

export default CAInfo;
