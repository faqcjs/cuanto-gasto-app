import React, { useState, useRef } from 'react';
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiDownload,
  FiExternalLink,
} from 'react-icons/fi';
import { parseMPCSV } from '../services/mpCSVService';
import { useGlobalContext } from '../context/GlobalContext';

const MPCSVImport = () => {
  const { addMultipleExpenses, addMultipleIncomes } = useGlobalContext();
  const fileInputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(null); // { expenses, incomes, skipped, total, fileName }
  const [result, setResult] = useState(null);   // { imported, message }
  const [error, setError] = useState('');

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('El archivo debe ser un CSV (.csv) exportado desde Mercado Pago.');
      return;
    }

    setError('');
    setResult(null);
    setPreview(null);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseMPCSV(text);
        setPreview({ ...parsed, fileName: file.name });
      } catch (err) {
        setError(err.message || 'No se pudo leer el archivo CSV.');
      } finally {
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setError('Error al leer el archivo.');
      setParsing(false);
    };
    // Try UTF-8 first; MP sometimes exports Latin-1 but modern browsers usually handle it
    reader.readAsText(file, 'UTF-8');
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleImport = () => {
    if (!preview) return;
    const importedExpenses = addMultipleExpenses(preview.expenses);
    const importedIncomes  = addMultipleIncomes(preview.incomes);
    const total = importedExpenses + importedIncomes;

    let msg = '';
    if (total > 0) {
      const parts = [];
      if (importedExpenses > 0) parts.push(`${importedExpenses} gasto(s)`);
      if (importedIncomes  > 0) parts.push(`${importedIncomes} ingreso(s)`);
      msg = `¡Importación exitosa! Se cargaron ${parts.join(' y ')} de Mercado Pago.`;
    } else {
      msg = 'Todos los movimientos del CSV ya estaban registrados (sin duplicados).';
    }

    setResult({ imported: total, message: msg });
    setPreview(null);
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <FiUploadCloud className="text-xl" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Importar CSV de Mercado Pago</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Exportá tu historial desde MP y cargalo acá para importar tus movimientos automáticamente.
          </p>
        </div>
      </div>

      {/* How to get the CSV */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <FiDownload className="text-emerald-400" /> ¿Cómo exportar el CSV?
        </p>
        <ol className="list-decimal list-inside space-y-1 pl-1">
          <li>
            Entrá a{' '}
            <a
              href="https://www.mercadopago.com.ar/movements"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              mercadopago.com.ar/movements <FiExternalLink className="text-[10px]" />
            </a>
          </li>
          <li>Filtrá por el período que querés importar (ej: último mes)</li>
          <li>Hacé click en el botón <strong className="text-slate-200">Descargar</strong> → elegí <strong className="text-slate-200">CSV</strong></li>
          <li>Subí el archivo acá abajo</li>
        </ol>
      </div>

      {/* Drop zone */}
      {!preview && !result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {parsing ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-400">Procesando archivo...</p>
            </>
          ) : (
            <>
              <FiFileText className={`text-4xl ${dragging ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-300">
                  {dragging ? 'Soltá el archivo acá' : 'Arrastrá tu CSV acá o hacé click para elegir'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Solo archivos .csv exportados desde Mercado Pago</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2.5">
          <FiAlertCircle className="text-base text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FiFileText className="text-emerald-400" />
              Vista previa — <span className="text-slate-400 font-normal">{preview.fileName}</span>
            </h3>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <FiX className="text-sm" />
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total filas', value: preview.total, color: 'text-slate-300' },
              { label: 'Gastos', value: preview.expenses.length, color: 'text-rose-400' },
              { label: 'Ingresos', value: preview.incomes.length, color: 'text-emerald-400' },
              { label: 'Omitidos', value: preview.skipped, color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-center">
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Top 5 expenses preview */}
          {preview.expenses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primeros gastos detectados</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {preview.expenses.slice(0, 6).map((exp, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/40 rounded-xl px-3 py-2 border border-slate-800 gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-slate-200 truncate">{exp.description}</span>
                      <span className="text-[10px] text-slate-500">{exp.date} · {exp.category}</span>
                    </div>
                    <span className="text-sm font-bold text-rose-400 shrink-0">${exp.amount.toFixed(2)}</span>
                  </div>
                ))}
                {preview.expenses.length > 6 && (
                  <p className="text-center text-xs text-slate-500 py-1">
                    +{preview.expenses.length - 6} gastos más...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={preview.expenses.length === 0 && preview.incomes.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
              (preview.expenses.length > 0 || preview.incomes.length > 0)
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <FiUploadCloud className="text-base" />
            Importar {preview.expenses.length} gasto(s) y {preview.incomes.length} ingreso(s)
          </button>
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="space-y-3 animate-fade-in">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm flex items-start gap-3">
            <FiCheckCircle className="text-xl text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{result.message}</span>
          </div>
          <button
            onClick={reset}
            className="w-full py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            Importar otro archivo
          </button>
        </div>
      )}
    </div>
  );
};

export default MPCSVImport;
