import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import DebtTracker from './components/DebtTracker';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="gastos" element={<Expenses />} />
            <Route path="agregar" element={<Expenses />} />
            <Route path="deudas" element={<DebtTracker />} />
            <Route path="analiticas" element={<Analytics />} />
            <Route path="ajustes" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
