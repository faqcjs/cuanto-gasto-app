import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';

const BudgetTimelineChart = ({ gastos = [], incomes = [], monthlyBudget = 0 }) => {
  const [filterDays, setFilterDays] = useState(30); // 7, 30, 90, 0 (all)

  // Generate timeline chart data grouped by date
  const chartData = useMemo(() => {
    const map = new Map();

    // Process expenses
    gastos.forEach((gasto) => {
      if (!gasto.date) return;
      const d = gasto.date;
      if (!map.has(d)) {
        map.set(d, { date: d, gastos: 0, ingresos: 0 });
      }
      map.get(d).gastos += Number(gasto.amount) || 0;
    });

    // Process incomes / added budget
    incomes.forEach((inc) => {
      if (!inc.date) return;
      const d = inc.date;
      if (!map.has(d)) {
        map.set(d, { date: d, gastos: 0, ingresos: 0 });
      }
      map.get(d).ingresos += Number(inc.amount) || 0;
    });

    // Ensure at least today's date if empty
    if (map.size === 0) {
      const today = format(new Date(), 'yyyy-MM-dd');
      map.set(today, { date: today, gastos: 0, ingresos: monthlyBudget });
    }

    // Sort chronologically
    let list = Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1));

    // Filter by selected days limit if set
    if (filterDays > 0 && list.length > filterDays) {
      list = list.slice(list.length - filterDays);
    }

    // Format display date and cumulative totals
    let acumuladoGastos = 0;
    let acumuladoIngresos = 0;

    return list.map((item) => {
      acumuladoGastos += item.gastos;
      acumuladoIngresos += item.ingresos;
      
      let dateLabel = item.date;
      try {
        dateLabel = format(parseISO(item.date), 'dd/MM');
      } catch {
        dateLabel = item.date;
      }

      return {
        ...item,
        dateLabel,
        gastos: Number(item.gastos.toFixed(2)),
        ingresos: Number(item.ingresos.toFixed(2)),
        acumuladoGastos: Number(acumuladoGastos.toFixed(2)),
        acumuladoIngresos: Number((monthlyBudget + acumuladoIngresos).toFixed(2))
      };
    });
  }, [gastos, incomes, monthlyBudget, filterDays]);

  const totalGastosPeriodo = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.gastos, 0);
  }, [chartData]);

  const totalIngresosPeriodo = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.ingresos, 0);
  }, [chartData]);

  // Custom Glassmorphism Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 p-3.5 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[160px]">
          <p className="font-semibold text-slate-300 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>Fecha: {data.dateLabel}</span>
            <span className="text-[10px] text-slate-500">{data.date}</span>
          </p>
          <div className="space-y-1 pt-0.5">
            <p className="text-rose-400 flex items-center justify-between font-medium">
              <span>Gastos del día:</span>
              <strong className="font-extrabold">${data.gastos.toFixed(2)}</strong>
            </p>
            <p className="text-emerald-400 flex items-center justify-between font-medium">
              <span>Ingreso/Presup. extra:</span>
              <strong className="font-extrabold">${data.ingresos.toFixed(2)}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Evolución Temporal</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Gastos vs. Presupuesto
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualización de gastos e ingresos de presupuesto a lo largo del tiempo.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterDays(7)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDays === 7 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7d
          </button>
          <button
            type="button"
            onClick={() => setFilterDays(30)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDays === 30 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30d
          </button>
          <button
            type="button"
            onClick={() => setFilterDays(0)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterDays === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todo
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <FiTrendingDown className="text-lg" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase font-semibold text-slate-400 block truncate">Gastos del Período</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-400 truncate block">
              ${totalGastosPeriodo.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <FiTrendingUp className="text-lg" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase font-semibold text-slate-400 block truncate">Ingresos Extra</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400 truncate block">
              ${totalIngresosPeriodo.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Recharts Area Chart */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis 
              dataKey="dateLabel" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#334155' }} 
            />

            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} 
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />

            <Area 
              type="monotone" 
              dataKey="gastos" 
              name="Gastos ($)" 
              stroke="#f43f5e" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#gradientGastos)" 
            />

            <Area 
              type="monotone" 
              dataKey="ingresos" 
              name="Ingresos / Presup. Extra ($)" 
              stroke="#10b981" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#gradientIngresos)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BudgetTimelineChart;
