import React from 'react';
import { LinearProgress } from '@mui/material';

const BudgetSummary = ({ totalSpent, monthlyBudget, onBudgetClick, onDeleteBudget }) => {
  const hasBudget = monthlyBudget > 0;
  
  return (
    <div className="budget-summary">
      <h2>Resumen de presupuesto</h2>
      
      {hasBudget ? (
        <>
          {/* Mostrar el restante (presupuesto - gastado) */}
          <div className="budget-remaining">
            <h3>Restante</h3>
            <h1 className={monthlyBudget - totalSpent >= 0 ? "positive" : "negative"}>
              ${(monthlyBudget - totalSpent).toFixed(2)}
            </h1>
          </div>
          
          {/* Barra de progreso */}
          <LinearProgress 
            variant="determinate" 
            value={monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#f5f5f5',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: totalSpent <= monthlyBudget ? '#2196F3' : '#f44336'
              }
            }}
          />
          
          {/* Información de presupuesto y gasto */}
          <div className="budget-info">
            <span>Gastado: ${totalSpent.toFixed(2)}</span>
            <span>Presupuesto: ${monthlyBudget}</span>
          </div>
        </>
      ) : (
        <>
          {/* Mostrar el gasto total en negativo cuando no hay presupuesto */}
          <div className="budget-remaining budget-negative">
            <h3>Total Gastado</h3>
            <h1 className="negative">
              -${totalSpent.toFixed(2)}
            </h1>
          </div>
          
          <div className="empty-state">
            <p>No has establecido un presupuesto mensual</p>
            <p>Establece tu presupuesto para comenzar a controlar tus gastos</p>
          </div>
        </>
      )}
      
      {/* Botones para gestionar el presupuesto */}
      <div className="budget-actions">
        <button 
          className="primary-button budget-button"
          onClick={onBudgetClick}
        >
          {hasBudget ? 'Modificar presupuesto' : 'Establecer presupuesto'}
        </button>
        
        {hasBudget && (
          <button 
            className="danger-button budget-button"
            onClick={onDeleteBudget}
          >
            Eliminar presupuesto
          </button>
        )}
      </div>
    </div>
  );
};

export default BudgetSummary;
