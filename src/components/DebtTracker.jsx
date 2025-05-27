import React, { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const DebtTracker = () => {
  // Inicializar el estado con las deudas guardadas en localStorage
  const [debts, setDebts] = useState(() => {
    try {
      const savedDebts = localStorage.getItem('debts');
      return savedDebts ? JSON.parse(savedDebts) : [];
    } catch (error) {
      console.error('Error al inicializar estado de deudas:', error);
      return [];
    }
  });
  const [newDebt, setNewDebt] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'Servicios',
    isPaid: false
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [totalDebt, setTotalDebt] = useState(0);

  // Categorías predefinidas para deudas
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

  // Colores para el gráfico
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

  // Cargar deudas desde localStorage
  useEffect(() => {
    try {
      const savedDebts = localStorage.getItem('debts');
      if (savedDebts) {
        const parsedDebts = JSON.parse(savedDebts);
        console.log('Deudas cargadas desde localStorage:', parsedDebts);
        setDebts(parsedDebts);
      } else {
        console.log('No se encontraron deudas guardadas en localStorage');
      }
    } catch (error) {
      console.error('Error al cargar deudas desde localStorage:', error);
    }
    
    // Esta función se ejecutará cuando el componente se desmonte
    return () => {
      // Asegurarse de que las deudas actuales se guarden antes de desmontar
      try {
        const currentDebts = localStorage.getItem('debts');
        if (currentDebts) {
          console.log('Preservando deudas antes de desmontar componente:', JSON.parse(currentDebts));
        }
      } catch (error) {
        console.error('Error al preservar deudas:', error);
      }
    };
  }, []);

  // Actualizar localStorage cuando cambian las deudas
  useEffect(() => {
    try {
      console.log('Guardando deudas en localStorage:', debts);
      localStorage.setItem('debts', JSON.stringify(debts));
      
      // Calcular deuda total (solo deudas no pagadas)
      const total = debts.reduce((sum, debt) => {
        // Solo sumar al total si la deuda no está marcada como pagada
        if (!debt.isPaid) {
          return sum + parseFloat(debt.amount);
        }
        return sum;
      }, 0);
      setTotalDebt(total);
    } catch (error) {
      console.error('Error al guardar deudas en localStorage:', error);
    }
  }, [debts]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt({
      ...newDebt,
      [name]: value
    });
  };

  // Agregar nueva deuda
  const handleAddDebt = (e) => {
    e.preventDefault();
    
    if (!newDebt.name || !newDebt.amount || !newDebt.dueDate) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const debtToAdd = {
        ...newDebt,
        id: Date.now(),
        amount: parseFloat(newDebt.amount)
      };

      console.log('Agregando nueva deuda:', debtToAdd);
      const updatedDebts = [...debts, debtToAdd];
      setDebts(updatedDebts);
      
      // Guardar inmediatamente en localStorage
      localStorage.setItem('debts', JSON.stringify(updatedDebts));
      
      setNewDebt({
        name: '',
        amount: '',
        dueDate: '',
        category: 'Servicios',
        isPaid: false
      });
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error al agregar deuda:', error);
      alert('Hubo un error al guardar la deuda. Por favor intenta nuevamente.');
    }
  };

  // Eliminar deuda
  const handleDeleteDebt = (id) => {
    try {
      const updatedDebts = debts.filter(debt => debt.id !== id);
      console.log('Eliminando deuda, nueva lista:', updatedDebts);
      setDebts(updatedDebts);
      
      // Guardar inmediatamente en localStorage
      localStorage.setItem('debts', JSON.stringify(updatedDebts));
    } catch (error) {
      console.error('Error al eliminar deuda:', error);
    }
  };

  // Marcar deuda como pagada
  const handleTogglePaid = (id) => {
    try {
      const updatedDebts = debts.map(debt => 
        debt.id === id ? { ...debt, isPaid: !debt.isPaid } : debt
      );
      console.log('Actualizando estado de deuda, nueva lista:', updatedDebts);
      setDebts(updatedDebts);
      
      // Guardar inmediatamente en localStorage
      localStorage.setItem('debts', JSON.stringify(updatedDebts));
    } catch (error) {
      console.error('Error al actualizar estado de deuda:', error);
    }
  };

  // Preparar datos para el gráfico (solo deudas no pagadas)
  const chartData = debtCategories.map(category => {
    const categoryTotal = debts
      .filter(debt => debt.category === category && !debt.isPaid) // Solo incluir deudas no pagadas
      .reduce((sum, debt) => sum + debt.amount, 0);
    
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
              <div key={debt.id} className={`debt-item ${debt.isPaid ? 'paid' : ''}`}>
                <div className="debt-info">
                  <h4>{debt.name}</h4>
                  <p className="debt-category">{debt.category}</p>
                  <p className="debt-amount">${debt.amount.toFixed(2)}</p>
                  <p className="debt-due-date">Vence: {new Date(debt.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="debt-actions">
                  <label className="paid-checkbox">
                    <input
                      type="checkbox"
                      checked={debt.isPaid}
                      onChange={() => handleTogglePaid(debt.id)}
                    />
                    Pagado
                  </label>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteDebt(debt.id)}
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
