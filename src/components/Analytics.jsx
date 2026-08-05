import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGlobalContext } from '../context/GlobalContext';

const COLORS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#9B51E0', '#FF9F40', '#A0AEC0', '#E83E8C'];

const Analytics = () => {
  const { gastos } = useGlobalContext();
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Extract unique YYYY-MM periods from expenses
  const periods = useMemo(() => {
    const periodSet = new Set();
    gastos.forEach(g => {
      if (g.date) {
        const d = new Date(g.date);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          periodSet.add(`${yyyy}-${mm}`);
        }
      }
    });
    const sortedPeriods = Array.from(periodSet).sort().reverse();
    if (sortedPeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(sortedPeriods[0]);
    }
    return sortedPeriods;
  }, [gastos, selectedPeriod]);

  // Filter expenses by period and tag search
  const { chartData, totalAmount, totalCount, averageAmount } = useMemo(() => {
    if (!selectedPeriod) return { chartData: [], totalAmount: 0, totalCount: 0, averageAmount: 0 };
    
    const filtered = gastos.filter(g => {
      if (!g.date) return false;
      const d = new Date(g.date);
      if (isNaN(d.getTime())) return false;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const periodMatch = `${yyyy}-${mm}` === selectedPeriod;

      if (!periodMatch) return false;

      if (tagSearch.trim()) {
        const tagTerm = tagSearch.trim().toLowerCase();
        const hasTagMatch = Array.isArray(g.tags) && g.tags.some(t => t.toLowerCase().includes(tagTerm));
        const hasDescMatch = g.description && g.description.toLowerCase().includes(tagTerm);
        return hasTagMatch || hasDescMatch;
      }

      return true;
    });

    let total = 0;
    const catMap = {};
    
    filtered.forEach(g => {
      const amt = Number(g.amount) || 0;
      total += amt;
      const cat = g.category || 'Otros';
      catMap[cat] = (catMap[cat] || 0) + amt;
    });

    const data = Object.keys(catMap).map(cat => ({
      name: cat,
      value: catMap[cat]
    }));

    const count = filtered.length;
    const avg = count > 0 ? total / count : 0;

    return { chartData: data, totalAmount: total, totalCount: count, averageAmount: avg };
  }, [gastos, selectedPeriod, tagSearch]);

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  const formatPeriodLabel = (period) => {
    if (!period) return '';
    const [year, month] = period.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <div className="w-full glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-4">
        Estadísticas & Analíticas
      </h2>
      
      {periods.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm space-y-2">
          <p className="text-base font-semibold text-slate-300">No hay gastos registrados para analizar.</p>
          <p className="text-xs text-slate-500">Comienza agregando tu primer gasto para visualizar las estadísticas.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="periodSelect" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Período</label>
              <select 
                id="periodSelect" 
                value={selectedPeriod} 
                onChange={handlePeriodChange}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
              >
                {periods.map(p => (
                  <option key={p} value={p}>{formatPeriodLabel(p)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tagSearch" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Filtrar por etiqueta / texto</label>
              <input
                type="text"
                id="tagSearch"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Ej: mercado, comida..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400">Total Gastado</span>
              <h3 className="text-2xl font-extrabold text-rose-400">${totalAmount.toFixed(2)}</h3>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400">Transacciones</span>
              <h3 className="text-2xl font-extrabold text-indigo-400">{totalCount}</h3>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs uppercase font-semibold text-slate-400">Gasto Promedio</span>
              <h3 className="text-2xl font-extrabold text-emerald-400">${averageAmount.toFixed(2)}</h3>
            </div>
          </div>

          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No se encontraron gastos para los criterios seleccionados.
            </p>
          ) : (
            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Monto']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', borderColor: '#334155', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
