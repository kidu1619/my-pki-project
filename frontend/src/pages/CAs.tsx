import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import api from '../services/api';

interface CaResponse {
  id: number;
  alias: string;
  subject?: string;
  commonName?: string;
  type: string;         // ROOT_CA | INTERMEDIATE_CA | ISSUING_CA
  parentAlias?: string;
}

interface KeyPair {
  id: number;
  alias: string;
  algorithm: string;
  keySize: string;
  type: string;
  purpose?: string;
}

const CA_TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  ROOT_CA:         { icon: '👑', color: '#8B5CF6', label: 'Root CA' },
  INTERMEDIATE_CA: { icon: '🔗', color: '#0EA5E9', label: 'Intermediate CA' },
  ISSUING_CA:      { icon: '🖊️', color: '#10B981', label: 'Issuing CA' },
};

export const CAs: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN') || false;
  const isCaOperator = user?.roles.includes('ROLE_ADMIN') || isSuperAdmin || false;

  const [cas, setCas] = useState<CaResponse[]>([]);
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab: root | intermediate | issuing
  const [activeTab, setActiveTab] = useState<'root' | 'intermediate' | 'issuing'>('root');

  // Shared form fields
  const [caAlias, setCaAlias]           = useState('');
  const [commonName, setCommonName]     = useState('');
  const [organization, setOrganization] = useState('');
  const [country, setCountry]           = useState('ET');
  const [parentAlias, setParentAlias]   = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCa, setSelectedCa] = useState<CaResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casRes, keysRes] = await Promise.all([
        api.get('/api/ca'),
        api.get('/api/keys'),
      ]);
      setCas(casRes.data);
      setKeys(keysRes.data);
    } catch {
      showToast('Failed to load CA directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setCaAlias(''); setCommonName(''); setOrganization('');
    setCountry('ET'); setParentAlias(''); setSelectedKeyId('');
  };

  const buildDn = () => `CN=${commonName}, O=${organization}, C=${country}`;

  /* ── Feature 3: Root CA (SUPER_ADMIN only) ── */
  const handleCreateRootCa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKeyId) { showToast('Select a key pair', 'error'); return; }
    setCreating(true);
    try {
      await api.post('/api/ca/root', {
        alias: caAlias, dn: buildDn(), keyId: parseInt(selectedKeyId, 10),
      });
      showToast(`Root CA '${caAlias}' created successfully`, 'success');
      resetForm(); loadData();
    } catch (err: any) {
      showToast(err.response?.data || 'Failed to create Root CA', 'error');
    } finally {
      setCreating(false);
    }
  };

  /* ── Feature 5: Intermediate CA (SUPER_ADMIN only) ── */
  const handleCreateIntermediateCa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentAlias || !selectedKeyId) {
      showToast('Select parent CA and key pair', 'error'); return;
    }
    setCreating(true);
    try {
      await api.post('/api/ca/intermediate', {
        alias: caAlias, dn: buildDn(),
        parentAlias, keyId: parseInt(selectedKeyId, 10),
      });
      showToast(`Intermediate CA '${caAlias}' created successfully`, 'success');
      resetForm(); loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.response?.data || 'Failed to create Intermediate CA', 'error');
    } finally {
      setCreating(false);
    }
  };

  /* ── Feature 5: Issuing CA (ADMIN or SUPER_ADMIN) ── */
  const handleCreateIssuingCa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentAlias || !selectedKeyId) {
      showToast('Select parent CA and key pair', 'error'); return;
    }
    setCreating(true);
    try {
      await api.post('/api/ca/issuing', {
        alias: caAlias, dn: buildDn(),
        parentAlias, keyId: parseInt(selectedKeyId, 10),
      });
      showToast(`Issuing CA '${caAlias}' created — CA Operators can now use it to sign certificates`, 'success');
      resetForm(); loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.response?.data || 'Failed to create Issuing CA', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadCert = async (ca: CaResponse) => {
    try {
      const response = await api.get(`/api/ca/${ca.id}/certificate`);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([response.data], { type: 'text/plain' }));
      a.download = `${ca.alias}.crt`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToast(`Downloaded ${ca.alias}.crt`, 'success');
    } catch {
      showToast('Certificate download failed', 'error');
    }
  };

  const handleDeleteCa = async () => {
    if (!selectedCa) return;
    try {
      await api.delete(`/api/ca/${selectedCa.id}`);
      showToast(`CA '${selectedCa.alias}' deleted`, 'success');
      loadData();
    } catch {
      showToast('CA deletion failed', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedCa(null);
    }
  };

  /* ── Hierarchy tree node ── */
  const renderNode = (ca: CaResponse, level = 0): React.ReactNode => {
    const meta = CA_TYPE_META[ca.type] || { icon: '🔐', color: '#64748B', label: ca.type };
    const children = cas.filter((c) => c.parentAlias === ca.alias);
    return (
      <div key={ca.id} style={{ marginLeft: level > 0 ? 24 : 0, marginTop: '0.75rem' }}>
        {level > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '-0.375rem' }}>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', marginLeft: '12px' }} />
            <div style={{ width: '12px', height: '1px', backgroundColor: 'var(--border-color)' }} />
          </div>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', border: `1px solid ${meta.color}44`,
          borderLeft: `4px solid ${meta.color}`,
          borderRadius: '0.375rem', backgroundColor: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{meta.icon}</span>
            <div>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{ca.alias}</strong>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                  borderRadius: '0.25rem', backgroundColor: `${meta.color}22`, color: meta.color,
                }}>
                  {meta.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {ca.subject || ca.commonName || '—'}
                </span>
                {ca.parentAlias && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    ← {ca.parentAlias}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={() => handleDownloadCert(ca)}>
              Export .crt
            </button>
            {isSuperAdmin && (
              <button className="btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                onClick={() => { setSelectedCa(ca); setIsDeleteModalOpen(true); }}>
                Delete
              </button>
            )}
          </div>
        </div>
        {children.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  const rootCas = cas.filter((c) => c.type === 'ROOT_CA' || (!c.parentAlias && c.type !== 'INTERMEDIATE_CA' && c.type !== 'ISSUING_CA'));

  const sharedFields = (parentRequired = false) => (
    <>
      {parentRequired && (
        <div className="form-group">
          <label>Parent CA Alias</label>
          <select value={parentAlias} onChange={(e) => setParentAlias(e.target.value)} required>
            <option value="">— Select Parent CA —</option>
            {cas.map((c) => <option key={c.id} value={c.alias}>{c.alias} [{c.type}]</option>)}
          </select>
        </div>
      )}
      <div className="form-group">
        <label>Select Key Pair {activeTab === 'root' && <span style={{ fontSize: '0.72rem', color: '#8B5CF6' }}>(use a CA_ROOT purpose key)</span>}</label>
        <select value={selectedKeyId} onChange={(e) => setSelectedKeyId(e.target.value)} required>
          <option value="">— Select Key Pair —</option>
          {keys.map((k) => (
            <option key={k.id} value={k.id}>
              {k.alias} ({k.algorithm} · {k.keySize} · {k.type}){k.purpose && k.purpose !== 'GENERAL' ? ` [${k.purpose}]` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>CA Alias</label>
        <input type="text" value={caAlias} onChange={(e) => setCaAlias(e.target.value)} placeholder="e.g., insa-root-ca" required />
      </div>
      <div className="form-group">
        <label>Common Name (CN)</label>
        <input type="text" value={commonName} onChange={(e) => setCommonName(e.target.value)} placeholder="e.g., INSA Root Certificate Authority" required />
      </div>
      <div className="form-group">
        <label>Organization (O)</label>
        <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g., INSA" required />
      </div>
      <div className="form-group">
        <label>Country (C)</label>
        <input type="text" maxLength={2} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="ET" required />
      </div>
    </>
  );

  if (loading) return <div className="flex-center" style={{ height: '400px' }}><div className="spinner"></div></div>;

  return (
    <div>
      <div className="grid-2">

        {/* ── LEFT: Creation Panel ── */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>CA Initialization Panel</h3>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '1.5rem' }}>
            {[
              { id: 'root',         label: '👑 Root CA',         allowed: isSuperAdmin, msg: 'Super Admin only' },
              { id: 'intermediate', label: '🔗 Intermediate CA',  allowed: isSuperAdmin, msg: 'Super Admin only' },
              { id: 'issuing',      label: '🖊️ Issuing CA',       allowed: isCaOperator, msg: 'CA Operator only' },
            ].map((tab) => {
              const allowed = tab.allowed;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => allowed && setActiveTab(tab.id as any)}
                  style={{
                    flex: 1, padding: '0.6rem 0.25rem', border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid var(--color-interactive)' : '3px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === tab.id ? 'var(--color-interactive)' : allowed ? 'var(--text-secondary)' : '#64748B88',
                    fontWeight: 600, fontSize: '0.8rem', cursor: allowed ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                  {!allowed && <span style={{ fontSize: '0.65rem', display: 'block', color: '#EF4444' }}>{tab.msg}</span>}
                </button>
              );
            })}
          </div>

          {/* Root CA — SUPER_ADMIN only */}
          {activeTab === 'root' && (
            isSuperAdmin ? (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139,92,246,0.08)', border: '1px solid #8B5CF644', borderRadius: '0.375rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#8B5CF6' }}>
                  👑 <strong>Root CA</strong> — Self-signed trust anchor. Must be created first. Only Super Admin can create Root CAs. The Root CA must never sign end-entity certificates directly.
                </div>
                <form onSubmit={handleCreateRootCa}>
                  {sharedFields(false)}
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={creating}>
                    {creating ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : '👑 Initialize Root CA'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444', fontSize: '0.875rem' }}>
                🔒 Root CA creation requires <strong>ROLE_SUPER_ADMIN</strong>.
              </div>
            )
          )}

          {/* Intermediate CA — SUPER_ADMIN only */}
          {activeTab === 'intermediate' && (
            isSuperAdmin ? (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(14,165,233,0.08)', border: '1px solid #0EA5E944', borderRadius: '0.375rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#0EA5E9' }}>
                  🔗 <strong>Intermediate CA</strong> — Signed by the Root CA. Acts as an offline bridge between the Root and Issuing CAs. Only Super Admin can create Intermediate CAs.
                </div>
                <form onSubmit={handleCreateIntermediateCa}>
                  {sharedFields(true)}
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={creating}>
                    {creating ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : '🔗 Initialize Intermediate CA'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444', fontSize: '0.875rem' }}>
                🔒 Intermediate CA creation requires <strong>ROLE_SUPER_ADMIN</strong>.
              </div>
            )
          )}

          {/* Issuing CA — ADMIN only */}
          {activeTab === 'issuing' && (
            isCaOperator ? (
              <>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid #10B98144', borderRadius: '0.375rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#10B981' }}>
                  🖊️ <strong>Issuing CA</strong> — Signed by an Intermediate CA. CA Operators use this CA daily to sign end-entity certificates for users. Only CA Operators can create Issuing CAs.
                </div>
                <form onSubmit={handleCreateIssuingCa}>
                  {sharedFields(true)}
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={creating}>
                    {creating ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : '🖊️ Initialize Issuing CA'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444', fontSize: '0.875rem' }}>
                🔒 Issuing CA creation requires <strong>ROLE_ADMIN</strong>.
              </div>
            )
          )}
        </div>

        {/* ── RIGHT: Hierarchy Tree ── */}
        <div className="card">
          <h3 className="card-title">PKI Trust Hierarchy</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <strong style={{ color: '#8B5CF6' }}>Root CA</strong> → <strong style={{ color: '#0EA5E9' }}>Intermediate CA</strong> → <strong style={{ color: '#10B981' }}>Issuing CA</strong>
            &nbsp;(only Issuing / Intermediate CAs can sign end-entity certificates)
          </p>
          <div className="scrollable-list" style={{ maxHeight: '520px' }}>
            {cas.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No Certificate Authorities configured yet.<br />
                <span style={{ fontSize: '0.8rem' }}>Start by creating a Root CA.</span>
              </div>
            ) : rootCas.length > 0 ? (
              rootCas.map((root) => renderNode(root))
            ) : (
              // Fallback: show all CAs if no root found (e.g., orphaned CAs)
              cas.map((ca) => renderNode(ca))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirm CA Deletion"
        body={
          <p>
            Delete CA <strong>{selectedCa?.alias}</strong>? This will permanently invalidate all certificates in this CA's trust chain.
          </p>
        }
        confirmText="Yes, Delete CA"
        cancelText="Cancel"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCa}
        confirmValidationText={selectedCa?.alias}
      />
    </div>
  );
};
