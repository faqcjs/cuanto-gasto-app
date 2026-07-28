import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import BudgetSummary from './BudgetSummary';
import ExpenseCategories from './ExpenseCategories';
import AddExpense from './AddExpense';
import ConfirmationModal from './ConfirmationModal';
import BudgetModal from './BudgetModal';
import DebtTracker from './DebtTracker';
import Settings from './Settings';
import Analytics from './Analytics';
import { useGlobalContext } from '../context/GlobalContext';

const Dashboard = () => {
  const { gastos, monthlyBudget, setMonthlyBudget, debts, deleteExpense } = useGlobalContext();
  
  const [totalSpent, setTotalSpent] = useState(0);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('resumen');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget);

  useEffect(() => {
    setTempBudget(monthlyBudget);
  }, [monthlyBudget]);

  useEffect(() => {
    // Note: old code checked debt.isPaid, let's use both paid and isPaid just in case
    const totalDeudas = debts.reduce((sum, debt) => (!(debt.paid || debt.isPaid) ? sum + Number(debt.amount) : sum), 0);
    const totalGastos = gastos.reduce((acc, item) => acc + Number(item.amount), 0);
    
    setTotalSpent(totalGastos + totalDeudas);

    const categoryTotals = gastos.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = 0;
      acc[item.category] += Number(item.amount);
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
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="dashboard-content">
        {activeTab === 'resumen' && (
          <div className="dashboard-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            {categories.length === 0 && monthlyBudget === 0 ? (
              <div className="budget-summary">
                <h2>Resumen del presupuesto</h2>
                <div className="empty-state">
                  <p>No hay datos para mostrar</p>
                  <p>Ingresa tu presupuesto mensual y luego agrega gastos para ver estadísticas</p>
                  <div className="budget-actions">
                    <button 
                      className="primary-button budget-button"
                      onClick={() => setIsBudgetModalOpen(true)}
                    >
                      Establecer presupuesto
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <BudgetSummary 
                  totalSpent={totalSpent} 
                  monthlyBudget={monthlyBudget} 
                  onBudgetClick={() => setIsBudgetModalOpen(true)}
                  onDeleteBudget={() => setIsDeleteModalOpen(true)}
                />
                <ExpenseCategories 
                  categories={categories} 
                  expenses={gastos} 
                  onDeleteExpense={deleteExpense} 
                />
              </div>
            )}
          </div>
        )}
        
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
          message="¿Estás seguro de que deseas eliminar el presupuesto mensual? Esta acción no se puede deshacer."
          confirmButtonText="Eliminar"
          cancelButtonText="Cancelar"
        />

        {activeTab === 'agregar' && (
          <div className="dashboard-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <AddExpense setActiveTab={setActiveTab} />
          </div>
        )}
        
        {activeTab === 'deudas' && (
          <div className="dashboard-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <DebtTracker />
          </div>
        )}
        
        {activeTab === 'analiticas' && (
          <div className="dashboard-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Analytics />
          </div>
        )}
        
        {activeTab === 'ajustes' && (
          <div className="dashboard-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Settings />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
