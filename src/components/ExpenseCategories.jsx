import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ConfirmationModal from './ConfirmationModal';

// Colores para las categorías
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

// Color específico para la categoría de Deudas fijas
const DEBT_COLOR = '#E74C3C'; // Rojo intenso para destacar las deudas

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
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [chartType, setChartType] = useState('pie'); // 'pie' o 'bar'
  
  const hasData = categories && categories.length > 0;
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  
  // Filtrar gastos o deudas cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === 'Deudas fijas') {
        // Cargar deudas desde localStorage cuando se selecciona la categoría Deudas fijas
        try {
          const savedDebts = localStorage.getItem('debts');
          if (savedDebts) {
            const parsedDebts = JSON.parse(savedDebts);
            // Filtrar solo las deudas no pagadas
            const activeDebts = parsedDebts.filter(debt => !debt.isPaid);
            setFilteredDebts(activeDebts);
          } else {
            setFilteredDebts([]);
          }
        } catch (error) {
          console.error('Error al cargar deudas:', error);
          setFilteredDebts([]);
        }
        setFilteredExpenses([]);
      } else if (expenses) {
        // Para otras categorías, filtrar gastos normalmente
        const filtered = expenses.filter(expense => expense.category === selectedCategory);
        setFilteredExpenses(filtered);
        setFilteredDebts([]);
      }
    } else {
      setFilteredExpenses([]);
      setFilteredDebts([]);
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
                style={{ 
                  backgroundColor: selectedCategory === category.name ? 
                    (category.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length]) : 
                    'transparent',
                  borderColor: category.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length] 
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {hasData ? (
        selectedCategory === null ? (
          // Mostrar todas las categorías con el gráfico seleccionado
          <>
            {/* Botón para cambiar tipo de gráfico */}
            <div className="chart-type-toggle">
              <button 
                className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
              >
                Gráfico Circular
              </button>
              <button 
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                Gráfico de Barras
              </button>
            </div>

            {chartType === 'pie' ? (
              // Gráfico de pastel
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
                    label={({name, value}) => isMobile ? `$${value.toFixed(2)}` : `${name}: $${value.toFixed(2)}`}
                  >
                    {categories.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              // Gráfico de barras
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categories}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']} />
                  <Bar dataKey="value">
                    {categories.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Lista de categorías con montos */}
            <div className="category-list">
              {categories.map((category, index) => (
                <div 
                  key={index} 
                  className="category-item" 
                  onClick={() => handleCategorySelect(category.name)}
                >
                  <div className="category-color" style={{ backgroundColor: category.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length] }}></div>
                  <div className="category-name">{category.name}</div>
                  <div className="category-value">${category.value.toFixed(2)}</div>
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
                style={{ backgroundColor: selectedCategory === 'Deudas fijas' ? DEBT_COLOR : COLORS[categories.findIndex(c => c.name === selectedCategory) % COLORS.length] }}
              ></span>
              {selectedCategory} - Total: ${categories.find(c => c.name === selectedCategory)?.value.toFixed(2) || 0}
            </h3>
            
            {selectedCategory === 'Deudas fijas' ? (
              // Mostrar lista de deudas fijas
              filteredDebts.length > 0 ? (
                <div className="expense-list">
                  {filteredDebts.map((debt) => (
                    <div key={debt.id} className="expense-item debt-item-in-list">
                      <div className="expense-date">{new Date(debt.dueDate).toLocaleDateString()} (Vencimiento)</div>
                      <div className="expense-description">
                        <strong>{debt.name}</strong>
                        <span className="debt-category-tag">{debt.category}</span>
                      </div>
                      <div className="expense-amount">${parseFloat(debt.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No hay deudas pendientes para mostrar.</p>
              )
            ) : (
              // Mostrar lista de gastos normales
              filteredExpenses.length > 0 ? (
                <div className="expense-list">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-date">{formatDate(expense.date)}</div>
                      <div className="expense-description">{expense.description || 'Sin descripción'}</div>
                      <div className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</div>
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
              )
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
