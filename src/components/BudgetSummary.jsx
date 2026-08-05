import React from 'react';
import { FiTrash2, FiDollarSign } from 'react-icons/fi';

const BudgetSummary = ({ totalSpent, monthlyBudget, onBudgetClick, onDeleteBudget }) => {
  const hasBudget = monthlyBudget > 0;
  const remaining = monthlyBudget - totalSpent;
  const progressPercent = hasBudget ? Math.min(100, Math.max(0, (totalSpent / monthlyBudget) * 100)) : 0;
  const isOverBudget = remaining < 0;

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100 tracking-wide">Resumen de Presupuesto</h2>
        {hasBudget && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
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

          <div className="flex justify-between text-sm text-slate-300 font-medium pt-1">
            <span className="text-slate-400">Gastado: <strong className="text-slate-100">${totalSpent.toFixed(2)}</strong></span>
            <span className="text-slate-400">Presupuesto: <strong className="text-indigo-300">${monthlyBudget.toFixed(2)}</strong></span>
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 w-full">
        <button
          className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer min-w-0"
          onClick={onBudgetClick}
        >
          <FiDollarSign className="text-lg text-emerald-300 shrink-0" />
          <span className="truncate">{hasBudget ? 'Modificar Presupuesto' : 'Ingresar Presupuesto'}</span>
        </button>

        {hasBudget && (
          <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0"
            onClick={onDeleteBudget}
            title="Eliminar Presupuesto"
            aria-label="Eliminar Presupuesto"
          >
            <FiTrash2 className="text-base text-rose-400" />
            <span className="sm:hidden">Eliminar Presupuesto</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BudgetSummary;
