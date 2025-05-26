import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

const AddExpense = ({ expense, setExpense, onAdd, setActiveTab }) => {
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
        onAdd(expense);
        setExpense({
          ...expense,
          amount: ''
        });
        // Cambiar a la pestaña de resumen después de agregar un gasto
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
