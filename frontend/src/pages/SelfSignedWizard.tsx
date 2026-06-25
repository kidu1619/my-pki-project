import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface KeyPair {
  id: number;
  alias: string;
  algorithm: string;
  keySize: string;
  type: string;
}

interface Certificate {
  id: number;
  serialNumber: string;
  alias: string;
  subjectDn: string;
  issuerDn: string;
  status: string;
  notBefore: string;
  notAfter: string;
  type?: string;
}

export const SelfSignedWizard: React.FC = () => {
  const { showToast } = useToast();
  
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [alias, setAlias] = useState('');
  const [commonName, setCommonName] = useState('');
  const [organization, setOrganization] = useState('');
  const [country, setCountry] = useState('ET');
  const [generating, setGenerating] = useState(false);

  const fetchKeys = async () => {
    try {
      const response = await api.get('/api/keys');
      setKeys(response.data);
      if (response.data.length > 0) {
        setSelectedKeyId(response.data[0].id.toString());
      }
    } catch (e) {
      showToast('Failed to load key pairs', 'error');
    }
  };

  const fetchMyCertificates = async () => {
    try {
      const response = await api.get('/api/certificates/my');
      // Filter certificates where subject == issuer (self-signed)
      const selfSignedCerts = response.data.filter((c: Certificate) => c.subjectDn === c.issuerDn);
      setCerts(selfSignedCerts);
    } catch (e) {
      showToast('Failed to load certificates history', 'error');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchKeys(), fetchMyCertificates()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSelfSigned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKeyId) {
      showToast('Please select a cryptographic key pair', 'error');
      return;
    }
    setGenerating(true);
    try {
      const dnString = `CN=${commonName}, O=${organization}, C=${country}`;
      await api.post('/api/certificates/self-signed', {
        keyId: parseInt(selectedKeyId, 10),
        alias: alias.trim(),
        dn: dnString,
      });
      showToast(`Self-signed certificate '${alias}' generated successfully!`, 'success');
      setAlias('');
      setCommonName('');
      setOrganization('');
      fetchMyCertificates();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.response?.data || 'Self-signed generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (cert: Certificate) => {
    try {
      const response = await api.get(`/api/certificates/${cert.id}/export`);
      const element = document.createElement('a');
      const file = new Blob([response.data], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${cert.alias}.pem`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast(`Exported certificate ${cert.alias}`, 'success');
    } catch (e: any) {
      showToast('Failed to export certificate', 'error');
    }
  };

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Create Self-Signed Certificate</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Generate a custom self-signed digital identity certificate bound directly to your private key pair.
          </p>
          <form onSubmit={handleCreateSelfSigned}>
            <div className="form-group">
              <label>Select Key Pair</label>
              <select value={selectedKeyId} onChange={(e) => setSelectedKeyId(e.target.value)} required>
                <option value="">-- Choose Key Pair --</option>
                {keys.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.alias} ({k.algorithm} &bull; {k.keySize} &bull; {k.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Certificate Alias</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g., self-signed-web-cert"
                required
              />
            </div>

            <div className="form-group">
              <label>Common Name (CN)</label>
              <input
                type="text"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="e.g., myserver.local"
                required
              />
            </div>

            <div className="form-group">
              <label>Organization (O)</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g., Local Labs"
                required
              />
            </div>

            <div className="form-group">
              <label>Country (C)</label>
              <input
                type="text"
                maxLength={2}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., ET"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={generating}>
              {generating ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Generate Self-Signed Certificate'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">My Self-Signed Certificates</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            A historical registry of self-signed credentials generated by your account.
          </p>
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}>
              <div className="spinner"></div>
            </div>
          ) : certs.length === 0 ? (
            <div style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>
              No self-signed certificates found.
            </div>
          ) : (
            <div className="scrollable-list" style={{ maxHeight: '450px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {certs.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.alias}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Serial: {c.serialNumber} &bull; DN: {c.subjectDn}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Validity: {new Date(c.notBefore).toLocaleDateString()} to {new Date(c.notAfter).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge badge-success">Active</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleExport(c)}>
                        Export Certificate (PEM)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
