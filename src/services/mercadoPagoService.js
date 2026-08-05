// Service for Mercado Pago API Integration

const MP_TOKEN_KEY = 'mp_access_token';

export const getMPToken = () => {
  try {
    return localStorage.getItem(MP_TOKEN_KEY) || '';
  } catch (error) {
    console.error('Error reading Mercado Pago token:', error);
    return '';
  }
};

export const setMPToken = (token) => {
  try {
    if (!token) {
      localStorage.removeItem(MP_TOKEN_KEY);
    } else {
      localStorage.setItem(MP_TOKEN_KEY, token.trim());
    }
  } catch (error) {
    console.error('Error saving Mercado Pago token:', error);
  }
};

export const autoCategorizeMP = (description = '') => {
  const lower = description.toLowerCase();
  if (
    lower.includes('coto') || 
    lower.includes('carrefour') || 
    lower.includes('pedidos') || 
    lower.includes('rappi') || 
    lower.includes('mcdonald') || 
    lower.includes('super') || 
    lower.includes('verduler') || 
    lower.includes('panader') || 
    lower.includes('resto') ||
    lower.includes('bar')
  ) {
    return 'Comida';
  }
  
  if (
    lower.includes('uber') || 
    lower.includes('cabify') || 
    lower.includes('subte') || 
    lower.includes('subte') || 
    lower.includes('ypf') || 
    lower.includes('shell') || 
    lower.includes('axon') || 
    lower.includes('axion') || 
    lower.includes('nafta') || 
    lower.includes('peaje') ||
    lower.includes('colectivo')
  ) {
    return 'Transporte';
  }

  if (
    lower.includes('steam') || 
    lower.includes('netflix') || 
    lower.includes('spotify') || 
    lower.includes('cine') || 
    lower.includes('playstation') ||
    lower.includes('xbox') ||
    lower.includes('twitch')
  ) {
    return 'Ocio';
  }

  if (
    lower.includes('farmacia') || 
    lower.includes('osde') || 
    lower.includes('swiss') || 
    lower.includes('medico') || 
    lower.includes('salud') ||
    lower.includes('remey')
  ) {
    return 'Salud';
  }

  if (
    lower.includes('edesur') || 
    lower.includes('edenor') || 
    lower.includes('metrogas') || 
    lower.includes('telecom') || 
    lower.includes('fibertel') || 
    lower.includes('movistar') || 
    lower.includes('claro') ||
    lower.includes('personal') ||
    lower.includes('aysa')
  ) {
    return 'Servicios';
  }

  return 'Otros';
};

export const parseMPPaymentToExpense = (payment) => {
  const desc = payment.description || payment.reason || payment.operation_type || 'Pago Mercado Pago';
  const category = autoCategorizeMP(desc);

  let dateStr = new Date().toISOString().slice(0, 10);
  if (payment.date_created) {
    dateStr = payment.date_created.slice(0, 10);
  }

  return {
    id: `mp_${payment.id}`,
    externalId: `mp_${payment.id}`,
    amount: Number(payment.transaction_amount || 0),
    description: desc,
    category,
    date: dateStr,
    paymentMethod: 'Mercado Pago',
    tags: ['Mercado Pago', 'Auto-Sync']
  };
};

export const fetchMPPayments = async (token) => {
  const accessToken = token || getMPToken();
  if (!accessToken) {
    throw new Error('No se ha configurado ningún Access Token de Mercado Pago');
  }

  try {
    // Call our Vercel serverless proxy to avoid CORS restrictions
    const response = await fetch('/api/mp-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status} al sincronizar`);
    }

    const results = data.results || [];

    // Keep only approved outgoing payments with a positive amount
    const approvedPayments = results.filter(
      (p) => p.status === 'approved' && p.transaction_amount > 0
    );
    const parsedExpenses = approvedPayments.map(parseMPPaymentToExpense);

    return {
      success: true,
      count: parsedExpenses.length,
      expenses: parsedExpenses,
      rawCount: results.length,
    };
  } catch (error) {
    console.error('Mercado Pago Sync Error:', error);
    throw error;
  }
};
