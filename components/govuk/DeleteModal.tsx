// components/govuk/DeleteModal.tsx
'use client';

import { useEffect } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="govuk-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="govuk-modal__dialog" style={{
        background: 'white',
        maxWidth: '500px',
        width: '90%',
        padding: '24px',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}>
        <h2 className="govuk-heading-m">{title}</h2>
        <p className="govuk-body">{message}</p>

        <div className="govuk-button-group govuk-!-margin-top-6">
          <button 
            className="govuk-button govuk-button--warning" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="govuk-button govuk-button--secondary" 
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}