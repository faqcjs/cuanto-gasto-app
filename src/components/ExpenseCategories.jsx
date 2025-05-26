import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ConfirmationModal from './ConfirmationModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

// Hook personalizado para detectar el tamaño de la ventana
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

// Función para formatear la fecha
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const ExpenseCategories = ({ categories, expenses, onDeleteExpense }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const hasData = categories && categories.length > 0;
  const { width } = useWindowSize();
  const isMobile = width <= 480;
  
  // Filtrar gastos cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategory && expenses) {
      const filtered = expenses.filter(expense => expense.category === selectedCategory);
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses([]);
    }
  }, [selectedCategory, expenses]);
  
  // Función para seleccionar una categoría
  const handleCategorySelect = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); // Deseleccionar si ya está seleccionada
    } else {
      setSelectedCategory(categoryName);
    }
  };
  
  // Función para mostrar todas las categorías
  const showAllCategories = () => {
    setSelectedCategory(null);
  };
  
  // Funciones para manejar la eliminación de gastos
  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete.id);
      setShowDeleteConfirmation(false);
      setExpenseToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setExpenseToDelete(null);
  };
  
  return (
    <div className="category-chart-full">
      <h2>Gastos por categoría</h2>
      
      {/* Badges de categorías para filtrar */}
      {hasData && (
        <div className="category-filter">
          <span className="filter-label">Filtrar por:</span>
          <div className="category-badges">
            <button 
              className={`category-badge ${selectedCategory === null ? 'active' : ''}`}
              onClick={showAllCategories}
            >
              Todos
            </button>
            {categories.map((category, index) => (
              <button 
                key={index} 
                className={`category-badge ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.name)}
                style={{ backgroundColor: selectedCategory === category.name ? COLORS[index % COLORS.length] : 'transparent',
                        borderColor: COLORS[index % COLORS.length] }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {hasData ? (
        selectedCategory === null ? (
          // Mostrar todas las categorías con el gráfico de pastel
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={categories} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={isMobile ? 50 : 80} 
                  outerRadius={isMobile ? 90 : 120} 
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, value}) => isMobile ? `$${value}` : `${name}: $${value}`}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Lista de categorías con montos */}
            <div className="category-list">
              {categories.map((category, index) => (
                <div 
                  key={index} 
                  className="category-item" 
                  onClick={() => handleCategorySelect(category.name)}
                >
                  <div className="category-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div className="category-name">{category.name}</div>
                  <div className="category-value">${category.value}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Mostrar los gastos de la categoría seleccionada
          <div className="filtered-expenses">
            <h3 className="filtered-category-title">
              <span 
                className="category-color" 
                style={{ backgroundColor: COLORS[categories.findIndex(c => c.name === selectedCategory) % COLORS.length] }}
              ></span>
              {selectedCategory} - Total: ${categories.find(c => c.name === selectedCategory)?.value || 0}
            </h3>
            
            {filteredExpenses.length > 0 ? (
              <div className="expense-list">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="expense-item">
                    <div className="expense-date">{formatDate(expense.date)}</div>
                    <div className="expense-description">{expense.description || 'Sin descripción'}</div>
                    <div className="expense-amount">${expense.amount}</div>
                    <button 
                      className="delete-expense-btn" 
                      onClick={() => handleDeleteClick(expense)}
                      aria-label="Eliminar gasto"
                    >
                      <span className="delete-icon">×</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No se encontraron gastos para esta categoría.</p>
            )}
          </div>
        )
      ) : (
        <div className="no-data-message">
          <p>No hay gastos registrados todavía.</p>
          <p>Agrega gastos para ver estadísticas por categoría.</p>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar gastos */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Eliminar Gasto"
        message="¿Estás seguro de eliminar este gasto?"
        confirmButtonText="Eliminar"
        cancelButtonText="Cancelar"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
      />
    </div>
  );
};

export default ExpenseCategories;
