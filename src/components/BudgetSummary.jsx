import React from 'react';
import { LinearProgress } from '@mui/material';

const BudgetSummary = ({ totalSpent, monthlyBudget, openBudgetModal }) => {
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
        <div className="empty-state">
          <p>No has establecido un presupuesto mensual</p>
          <p>Establece tu presupuesto para comenzar a controlar tus gastos</p>
        </div>
      )}
      
      {/* Botón para abrir el modal de presupuesto */}
      <div className="budget-actions">
        <button 
          className="primary-button budget-button"
          onClick={openBudgetModal}
        >
          {hasBudget ? 'Modificar presupuesto' : 'Establecer presupuesto'}
        </button>
      </div>
    </div>
  );
};

export default BudgetSummary;
