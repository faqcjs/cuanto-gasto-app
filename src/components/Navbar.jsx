import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiPieChart, 
  FiPlusCircle, 
  FiCreditCard, 
  FiBarChart2, 
  FiSettings 
} from 'react-icons/fi';

const Navbar = () => {
  const navItems = [
    { to: '/', label: 'Resumen', icon: <FiPieChart className="text-xl" /> },
    { to: '/agregar', label: 'Agregar', icon: <FiPlusCircle className="text-xl" /> },
    { to: '/deudas', label: 'Deudas', icon: <FiCreditCard className="text-xl" /> },
    { to: '/analiticas', label: 'Estadísticas', icon: <FiBarChart2 className="text-xl" /> },
    { to: '/ajustes', label: 'Ajustes', icon: <FiSettings className="text-xl" /> },
  ];

  return (
    <>
      {/* Desktop Sidebar (md+) */}
      <aside className="hidden md:flex flex-col w-64 sticky top-0 h-screen glass-panel border-r border-slate-800/60 p-5 z-30 shrink-0">
        <div className="mb-8 px-2 py-3 border-b border-slate-800/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Menú Principal</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              {item.icon}
              <span className="text-sm tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation (<md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-slate-800/80 flex items-center justify-around z-40 px-2 shadow-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-200 ${
                isActive 
                  ? 'text-indigo-400 font-semibold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
