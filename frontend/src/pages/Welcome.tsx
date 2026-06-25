import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [activeNav, setActiveNav] = useState('home');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignIn = () => {
    if (token && user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home', route: '/' },
    { id: 'ca', label: 'CA', route: '/ca-info' },
    { id: 'certificates', label: 'Certificates', route: '/cert-info' },
    { id: 'publications', label: 'Publications', route: '/publications' },
    { id: 'contact', label: 'Contact', route: '/contact' },
    { id: 'about', label: 'About', route: '/about' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setActiveNav(link.id);
    if (link.id === 'home') return;
    navigate(link.route);
  };

  const features = [
    {
      icon: '👑',
      title: 'Trust Anchors',
      desc: 'Root & Intermediate CAs secured via SoftHSM-backed cryptographic modules.',
      color: '#8B5CF6',
    },
    {
      icon: '🔑',
      title: 'Key Lifecycle',
      desc: 'RSA/EC key pair generation, CSR orchestration, and granular signing controls.',
      color: '#10B981',
    },
    {
      icon: '🛡️',
      title: 'Compliance & Audit',
      desc: 'HMAC-secured audit trails, real-time OCSP validation, and CRL management.',
      color: '#F59E0B',
    },
    {
      icon: '🔒',
      title: 'Role-Based Access',
      desc: 'Seven multi-tenant specialized roles enforced with strict cryptographic MFA.',
      color: '#3B82F6',
    },
    {
      icon: '📜',
      title: 'Certificate Issuance',
      desc: 'Automated SSL/TLS, S/MIME, Code Signing, and Personal ID provisioning.',
      color: '#EC4899',
    },
    {
      icon: '🔄',
      title: 'Escrow & Recovery',
      desc: 'Secure key backup infrastructure featuring multi-party quorum recovery.',
      color: '#06B6D4',
    },
  ];

  const stats = [
    { label: 'Managed CAs', value: '∞', sub: 'Root & Intermediate CAs' },
    { label: 'Cert Profiles', value: '5+', sub: 'SSL, S/MIME, Code, ID' },
    { label: 'User Roles', value: '7', sub: 'RBAC Enforced Access' },
    { label: 'MFA State', value: 'TOTP', sub: 'Hardware & App Tokens' },
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden',
      background: '#020617', // Deeper, modern slate-950 background
    }}>

      {/* ═══ TOP INFO BAR ═══ */}
      <div style={{
        background: 'linear-gradient(90deg, #020617 0%, #0f172a 50%, #020617 100%)',
        color: '#94a3b8',
        fontSize: '0.72rem',
        padding: '0.4rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        letterSpacing: '0.05em',
        borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
        flexShrink: 0,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <span className="live-indicator" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Federal Democratic Republic of Ethiopia • National Root CA
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontWeight: 500 }}>
          <span>npki@insa.gov.et</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>(+251)-113-71-71-14</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: '#38bdf8', fontWeight: 600 }}>
            {time.toLocaleTimeString('en-US', { hour12: false })} UTC
          </span>
        </span>
      </div>

      {/* ═══ MAIN HEADER ═══ */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <img
                src="/insa_logo.png"
                alt="INSA Logo"
                style={{
                  height: '52px',
                  width: 'auto',
                  filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.2))',
                  animation: 'fadeLogoIn 1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
              <div className="logo-pulse-ring" />
            </div>
            <div>
              <div style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                ENRCA
              </div>
              <div style={{
                fontSize: '0.6rem',
                color: '#38bdf8',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '0.25rem',
              }}>
                Information Network Security Administration
              </div>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            style={{
              background: token && user
                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                : 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.6rem',
              borderRadius: '0.375rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: token && user
                ? '0 0 20px rgba(16, 185, 129, 0.2)'
                : '0 0 20px rgba(249, 115, 22, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              letterSpacing: '0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = token && user
                ? '0 0 30px rgba(16, 185, 129, 0.4)'
                : '0 0 30px rgba(249, 115, 22, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = token && user
                ? '0 0 20px rgba(16, 185, 129, 0.2)'
                : '0 0 20px rgba(249, 115, 22, 0.2)';
            }}
          >
            {token && user ? '🚀 Management Console' : '🔐 Operator Authentication'}
          </button>
        </div>

        {/* Navigation row */}
        <nav style={{ padding: '0 2.5rem', display: 'flex', gap: '0.5rem' }}>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeNav === link.id ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeNav === link.id ? '#ffffff' : '#94a3b8',
                padding: '0.75rem 1.2rem',
                fontWeight: activeNav === link.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => {
                if (activeNav !== link.id) {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={e => {
                if (activeNav !== link.id) {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ═══ HERO WORKSPACE ═══ */}
      <main style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Dynamic Abstract Cyber Backgrounds */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/photo_2026-06-13_22-31-08.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.08) contrast(1.2)',
          zIndex: 0,
        }} />
        
        {/* Dark subtle gradient mapping over background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.3) 0%, #020617 90%)',
          zIndex: 1,
        }} />

        {/* Animated Cyber Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Tactical Dot Matrix Grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6
        }} />

        {/* Main Interface Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem 2.5rem',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          gap: '2.5rem'
        }}>

          {/* Top Row: Brand Messaging + Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '4rem',
            alignItems: 'center',
          }}>
            {/* Typography Engine */}
            <div style={{ animation: 'revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '4px', padding: '0.35rem 0.8rem', marginBottom: '1.2rem',
                color: '#38bdf8', fontSize: '0.68rem', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>
                <span className="scan-line-pulse" />
                SECURE ROOT KEYSTONE // LEVEL 00
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                margin: 0,
              }}>
                Web PKI Architecture
                <span className="shimmer-text" style={{ display: 'block' }}>
                  Management Console
                </span>
              </h1>

              <p style={{
                fontSize: '0.95rem',
                color: '#94a3b8',
                maxWidth: '540px',
                lineHeight: 1.6,
                marginTop: '1rem',
                marginBottom: 0,
              }}>
                Centralized automation engine for cryptographic root key orchestration, intermediate authority 
                provisioning, rapid certificate signing requests, and real-time validation compliance infrastructure.
              </p>
            </div>

            {/* Tactical Stats Framework */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              animation: 'revealUp 1s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {stats.map((s, idx) => (
                <div key={s.label} className="stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.4rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '0.15rem' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Dynamic Matrix Grid */}
          <div className="features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="feature-card"
                style={{
                  '--card-theme-color': f.color,
                  animationDelay: `${0.2 + i * 0.08}s`
                } as React.CSSProperties}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>{f.icon}</div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem', margin: '0 0 0.35rem' }}>{f.title}</h4>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Infrastructure Integrity Footbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'revealUp 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            borderTop: '1px solid rgba(255,255,255,0.03)',
            paddingTop: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Operational Clearance:
              </span>
              {['Super Admin', 'CA Operator', 'Auditor', 'HSM Signer', 'OCSP Controller'].map(role => (
                <span key={role} className="role-tag">{role}</span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#64748b', fontSize: '0.68rem', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="live-indicator" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                HSM Clusters Online
              </span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>FIPS 140-2 Level 3 Compliance</span>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ COMPACT FOOTER ═══ */}
      <footer style={{
        background: '#020617',
        color: '#475569',
        padding: '0.8rem 2.5rem',
        borderTop: '1px solid rgba(51, 65, 85, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        fontSize: '0.72rem',
        fontWeight: 500,
      }}>
        <span>© {new Date().getFullYear()} Information Network Security Administration (INSA). All Rights Reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {['About', 'Contact', 'Publications'].map((item) => (
            <span
              key={item}
              onClick={() => navigate(`/${item.toLowerCase()}`)}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#38bdf8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
            >
              {item}
            </span>
          ))}
        </div>
      </footer>

      {/* ═══ ADVANCED ENHANCED ANIMATION STYLESHEET ═══ */}
      <style>{`
        /* Global Reset additions for standard seamless viewport */
        * { box-sizing: border-box; }

        /* Responsive Adaptive Grid System */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          animation: revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        /* High-End Glassmorphic Feature Cards */
        .feature-card {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-top: 2px solid var(--card-theme-color);
          border-radius: 6px;
          padding: 1.25rem 1rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(15, 23, 42, 0.75);
          border-color: var(--card-theme-color);
          box-shadow: 0 12px 30px rgba(0,0,0,0.5), 0 0 25px rgba(56, 189, 248, 0.05);
        }

        /* Statistical Framework Blocks */
        .stat-card {
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          border-radius: 6px;
          padding: 1rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: revealUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .stat-card:hover {
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(56, 189, 248, 0.2);
          transform: translateY(-2px);
        }

        /* Role Badge System */
        .role-tag {
          background: rgba(56, 189, 248, 0.05);
          border: 1px solid rgba(56, 189, 248, 0.15);
          color: #94a3b8;
          font-size: 0.62rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        .role-tag:hover {
          color: #38bdf8;
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
        }

        /* Premium Text Shimmer Effect */
        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8, #a5f3fc, #38bdf8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShimmer 4s linear infinite;
        }

        /* Ambient Fluid Light Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 2;
          opacity: 0.45;
        }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%); top: -10%; left: -5%; animation: wanderOrb1 15s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%); bottom: -5%; right: -5%; animation: wanderOrb2 18s ease-in-out infinite; }
        .orb-3 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%); top: 25%; right: 25%; animation: wanderOrb3 20s ease-in-out infinite; }

        /* Live Activity Dot Indicator */
        .live-indicator {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: activePulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
        }

        /* Brand Identity Concentric Pulse Outer Ring */
        .logo-pulse-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(56, 189, 248, 0.2);
          animation: outerRingPulse 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          pointer-events: none;
        }

        /* Core Motion Keyframes Engine */
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeLogoIn {
          from { opacity: 0; transform: scale(0.9) rotate(-3deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes textShimmer {
          to { background-position: 200% center; }
        }
        @keyframes activePulse {
          to { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        }
        @keyframes outerRingPulse {
          0%   { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes wanderOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes wanderOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-30px, -40px) scale(0.9); }
        }
        @keyframes wanderOrb3 {
          0%, 100% { transform: translate(0, 0); }
          33%      { transform: translate(20px, -30px); }
          66%      { transform: translate(-20px, 20px); }
        }
      `}</style>
    </div>
  );
};
export default Welcome;
