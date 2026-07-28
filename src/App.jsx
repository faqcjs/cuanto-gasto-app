import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { GlobalProvider } from './context/GlobalContext';
import './App.css';

function App() {
  return (
    <GlobalProvider>
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-logo">Cuánto Gasto 💰</h1>
        </header>

        <main className="main-content">
          <div className="content-wrapper">
            <Dashboard />
          </div>
        </main>
      </div>
    </GlobalProvider>
  );
}

export default App;
