import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationModal from './ConfirmationModal';

const Settings = () => {
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  // Cargar categorías personalizadas al montar el componente
  useEffect(() => {
    const savedCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
    setCustomCategories(savedCategories);

    // PWA Install Logic
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ('standalone' in window.navigator) && window.navigator.standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Guardar categorías personalizadas cuando cambian
  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Agregar una nueva categoría
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    // Verificar si la categoría ya existe
    if (customCategories.some(cat => cat.toLowerCase() === newCategory.toLowerCase())) {
      alert('Esta categoría ya existe');
      return;
    }
    
    setCustomCategories([...customCategories, newCategory]);
    setNewCategory('');
  };

  // Eliminar una categoría
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCustomCategories(customCategories.filter(cat => cat !== categoryToDelete));
      setShowDeleteConfirmation(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCategoryToDelete(null);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="settings-container">
      <h2 className="section-title">Ajustes</h2>
      
      {(isInstallable || isIOS) && (
        <div className="settings-section glass-card" style={{ marginBottom: '20px', padding: '20px', borderRadius: '15px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <h3>Instalar Aplicación</h3>
          {isInstallable && (
            <div>
              <p className="settings-description" style={{ marginBottom: '15px' }}>
                Instala Cuánto Gasto en tu dispositivo para un acceso rápido y uso sin conexión.
              </p>
              <button 
                onClick={handleInstallClick}
                style={{ 
                  background: 'linear-gradient(135deg, #6e8efb, #a777e3)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Instalar Aplicación en Celular / PC
              </button>
            </div>
          )}
          {!isInstallable && isIOS && (
            <p className="settings-description" style={{ marginBottom: '0', fontSize: '0.95rem' }}>
              Para instalar en tu iPhone: presiona Compartir 📤 y luego <strong>Agregar a pantalla de inicio ➕</strong>.
            </p>
          )}
        </div>
      )}

      <div className="settings-section">
        <h3>Categorías personalizadas</h3>
        <p className="settings-description">
          Agrega categorías personalizadas para clasificar tus gastos. Estas categorías estarán disponibles al agregar nuevos gastos.
        </p>
        
        <div className="add-category-form">
          <input 
            type="text" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)} 
            placeholder="Nombre de la categoría"
            className="category-input"
          />
          <button 
            className="add-category-btn"
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
          >
            <AddIcon /> Agregar
          </button>
        </div>
        
        {customCategories.length > 0 ? (
          <div className="category-list">
            <h4>Categorías actuales:</h4>
            <ul className="custom-categories">
              {customCategories.map((category, index) => (
                <li key={index} className="custom-category-item">
                  <span>{category}</span>
                  <button 
                    className="delete-category-btn"
                    onClick={() => handleDeleteClick(category)}
                    aria-label={`Eliminar categoría ${category}`}
                  >
                    <DeleteIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="no-categories">No hay categorías personalizadas. Agrega una para comenzar.</p>
        )}
      </div>
      
      {/* Modal de confirmación para eliminar categoría */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Eliminar Categoría"
        message="¿Estás seguro de eliminar esta categoría?"
        confirmButtonText="Eliminar"
        cancelButtonText="Cancelar"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
      />
    </div>
  );
};

export default Settings;
