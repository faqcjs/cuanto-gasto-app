// Mercado Pago CSV Import Service
// Parses the settlement_v2 CSV exported from mercadopago.com.ar/movements
// Format: semicolon-separated, no description column, signed amounts

import { autoCategorizeMP } from './mercadoPagoService';

/**
 * Maps PAYMENT_METHOD_TYPE to a human-readable label.
 */
const paymentMethodLabel = (type = '') => {
  const map = {
    bank_transfer: 'Transferencia bancaria',
    available_money: 'Dinero disponible MP',
    credit_card: 'Tarjeta de crédito',
    debit_card: 'Tarjeta de débito',
    account_money: 'Cuenta MP',
  };
  return map[type.toLowerCase()] || type || 'Mercado Pago';
};

/**
 * Maps TRANSACTION_TYPE and signed amount to a human-readable description.
 */
const buildDescription = (txType = '', pmType = '', sourceId = '', amount = 0) => {
  const isNegative = amount < 0;
  const type = txType.toUpperCase();

  if (type === 'CREDIT') return isNegative ? 'Débito en cuenta MP' : 'Crédito en cuenta MP';
  if (pmType === 'bank_transfer') return isNegative ? 'Transferencia enviada' : 'Transferencia recibida';
  if (pmType === 'available_money') return isNegative ? 'Pago / Egreso MP' : 'Cobro / Ingreso MP';
  if (type === 'SETTLEMENT') return isNegative ? 'Pago MP' : 'Liquidación MP';

  return `Movimiento MP #${sourceId}`;
};

/**
 * Parses a raw CSV string from Mercado Pago (settlement_v2 format).
 * Separator: semicolon (;)
 * Returns { expenses, incomes, skipped, total }
 */
export const parseMPCSV = (csvText) => {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) throw new Error('El archivo CSV no contiene datos.');

  // Detect separator: semicolon or comma
  const separator = lines[0].includes(';') ? ';' : ',';

  const headers = lines[0].split(separator).map((h) => h.trim().toUpperCase());

  const col = (name) => headers.indexOf(name);

  const colSourceId      = col('SOURCE_ID');
  const colPaymentMethod = col('PAYMENT_METHOD_TYPE');
  const colTxType        = col('TRANSACTION_TYPE');
  const colAmount        = col('TRANSACTION_AMOUNT');
  const colDate          = col('TRANSACTION_DATE');
  const colRealAmount    = col('REAL_AMOUNT');

  if (colAmount === -1 || colDate === -1) {
    throw new Error(
      'Formato de CSV no reconocido. Asegurate de exportar el archivo desde Mercado Pago → Mis movimientos → Descargar CSV.'
    );
  }

  const expenses = [];
  const incomes  = [];
  let skipped    = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(separator).map((c) => c.trim());
    if (row.length < 3) { skipped++; continue; }

    const sourceId  = colSourceId !== -1      ? row[colSourceId]      : '';
    const pmType    = colPaymentMethod !== -1  ? row[colPaymentMethod] : '';
    const txType    = colTxType !== -1         ? row[colTxType]        : 'SETTLEMENT';

    // Use REAL_AMOUNT if available, otherwise TRANSACTION_AMOUNT
    const rawAmount = colRealAmount !== -1 && row[colRealAmount] !== ''
      ? row[colRealAmount]
      : (colAmount !== -1 ? row[colAmount] : '0');

    const amount = parseFloat(rawAmount.replace(',', '.')) || 0;

    if (amount === 0) { skipped++; continue; }

    // Date: ISO format "2026-08-04T01:32:04.000-04:00"
    let date = new Date().toISOString().slice(0, 10);
    if (colDate !== -1 && row[colDate]) {
      date = row[colDate].slice(0, 10);
    }

    const externalId  = `mpcsv_${sourceId || i}_${date}`;
    const description = buildDescription(txType, pmType, sourceId, amount);
    const category    = autoCategorizeMP(description);
    const absAmount   = Math.abs(amount);

    const entry = {
      externalId,
      amount: absAmount,
      description,
      category,
      date,
      paymentMethod: paymentMethodLabel(pmType),
      tags: ['Mercado Pago', 'CSV Import'],
    };

    if (amount < 0) {
      expenses.push(entry);
    } else {
      incomes.push(entry);
    }
  }

  return {
    expenses,
    incomes,
    skipped,
    total: lines.length - 1,
  };
};
