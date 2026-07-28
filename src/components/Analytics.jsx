import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGlobalContext } from '../context/GlobalContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

const Analytics = () => {
  const { gastos } = useGlobalContext();
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // Extract unique periods (YYYY-MM) from expenses
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

  // Filter expenses and aggregate by category
  const { chartData, total } = useMemo(() => {
    if (!selectedPeriod) return { chartData: [], total: 0 };
    
    const filtered = gastos.filter(g => {
      if (!g.date) return false;
      const d = new Date(g.date);
      if (isNaN(d.getTime())) return false;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${yyyy}-${mm}` === selectedPeriod;
    });

    let periodTotal = 0;
    const catMap = {};
    
    filtered.forEach(g => {
      const amt = Number(g.amount);
      periodTotal += amt;
      if (!catMap[g.category]) {
        catMap[g.category] = 0;
      }
      catMap[g.category] += amt;
    });

    const data = Object.keys(catMap).map(cat => ({
      name: cat,
      value: catMap[cat]
    }));

    return { chartData: data, total: periodTotal };
  }, [gastos, selectedPeriod]);

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  const formatPeriodLabel = (period) => {
    const [year, month] = period.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <div className="analytics-container" style={{ width: '100%', padding: '20px', backgroundColor: 'var(--card-bg, #fff)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2>Estadísticas</h2>
      
      {periods.length === 0 ? (
        <p>No hay datos para mostrar en este período.</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="periodSelect" style={{ marginRight: '10px' }}>Seleccionar Período: </label>
            <select 
              id="periodSelect" 
              value={selectedPeriod} 
              onChange={handlePeriodChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {periods.map(p => (
                <option key={p} value={p}>{formatPeriodLabel(p)}</option>
              ))}
            </select>
          </div>

          {chartData.length === 0 ? (
            <p>No hay datos para mostrar en este período.</p>
          ) : (
            <>
              <h3>Total Gastado: ${total.toFixed(2)}</h3>
              <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
