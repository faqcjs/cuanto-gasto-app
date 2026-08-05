import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { useGlobalContext } from '../context/GlobalContext';

const EditExpenseModal = ({ isOpen, onClose, expense, onUpdateExpense }) => {
  const { DEFAULT_CATEGORIES } = useGlobalContext();
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Comida');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isOpen && expense) {
      setShouldRender(true);
      setIsClosing(false);
      setAmount(expense.amount ? expense.amount.toString() : '');
      setDescription(expense.description || '');
      setCategory(expense.category || 'Comida');
      setDate(expense.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setPaymentMethod(expense.paymentMethod || 'Efectivo');
      setTags(Array.isArray(expense.tags) ? expense.tags.join(', ') : (expense.tags || ''));
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, expense]);

  if (!shouldRender || !expense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    const tagArray = tags
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    onUpdateExpense({
      ...expense,
      amount: Number(amount),
      description,
      category,
      date,
      paymentMethod,
      tags: tagArray
    });

    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className="w-full max-w-lg glass-card rounded-2xl p-5 sm:p-6 border border-indigo-500/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-100">Editar Gasto</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="edit-amount" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monto ($) *
              </label>
              <input 
                type="number"
                id="edit-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="any"
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base font-bold text-indigo-300"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-category" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Categoría
              </label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-description" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Descripción
            </label>
            <input 
              type="text"
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Supermercado, Almuerzo..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="edit-date" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Fecha
              </label>
              <input 
                type="date"
                id="edit-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="edit-payment" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Método de Pago
              </label>
              <select
                id="edit-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-tags" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Etiquetas (separadas por coma)
            </label>
            <input 
              type="text"
              id="edit-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ej: mensual, urgente"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <FiCheck className="text-base" /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
