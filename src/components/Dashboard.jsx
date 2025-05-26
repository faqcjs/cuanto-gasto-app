import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import BudgetSummary from './BudgetSummary';
import ExpenseCategories from './ExpenseCategories';
import AddExpense from './AddExpense';
import BudgetModal from './BudgetModal';
import ConfirmationModal from './ConfirmationModal';
import Navbar from './Navbar';
import Settings from './Settings';
import { 
  LinearProgress, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button, 
  Box, 
  Typography 
} from '@mui/material';
import es from 'date-fns/locale/es';

const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'];

const CATEGORY_OPTIONS = [
  { value: 'Comida', label: 'Comida' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Ocio', label: 'Ocio' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Otros', label: 'Otros' }
];

const Dashboard = () => {
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [tempBudget, setTempBudget] = useState(0);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('resumen');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expense, setExpense] = useState({
    amount: '',
    description: '',
    category: 'Comida',
    paymentMethod: 'efectivo',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [paymentMethods, setPaymentMethods] = useState([
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' }
  ]);

  // Función para eliminar el presupuesto
  const deleteBudget = () => {
    localStorage.removeItem('monthlyBudget');
    setMonthlyBudget(0);
    setTempBudget(0);
  };
  
  // Función para eliminar un gasto individual
  const deleteExpense = (expenseId) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    localStorage.setItem('gastos', JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
    loadData(); // Recargar los datos para actualizar las categorías y totales
  };

  // Función para cargar datos
  const loadData = () => {
    const savedData = JSON.parse(localStorage.getItem('gastos')) || [];
    const savedBudget = localStorage.getItem('monthlyBudget') || '0';
    
    setMonthlyBudget(Number(savedBudget));
    setTempBudget(Number(savedBudget));
    
    // Guardar los gastos completos
    setExpenses(savedData);
    
    // Calcular total gastado
    const total = savedData.reduce((acc, item) => acc + Number(item.amount), 0);
    setTotalSpent(total);

    // Calcular gastos por categoría
    const categoryTotals = savedData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += Number(item.amount);
      return acc;
    }, {});

    setCategories(Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    })));
  };

  // Función para agregar un nuevo gasto
  const onAdd = (newExpense) => {
    const savedData = JSON.parse(localStorage.getItem('gastos')) || [];
    const updatedExpenses = [...savedData, { ...newExpense, id: Date.now(), amount: Number(newExpense.amount) }];
    localStorage.setItem('gastos', JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses); // Actualizar el estado de expenses directamente
    loadData();
  };

  useEffect(() => {
    // Cargar datos al iniciar
    loadData();
  }, []);


  return (
    <div className="dashboard-wrapper">
      {/* Navbar desplegable */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenido de las pestañas */}
      <div className="dashboard-content">
        {/* Pestaña de Resumen */}
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
                  expenses={expenses} 
                  onDeleteExpense={deleteExpense} 
                />
              </div>
            )}
          </div>
        )}
        
        {/* Modal de Presupuesto */}
        <BudgetModal 
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          tempBudget={tempBudget}
          setTempBudget={setTempBudget}
          setMonthlyBudget={setMonthlyBudget}
        />
        
        {/* Modal de Confirmación para eliminar presupuesto */}
        <ConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={deleteBudget}
          title="Eliminar Presupuesto"
          message="¿Estás seguro de que deseas eliminar el presupuesto mensual? Esta acción no se puede deshacer."
          confirmButtonText="Eliminar"
          cancelButtonText="Cancelar"
        />



        {/* Pestaña de Agregar Gasto */}
        {activeTab === 'agregar' && (
          <div className="dashboard-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <AddExpense 
              expense={expense}
              setExpense={setExpense}
              onAdd={onAdd}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
        
        {/* Pestaña de Ajustes */}
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
