import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PublicationsPage: React.FC = () => {
  const navigate = useNavigate();

  const publications = [
    {
      title: 'Certificate Policy (CP)',
      date: '2025',
      type: 'Policy Document',
      icon: '📋',
      filename: 'Certificate_Policy_CP.pdf',
      desc: 'Defines the rules and obligations governing certificate issuance, management, and revocation within the ENRCA PKI hierarchy.',
    },
    {
      title: 'Certificate Practice Statement (CPS)',
      date: '2025',
      type: 'Practice Statement',
      icon: '📄',
      filename: 'Certificate_Practice_Statement_CPS.pdf',
      desc: 'Details the specific practices and procedures used by ENRCA to implement the Certificate Policy, including key management and CA operations.',
    },
    {
      title: 'Root CA Certificate Information',
      date: '2024',
      type: 'Certificate Documentation',
      icon: '🏅',
      filename: 'Root_CA_Certificate_Info.pdf',
      desc: 'Technical details of the ENRCA Root CA certificate including fingerprint, public key, validity period, and trust chain information.',
    },
    {
      title: 'CRL Distribution Points',
      date: 'Active',
      type: 'Revocation Information',
      icon: '🔄',
      filename: 'CRL_Distribution_Points.pdf',
      desc: 'Lists the CRL distribution endpoints, update schedule, and procedures for checking certificate revocation status via CRL and OCSP.',
    },
  ];

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Publications</h1>
            <p style={{ fontSize: '0.68rem', color: '#5a93d4', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Policy Documents & Technical Specifications</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/insa_logo.png" alt="INSA" style={{ height: '36px', opacity: 0.8 }} />
          <span style={{ fontSize: '0.75rem', color: '#5a93d4', fontWeight: 700 }}>ENRCA</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem', animation: 'slideUp 0.5s ease-out' }}>
          <p style={{ color: '#7a9ec7', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '700px' }}>
            Official policy documents, Certificate Practice Statements, and technical specifications published by the Ethiopian National Root Certificate Authority. Click the download button to access each document.
          </p>
        </div>

        {/* Publication cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {publications.map((pub, i) => (
            <div key={pub.title} style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: '4px solid #1560bd',
              borderRadius: '0.65rem',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              transition: 'all 0.3s ease',
              animation: `slideUp 0.5s ease-out ${0.1 + i * 0.1}s both`,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.borderLeftColor = '#f59e0b'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.borderLeftColor = '#1560bd'; }}
            >
              <div style={{
                fontSize: '2.25rem',
                width: '55px',
                height: '55px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(21,96,189,0.1)',
                borderRadius: '0.6rem',
                flexShrink: 0,
              }}>{pub.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{pub.title}</div>
                <p style={{ fontSize: '0.78rem', color: '#7a9ec7', lineHeight: 1.55, margin: '0 0 0.4rem' }}>{pub.desc}</p>
                <div style={{ fontSize: '0.7rem', color: '#4a6d94' }}>{pub.type} · {pub.date}</div>
              </div>
              <button
                onClick={() => handleDownload(pub.filename)}
                style={{
                  background: 'linear-gradient(135deg, #1560bd 0%, #3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(21,96,189,0.3)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(21,96,189,0.4)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(21,96,189,0.3)'; }}
              >
                📥 Download PDF
              </button>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '0.65rem',
          padding: '1rem 1.25rem',
          animation: 'slideUp 0.5s ease-out 0.6s both',
        }}>
          <p style={{ fontSize: '0.78rem', color: '#d4a054', lineHeight: 1.6, margin: 0 }}>
            <strong>📢 Note:</strong> All published documents are governed by INSA's information classification policy.
            For questions regarding certificate policies or practice statements, contact the PKI Center at{' '}
            <a href="mailto:npki@insa.gov.et" style={{ color: '#f59e0b', textDecoration: 'none' }}>npki@insa.gov.et</a>.
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

export default PublicationsPage;
