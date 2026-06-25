import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  body?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmValidationText?: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  body,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onClose,
  onConfirm = () => {},
  confirmValidationText,
  children,
}) => {
  const [typedConfirm, setTypedConfirm] = useState('');

  if (!isOpen) return null;

  const isValid = !confirmValidationText || typedConfirm === confirmValidationText;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setTypedConfirm('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            className="toast-close"
            style={{ fontSize: '1.5rem', border: 'none', cursor: 'pointer' }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {body}
          {children}
          {confirmValidationText && (
            <div style={{ marginTop: '1rem' }}>
              <label>
                Type <strong>{confirmValidationText}</strong> to confirm:
              </label>
              <input
                type="text"
                autoComplete="off"
                value={typedConfirm}
                onChange={(e) => setTypedConfirm(e.target.value)}
                style={{ marginTop: '0.5rem' }}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-danger" onClick={handleConfirm} disabled={!isValid}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
