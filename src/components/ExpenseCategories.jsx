import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

// Hook personalizado para detectar el tamaño de la ventana
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

const ExpenseCategories = ({ categories }) => {
  const hasData = categories && categories.length > 0;
  const { width } = useWindowSize();
  const isMobile = width <= 480;
  
  return (
    <div className="category-chart-full">
      <h2>Gastos por categoría</h2>
      
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={categories} 
                cx="50%" 
                cy="50%" 
                innerRadius={isMobile ? 50 : 80} 
                outerRadius={isMobile ? 90 : 120} 
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({name, value}) => isMobile ? `$${value}` : `${name}: $${value}`}
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Lista de categorías con montos */}
          <div className="category-list">
            {categories.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="category-name">{category.name}</span>
                <span className="category-value">${category.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No hay datos para mostrar.</p>
          <p>Ingresa tu presupuesto y luego agrega gastos para ver estadísticas.</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategories;
