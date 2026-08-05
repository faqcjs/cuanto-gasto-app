import React from 'react';
import { FiTrash2, FiSliders, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const BudgetSummary = ({ 
  totalSpent, 
  monthlyBudget, 
  onAddIncomeClick, 
  onBudgetClick, 
  onDeleteBudget 
}) => {
  const hasBudget = monthlyBudget > 0;
  const remaining = monthlyBudget - totalSpent;
  const progressPercent = hasBudget ? Math.min(100, Math.max(0, (totalSpent / monthlyBudget) * 100)) : 0;
  const isOverBudget = remaining < 0;

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-wide truncate">Resumen de Presupuesto</h2>
        {hasBudget && (
          <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border shrink-0 whitespace-nowrap ${
            isOverBudget 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {isOverBudget ? 'Excedido' : 'Dentro del límite'}
          </span>
        )}
      </div>

      {hasBudget ? (
        <div className="space-y-4">
          <div className="text-center py-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Restante</span>
            <h1 className={`text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight ${
              remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ${remaining.toFixed(2)}
            </h1>
          </div>

          {/* Custom Tailwind Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Uso del presupuesto</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget 
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/30' 
                    : 'bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/30'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium pt-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FiTrendingDown className="text-rose-400 text-base shrink-0" title="Gastado" />
              <span className="hidden sm:inline">Gastado:</span>
              <strong className="text-slate-100">${totalSpent.toFixed(2)}</strong>
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <FiSliders className="text-indigo-400 text-base shrink-0" title="Presupuesto" />
              <span className="hidden sm:inline">Presupuesto:</span>
              <strong className="text-indigo-300">${monthlyBudget.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Total Gastado</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-rose-400 mt-1 tracking-tight">
              -${totalSpent.toFixed(2)}
            </h1>
          </div>

          <div className="text-center py-4 text-slate-400 text-sm space-y-1">
            <p className="font-semibold text-slate-200">No has establecido un presupuesto mensual</p>
            <p className="text-xs text-slate-400">Establece tu presupuesto para comenzar a controlar tus gastos.</p>
          </div>
        </div>
      )}

      {/* 3 Icon-Only Action Buttons in a Row (3 en línea) */}
      <div className="flex items-center justify-between gap-3 pt-2 w-full">
        {/* Button 1: Ingreso de dinero extra */}
        <button
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
          onClick={onAddIncomeClick}
          title="Ingresar dinero extra (ej: cobro de un trabajo)"
          aria-label="Ingresar dinero extra"
        >
          <FiTrendingUp className="text-xl text-emerald-400" />
        </button>

        {/* Button 2: Modificar presupuesto */}
        <button
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-95"
          onClick={onBudgetClick}
          title="Modificar presupuesto mensual"
          aria-label="Modificar presupuesto mensual"
        >
          <FiSliders className="text-xl text-indigo-300" />
        </button>

        {/* Button 3: Eliminar presupuesto */}
        {hasBudget && (
          <button
            className="flex-1 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-rose-500/10 active:scale-95"
            onClick={onDeleteBudget}
            title="Eliminar presupuesto mensual"
            aria-label="Eliminar presupuesto mensual"
          >
            <FiTrash2 className="text-xl text-rose-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BudgetSummary;
