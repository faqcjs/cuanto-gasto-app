// Vercel Serverless Function — Mercado Pago API Proxy
// Bypasses CORS restrictions by calling the MP API server-side

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token || typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({ error: 'Access Token is required' });
  }

  const accessToken = token.trim();

  try {
    const mpUrl = 'https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=100';

    const mpResponse = await fetch(mpUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mpResponse.ok) {
      const errBody = await mpResponse.json().catch(() => ({}));
      const status = mpResponse.status;

      if (status === 401) {
        return res.status(401).json({ error: 'Token de Mercado Pago inválido o expirado. Verificá que copiaste el Access Token completo desde Credenciales de producción.' });
      }

      return res.status(status).json({
        error: errBody.message || `Error ${status} al consultar Mercado Pago`,
      });
    }

    const data = await mpResponse.json();

    // Set CORS headers so the browser can read the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json(data);
  } catch (err) {
    console.error('[mp-sync] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
