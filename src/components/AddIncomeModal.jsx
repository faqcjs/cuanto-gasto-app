import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiX } from 'react-icons/fi';

const AddIncomeModal = ({ isOpen, onClose, onAddIncome }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setInputValue('');
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Number(inputValue);
    if (isNaN(val) || val <= 0) {
      alert('Por favor ingresa un monto de dinero válido a sumar');
      return;
    }
    onAddIncome(val);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-emerald-500/30 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FiTrendingUp className="text-lg" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Ingresar Dinero Extra</h2>
          </div>
          <button 
            type="button" 
            onClick={() => {
              setIsClosing(true);
              setTimeout(onClose, 200);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="income-amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monto de dinero a sumar ($)
            </label>
            <input 
              type="number" 
              id="income-amount" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ej: 25000"
              min="1"
              step="any"
              autoFocus
              required
              className="w-full px-4 py-3 rounded-xl glass-input text-lg font-semibold text-emerald-400 placeholder:text-slate-600"
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
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <FiTrendingUp className="text-base" /> Sumar Dinero
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal;
