/**
 * Cancel order confirmation modal – Thaveesha
 * Replaces window.confirm for consistent UX.
 */
import React from 'react';
import './CancelConfirmModal.css';

export default function CancelConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="cancel-modal-overlay" onClick={onCancel}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="cancel-modal-title">{title ?? 'Cancel order?'}</h3>
        <p className="cancel-modal-message">{message ?? 'This action cannot be undone.'}</p>
        <div className="cancel-modal-actions">
          <button type="button" className="cancel-modal-btn cancel-modal-btn-secondary" onClick={onCancel} disabled={loading}>
            Keep order
          </button>
          <button type="button" className="cancel-modal-btn cancel-modal-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Cancelling...' : 'Yes, cancel order'}
          </button>
        </div>
      </div>
    </div>
  );
}
