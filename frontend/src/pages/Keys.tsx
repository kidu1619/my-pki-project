import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import api from '../services/api';

interface KeyPair {
  id: number;
  alias: string;
  algorithm: string;
  keySize: string;
  type: string;
  message?: string;
}

/* ── Inline Help Button Component ── */
const HelpButton: React.FC<{ note: string }> = ({ note }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        className="help-btn"
        onClick={() => setOpen((v) => !v)}
        title="Show help"
        aria-label="Show help"
      >
        ?
      </button>
      {open && (
        <div className="help-popover">
          {note}
        </div>
      )}
    </div>
  );
};

export const Keys: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const hasHsmRole = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN') || user?.roles.includes('ROLE_HSM') || false;
  const [hsmGloballyEnabled, setHsmGloballyEnabled] = useState(true);
  const hasHsmPermission = hasHsmRole && hsmGloballyEnabled;
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [loading, setLoading] = useState(true);

  const [algorithm, setAlgorithm] = useState('RSA');
  const [keySize, setKeySize] = useState('2048');
  const [alias, setAlias] = useState('');
  const [isHsm, setIsHsm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genPfxPassword, setGenPfxPassword] = useState('');

  const [importAlgorithm, setImportAlgorithm] = useState('RSA');
  const [importKeySize, setImportKeySize] = useState('2048');
  const [importAlias, setImportAlias] = useState('');
  const [importKeyPairPem, setImportKeyPairPem] = useState('');
  const [importing, setImporting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyPair | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameAlias, setRenameAlias] = useState('');

  const [isExportPfxOpen, setIsExportPfxOpen] = useState(false);
  const [selectedKeyForPfx, setSelectedKeyForPfx] = useState<KeyPair | null>(null);
  const [pfxPassword, setPfxPassword] = useState('');
  const [exportingPfx, setExportingPfx] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    try {
      let privKey = importKeyPairPem;
      
      const privMatch = importKeyPairPem.match(/-----BEGIN[\s\S]+?PRIVATE KEY-----[\s\S]+?-----END[\s\S]+?PRIVATE KEY-----/) ||
                        importKeyPairPem.match(/-----BEGIN[\s\S]+?RSA PRIVATE KEY-----[\s\S]+?-----END[\s\S]+?RSA PRIVATE KEY-----/);
      
      if (privMatch) {
        privKey = privMatch[0];
      }
      
      const response = await api.post('/api/keys/import', {
        alias: importAlias.trim(),
        algorithm: importAlgorithm,
        keySize: importKeySize,
        publicKeyPem: '',
        privateKeyPem: privKey
      });
      showToast(response.data.message || 'Key pair imported successfully', 'success');
      setImportAlias('');
      setImportKeyPairPem('');
      fetchKeys();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Key import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  const fetchKeys = async () => {
    try {
      const response = await api.get('/api/keys');
      setKeys(response.data);
    } catch (e: any) {
      showToast('Failed to load keys catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHsmGlobalStatus = async () => {
    try {
      const response = await api.get('/api/hsm/global-status');
      setHsmGloballyEnabled(response.data.enabled);
    } catch (e) {}
  };

  useEffect(() => {
    fetchKeys();
    fetchHsmGlobalStatus();
  }, []);

  const handleAlgorithmChange = (algo: string) => {
    setAlgorithm(algo);
    if (algo === 'RSA') {
      setKeySize('2048');
    } else if (algo === 'EC') {
      setKeySize('secp256r1');
    } else if (algo === 'EdDSA') {
      setKeySize('ed25519');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHsm && genPfxPassword.length < 8) {
      showToast('PFX password must be at least 8 characters.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const endpoint = isHsm ? '/api/keys/generate-hsm' : '/api/keys/generate';
      const response = await api.post(endpoint, {
        algorithm,
        keySize,
        alias: alias.trim() ? alias.trim() : null,
        password: !isHsm ? genPfxPassword : undefined,
        exportAsPfx: !isHsm,
      });
      showToast(response.data.message || 'Key pair generated successfully', 'success');

      if (!isHsm && response.data.id) {
        try {
          const pemResponse = await api.get(`/api/keys/${response.data.id}/export/pem`);
          const pemElement = document.createElement('a');
          const pemFile = new Blob([pemResponse.data], { type: 'text/plain' });
          pemElement.href = URL.createObjectURL(pemFile);
          pemElement.download = `${response.data.alias || alias.trim()}.key`;
          document.body.appendChild(pemElement);
          pemElement.click();
          document.body.removeChild(pemElement);
        } catch (err: any) {
          showToast('PEM download failed: ' + (err.response?.data || err.message), 'error');
        }
      }

      if (!isHsm && response.data.pfxBase64) {
        const pfxBytes = Uint8Array.from(atob(response.data.pfxBase64), c => c.charCodeAt(0));
        const pfxBlob = new Blob([pfxBytes], { type: 'application/x-pkcs12' });
        const pfxElement = document.createElement('a');
        pfxElement.href = URL.createObjectURL(pfxBlob);
        pfxElement.download = `${response.data.alias || alias.trim()}.pfx`;
        document.body.appendChild(pfxElement);
        pfxElement.click();
        document.body.removeChild(pfxElement);
        showToast('Key pair (.key + .pfx) downloaded successfully.', 'success');
      }

      setAlias('');
      setGenPfxPassword('');
      fetchKeys();
    } catch (e: any) {
      showToast(e.response?.data?.message || e.response?.data || 'Key generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const openDeleteModal = (key: KeyPair) => {
    setSelectedKey(key);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedKey) return;
    try {
      await api.delete(`/api/keys/${selectedKey.id}`);
      showToast(`Key pair ${selectedKey.alias} deleted`, 'success');
      fetchKeys();
    } catch (e: any) {
      showToast('Key deletion failed', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedKey(null);
    }
  };

  const handleExportPem = async (key: KeyPair) => {
    try {
      const response = await api.get(`/api/keys/${key.id}/export/pem`);
      const element = document.createElement('a');
      const file = new Blob([response.data], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${key.alias}.key`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast(`Exported private key PEM for ${key.alias}`, 'success');
    } catch (e: any) {
      showToast('PEM export failed', 'error');
    }
  };

  const handleEscrowKey = async (key: KeyPair) => {
    try {
      const response = await api.post(`/api/escrow/key/${key.id}`);
      showToast(response.data.message || 'Key escrowed successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Key escrow failed', 'error');
    }
  };

  const triggerExportPfx = (key: KeyPair) => {
    setSelectedKeyForPfx(key);
    setPfxPassword('');
    setIsExportPfxOpen(true);
  };

  const openRenameModal = (key: KeyPair) => {
    setSelectedKey(key);
    setRenameAlias(key.alias);
    setIsRenameOpen(true);
  };

  const handleRenameSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedKey) return;
    try {
      const response = await api.put(`/api/keys/${selectedKey.id}`, {
        algorithm: selectedKey.algorithm,
        keySize: selectedKey.keySize,
        alias: renameAlias.trim() || selectedKey.alias,
      });
      showToast(response.data.message || `Alias updated to ${renameAlias}`, 'success');
      setIsRenameOpen(false);
      setSelectedKey(null);
      fetchKeys();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Rename failed', 'error');
    }
  };

  const handleExportPfxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKeyForPfx) return;
    setExportingPfx(true);
    try {
      const response = await api.get(`/api/keys/${selectedKeyForPfx.id}/export/pfx`, {
        params: { password: pfxPassword },
        responseType: 'blob'
      });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(response.data);
      element.download = `${selectedKeyForPfx.alias}.pfx`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast(`Exported PFX for ${selectedKeyForPfx.alias}`, 'success');
      setIsExportPfxOpen(false);
    } catch (err: any) {
      showToast('PFX export failed', 'error');
    } finally {
      setExportingPfx(false);
    }
  };

  return (
    <div>
      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ── Key Pair Generator ── */}
          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Key Pair Generator
              <HelpButton note="Generate a new cryptographic key pair. For software keys, a PFX password is required to protect the exported keystore. HSM keys are stored on the hardware token and cannot be exported as PEM." />
            </h3>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label>Alias / Label Indicator</label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="e.g., insa-web-server-key"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  Cryptographic Algorithm
                  <HelpButton note="RSA is widely compatible. ECC (Elliptic Curve) provides stronger security with smaller keys. EdDSA (Ed25519) is the fastest and most modern option." />
                </label>
                <select value={algorithm} onChange={(e) => handleAlgorithmChange(e.target.value)}>
                  <option value="RSA">RSA</option>
                  <option value="EC">ECC</option>
                  <option value="EdDSA">EdDSA</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  Key Size / Curve Selection
                  <HelpButton note="For RSA: 2048-bit is standard, 3072+ is recommended for long-term security. For ECC: secp256r1 is widely supported, secp384r1 provides stronger security. EdDSA only supports Ed25519." />
                </label>
                {algorithm === 'RSA' && (
                  <select value={keySize} onChange={(e) => setKeySize(e.target.value)}>
                    <option value="2048">2048-bit</option>
                    <option value="3072">3072-bit</option>
                    <option value="4048">4048-bit</option>
                  </select>
                )}
                {algorithm === 'EC' && (
                  <select value={keySize} onChange={(e) => setKeySize(e.target.value)}>
                    <option value="secp256r1">secp256r1</option>
                    <option value="secp384r1">secp384r1</option>
                  </select>
                )}
                {algorithm === 'EdDSA' && (
                  <select value={keySize} onChange={(e) => setKeySize(e.target.value)}>
                    <option value="ed25519">Ed25519</option>
                  </select>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isHsm"
                  checked={isHsm}
                  disabled={!hasHsmPermission}
                  onChange={(e) => setIsHsm(e.target.checked)}
                  style={{ width: 'auto', cursor: hasHsmPermission ? 'pointer' : 'not-allowed' }}
                />
                <label htmlFor="isHsm" style={{ marginBottom: 0, cursor: hasHsmPermission ? 'pointer' : 'not-allowed', color: hasHsmPermission ? 'inherit' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  HSM Token Binding
                  {!hsmGloballyEnabled && <span style={{ fontSize: '0.72rem', color: '#EF4444', marginLeft: '0.35rem' }}>(Disabled by Super Admin)</span>}
                  {hsmGloballyEnabled && !hasHsmRole && <span style={{ fontSize: '0.72rem', color: '#EF4444', marginLeft: '0.35rem' }}>(Requires HSM Role)</span>}
                  <HelpButton note="When enabled, the key is generated and stored securely inside the Hardware Security Module (SoftHSM). HSM keys cannot be exported as PEM — this is a security feature." />
                </label>
              </div>

              {!isHsm && (
                <div className="form-group" style={{ animation: 'slide-in 0.2s ease-out' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    PFX Export Password
                    <HelpButton note="A PKCS#12 (.pfx) container will be generated to store your key pair. This password encrypts the container. Minimum 8 characters required. Store this password safely — it cannot be recovered." />
                  </label>
                  <input
                    type="password"
                    id="genPfxPassword"
                    value={genPfxPassword}
                    onChange={(e) => setGenPfxPassword(e.target.value)}
                    placeholder="Strong password (min. 8 characters)"
                    minLength={8}
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={generating}>
                {generating ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : '🔑 Generate Key Pair'}
              </button>
            </form>
          </div>

          {/* ── Import Key Pair ── */}
          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Import Cryptographic Key Pair
              <HelpButton note="Import an existing private key in PEM format (-----BEGIN PRIVATE KEY----- or -----BEGIN RSA PRIVATE KEY-----). You can paste the PEM text directly or upload a .key/.pem file." />
            </h3>
            <form onSubmit={handleImport}>
              <div className="form-group">
                <label>Cryptographic Algorithm</label>
                <select value={importAlgorithm} onChange={(e) => setImportAlgorithm(e.target.value)}>
                  <option value="RSA">RSA</option>
                  <option value="EC">ECC</option>
                  <option value="EdDSA">EdDSA</option>
                </select>
              </div>

              <div className="form-group">
                <label>Key Size</label>
                {importAlgorithm === 'RSA' && (
                  <select value={importKeySize} onChange={(e) => setImportKeySize(e.target.value)}>
                    <option value="2048">2048-bit</option>
                    <option value="3072">3072-bit</option>
                    <option value="4048">4048-bit</option>
                  </select>
                )}
                {importAlgorithm === 'EC' && (
                  <select value={importKeySize} onChange={(e) => setImportKeySize(e.target.value)}>
                    <option value="secp256r1">secp256r1</option>
                    <option value="secp384r1">secp384r1</option>
                  </select>
                )}
                {importAlgorithm === 'EdDSA' && (
                  <select value={importKeySize} onChange={(e) => setImportKeySize(e.target.value)}>
                    <option value="ed25519">Ed25519</option>
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Alias / Label Indicator</label>
                <input
                  type="text"
                  value={importAlias}
                  onChange={(e) => setImportAlias(e.target.value)}
                  placeholder="e.g., imported-server-key"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  Private Key PEM
                  <HelpButton note="Paste your private key in PEM format, or upload a .key or .pem file. Only the private key is needed — the public key will be derived automatically. Ensure the key matches the algorithm selected above." />
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="file"
                    accept=".key,.pem,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setImportKeyPairPem(event.target?.result as string);
                          if (!importAlias) {
                            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                            setImportAlias(nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-'));
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.25rem' }}
                  />
                </div>
                <textarea
                  value={importKeyPairPem}
                  onChange={(e) => setImportKeyPairPem(e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  style={{ height: '130px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={importing}>
                {importing ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : '📥 Import Key Pair'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Keystore Inventory ── */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Keystore Inventory
            <HelpButton note="Lists all cryptographic key pairs stored in the system. 'Software DB' keys can be exported as PEM or PFX. 'Hardware Protected' keys reside in the HSM and cannot be exported — this protects the private key material." />
          </h3>
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="scrollable-list">
              {keys.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>
                  No active cryptographic key pairs found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {keys.map((k) => (
                    <div
                      key={k.id}
                      style={{
                        padding: '0.875rem 1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        backgroundColor: 'var(--bg-surface)',
                        transition: 'box-shadow 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{k.alias}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                            ID: {k.id} · {k.algorithm} · {k.keySize}
                          </div>
                        </div>
                        {k.type === 'HSM' ? (
                          <span className="badge-hardware">🔒 Hardware Protected</span>
                        ) : (
                          <span className="badge badge-info">💾 Software DB</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                        {k.type !== 'HSM' && (
                          <>
                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={() => handleExportPem(k)}>
                              Export PEM
                            </button>
                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={() => triggerExportPfx(k)}>
                              Export PFX
                            </button>
                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={() => handleEscrowKey(k)}>
                              Escrow Key
                            </button>
                          </>
                        )}
                        <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={() => openRenameModal(k)}>
                          Rename
                        </button>
                        <button className="btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }} onClick={() => openDeleteModal(k)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirm Key Deletion"
        body={
          <p>
            Are you sure you want to permanently delete key pair <strong>{selectedKey?.alias}</strong>? This action is irreversible. Any certificates depending on this key pair will become invalid.
          </p>
        }
        confirmText="Yes, Delete Key"
        cancelText="Cancel"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        confirmValidationText={selectedKey?.alias}
      />

      {/* Rename Modal */}
      <Modal
        isOpen={isRenameOpen}
        title="Rename Key Alias"
        body={
          <div className="form-group">
            <label>New Alias</label>
            <input type="text" value={renameAlias} onChange={(e) => setRenameAlias(e.target.value)} required />
          </div>
        }
        confirmText="Rename"
        cancelText="Cancel"
        onClose={() => setIsRenameOpen(false)}
        onConfirm={() => handleRenameSubmit()}
      />

      {/* Export PFX Modal */}
      {isExportPfxOpen && (
        <div className="modal-overlay" onClick={() => setIsExportPfxOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Export PFX Keystore</h3>
              <button className="toast-close" onClick={() => setIsExportPfxOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleExportPfxSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  Provide a password to encrypt the exported PKCS#12 (.pfx) keystore for key alias: <strong>{selectedKeyForPfx?.alias}</strong>.
                </p>
                <div className="form-group">
                  <label htmlFor="pfxPassword" style={{ display: 'flex', alignItems: 'center' }}>
                    Password
                    <HelpButton note="This password will be used to encrypt the PKCS#12 container. You will need it to import the key into other systems. Store it securely." />
                  </label>
                  <input
                    type="password"
                    id="pfxPassword"
                    value={pfxPassword}
                    onChange={(e) => setPfxPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsExportPfxOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={exportingPfx}>
                  {exportingPfx ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Export Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
