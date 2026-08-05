import React, { useState, useMemo } from 'react';
import { 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiTag, 
  FiCalendar, 
  FiCreditCard, 
  FiFilter,
  FiShoppingBag,
  FiRefreshCw,
  FiAlertTriangle,
  FiDownload
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useGlobalContext } from '../context/GlobalContext';
import { fetchMPPayments, getMPToken } from '../services/mercadoPagoService';
import EditExpenseModal from './EditExpenseModal';
import ConfirmationModal from './ConfirmationModal';

const Expenses = () => {
  const { gastos, addMultipleExpenses, updateExpense, deleteExpense, clearAllData, exportDataCSV, DEFAULT_CATEGORIES } = useGlobalContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest'
  const [syncingMP, setSyncingMP] = useState(false);
  
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleReset = () => {
    clearAllData();
    setShowResetModal(false);
  };

  const handleQuickMPSync = async () => {
    const token = getMPToken();
    if (!token) {
      alert('Para sincronizar con Mercado Pago, primero configurá tu Access Token en Ajustes.');
      return;
    }

    setSyncingMP(true);
    try {
      const res = await fetchMPPayments(token);
      const imported = addMultipleExpenses(res.expenses);
      alert(imported > 0 ? `¡Sincronización exitosa! Se importaron ${imported} gastos nuevos de Mercado Pago.` : 'Tus gastos de Mercado Pago ya están al día.');
    } catch (err) {
      alert(`Error al sincronizar: ${err.message}`);
    } finally {
      setSyncingMP(false);
    }
  };

  // Filtered and sorted expenses list
  const filteredExpenses = useMemo(() => {
    let list = [...gastos];

    // Filter by category
    if (selectedCategory !== 'Todas') {
      list = list.filter(e => e.category === selectedCategory);
    }

    // Filter by search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(e => {
        const desc = (e.description || '').toLowerCase();
        const cat = (e.category || '').toLowerCase();
        const tags = Array.isArray(e.tags) ? e.tags.join(' ').toLowerCase() : (e.tags || '').toLowerCase();
        return desc.includes(q) || cat.includes(q) || tags.includes(q);
      });
    }

    // Sort list
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    } else if (sortBy === 'highest') {
      list.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => Number(a.amount) - Number(b.amount));
    }

    return list;
  }, [gastos, selectedCategory, searchTerm, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [filteredExpenses]);

  const handleConfirmDelete = () => {
    if (deletingExpense) {
      deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <div className="w-full glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <FiShoppingBag className="text-xl" />
              </div>
              <span>Todos los Gastos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Administrá, buscá, editá o eliminá tus gastos registrados.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleQuickMPSync}
              disabled={syncingMP}
              className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Sincronizar Mercado Pago"
            >
              <FiRefreshCw className={`text-sm ${syncingMP ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar MP</span>
            </button>

            <button
              type="button"
              onClick={exportDataCSV}
              disabled={gastos.length === 0}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Exportar gastos como CSV"
            >
              <FiDownload className="text-sm" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer active:scale-95"
              title="Resetear base de datos"
            >
              <FiAlertTriangle className="text-sm" />
            </button>

            <div className="bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="text-[10px] sm:text-xs uppercase font-semibold text-slate-400">Total:</span>
              <strong className="text-base sm:text-lg font-black text-indigo-300">${totalFilteredAmount.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Filters and Search controls */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input 
                type="text" 
                placeholder="Buscar gasto por nombre, categoría o etiqueta..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-300 cursor-pointer"
              >
                <option value="recent">Más recientes primero</option>
                <option value="highest">Mayor monto primero</option>
                <option value="lowest">Menor monto primero</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('Todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'Todas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todas ({gastos.length})
            </button>
            {DEFAULT_CATEGORIES.map((cat) => {
              const count = gastos.filter(g => g.category === cat.name).length;
              if (count === 0 && selectedCategory !== cat.name) return null;

              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expenses Cards List */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const tagList = Array.isArray(expense.tags) ? expense.tags : (expense.tags ? [expense.tags] : []);

            return (
              <div 
                key={expense.id}
                className="w-full glass-card glass-card-hover rounded-2xl p-4 border border-slate-800/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                {/* Left info */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider shrink-0">
                      {expense.category || 'Otros'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                      <FiCalendar className="text-slate-500" />
                      {formatDateLabel(expense.date)}
                    </span>
                    {expense.paymentMethod && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <FiCreditCard className="text-slate-500" />
                        {expense.paymentMethod}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100 truncate">
                    {expense.description || 'Sin descripción'}
                  </h3>

                  {tagList.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {tagList.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1"
                        >
                          <FiTag className="text-[9px] text-indigo-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Amount & Actions (Mobile Icon-First) */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block sm:hidden">Monto</span>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-100">
                      ${Number(expense.amount).toFixed(2)}
                    </span>
                  </div>

                  {/* Icon Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingExpense(expense)}
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-95"
                      title="Editar gasto"
                      aria-label="Editar gasto"
                    >
                      <FiEdit2 className="text-base text-indigo-400" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingExpense(expense)}
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-95"
                      title="Borrar gasto"
                      aria-label="Borrar gasto"
                    >
                      <FiTrash2 className="text-base text-rose-400" />
                      <span className="hidden sm:inline">Borrar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-3">
          <p className="text-base font-semibold text-slate-300">No se encontraron gastos</p>
          <p className="text-xs text-slate-500">
            {searchTerm || selectedCategory !== 'Todas' 
              ? 'Intentá cambiar el filtro o término de búsqueda.' 
              : 'Todavía no agregaste ningún gasto.'}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <EditExpenseModal 
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        onUpdateExpense={updateExpense}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
        title="Borrar Gasto"
        message={`¿Estás seguro de eliminar el gasto "${deletingExpense?.description || 'sin descripción'}" por $${deletingExpense?.amount?.toFixed(2)}?`}
        confirmButtonText="Borrar"
        cancelButtonText="Cancelar"
      />

      {/* Reset Database Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Resetear base de datos"
        message="¿Estás seguro? Se van a eliminar TODOS los gastos, ingresos, deudas y configuraciones. Esta acción no se puede deshacer."
        confirmButtonText="Sí, resetear todo"
        cancelButtonText="Cancelar"
      />
    </div>
  );
};

export default Expenses;
