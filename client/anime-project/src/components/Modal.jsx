import React from 'react';
import './Modal.css';

function Modal({ isOpen, title, message, onClose, onConfirm, confirmText = 'OK', cancelText = 'Cancelar', type = 'alert' }) {
    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay">
            <div className="custom-modal-container">
                {title && <h2 className="custom-modal-title">{title}</h2>}
                <div className="custom-modal-message">{message}</div>
                <div className="custom-modal-actions">
                    {type === 'confirm' && (
                        <button className="custom-modal-btn custom-modal-cancel" onClick={onClose}>{cancelText}</button>
                    )}
                    <button className="custom-modal-btn custom-modal-confirm" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}

export default Modal; 