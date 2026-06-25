import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface RegistryCert {
  id: number;
  certificateId: number;
  certificateAlias: string;
  commonName: string;
  serialNumber: string;
  subject: string;
  issuer: string;
  status: string;
  validFrom: string;
  validUntil: string;
  ownerUsername: string;
  revokedAt?: string;
  revocationReason?: number;
  createdAt: string;
}

interface LookupResult {
  status: string;
  commonName: string;
  serialNumber: string;
  subject: string;
  issuer: string;
  alias: string;
  ownerUsername: string;
  validFrom: string;
  validUntil: string;
  revokedAt?: string;
  revocationReason?: number;
  note?: string;
}

const reasonLabel = (code?: number) => {
  const map: Record<number, string> = { 0: 'Unspecified', 1: 'Key Compromise', 2: 'CA Compromise', 3: 'Affiliation Changed', 4: 'Superseded', 5: 'Cessation of Operation', 6: 'Certificate Hold' };
  return code !== undefined ? (map[code] || `Code ${code}`) : '—';
};

export const OcspOperator: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [registry, setRegistry] = useState<RegistryCert[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(true);
  const [search, setSearch] = useState('');

  const [lookupCn, setLookupCn] = useState('');
  const [lookupSerial, setLookupSerial] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [looking, setLooking] = useState(false);

  const [activeTab, setActiveTab] = useState<'registry' | 'lookup'>('lookup');

  const fetchRegistry = async () => {
    setLoadingRegistry(true);
    try {
      const r = await api.get('/api/ocsp/registry');
      setRegistry(r.data);
    } catch (e: any) {
      showToast('Failed to load OCSP certificate registry', 'error');
    } finally {
      setLoadingRegistry(false);
    }
  };

  useEffect(() => { fetchRegistry(); }, []);

  const filteredRegistry = registry.filter(c =>
    !search ||
    c.commonName?.toLowerCase().includes(search.toLowerCase()) ||
    c.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateAlias?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCn.trim() || !lookupSerial.trim()) {
      showToast('Both CN and Serial Number are required for OCSP lookup', 'error');
      return;
    }
    setLooking(true);
    setLookupResult(null);
    try {
      const r = await api.post('/api/ocsp/registry/lookup', {
        cn: lookupCn.trim(),
        serialNumber: lookupSerial.trim(),
      });
      setLookupResult(r.data);
    } catch (e: any) {
      showToast(e.response?.data?.error || 'OCSP lookup failed', 'error');
    } finally {
      setLooking(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'ACTIVE' || status === 'ISSUED') return { bg: '#D1FAE5', text: '#065F46', label: '✅ GOOD' };
    if (status === 'REVOKED') return { bg: '#FEE2E2', text: '#7F1D1D', label: '❌ REVOKED' };
    return { bg: '#FEF3C7', text: '#92400E', label: '⚠️ UNKNOWN' };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0C4A6E 100%)', borderRadius: '0.75rem', padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>🔍 OCSP Certificate Registry</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Online Certificate Status Protocol · CN + Serial Number verification</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.2)', color: '#93C5FD', border: '1px solid #3B82F6' }}>
            {registry.length} Registered Certificates
          </span>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }} onClick={fetchRegistry}>
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={activeTab === 'lookup' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('lookup')}>
          🔎 OCSP Status Lookup
        </button>
        <button className={activeTab === 'registry' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('registry')}>
          📋 Certificate Registry ({registry.length})
        </button>
      </div>

      {/* ── OCSP Lookup Tab ───────────────────────────────────────────────── */}
      {activeTab === 'lookup' && (
        <div className="grid-2">
          {/* Lookup Form */}
          <div className="card">
            <h3 className="card-title">🔎 Certificate Status Lookup</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter the certificate's Common Name (CN) and Serial Number to check its revocation status in real-time.
            </p>

            <form onSubmit={handleLookup}>
              <div className="form-group">
                <label>Common Name (CN)</label>
                <input
                  id="ocsp-cn-input"
                  type="text"
                  value={lookupCn}
                  onChange={e => setLookupCn(e.target.value)}
                  placeholder="e.g. alice or alice.insa.gov.et"
                  required
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>The CN field from the certificate's Subject DN</div>
              </div>

              <div className="form-group">
                <label>Serial Number (Hex)</label>
                <input
                  id="ocsp-serial-input"
                  type="text"
                  value={lookupSerial}
                  onChange={e => setLookupSerial(e.target.value)}
                  placeholder="e.g. 197A3B5C2F..."
                  required
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Hexadecimal serial as shown in the certificate</div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={looking}>
                {looking
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Querying OCSP Registry...</span>
                  : '🔍 Check Certificate Status'}
              </button>
            </form>

            {/* Result */}
            {lookupResult && (() => {
              const sc = statusColor(lookupResult.status);
              return (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '0.5rem', backgroundColor: sc.bg, border: `1px solid ${lookupResult.status === 'REVOKED' ? '#EF4444' : lookupResult.status === 'ACTIVE' || lookupResult.status === 'ISSUED' ? '#10B981' : '#F59E0B'}`, animation: 'slide-in 0.2s ease-out' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: sc.text, marginBottom: '0.75rem' }}>
                    {sc.label}
                  </div>
                  <table style={{ fontSize: '0.78rem', width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[
                        ['Common Name', lookupResult.commonName],
                        ['Serial Number', lookupResult.serialNumber],
                        ['Alias', lookupResult.alias],
                        ['Owner', lookupResult.ownerUsername],
                        ['Subject', lookupResult.subject],
                        ['Issuer', lookupResult.issuer],
                        ['Valid From', lookupResult.validFrom ? new Date(lookupResult.validFrom).toLocaleDateString() : '—'],
                        ['Valid Until', lookupResult.validUntil ? new Date(lookupResult.validUntil).toLocaleDateString() : '—'],
                        ...(lookupResult.status === 'REVOKED' ? [
                          ['Revoked At', lookupResult.revokedAt ? new Date(lookupResult.revokedAt).toLocaleString() : '—'],
                          ['Revocation Reason', reasonLabel(lookupResult.revocationReason)],
                        ] : []),
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ fontWeight: 600, paddingRight: '0.75rem', paddingBottom: '0.3rem', color: sc.text, whiteSpace: 'nowrap' }}>{k}</td>
                          <td style={{ color: sc.text, wordBreak: 'break-all', paddingBottom: '0.3rem' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {lookupResult.note && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '0.375rem', fontSize: '0.75rem', color: sc.text }}>
                      ℹ️ {lookupResult.note}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Info panel */}
          <div className="card">
            <h3 className="card-title">📖 OCSP Verification Guide</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>What is OCSP?</strong>
                <p style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                  Online Certificate Status Protocol (RFC 6960) provides real-time certificate revocation status — superior to CRL because it avoids downloading large revocation lists.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Required Fields</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', marginBottom: 0 }}>
                  <li><strong>CN (Common Name)</strong> — extracted from the Subject DN of the certificate (e.g., "alice" from "CN=alice, O=INSA")</li>
                  <li><strong>Serial Number</strong> — the hexadecimal serial printed on the certificate</li>
                </ul>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Status Codes</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', backgroundColor: '#D1FAE5', color: '#065F46', fontSize: '0.7rem', fontWeight: 700 }}>GOOD</span> Certificate is valid and not revoked</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', backgroundColor: '#FEE2E2', color: '#7F1D1D', fontSize: '0.7rem', fontWeight: 700 }}>REVOKED</span> Certificate has been revoked — do not trust</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.7rem', fontWeight: 700 }}>UNKNOWN</span> Certificate not found in this registry</span>
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Auto-Registration</strong>
                <p style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                  All certificates issued by this PKI are automatically registered in this OCSP registry when created or signed. Revocation status is immediately reflected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Certificate Registry Tab ──────────────────────────────────────── */}
      {activeTab === 'registry' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>📋 All Registered Certificates ({registry.length})</span>
            <input
              type="text"
              placeholder="Search by CN, Serial, Subject, Alias..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: '320px' }}
            />
          </div>

          {loadingRegistry ? (
            <div className="flex-center" style={{ height: '200px' }}><div className="spinner" /></div>
          ) : filteredRegistry.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {search ? 'No certificates match your search.' : 'No certificates registered yet. Issue a certificate to populate this registry.'}
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Common Name</th>
                    <th>Serial Number</th>
                    <th>Alias</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Valid Until</th>
                    <th>Issuer</th>
                    <th>Revocation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistry.map(c => {
                    const sc = statusColor(c.status);
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.commonName || '—'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.serialNumber}>
                          {c.serialNumber || '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{c.certificateAlias || '—'}</td>
                        <td style={{ fontSize: '0.82rem' }}>{c.ownerUsername || '—'}</td>
                        <td>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.text }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.issuer}>
                          {c.issuer || '—'}
                        </td>
                        <td style={{ fontSize: '0.75rem' }}>
                          {c.status === 'REVOKED'
                            ? <span style={{ color: '#EF4444' }}>{c.revokedAt ? new Date(c.revokedAt).toLocaleDateString() : '—'}<br /><span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{reasonLabel(c.revocationReason)}</span></span>
                            : <span style={{ color: '#94A3B8' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
