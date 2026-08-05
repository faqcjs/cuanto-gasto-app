import React, { useState, useEffect } from 'react';
import BudgetSummary from './BudgetSummary';
import BudgetTimelineChart from './BudgetTimelineChart';
import ExpenseCategories from './ExpenseCategories';
import ConfirmationModal from './ConfirmationModal';
import BudgetModal from './BudgetModal';
import AddIncomeModal from './AddIncomeModal';
import { useGlobalContext } from '../context/GlobalContext';

const Dashboard = () => {
  const { gastos, incomes, addIncomeRecord, monthlyBudget, setMonthlyBudget, debts, deleteExpense } = useGlobalContext();
  
  const [totalSpent, setTotalSpent] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget);

  useEffect(() => {
    setTempBudget(monthlyBudget);
  }, [monthlyBudget]);

  useEffect(() => {
    const totalDeudas = debts.reduce((sum, debt) => (!(debt.paid || debt.isPaid) ? sum + Number(debt.amount) : sum), 0);
    const totalGastos = gastos.reduce((acc, item) => acc + Math.abs(Number(item.amount)), 0);
    
    setTotalSpent(totalGastos + totalDeudas);

    const categoryTotals = gastos.reduce((acc, item) => {
      const cat = item.category || 'Otros';
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Number(item.amount);
      return acc;
    }, {});

    if (totalDeudas > 0) {
      categoryTotals['Deudas fijas'] = totalDeudas;
    }

    setCategories(Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    })));
  }, [gastos, debts]);

  const deleteBudget = () => {
    setMonthlyBudget(0);
    setTempBudget(0);
    setIsDeleteModalOpen(false);
  };

  const handleAddIncome = (amount) => {
    addIncomeRecord(amount, 'Ingreso Extra');
    const newBudget = monthlyBudget + amount;
    setMonthlyBudget(newBudget);
    setTempBudget(newBudget);
  };

  return (
    <div className="w-full space-y-6">
      {categories.length === 0 && monthlyBudget === 0 ? (
        <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Resumen del Presupuesto</h2>
          <div className="py-6 space-y-3">
            <p className="text-lg font-semibold text-slate-200">No hay datos para mostrar</p>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Ingresa tu presupuesto mensual y luego agrega gastos para ver estadísticas detalladas.
            </p>
            <div className="pt-2">
              <button 
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
                onClick={() => setIsBudgetModalOpen(true)}
              >
                Establecer Presupuesto
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <BudgetSummary 
            totalSpent={totalSpent} 
            monthlyBudget={monthlyBudget} 
            onAddIncomeClick={() => setIsIncomeModalOpen(true)}
            onBudgetClick={() => setIsBudgetModalOpen(true)}
            onDeleteBudget={() => setIsDeleteModalOpen(true)}
          />

          {/* Timeline Chart below Budget Summary */}
          <BudgetTimelineChart 
            gastos={gastos} 
            incomes={incomes} 
            monthlyBudget={monthlyBudget} 
          />

          <ExpenseCategories 
            categories={categories} 
            expenses={gastos} 
            onDeleteExpense={deleteExpense} 
          />
        </div>
      )}
      
      <AddIncomeModal 
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onAddIncome={handleAddIncome}
      />

      <BudgetModal 
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        tempBudget={tempBudget}
        setTempBudget={setTempBudget}
        setMonthlyBudget={setMonthlyBudget}
      />
      
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteBudget}
        title="Eliminar Presupuesto"
        message="¿Estás seguro de que deseas eliminar el presupuesto mensual? Esta acción dejará tu presupuesto en $0 pero mantendrá todos tus gastos guardados."
        confirmButtonText="Eliminar"
        cancelButtonText="Cancelar"
      />
    </div>
  );
};

export default Dashboard;
