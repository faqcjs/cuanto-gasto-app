import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useGlobalContext } from '../context/GlobalContext';

const CATEGORY_OPTIONS = [
  { value: 'Comida', label: 'Comida' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Ocio', label: 'Ocio' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Otros', label: 'Otros' }
];

const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' }
];

const AddExpense = ({ setActiveTab }) => {
  const { addExpense } = useGlobalContext();
  const [expense, setExpense] = useState({
    amount: '',
    description: '',
    category: 'Comida',
    paymentMethod: 'efectivo',
    date: format(new Date(), 'yyyy-MM-dd'),
    tags: ''
  });
  
  const [allCategories, setAllCategories] = useState([...CATEGORY_OPTIONS]);
  
  // Cargar categorías personalizadas
  useEffect(() => {
    const customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
    const customCategoryOptions = customCategories.map(cat => ({
      value: cat,
      label: cat
    }));
    
    setAllCategories([...CATEGORY_OPTIONS, ...customCategoryOptions]);
  }, []);

  return (
    <div className="add-expense-card-full">
      <h2>Agregar gasto</h2>
      <form className="add-expense-form" onSubmit={(e) => {
        e.preventDefault();
        if (!expense.amount || expense.amount <= 0) {
          alert('Por favor ingrese un monto válido');
          return;
        }
        
        // Parse tags
        const parsedTags = expense.tags 
          ? expense.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
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
        
        setActiveTab('resumen');
      }}>
        <div className="form-group">
          <label htmlFor="amount">Monto</label>
          <input
            type="number"
            id="amount"
            value={expense.amount}
            onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <input
            type="text"
            id="description"
            value={expense.description || ''}
            onChange={(e) => setExpense({ ...expense, description: e.target.value })}
            placeholder="Ej: Compra en supermercado"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Etiquetas (separadas por coma)</label>
          <input
            type="text"
            id="tags"
            value={expense.tags || ''}
            onChange={(e) => setExpense({ ...expense, tags: e.target.value })}
            placeholder="Ej: mercado, semanal"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            value={expense.category}
            onChange={(e) => setExpense({ ...expense, category: e.target.value })}
            required
          >
            {allCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Forma de pago</label>
          <select
            id="paymentMethod"
            value={expense.paymentMethod}
            onChange={(e) => setExpense({ ...expense, paymentMethod: e.target.value })}
            required
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha</label>
          <input
            type="date"
            id="date"
            value={expense.date}
            onChange={(e) => setExpense({ ...expense, date: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="primary-button">
          Agregar gasto
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
