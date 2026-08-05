import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import QuickAddModal from './QuickAddModal';
import { FiPlus } from 'react-icons/fi';

const Layout = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#090e1a] text-slate-100 relative selection:bg-indigo-500 selection:text-white">
      {/* Sidebar for Desktop / Bottombar for Mobile Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="sticky top-0 z-30 glass-panel border-b border-indigo-500/10 px-6 py-4 flex justify-between items-center shadow-lg">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Cuánto Gasto 💰
          </h1>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            v2.0 • Tailwind v4
          </span>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button (FAB) for Quick Add */}
      <button 
        className="fixed bottom-20 md:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 cursor-pointer" 
        onClick={() => setIsQuickAddOpen(true)}
        aria-label="Agregar Gasto Rápido"
        title="Agregar gasto rápido"
      >
        <FiPlus className="text-2xl stroke-[2.5]" />
      </button>

      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </div>
  );
};

export default Layout;
