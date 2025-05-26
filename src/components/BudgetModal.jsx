import React, { useState, useEffect } from 'react';

const BudgetModal = ({ isOpen, onClose, tempBudget, setTempBudget, setMonthlyBudget }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      // Si hay un presupuesto establecido, mostrar su valor, de lo contrario dejar vacío
      setInputValue(tempBudget > 0 ? tempBudget.toString() : '');
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Duración de la animación
      return () => clearTimeout(timer);
    }
  }, [isOpen, tempBudget]);
  
  if (!shouldRender) return null;

  const handleSave = () => {
    const budgetValue = inputValue === '' ? 0 : Number(inputValue);
    setTempBudget(budgetValue);
    setMonthlyBudget(budgetValue);
    localStorage.setItem('monthlyBudget', budgetValue);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 280); // Duración de la animación
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-fadeout' : ''}`}>
      <div className={`modal-content ${isClosing ? 'modal-slideout' : ''}`}>
        <h2>Establecer presupuesto</h2>
        <div className="form-group">
          <label htmlFor="budget-modal">Ingrese su presupuesto mensual</label>
          <input 
            type="number" 
            id="budget-modal" 
            value={inputValue} 
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            placeholder="Ingrese monto"
            min="0"
            step="100"
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button 
            className="secondary-button" 
            onClick={() => {
              setIsClosing(true);
              setTimeout(onClose, 280);
            }}
          >
            Cancelar
          </button>
          <button className="primary-button" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
