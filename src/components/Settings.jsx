import React, { useState, useEffect, useRef } from 'react';
import { 
  FiTrash2, 
  FiPlus, 
  FiDownload, 
  FiUpload, 
  FiAlertTriangle, 
  FiSave 
} from 'react-icons/fi';
import ConfirmationModal from './ConfirmationModal';
import { useGlobalContext } from '../context/GlobalContext';

const Settings = () => {
  const { 
    monthlyBudget, 
    setMonthlyBudget, 
    exportDataJSON, 
    importDataJSON, 
    clearAllData 
  } = useGlobalContext();

  const [budgetInput, setBudgetInput] = useState(monthlyBudget || '');
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setBudgetInput(monthlyBudget || '');
  }, [monthlyBudget]);

  useEffect(() => {
    try {
      const savedCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
      setCustomCategories(savedCategories);
    } catch {
      setCustomCategories([]);
    }

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

  useEffect(() => {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (isNaN(val) || val < 0) {
      alert('Por favor ingresa un monto de presupuesto válido');
      return;
    }
    setMonthlyBudget(val);
    alert('Presupuesto actualizado correctamente');
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    if (customCategories.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
      alert('Esta categoría ya existe');
      return;
    }
    
    setCustomCategories([...customCategories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleDeleteCategoryClick = (category) => {
    setCategoryToDelete(category);
    setShowCategoryDeleteModal(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      setCustomCategories(customCategories.filter(cat => cat !== categoryToDelete));
      setShowCategoryDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = importDataJSON(content);
      if (res.success) {
        alert('¡Datos importados exitosamente!');
      } else {
        alert(`Error al importar datos: ${res.error || 'Formato no válido'}`);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClearAll = () => {
    clearAllData();
    setCustomCategories([]);
    setBudgetInput(0);
    setShowClearAllModal(false);
    alert('Todos los datos han sido borrados');
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
    <div className="w-full glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-slate-100 border-b border-slate-800 pb-4">
        Ajustes & Configuración
      </h2>
      
      {/* Section 1: Presupuesto Mensual */}
      <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100">Presupuesto Mensual</h3>
        <p className="text-xs text-slate-400">
          Define el límite de gasto mensual para visualizar el progreso en tu resumen.
        </p>
        <form onSubmit={handleSaveBudget} className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="Ej: 150000"
            min="0"
            step="any"
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl glass-input text-sm"
          />
          <button 
            type="submit" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <FiSave className="text-base" /> Guardar Presupuesto
          </button>
        </form>
      </div>

      {/* Section 2: PWA Install Prompt */}
      {(isInstallable || isIOS) && (
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100">Instalar Aplicación</h3>
          {isInstallable && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Instala Cuánto Gasto en tu dispositivo para un acceso rápido y uso sin conexión.
              </p>
              <button 
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg transition-all cursor-pointer"
              >
                Instalar Aplicación en Celular / PC
              </button>
            </div>
          )}
          {!isInstallable && isIOS && (
            <p className="text-xs text-slate-300">
              Para instalar en tu iPhone: presiona Compartir 📤 y luego <strong>Agregar a pantalla de inicio ➕</strong>.
            </p>
          )}
        </div>
      )}

      {/* Section 3: Backup Data (Export & Import JSON) */}
      <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100">Copia de Seguridad y Datos</h3>
        <p className="text-xs text-slate-400">
          Exporta todos tus datos a un archivo JSON para respaldo o impórtalos en otro dispositivo.
        </p>

        <div className="flex flex-wrap gap-3">
          <button 
            type="button" 
            onClick={exportDataJSON}
            className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <FiDownload className="text-base" /> Exportar JSON
          </button>

          <button 
            type="button" 
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <FiUpload className="text-base" /> Importar JSON
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Section 4: Categorías Personalizadas */}
      <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100">Categorías Personalizadas</h3>
        <p className="text-xs text-slate-400">
          Agrega categorías personalizadas para clasificar tus gastos.
        </p>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)} 
            placeholder="Nombre de la categoría"
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm"
          />
          <button 
            type="button"
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg transition-all cursor-pointer"
          >
            <FiPlus className="text-base" /> Agregar
          </button>
        </div>
        
        {customCategories.length > 0 ? (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categorías actuales:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-sm font-medium text-slate-200">{category}</span>
                  <button 
                    type="button"
                    onClick={() => handleDeleteCategoryClick(category)}
                    aria-label={`Eliminar categoría ${category}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 pt-1">No hay categorías personalizadas agregadas.</p>
        )}
      </div>

      {/* Section 5: Zona de Peligro (Borrar Datos) */}
      <div className="bg-rose-500/5 p-5 rounded-2xl border border-rose-500/30 space-y-4">
        <h3 className="text-base font-bold text-rose-400">Zona de Peligro</h3>
        <p className="text-xs text-slate-400">
          Elimina permanentemente todos los gastos, deudas y configuraciones almacenadas.
        </p>
        <button 
          type="button" 
          onClick={() => setShowClearAllModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-sm font-semibold transition-all cursor-pointer"
        >
          <FiAlertTriangle className="text-base" /> Borrar Todos los Datos
        </button>
      </div>
      
      {/* Modal confirmación eliminar categoría */}
      <ConfirmationModal
        isOpen={showCategoryDeleteModal}
        title="Eliminar Categoría"
        message="¿Estás seguro de eliminar esta categoría?"
        confirmButtonText="Eliminar"
        cancelButtonText="Cancelar"
        onConfirm={confirmDeleteCategory}
        onClose={() => setShowCategoryDeleteModal(false)}
      />

      {/* Modal confirmación borrar todo */}
      <ConfirmationModal
        isOpen={showClearAllModal}
        title="Borrar Todos los Datos"
        message="¿Estás seguro de que deseas eliminar TODOS los gastos, deudas y configuraciones? Esta acción no se puede deshacer."
        confirmButtonText="Sí, Borrar Todo"
        cancelButtonText="Cancelar"
        onConfirm={handleConfirmClearAll}
        onClose={() => setShowClearAllModal(false)}
      />
    </div>
  );
};

export default Settings;
