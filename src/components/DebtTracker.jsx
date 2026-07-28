import React, { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useGlobalContext } from '../context/GlobalContext';

const DebtTracker = () => {
  const { debts, addDebt, deleteDebt, toggleDebtPaid } = useGlobalContext();
  
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
    setNewDebt({
      ...newDebt,
      [name]: value
    });
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
      amount: parseFloat(newDebt.amount)
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

  const totalDebt = debts.reduce((sum, debt) => {
    if (!debt.paid && !debt.isPaid) {
      return sum + parseFloat(debt.amount);
    }
    return sum;
  }, 0);

  const chartData = debtCategories.map(category => {
    const categoryTotal = debts
      .filter(debt => debt.category === category && !debt.paid && !debt.isPaid)
      .reduce((sum, debt) => sum + Number(debt.amount), 0);
    
    return {
      title: category,
      value: categoryTotal,
      color: categoryColors[category]
    };
  }).filter(item => item.value > 0);

  return (
    <div className="debt-tracker">
      <h2>Deudas a Pagar</h2>
      
      <div className="debt-summary">
        <div className="debt-total">
          <h3>Total de Deudas Mensuales</h3>
          <p className="debt-amount">${totalDebt.toFixed(2)}</p>
        </div>
        
        {chartData.length > 0 && (
          <div className="debt-chart">
            <PieChart
              data={chartData}
              lineWidth={40}
              paddingAngle={5}
              rounded
              label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
              labelStyle={{
                fontSize: '5px',
                fontFamily: 'sans-serif',
                fill: '#fff',
              }}
              labelPosition={70}
            />
            <div className="chart-legend">
              {chartData.map((entry, i) => (
                <div key={i} className="legend-item">
                  <span className="color-box" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.title}: ${entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        className="add-button"
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        <AddIcon /> Agregar Deuda
      </button>

      {isFormVisible && (
        <div className="form-container">
          <h3>Agregar Nueva Deuda</h3>
          <form onSubmit={handleAddDebt}>
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newDebt.name}
                onChange={handleInputChange}
                placeholder="Ej: Alquiler, Netflix, etc."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Monto:</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newDebt.amount}
                onChange={handleInputChange}
                placeholder="Monto en $"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dueDate">Fecha de vencimiento:</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newDebt.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Categoría:</label>
              <select
                id="category"
                name="category"
                value={newDebt.category}
                onChange={handleInputChange}
                required
              >
                {debtCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">Guardar</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setIsFormVisible(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="debt-list">
        <h3>Mis Deudas Mensuales</h3>
        {debts.length === 0 ? (
          <p className="empty-message">No hay deudas registradas</p>
        ) : (
          <div className="debt-items">
            {debts.map(debt => (
              <div key={debt.id} className={`debt-item ${debt.paid || debt.isPaid ? 'paid' : ''}`}>
                <div className="debt-info">
                  <h4>{debt.name}</h4>
                  <p className="debt-category">{debt.category}</p>
                  <p className="debt-amount">${Number(debt.amount).toFixed(2)}</p>
                  <p className="debt-due-date">Vence: {new Date(debt.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="debt-actions">
                  <label className="paid-checkbox">
                    <input
                      type="checkbox"
                      checked={debt.paid || debt.isPaid || false}
                      onChange={() => toggleDebtPaid(debt.id)}
                    />
                    Pagado
                  </label>
                  <button 
                    className="delete-button"
                    onClick={() => deleteDebt(debt.id)}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtTracker;
