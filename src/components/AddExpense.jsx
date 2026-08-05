import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useGlobalContext } from '../context/GlobalContext';

const CATEGORY_OPTIONS = [
  { value: 'Comida', label: 'Comida' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Ocio', label: 'Ocio' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Otros', label: 'Otros' }
];

const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' }
];

const AddExpense = () => {
  const { addExpense } = useGlobalContext();
  const navigate = useNavigate();
  const amountInputRef = useRef(null);

  const [expense, setExpense] = useState({
    amount: '',
    description: '',
    category: 'Comida',
    paymentMethod: 'efectivo',
    date: format(new Date(), 'yyyy-MM-dd'),
    tags: ''
  });

  const [allCategories, setAllCategories] = useState([...CATEGORY_OPTIONS]);

  useEffect(() => {
    try {
      const customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
      const customCategoryOptions = customCategories.map(cat => ({
        value: cat,
        label: cat
      }));
      setAllCategories([...CATEGORY_OPTIONS, ...customCategoryOptions]);
    } catch {
      setAllCategories(CATEGORY_OPTIONS);
    }
  }, []);

  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expense.amount || Number(expense.amount) <= 0) {
      alert('Por favor ingrese un monto válido');
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
    navigate('/');
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-4">
        Agregar Nuevo Gasto
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Monto ($)
          </label>
          <input
            ref={amountInputRef}
            type="number"
            id="amount"
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
          <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            value={expense.description || ''}
            onChange={(e) => setExpense({ ...expense, description: e.target.value })}
            placeholder="Ej: Compra en supermercado"
            required
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Etiquetas (separadas por coma)
          </label>
          <input
            type="text"
            id="tags"
            value={expense.tags || ''}
            onChange={(e) => setExpense({ ...expense, tags: e.target.value })}
            placeholder="Ej: mercado, semanal"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Categoría
            </label>
            <select
              id="category"
              value={expense.category}
              onChange={(e) => setExpense({ ...expense, category: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
            >
              {allCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Forma de Pago
            </label>
            <select
              id="paymentMethod"
              value={expense.paymentMethod}
              onChange={(e) => setExpense({ ...expense, paymentMethod: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            value={expense.date}
            onChange={(e) => setExpense({ ...expense, date: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
          />
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button 
            type="submit" 
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
          >
            Agregar Gasto
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
