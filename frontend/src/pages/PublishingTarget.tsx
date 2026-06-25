import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const PublishingTarget: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [ldapUrl, setLdapUrl] = useState('ldap://localhost:389');
  const [ldapDn, setLdapDn] = useState('cn=admin,dc=insa,dc=gov,dc=et');
  const [storagePath, setStoragePath] = useState('C:\\Users\\Admin\\Documents\\Downloads\\Telegram Desktop\\udated234\\cl\\latest.crl');
  const [autoPublish, setAutoPublish] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      showToast('Downstream publication target channels updated successfully', 'success');
      setSavingSettings(false);
    }, 800);
  };

  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN') || false;

  if (!isSuperAdmin) {
    return (
      <div className="card">
        <h3 style={{ color: '#EF4444' }}>Access Denied</h3>
        <p>You do not have administrative privileges to manage publication target configurations.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">Configure Downstream Publication Channels</h3>
      <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
        Establish connections to public registries, LDAP schemas, and physical storage locations for CRL distribution.
      </p>

      <form onSubmit={handleSaveSettings}>
        <div className="grid-2">
          <div className="form-group">
            <label>LDAP Server Endpoint URL</label>
            <input
              type="text"
              value={ldapUrl}
              onChange={(e) => setLdapUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Directory Base distinguishedName (DN)</label>
            <input
              type="text"
              value={ldapDn}
              onChange={(e) => setLdapDn(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>CRL Distribution Storage Folder Path</label>
            <input
              type="text"
              value={storagePath}
              onChange={(e) => setStoragePath(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <input
              type="checkbox"
              id="autoPublishTarget"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="autoPublishTarget" style={{ marginBottom: 0, cursor: 'pointer' }}>
              Enforce immediate publication pushes upon manual CRL compilations
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={savingSettings}>
          {savingSettings ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Save Downstream Config'}
        </button>
      </form>
    </div>
  );
};
