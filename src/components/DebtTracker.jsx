import React, { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { 
  FiTrash2, 
  FiPlus, 
  FiCheckCircle, 
  FiCircle 
} from 'react-icons/fi';
import { useGlobalContext } from '../context/GlobalContext';

const DebtTracker = () => {
  const { debts, addDebt, deleteDebt, toggleDebtPaid } = useGlobalContext();
  const [filter, setFilter] = useState('all'); // 'all', 'unpaid', 'paid'
  
  const [newDebt, setNewDebt] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'Servicios',
    paid: false
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const debtCategories = [
    'Servicios',
    'Préstamos',
    'Tarjetas de crédito',
    'Alquiler',
    'Seguros',
    'Suscripciones',
    'Impuestos',
    'Otros'
  ];

  const categoryColors = {
    'Servicios': '#FF6384',
    'Préstamos': '#36A2EB',
    'Tarjetas de crédito': '#FFCE56',
    'Alquiler': '#4BC0C0',
    'Seguros': '#9966FF',
    'Suscripciones': '#FF9F40',
    'Impuestos': '#C9CBCF',
    'Otros': '#7BC043'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount || !newDebt.dueDate) {
      alert('Por favor completa todos los campos');
      return;
    }
    const debtToAdd = {
      ...newDebt,
      id: Date.now(),
      amount: parseFloat(newDebt.amount),
      paid: false
    };
    addDebt(debtToAdd);
    setNewDebt({
      name: '',
      amount: '',
      dueDate: '',
      category: 'Servicios',
      paid: false
    });
    setIsFormVisible(false);
  };

  const isPaid = (debt) => Boolean(debt.paid || debt.isPaid);

  const totalUnpaidDebt = debts.reduce((sum, debt) => {
    if (!isPaid(debt)) {
      return sum + Number(debt.amount);
    }
    return sum;
  }, 0);

  const totalPaidDebt = debts.reduce((sum, debt) => {
    if (isPaid(debt)) {
      return sum + Number(debt.amount);
    }
    return sum;
  }, 0);

  const filteredDebts = debts.filter(debt => {
    if (filter === 'unpaid') return !isPaid(debt);
    if (filter === 'paid') return isPaid(debt);
    return true;
  });

  const chartData = debtCategories.map(category => {
    const categoryTotal = debts
      .filter(debt => debt.category === category && !isPaid(debt))
      .reduce((sum, debt) => sum + Number(debt.amount), 0);
    
    return {
      title: category,
      value: categoryTotal,
      color: categoryColors[category]
    };
  }).filter(item => item.value > 0);

  return (
    <div className="w-full glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-4">
        Deudas a Pagar
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/80 space-y-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Pendientes a Pagar</span>
          <h3 className="text-3xl font-extrabold text-amber-400 tracking-tight">${totalUnpaidDebt.toFixed(2)}</h3>
          {totalPaidDebt > 0 && (
            <p className="text-xs text-slate-400">
              Pagadas este mes: <strong className="text-emerald-400">${totalPaidDebt.toFixed(2)}</strong>
            </p>
          )}
        </div>
        
        {chartData.length > 0 && (
          <div className="flex flex-col items-center justify-center p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <div className="w-40 h-40">
              <PieChart
                data={chartData}
                lineWidth={40}
                paddingAngle={5}
                rounded
                label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
                labelStyle={{
                  fontSize: '6px',
                  fontFamily: 'sans-serif',
                  fill: '#fff',
                }}
                labelPosition={70}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {chartData.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.title}: ${entry.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          <FiPlus className="text-lg" /> {isFormVisible ? 'Cerrar Formulario' : 'Agregar Deuda'}
        </button>

        <div className="flex items-center justify-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button 
            type="button" 
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setFilter('all')}
          >
            Todas ({debts.length})
          </button>
          <button 
            type="button" 
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'unpaid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setFilter('unpaid')}
          >
            Pendientes ({debts.filter(d => !isPaid(d)).length})
          </button>
          <button 
            type="button" 
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'paid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setFilter('paid')}
          >
            Pagadas ({debts.filter(d => isPaid(d)).length})
          </button>
        </div>
      </div>

      {isFormVisible && (
        <div className="bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-indigo-500/20 shadow-lg space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-slate-100">Agregar Nueva Deuda</h3>
          <form onSubmit={handleAddDebt} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newDebt.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Alquiler, Netflix, Visa"
                  required
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Monto ($)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={newDebt.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={newDebt.dueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Categoría</label>
                <select
                  id="category"
                  name="category"
                  value={newDebt.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm cursor-pointer"
                >
                  {debtCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold cursor-pointer text-center">
                Guardar Deuda
              </button>
              <button 
                type="button" 
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer text-center"
                onClick={() => setIsFormVisible(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Lista de Deudas</h3>
        {filteredDebts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No hay deudas para mostrar</p>
        ) : (
          <div className="space-y-2">
            {filteredDebts.map(debt => {
              const paidStatus = isPaid(debt);
              return (
                <div key={debt.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-3 ${
                  paidStatus 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{debt.name}</h4>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                        {debt.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Vence: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'Sin fecha'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <span className={`text-base font-extrabold ${paidStatus ? 'text-emerald-400 line-through' : 'text-amber-400'}`}>
                      ${Number(debt.amount).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          paidStatus
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        onClick={() => toggleDebtPaid(debt.id)}
                        title={paidStatus ? 'Marcar como pendiente' : 'Marcar como pagada'}
                      >
                        {paidStatus ? <FiCheckCircle className="text-sm" /> : <FiCircle className="text-sm" />}
                        <span>{paidStatus ? 'Pagado' : 'Marcar Pagado'}</span>
                      </button>

                      <button 
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        onClick={() => deleteDebt(debt.id)}
                        aria-label="Eliminar deuda"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtTracker;
