import React, { useState } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar la navbar cuando se hace clic fuera de ella (solo en dispositivos móviles)
  const handleOverlayClick = (e) => {
    if (window.innerWidth <= 480 && isOpen) {
      setIsOpen(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Solo cerramos el menú en dispositivos móviles
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && window.innerWidth <= 480 && (
        <div className="navbar-overlay" onClick={handleOverlayClick}></div>
      )}
      <div className={`navbar ${isOpen ? 'navbar-open' : ''}`}>
        <button className="navbar-toggle" onClick={toggleNavbar}>
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        
        <div className="navbar-items">
          <button 
            className={`navbar-item ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => handleTabClick('resumen')}
          >
            <DashboardIcon className="navbar-icon" />
            <span className="navbar-text">Resumen</span>
          </button>
          
          <button 
            className={`navbar-item ${activeTab === 'agregar' ? 'active' : ''}`}
            onClick={() => handleTabClick('agregar')}
          >
            <AddCircleOutlineIcon className="navbar-icon" />
            <span className="navbar-text">Agregar Gasto</span>
          </button>
          
          <button 
            className={`navbar-item ${activeTab === 'deudas' ? 'active' : ''}`}
            onClick={() => handleTabClick('deudas')}
          >
            <PaymentIcon className="navbar-icon" />
            <span className="navbar-text">Deudas a Pagar</span>
          </button>
          
          <button 
            className={`navbar-item ${activeTab === 'ajustes' ? 'active' : ''}`}
            onClick={() => handleTabClick('ajustes')}
          >
            <SettingsIcon className="navbar-icon" />
            <span className="navbar-text">Ajustes</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
