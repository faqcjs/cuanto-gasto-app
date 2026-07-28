import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { format } from 'date-fns';
import ConfirmationModal from './ConfirmationModal';
import { FaChartPie, FaChartBar, FaChartLine, FaChartArea, FaRegDotCircle } from 'react-icons/fa';
import { useGlobalContext } from '../context/GlobalContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];
const DEBT_COLOR = '#E74C3C';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const ExpenseCategories = ({ categories, expenses, onDeleteExpense }) => {
  const { debts } = useGlobalContext();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [chartType, setChartType] = useState('pie');
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const hasData = categories && categories.length > 0;
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  
  useEffect(() => {
    // If we have a search term, we show all expenses matching it, ignoring category filter if we want, or combining them.
    // Let's combine them:
    const activeDebts = debts.filter(debt => !debt.paid && !debt.isPaid);

    let currentExpenses = expenses || [];
    let currentDebts = activeDebts;

    if (selectedCategory) {
      if (selectedCategory === 'Deudas fijas') {
        currentExpenses = [];
      } else {
        currentExpenses = currentExpenses.filter(e => e.category === selectedCategory);
        currentDebts = [];
      }
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      currentExpenses = currentExpenses.filter(e => {
        const descMatch = e.description && e.description.toLowerCase().includes(lowerSearch);
        const tagsMatch = e.tags && e.tags.some(t => t.toLowerCase().includes(lowerSearch));
        return descMatch || tagsMatch;
      });
      currentDebts = currentDebts.filter(d => d.name && d.name.toLowerCase().includes(lowerSearch));
    }

    setFilteredExpenses(currentExpenses);
    setFilteredDebts(currentDebts);
  }, [selectedCategory, expenses, debts, searchTerm]);
  
  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });
      
      const dailyExpenses = {};
      currentMonthExpenses.forEach(expense => {
        const dateStr = format(new Date(expense.date), 'yyyy-MM-dd');
        if (!dailyExpenses[dateStr]) {
          dailyExpenses[dateStr] = 0;
        }
        dailyExpenses[dateStr] += Number(expense.amount);
      });
      
      const timeSeriesArray = Object.keys(dailyExpenses).map(date => ({
        date: format(new Date(date), 'dd/MM'),
        gasto: dailyExpenses[date],
        presupuesto: Number(localStorage.getItem('monthlyBudget') || 0) / 30
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setTimeSeriesData(timeSeriesArray);
      
      const categoryData = categories.map(cat => ({
        category: cat.name,
        value: cat.value,
        fullMark: Math.max(...categories.map(c => c.value)) * 1.2
      }));
      
      setComparisonData(categoryData);
    }
  }, [expenses, categories]);
  
  const handleCategorySelect = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
    }
  };
  
  const showAllCategories = () => {
    setSelectedCategory(null);
  };
  
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

  const isListView = selectedCategory !== null || searchTerm !== '';
  
  return (
    <div className="category-chart-full">
      <h2>Gastos por categoría</h2>
      
      <div className="search-filter-container" style={{ width: '100%', marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Buscar por descripción o etiqueta..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

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
      
      {hasData || searchTerm !== '' ? (
        !isListView ? (
          <>
            <div className="chart-type-toggle">
              <button 
                className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
                title="Gráfico Circular"
              >
                <FaChartPie className="chart-icon" /> Circular
              </button>
              <button 
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
                title="Gráfico de Barras"
              >
                <FaChartBar className="chart-icon" /> Barras
              </button>
              <button 
                className={`chart-type-btn ${chartType === 'radar' ? 'active' : ''}`}
                onClick={() => setChartType('radar')}
                title="Gráfico de Radar"
              >
                <FaRegDotCircle className="chart-icon" /> Radar
              </button>
            </div>

            {chartType === 'pie' ? (
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
            ) : chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categories}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
            ) : chartType === 'line' ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']} />
                  <Legend />
                  <Line type="monotone" dataKey="gasto" name="Gastos Diarios" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="presupuesto" name="Presupuesto Diario" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : chartType === 'area' ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']} />
                  <Legend />
                  <Area type="monotone" dataKey="gasto" name="Gastos Diarios" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="presupuesto" name="Presupuesto Diario" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={90} data={comparisonData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar name="Gastos por Categoría" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']} />
                </RadarChart>
              </ResponsiveContainer>
            )}

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
          <div className="filtered-expenses">
            {selectedCategory && (
              <h3 className="filtered-category-title">
                <span 
                  className="category-color" 
                  style={{ backgroundColor: selectedCategory === 'Deudas fijas' ? DEBT_COLOR : COLORS[categories.findIndex(c => c.name === selectedCategory) % COLORS.length] }}
                ></span>
                {selectedCategory}
              </h3>
            )}
            
            {(selectedCategory === 'Deudas fijas' || (searchTerm && filteredDebts.length > 0)) && (
              <div className="expense-list">
                {filteredDebts.length > 0 ? filteredDebts.map((debt) => (
                  <div key={debt.id} className="expense-item debt-item-in-list">
                    <div className="expense-date">{new Date(debt.dueDate).toLocaleDateString()} (Vencimiento)</div>
                    <div className="expense-description">
                      <strong>{debt.name}</strong>
                      <span className="debt-category-tag">{debt.category}</span>
                    </div>
                    <div className="expense-amount">${parseFloat(debt.amount).toFixed(2)}</div>
                  </div>
                )) : null}
              </div>
            )}
            
            {(selectedCategory !== 'Deudas fijas' || searchTerm) && (
              <div className="expense-list">
                {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                  <div key={expense.id} className="expense-item">
                    <div className="expense-date">{formatDate(expense.date)}</div>
                    <div className="expense-description">
                      {expense.description || 'Sin descripción'}
                      {expense.tags && expense.tags.length > 0 && (
                        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                          Etiquetas: {expense.tags.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</div>
                    <button 
                      className="delete-expense-btn" 
                      onClick={() => handleDeleteClick(expense)}
                      aria-label="Eliminar gasto"
                    >
                      <span className="delete-icon">×</span>
                    </button>
                  </div>
                )) : (
                  <p>No se encontraron gastos.</p>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        <div className="no-data-message">
          <p>No hay gastos registrados todavía.</p>
          <p>Agrega gastos para ver estadísticas por categoría.</p>
        </div>
      )}
      
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
