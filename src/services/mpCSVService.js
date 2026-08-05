// Mercado Pago CSV Import Service
// Parses the CSV exported from mercadopago.com.ar/movements

import { autoCategorizeMP } from './mercadoPagoService';

/**
 * Detects the column index map from the header row.
 * MP has changed their CSV format multiple times — we handle both variants.
 */
const detectColumns = (headers) => {
  const h = headers.map((c) => c.toLowerCase().trim().replace(/[^a-záéíóúñ\s]/gi, '').trim());

  const find = (...keywords) => {
    for (const kw of keywords) {
      const idx = h.findIndex((col) => col.includes(kw));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  return {
    date:        find('fecha'),
    description: find('descripci'),
    amount:      find('monto', 'importe'),
    moneyIn:     find('dinero ingresado', 'ingresado'),
    moneyOut:    find('dinero retirado', 'retirado'),
    status:      find('estado'),
    refId:       find('referencia', 'número de operaci', 'id de'),
    type:        find('tipo'),
  };
};

/**
 * Parses a raw CSV string exported from Mercado Pago.
 * Returns { expenses, incomes, skipped, total }
 */
export const parseMPCSV = (csvText) => {
  // Normalize line endings and split
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Find the header line (first non-empty line)
  const headerLineIdx = lines.findIndex((l) => l.trim().length > 0);
  if (headerLineIdx === -1) throw new Error('Archivo CSV vacío o inválido.');

  const parseRow = (line) => {
    // Handle quoted fields with commas inside
    const result = [];
    let inQuote = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseRow(lines[headerLineIdx]);
  const cols = detectColumns(headers);

  const dataLines = lines.slice(headerLineIdx + 1).filter((l) => l.trim().length > 0);

  const expenses = [];
  const incomes = [];
  let skipped = 0;

  for (const line of dataLines) {
    const row = parseRow(line);
    if (row.length < 2) { skipped++; continue; }

    // Status filter — only approved/completado
    const status = cols.status !== -1 ? row[cols.status].toLowerCase() : 'aprobado';
    if (
      status.includes('cancel') ||
      status.includes('rechazado') ||
      status.includes('pendiente') ||
      status.includes('en proceso')
    ) {
      skipped++;
      continue;
    }

    // Date
    let date = '';
    if (cols.date !== -1) {
      const raw = row[cols.date] || '';
      // Formats: "2024-01-15", "15/01/2024", "15/01/2024 14:23"
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        date = raw.slice(0, 10);
      } else if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
        const [d, m, y] = raw.split('/');
        date = `${y}-${m}-${d.padStart(2, '0')}`;
      } else {
        date = new Date().toISOString().slice(0, 10);
      }
    }

    // Description
    const description = cols.description !== -1 ? row[cols.description] : 'Movimiento MP';

    // Reference ID for deduplication
    const refId = cols.refId !== -1 ? row[cols.refId] : '';
    const externalId = refId ? `mpcsv_${refId}` : `mpcsv_${date}_${description}_${Math.random()}`;

    // Amount — two strategies depending on CSV variant
    let amount = 0;
    let isIncome = false;

    if (cols.moneyIn !== -1 && cols.moneyOut !== -1) {
      // Variant with separate "Dinero ingresado" / "Dinero retirado" columns
      const rawIn  = parseFloat((row[cols.moneyIn]  || '0').replace(/\./g, '').replace(',', '.')) || 0;
      const rawOut = parseFloat((row[cols.moneyOut] || '0').replace(/\./g, '').replace(',', '.')) || 0;
      if (rawIn > 0) {
        amount = rawIn;
        isIncome = true;
      } else {
        amount = rawOut;
        isIncome = false;
      }
    } else if (cols.amount !== -1) {
      // Variant with single "Monto" column (negative = gasto, positive = ingreso)
      const raw = (row[cols.amount] || '0').replace(/\./g, '').replace(',', '.');
      const val = parseFloat(raw) || 0;
      amount = Math.abs(val);
      isIncome = val > 0;
    }

    if (amount <= 0) { skipped++; continue; }

    const category = autoCategorizeMP(description);
    const entry = {
      externalId,
      amount,
      description,
      category,
      date,
      paymentMethod: 'Mercado Pago',
      tags: ['Mercado Pago', 'CSV Import'],
    };

    if (isIncome) {
      incomes.push(entry);
    } else {
      expenses.push(entry);
    }
  }

  return {
    expenses,
    incomes,
    skipped,
    total: dataLines.length,
  };
};
