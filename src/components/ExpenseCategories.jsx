import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { format } from 'date-fns';
import ConfirmationModal from './ConfirmationModal';
import { FaChartPie, FaChartBar, FaRegDotCircle } from 'react-icons/fa';
import { FiSearch, FiTrash2, FiTag } from 'react-icons/fi';
import { useGlobalContext } from '../context/GlobalContext';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'];
const DEBT_COLOR = '#EF4444';

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
    <div className="w-full glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
      <h2 className="text-lg font-bold text-slate-100 tracking-wide">Gastos por Categoría</h2>
      
      <div className="relative w-full">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
        <input 
          type="text" 
          placeholder="Buscar por descripción o etiqueta..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
        />
      </div>

      {hasData && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filtrar por:</span>
          <div className="flex flex-wrap gap-1.5">
            <button 
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === null 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50'
              }`}
              onClick={showAllCategories}
            >
              Todos
            </button>
            {categories.map((category, index) => {
              const color = category.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length];
              const isSelected = selectedCategory === category.name;
              return (
                <button 
                  key={index} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'text-white shadow-md'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
                  }`}
                  onClick={() => handleCategorySelect(category.name)}
                  style={{ 
                    backgroundColor: isSelected ? color : undefined,
                    borderColor: color 
                  }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {hasData || searchTerm !== '' ? (
        !isListView ? (
          <>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  chartType === 'pie' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setChartType('pie')}
                title="Gráfico Circular"
              >
                <FaChartPie /> Circular
              </button>
              <button 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  chartType === 'bar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setChartType('bar')}
                title="Gráfico de Barras"
              >
                <FaChartBar /> Barras
              </button>
              <button 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  chartType === 'radar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setChartType('radar')}
                title="Gráfico de Radar"
              >
                <FaRegDotCircle /> Radar
              </button>
            </div>

            <div className="w-full h-80 py-2 relative flex items-center justify-center">
              {chartType === 'pie' ? (
                <div className="w-full h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const total = categories.reduce((acc, c) => acc + c.value, 0);
                            const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                            const color = data.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[categories.findIndex(c => c.name === data.name) % COLORS.length];
                            return (
                              <div className="bg-slate-900/95 p-3 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                  <span className="font-bold text-slate-100">{data.name}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 pt-1">
                                  <span className="text-slate-400">Monto:</span>
                                  <strong className="text-slate-100 font-extrabold">${Number(data.value).toFixed(2)}</strong>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-400">Proporción:</span>
                                  <span className="text-indigo-400 font-semibold">{percent}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Pie 
                        data={categories} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={isMobile ? 55 : 80} 
                        outerRadius={isMobile ? 85 : 115} 
                        paddingAngle={4}
                        cornerRadius={6}
                        stroke="#090e1a"
                        strokeWidth={2}
                        dataKey="value"
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

                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">Total</span>
                    <span className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                      ${categories.reduce((acc, c) => acc + c.value, 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              ) : chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Monto']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', borderColor: '#334155', color: '#fff' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {categories.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={85} data={comparisonData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#94a3b8" />
                    <Radar name="Gastos" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Monto']} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', borderColor: '#334155', color: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Legend Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {categories.map((category, index) => {
                const total = categories.reduce((acc, c) => acc + c.value, 0);
                const percent = total > 0 ? ((category.value / total) * 100).toFixed(1) : '0';
                const color = category.name === 'Deudas fijas' ? DEBT_COLOR : COLORS[index % COLORS.length];

                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all hover:translate-x-0.5" 
                    onClick={() => handleCategorySelect(category.name)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-slate-200 block truncate">{category.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">{percent}% del total</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-slate-100 shrink-0 ml-2">${category.value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {selectedCategory && (
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
                <span 
                  className="w-3 h-3 rounded-full inline-block" 
                  style={{ backgroundColor: selectedCategory === 'Deudas fijas' ? DEBT_COLOR : COLORS[categories.findIndex(c => c.name === selectedCategory) % COLORS.length] }}
                />
                {selectedCategory}
              </h3>
            )}
            
            {(selectedCategory === 'Deudas fijas' || (searchTerm && filteredDebts.length > 0)) && (
              <div className="space-y-2">
                {filteredDebts.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{debt.name}</h4>
                      <span className="text-xs text-slate-400">Vence: {new Date(debt.dueDate).toLocaleDateString()} • {debt.category}</span>
                    </div>
                    <span className="text-sm font-extrabold text-rose-400">${parseFloat(debt.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {(selectedCategory !== 'Deudas fijas' || searchTerm) && (
              <div className="space-y-2">
                {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="space-y-0.5">
                      <div className="text-xs text-slate-400">{formatDate(expense.date)}</div>
                      <div className="text-sm font-semibold text-slate-100">
                        {expense.description || 'Sin descripción'}
                      </div>
                      {expense.tags && expense.tags.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-indigo-400">
                          <FiTag className="text-[10px]" />
                          {expense.tags.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-100">${parseFloat(expense.amount).toFixed(2)}</span>
                      <button 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" 
                        onClick={() => handleDeleteClick(expense)}
                        aria-label="Eliminar gasto"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 text-center py-6">No se encontraron gastos.</p>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm space-y-1">
          <p className="font-semibold text-slate-300">No hay gastos registrados todavía.</p>
          <p className="text-xs text-slate-500">Agrega gastos para ver estadísticas por categoría.</p>
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
