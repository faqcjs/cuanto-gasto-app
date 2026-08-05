import React, { useState, useEffect } from 'react';
import { 
  FiKey, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiExternalLink, 
  FiShield, 
  FiZap,
  FiTrash2
} from 'react-icons/fi';
import { 
  getMPToken, 
  setMPToken, 
  fetchMPPayments 
} from '../services/mercadoPagoService';
import { useGlobalContext } from '../context/GlobalContext';

const MercadoPagoSync = () => {
  const { addMultipleExpenses } = useGlobalContext();

  const [tokenInput, setTokenInput] = useState('');
  const [savedToken, setSavedToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }

  useEffect(() => {
    const token = getMPToken();
    setSavedToken(token);
    setTokenInput(token);
  }, []);

  const handleSaveToken = (e) => {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    setMPToken(trimmed);
    setSavedToken(trimmed);
    setStatusMessage({
      type: 'success',
      text: trimmed ? 'Token de Mercado Pago guardado correctamente.' : 'Token removido.'
    });
  };

  const handleRemoveToken = () => {
    setMPToken('');
    setSavedToken('');
    setTokenInput('');
    setStatusMessage({ type: 'success', text: 'Token de Mercado Pago eliminado.' });
  };

  const handleSync = async () => {
    if (!savedToken) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor ingresá y guardá tu Access Token de Mercado Pago antes de sincronizar.'
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const result = await fetchMPPayments(savedToken);
      const importedCount = addMultipleExpenses(result.expenses);

      setStatusMessage({
        type: 'success',
        text: importedCount > 0 
          ? `¡Sincronización exitosa! Se importaron ${importedCount} nuevo(s) gasto(s) de Mercado Pago con auto-categorización.`
          : `Sincronización completada. No se encontraron gastos nuevos (tus pagos ya están actualizados).`
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.message || 'Ocurrió un error al sincronizar con Mercado Pago.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg shrink-0">
            MP
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Sincronización Mercado Pago</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                savedToken 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {savedToken ? 'Configurado' : 'Sin Token'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conectá tu cuenta vía API para importar automáticamente tus pagos y transferencias.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={loading || !savedToken}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
            loading || !savedToken
              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
        </button>
      </div>

      {/* Status Toasts */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <FiCheckCircle className="text-base text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <FiAlertCircle className="text-base text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Token Form & Instruction Guide */}
      <form onSubmit={handleSaveToken} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="mp-token" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Mercado Pago Access Token (`APP_USR-...`)</span>
            <span className="text-[10px] text-slate-500 font-normal flex items-center gap-1">
              <FiShield className="text-emerald-400" /> Almacenado localmente en tu dispositivo
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <FiKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input 
                type="password"
                id="mp-token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="APP_USR-1234567890123456-..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
            >
              Guardar Token
            </button>

            {savedToken && (
              <button
                type="button"
                onClick={handleRemoveToken}
                className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center"
                title="Eliminar token guardado"
              >
                <FiTrash2 className="text-sm" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* How to get credentials guide */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 space-y-2.5 text-xs text-slate-300">
        <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
          <FiZap className="text-amber-400 text-sm" />
          <span>¿Cómo obtener tu Access Token de Mercado Pago?</span>
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
          <li>
            Ingresá a tu panel oficial en{' '}
            <a 
              href="https://www.mercadopago.com.ar/developers/panel/app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              Mercado Pago Developers Panel <FiExternalLink className="text-[10px]" />
            </a>.
          </li>
          <li>Creá una aplicación (o seleccioná una existente).</li>
          <li>Ve a la sección **Credenciales de producción** o **Credenciales de prueba**.</li>
          <li>Copiá el **Access Token** (comienza con `APP_USR-` o `TEST-`), pégalo arriba y guardalo.</li>
        </ol>
      </div>
    </div>
  );
};

export default MercadoPagoSync;
