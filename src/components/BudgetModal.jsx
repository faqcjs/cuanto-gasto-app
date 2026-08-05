import React, { useState, useEffect } from 'react';

const BudgetModal = ({ isOpen, onClose, tempBudget, setTempBudget, setMonthlyBudget }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setInputValue(tempBudget > 0 ? tempBudget.toString() : '');
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
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
    }, 200);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-indigo-500/20 shadow-2xl space-y-5">
        <h2 className="text-xl font-bold text-slate-100">Establecer Presupuesto</h2>
        <div className="space-y-1.5">
          <label htmlFor="budget-modal" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ingrese su presupuesto mensual ($)
          </label>
          <input 
            type="number" 
            id="budget-modal" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ej: 150000"
            min="0"
            step="100"
            autoFocus
            className="w-full px-4 py-3 rounded-xl glass-input text-lg font-semibold text-indigo-300"
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button 
            type="button"
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer" 
            onClick={() => {
              setIsClosing(true);
              setTimeout(onClose, 200);
            }}
          >
            Cancelar
          </button>
          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
