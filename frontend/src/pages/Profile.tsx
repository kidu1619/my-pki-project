import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import QRCode from 'qrcode';

export const Profile: React.FC = () => {
  const { showToast } = useToast();
  const { user, refreshProfile } = useAuth();

  const [photo, setPhoto] = useState<string | null>(null);
  const [mfaQrDataUrl, setMfaQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (user && user.profilePhoto) {
      setPhoto(user.profilePhoto);
    } else {
      setPhoto(null);
    }
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        try {
          await api.post('/api/self/profile-photo', { profilePhoto: compressedBase64 });
          setPhoto(compressedBase64);
          showToast('Profile photo updated successfully', 'success');
          await refreshProfile();
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || 'Unknown error';
          showToast(`Failed to upload profile photo: ${msg}`, 'error');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrUrl, setMfaQrUrl] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [enablingMfa, setEnablingMfa] = useState(false);
  const [loadingMfa, setLoadingMfa] = useState(false);

  const fetchMfaSetup = async () => {
    if (user?.mfaEnabled) return;
    setLoadingMfa(true);
    try {
      const response = await api.get('/api/self/mfa/setup');
      setMfaSecret(response.data.secret);
      const qrUrl = response.data.qrUrl;
      setMfaQrUrl(qrUrl);
      // Generate QR code client-side (no deprecated external API)
      const dataUrl = await QRCode.toDataURL(qrUrl, { width: 180, margin: 1 });
      setMfaQrDataUrl(dataUrl);
    } catch (e: any) {
      showToast('Failed to retrieve MFA configurations', 'error');
    } finally {
      setLoadingMfa(false);
    }
  };

  useEffect(() => {
    fetchMfaSetup();
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setChangingPass(true);
    try {
      await api.post('/api/self/password', { newPassword });
      showToast('Password updated successfully', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      showToast('Failed to change password', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnablingMfa(true);
    try {
      await api.post('/api/self/mfa/enable', { code: mfaCode });
      showToast('Multi-Factor Authentication enabled', 'success');
      setMfaCode('');
      await refreshProfile();
    } catch (e: any) {
      showToast('Invalid verification code entered', 'error');
    } finally {
      setEnablingMfa(false);
    }
  };

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">User Account Specifications</h3>
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  <div 
                    onClick={() => document.getElementById('avatar-file-input')?.click()}
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #0F172A',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F1F5F9',
                      fontSize: '2rem',
                      color: '#64748B',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                    title="Click to upload profile photo"
                  >
                    {photo ? (
                      <img src={photo} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.username ? user.username.substring(0, 2) : 'U'
                    )}
                  </div>
                  <label htmlFor="avatar-file-input" style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid #FFFFFF'
                  }} title="Upload profile photo">
                    📷
                  </label>
                  <input
                    type="file"
                    id="avatar-file-input"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{user.username}</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>{user.email}</p>
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.375rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Username:</strong> {user.username}</div>
                <div><strong>Email Address:</strong> {user.email}</div>
                <div><strong>Department:</strong> {user.department || 'N/A'}</div>
                <div>
                  <strong>Assigned Roles:</strong>{' '}
                  {user.roles.map((r) => (
                    <span key={r} className="badge badge-info" style={{ marginLeft: '0.25rem' }}>
                      {r.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <strong>MFA Status:</strong>
                  {user.mfaEnabled ? (
                    <span className="badge badge-success">MFA Enabled</span>
                  ) : (
                    <span className="badge badge-danger">MFA Disabled</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <h3 className="card-title" style={{ marginTop: '2rem' }}>Change Account Credentials</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={changingPass}>
              {changingPass ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title">Multi-Factor Authentication (MFA) Setup</h3>
          {user?.mfaEnabled ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '0.375rem', color: '#15803D', padding: '2rem', textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</span>
              <strong style={{ fontSize: '1rem' }}>MFA Security Enforced</strong>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Your identity is secured with a high-entropy TOTP authenticator key.
              </p>
            </div>
          ) : loadingMfa ? (
            <div className="flex-center" style={{ height: '240px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#64748B', fontSize: '0.8rem' }}>
                Scan the QR code below using an authenticator app (Google Authenticator, Duo, Aegis) or input the manual secret key.
              </p>

              {mfaQrDataUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}>
                  <img
                    src={mfaQrDataUrl}
                    alt="MFA QR Code Scanner"
                    style={{ width: '180px', height: '180px', border: '1px solid #CBD5E1', padding: '0.5rem', backgroundColor: '#FFFFFF' }}
                  />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', userSelect: 'all', wordBreak: 'break-all', textAlign: 'center' }}>
                    Secret Key: {mfaSecret}
                  </div>
                </div>
              )}

              <form onSubmit={handleEnableMfa} style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label>Enter 6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="000000"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={enablingMfa || !mfaCode}>
                  {enablingMfa ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Activate MFA'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
