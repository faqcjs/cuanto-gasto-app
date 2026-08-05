import React, { createContext, useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';

export const DEFAULT_CATEGORIES = [
  { id: 'Comida', name: 'Comida', color: '#FF6B6B', icon: 'Restaurant' },
  { id: 'Transporte', name: 'Transporte', color: '#4D96FF', icon: 'DirectionsBus' },
  { id: 'Ocio', name: 'Ocio', color: '#FFD93D', icon: 'SportsEsports' },
  { id: 'Educación', name: 'Educación', color: '#6BCB77', icon: 'School' },
  { id: 'Salud', name: 'Salud', color: '#9B51E0', icon: 'LocalHospital' },
  { id: 'Servicios', name: 'Servicios', color: '#FF9F40', icon: 'Receipt' },
  { id: 'Otros', name: 'Otros', color: '#A0AEC0', icon: 'MoreHoriz' },
];

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [gastos, setGastos] = useState(() => {
    try {
      const item = localStorage.getItem('gastos');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading gastos from storage:', error);
      return [];
    }
  });

  const [incomes, setIncomes] = useState(() => {
    try {
      const item = localStorage.getItem('incomes');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading incomes from storage:', error);
      return [];
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    try {
      const item = localStorage.getItem('monthlyBudget');
      return item ? Number(item) : 0;
    } catch (error) {
      console.error('Error reading monthlyBudget from storage:', error);
      return 0;
    }
  });

  const [debts, setDebts] = useState(() => {
    try {
      const item = localStorage.getItem('debts');
      if (!item) return [];
      const parsed = JSON.parse(item);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(d => ({
        ...d,
        paid: Boolean(d.paid || d.isPaid || false)
      }));
    } catch (error) {
      console.error('Error reading debts from storage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gastos', JSON.stringify(gastos));
    } catch (error) {
      console.error("Storage error for gastos:", error);
    }
  }, [gastos]);

  useEffect(() => {
    try {
      localStorage.setItem('incomes', JSON.stringify(incomes));
    } catch (error) {
      console.error("Storage error for incomes:", error);
    }
  }, [incomes]);

  useEffect(() => {
    try {
      localStorage.setItem('monthlyBudget', String(monthlyBudget));
    } catch (error) {
      console.error("Storage error for monthlyBudget:", error);
    }
  }, [monthlyBudget]);

  useEffect(() => {
    try {
      localStorage.setItem('debts', JSON.stringify(debts));
    } catch (error) {
      console.error("Storage error for debts:", error);
    }
  }, [debts]);

  const addExpense = (expense) => {
    const formatted = {
      ...expense,
      id: expense.id || Date.now(),
      amount: Number(expense.amount) || 0,
      tags: Array.isArray(expense.tags) ? expense.tags : (expense.tags ? String(expense.tags).split(',').map(t => t.trim()).filter(Boolean) : [])
    };
    setGastos(prev => [...prev, formatted]);
  };

  const addMultipleExpenses = (newExpenses) => {
    if (!Array.isArray(newExpenses) || newExpenses.length === 0) return 0;
    
    let addedCount = 0;
    setGastos(prev => {
      const existingIds = new Set(prev.map(g => g.externalId || g.id));
      const filtered = newExpenses.filter(e => !existingIds.has(e.externalId || e.id));
      addedCount = filtered.length;

      const formattedList = filtered.map((expense, idx) => ({
        ...expense,
        id: expense.id || `exp_${Date.now()}_${idx}`,
        amount: Number(expense.amount) || 0,
        tags: Array.isArray(expense.tags) ? expense.tags : (expense.tags ? String(expense.tags).split(',').map(t => t.trim()).filter(Boolean) : [])
      }));

      return [...prev, ...formattedList];
    });

    return addedCount;
  };

  const addMultipleIncomes = (newIncomes) => {
    if (!Array.isArray(newIncomes) || newIncomes.length === 0) return 0;

    let addedCount = 0;
    setIncomes(prev => {
      const existingIds = new Set(prev.map(i => i.externalId || i.id));
      const filtered = newIncomes.filter(i => !existingIds.has(i.externalId || i.id));
      addedCount = filtered.length;

      const formattedList = filtered.map((income, idx) => ({
        ...income,
        id: income.id || `inc_${Date.now()}_${idx}`,
        amount: Number(income.amount) || 0,
      }));

      return [...prev, ...formattedList];
    });

    return addedCount;
  };

  const deleteExpense = (id) => {
    setGastos(prev => prev.filter(g => g.id !== id));
  };
  
  const updateExpense = (updatedExpense) => {
    setGastos(prev => prev.map(g => g.id === updatedExpense.id ? updatedExpense : g));
  };

  const addDebt = (debt) => {
    const formatted = {
      ...debt,
      id: debt.id || Date.now(),
      amount: Number(debt.amount) || 0,
      paid: Boolean(debt.paid || debt.isPaid || false)
    };
    setDebts(prev => [...prev, formatted]);
  };

  const deleteDebt = (id) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const toggleDebtPaid = (id) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, paid: !d.paid, isPaid: !d.paid } : d));
  };
  
  const updateDebt = (updatedDebt) => {
    setDebts(prev => prev.map(d => d.id === updatedDebt.id ? { ...updatedDebt, paid: Boolean(updatedDebt.paid || updatedDebt.isPaid || false) } : d));
  };

  const updateBudget = (amount) => {
    setMonthlyBudget(Number(amount) || 0);
  };

  const exportDataJSON = () => {
    try {
      const customCategories = (() => {
        try {
          return JSON.parse(localStorage.getItem('customCategories')) || [];
        } catch {
          return [];
        }
      })();
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        gastos,
        monthlyBudget,
        debts,
        customCategories,
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `cuanto_gasto_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Error al exportar los datos");
    }
  };

  const exportDataCSV = () => {
    try {
      const escape = (val) => {
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      };

      const headers = ['Fecha', 'Descripcion', 'Categoria', 'Monto', 'Metodo de pago', 'Etiquetas'];
      const rows = gastos.map(g => [
        escape(g.date || ''),
        escape(g.description || ''),
        escape(g.category || ''),
        escape(Number(g.amount || 0).toFixed(2)),
        escape(g.paymentMethod || ''),
        escape(Array.isArray(g.tags) ? g.tags.join(';') : (g.tags || '')),
      ]);

      const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gastos_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('Error al exportar el CSV');
    }
  };

  const importDataJSON = (jsonContent) => {
    try {
      const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      if (!data || typeof data !== 'object') {
        throw new Error('Formato JSON inválido');
      }
      if (Array.isArray(data.gastos)) {
        setGastos(data.gastos);
      }
      if (typeof data.monthlyBudget === 'number' || typeof data.monthlyBudget === 'string') {
        setMonthlyBudget(Number(data.monthlyBudget) || 0);
      }
      if (Array.isArray(data.debts)) {
        setDebts(data.debts.map(d => ({
          ...d,
          paid: Boolean(d.paid || d.isPaid || false)
        })));
      }
      if (Array.isArray(data.customCategories)) {
        localStorage.setItem('customCategories', JSON.stringify(data.customCategories));
      }
      return { success: true };
    } catch (err) {
      console.error("Import failed:", err);
      return { success: false, error: err.message };
    }
  };

  const addIncomeRecord = (amount, description = 'Ingreso Extra') => {
    const formatted = {
      id: Date.now(),
      amount: Number(amount) || 0,
      description,
      date: format(new Date(), 'yyyy-MM-dd')
    };
    setIncomes(prev => [...prev, formatted]);
  };

  const clearAllData = () => {
    setGastos([]);
    setIncomes([]);
    setMonthlyBudget(0);
    setDebts([]);
    localStorage.removeItem('gastos');
    localStorage.removeItem('incomes');
    localStorage.removeItem('monthlyBudget');
    localStorage.removeItem('debts');
    localStorage.removeItem('customCategories');
  };

  return (
    <GlobalContext.Provider value={{
      gastos, setGastos, addExpense, addMultipleExpenses, deleteExpense, updateExpense,
      incomes, setIncomes, addIncomeRecord, addMultipleIncomes,
      monthlyBudget, setMonthlyBudget, updateBudget,
      debts, setDebts, addDebt, deleteDebt, toggleDebtPaid, updateDebt,
      exportDataJSON, exportDataCSV, importDataJSON, clearAllData, DEFAULT_CATEGORIES
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

