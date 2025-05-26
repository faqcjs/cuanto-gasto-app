import React, { useState, useEffect } from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar'
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Duración de la animación
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!shouldRender) return null;

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 280); // Duración de la animación
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 280); // Duración de la animación
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-fadeout' : ''}`}>
      <div className={`modal-content ${isClosing ? 'modal-slideout' : ''}`}>
        <h2>{title}</h2>
        <p className="confirmation-message">{message}</p>
        <div className="modal-actions">
          <button 
            className="secondary-button" 
            onClick={handleCancel}
          >
            {cancelButtonText}
          </button>
          <button 
            className="danger-button" 
            onClick={handleConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
