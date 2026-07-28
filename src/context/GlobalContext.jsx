import React, { createContext, useState, useEffect, useContext } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [gastos, setGastos] = useState(() => {
    try {
      const item = localStorage.getItem('gastos');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    try {
      const item = localStorage.getItem('monthlyBudget');
      return item ? Number(item) : 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  });

  const [debts, setDebts] = useState(() => {
    try {
      const item = localStorage.getItem('debts');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gastos', JSON.stringify(gastos));
    } catch (error) {
      console.error("Storage error:", error);
      alert("Error saving gastos to local storage. Quota might be exceeded.");
    }
  }, [gastos]);

  useEffect(() => {
    try {
      localStorage.setItem('monthlyBudget', String(monthlyBudget));
    } catch (error) {
      console.error("Storage error:", error);
      alert("Error saving budget to local storage.");
    }
  }, [monthlyBudget]);

  useEffect(() => {
    try {
      localStorage.setItem('debts', JSON.stringify(debts));
    } catch (error) {
      console.error("Storage error:", error);
      alert("Error saving debts to local storage.");
    }
  }, [debts]);

  const addExpense = (expense) => {
    setGastos(prev => [...prev, expense]);
  };

  const deleteExpense = (id) => {
    setGastos(prev => prev.filter(g => g.id !== id));
  };
  
  const updateExpense = (updatedExpense) => {
    setGastos(prev => prev.map(g => g.id === updatedExpense.id ? updatedExpense : g));
  }

  const addDebt = (debt) => {
    setDebts(prev => [...prev, debt]);
  };

  const deleteDebt = (id) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const toggleDebtPaid = (id) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, paid: !d.paid } : d));
  };
  
  const updateDebt = (updatedDebt) => {
    setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
  }

  return (
    <GlobalContext.Provider value={{
      gastos, setGastos, addExpense, deleteExpense, updateExpense,
      monthlyBudget, setMonthlyBudget,
      debts, setDebts, addDebt, deleteDebt, toggleDebtPaid, updateDebt
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
