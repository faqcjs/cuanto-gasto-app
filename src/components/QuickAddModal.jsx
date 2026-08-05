import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiX, FiZap } from 'react-icons/fi';
import { useGlobalContext } from '../context/GlobalContext';

const DEFAULT_CATEGORY_OPTIONS = [
  'Comida', 'Transporte', 'Ocio', 'Educación', 'Salud', 'Servicios', 'Otros'
];

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' }
];

const QuickAddModal = ({ isOpen, onClose }) => {
  const { addExpense } = useGlobalContext();
  const amountInputRef = useRef(null);

  const [expense, setExpense] = useState({
    amount: '',
    description: '',
    category: 'Comida',
    paymentMethod: 'efectivo',
    date: format(new Date(), 'yyyy-MM-dd'),
    tags: ''
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORY_OPTIONS);

  useEffect(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('customCategories')) || [];
      setCategories([...DEFAULT_CATEGORY_OPTIONS, ...custom]);
    } catch {
      setCategories(DEFAULT_CATEGORY_OPTIONS);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expense.amount || Number(expense.amount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }
    if (!expense.description.trim()) {
      alert('Por favor ingresa una descripción');
      return;
    }

    const parsedTags = expense.tags
      ? expense.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const newExpense = {
      ...expense,
      id: Date.now(),
      amount: Number(expense.amount),
      tags: parsedTags
    };

    addExpense(newExpense);

    setExpense({
      amount: '',
      description: '',
      category: 'Comida',
      paymentMethod: 'efectivo',
      date: format(new Date(), 'yyyy-MM-dd'),
      tags: ''
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg glass-card rounded-2xl p-6 border border-indigo-500/20 shadow-2xl space-y-5 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FiZap className="text-amber-400 text-xl" />
            <h3 className="text-lg font-bold text-slate-100">Carga Rápida de Gasto</h3>
          </div>
          <button 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer" 
            onClick={onClose} 
            aria-label="Cerrar modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="quick-amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Monto ($)
            </label>
            <input
              ref={amountInputRef}
              type="number"
              id="quick-amount"
              value={expense.amount}
              onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
              placeholder="0.00"
              step="any"
              min="0.01"
              required
              className="w-full px-4 py-3 rounded-xl glass-input text-lg font-semibold text-indigo-300"
            />
          </div>

          <div>
            <label htmlFor="quick-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Descripción
            </label>
            <input
              type="text"
              id="quick-description"
              value={expense.description}
              onChange={(e) => setExpense({ ...expense, description: e.target.value })}
              placeholder="Ej: Café con facturas"
              required
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Categoría
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    expense.category === cat 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50'
                  }`}
                  onClick={() => setExpense({ ...expense, category: cat })}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="quick-paymentMethod" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Forma de Pago
              </label>
              <select
                id="quick-paymentMethod"
                value={expense.paymentMethod}
                onChange={(e) => setExpense({ ...expense, paymentMethod: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quick-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                id="quick-date"
                value={expense.date}
                onChange={(e) => setExpense({ ...expense, date: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quick-tags" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Etiquetas (opcional)
            </label>
            <input
              type="text"
              id="quick-tags"
              value={expense.tags}
              onChange={(e) => setExpense({ ...expense, tags: e.target.value })}
              placeholder="Ej: gustos, oficina"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button 
              type="button" 
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
