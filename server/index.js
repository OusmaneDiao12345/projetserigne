/** GRF CONSULTING payment gateway. Provider credentials stay server-side. */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 4000);
const MODE = process.env.PAYMENTS_MODE || 'demo';
const APP_URL = process.env.APP_URL || 'http://localhost:4200';
const API_URL = process.env.PUBLIC_API_URL || `http://localhost:${PORT}/api`;
const PLAN_PRICES = { adhesion: 5000, ia: 1000 };
const SESSION_STORE = path.join(__dirname, '.payments.json');
const CONSTITUTION = require('./knowledge/constitution-sn');
const aiRateLimits = new Map();

function findPaidMembership(reference) {
  if (typeof reference !== 'string' || !reference) return false;
  const cutoff = Date.now() - 366 * 24 * 60 * 60 * 1000;
  const session = sessions.get(reference);
  if (!session || session.planId !== 'adhesion' || session.status !== 'PAID') return false;
  const paidAt = new Date(session.paidAt || session.createdAt);
  if (!Number.isFinite(paidAt.getTime()) || paidAt.getTime() <= cutoff) return false;
  const expiresAt = new Date(paidAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  if (paidAt.getMonth() === 1 && paidAt.getDate() === 29 && expiresAt.getMonth() !== 1) expiresAt.setDate(0);
  return Date.now() < expiresAt.getTime();
}

function constitutionContext(question, domain) {
  const terms = `${question} ${domain}`.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  const ranked = CONSTITUTION.articles.map((article) => {
    const source = `${article.title} ${article.text} ${article.keywords.join(' ')}`.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return { article, score: terms.reduce((score, term) => score + (source.includes(term) ? 1 : 0), 0) };
  }).sort((a, b) => b.score - a.score).slice(0, 7);
  return ranked.filter((item) => item.score > 0).map(({ article }) => `Article ${article.number} — ${article.title}\n${article.text}`).join('\n\n');
}

function allowAiRequest(ip) {
  const now = Date.now();
  const recent = (aiRateLimits.get(ip) || []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= 8) return false;
  recent.push(now);
  aiRateLimits.set(ip, recent);
  return true;
}

async function generateConstitutionalAnswer(question, domain) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const endpoint = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  if (!apiKey || !model) {
    const error = new Error('Le service de réponse juridique IA n’est pas encore configuré. Ajoutez AI_API_KEY et AI_MODEL dans le fichier .env du serveur.');
    error.status = 503;
    throw error;
  }
  const context = constitutionContext(question, domain);
  const sourceContext = context || 'Aucun article pertinent n’a été trouvé dans le corpus constitutionnel local.';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: `Tu es l’assistant d’orientation juridique de GRF CONSULTING. Réponds en français clair, en t’appuyant exclusivement sur les extraits de la Constitution du Sénégal fournis ci-dessous. N’invente aucun article, délai, procédure ou règle. Si ces extraits ne permettent pas de répondre, dis-le explicitement et précise que la Constitution ne suffit pas pour trancher; indique que les lois applicables ou un professionnel habilité peuvent être nécessaires. Distingue les faits rapportés par l’utilisateur des règles constitutionnelles. Cite les articles réellement présents dans les extraits. Termine par une courte phrase indiquant qu’il s’agit d’une information générale, pas d’un avis d’avocat.\n\nCorpus de référence :\n${sourceContext}` },
        { role: 'user', content: `Domaine choisi : ${domain}\nQuestion : ${question}` }
      ]
    }),
    signal: AbortSignal.timeout(30_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || `Le fournisseur IA a répondu HTTP ${response.status}.`);
    error.status = response.status === 401 || response.status === 403 ? 503 : 502;
    throw error;
  }
  const answer = payload.choices?.[0]?.message?.content;
  if (typeof answer !== 'string' || !answer.trim()) {
    const error = new Error('Le fournisseur IA n’a pas renvoyé de réponse exploitable.');
    error.status = 502;
    throw error;
  }
  return answer.trim();
}

function loadSessions() {
  try {
    const rows = JSON.parse(fs.readFileSync(SESSION_STORE, 'utf8'));
    return new Map(Array.isArray(rows) ? rows : []);
  } catch {
    return new Map();
  }
}

const sessions = loadSessions();

function persistSessions() {
  fs.writeFileSync(SESSION_STORE, JSON.stringify([...sessions.entries()], null, 2), 'utf8');
}

function dexpPayConfig() {
  const apiKey = process.env.DEXPAY_API_KEY;
  const apiSecret = process.env.DEXPAY_API_SECRET;
  if (!apiKey) {
    throw new Error('Configuration DEXPAY incomplète. Définissez DEXPAY_API_KEY dans .env.');
  }
  const baseUrl = process.env.DEXPAY_API_URL || 'https://api-sandbox.dexpay.africa/api/v1';
  return { apiKey, apiSecret, baseUrl };
}

async function dexpay(path, init = {}) {
  const config = dexpPayConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, ...(init.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || payload.error || `DEXPAY a répondu HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function findValue(value, keys, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 4) return undefined;
  for (const key of keys) if (typeof value[key] === 'string' && value[key]) return value[key];
  for (const child of Object.values(value)) {
    const found = findValue(child, keys, depth + 1);
    if (found) return found;
  }
}

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.APP_ORIGIN || 'http://localhost:4200',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function requireSenePayConfig() {
  const { SENEPAY_API_KEY, SENEPAY_API_SECRET, SENEPAY_WEBHOOK_SECRET } = process.env;
  if (!SENEPAY_API_KEY || !SENEPAY_API_SECRET || !SENEPAY_WEBHOOK_SECRET) {
    throw new Error('Configuration SenePay incomplète. Définissez les identifiants uniquement dans les variables du serveur.');
  }
  return { key: SENEPAY_API_KEY, secret: SENEPAY_API_SECRET };
}

async function senepay(path, init = {}) {
  const credentials = requireSenePayConfig();
  const response = await fetch(`https://api.sene-pay.com${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': credentials.key,
      'X-Api-Secret': credentials.secret,
      ...(init.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || payload.error || `SenePay a répondu HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': process.env.APP_ORIGIN || 'http://localhost:4200',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return json(res, 200, { ok: true, service: 'grf-payments', mode: MODE, legalAiConfigured: Boolean(process.env.AI_API_KEY && process.env.AI_MODEL) });
    }

    if (req.method === 'POST' && url.pathname === '/api/legal/answer') {
      if (!allowAiRequest(req.socket.remoteAddress || 'unknown')) return json(res, 429, { error: 'Trop de demandes. Réessayez dans une minute.' });
      const body = JSON.parse((await readRawBody(req)).toString('utf8') || '{}');
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      const domain = typeof body.domain === 'string' ? body.domain.trim() : '';
      if (question.length < 10 || question.length > 3000 || !domain || domain.length > 80) {
        return json(res, 400, { error: 'Indiquez un domaine et une question de 10 à 3 000 caractères.' });
      }
      const paidQuestion = typeof body.paymentReference === 'string' ? sessions.get(body.paymentReference) : undefined;
      const paidOneOff = paidQuestion?.status === 'PAID' && paidQuestion.planId === 'ia';
      const member = !body.paymentReference && findPaidMembership(body.membershipReference);
      if (!paidOneOff && !member) return json(res, 403, { error: 'Un paiement confirmé de réponse rapide ou une adhésion active est requis.' });
      const answer = await generateConstitutionalAnswer(question, domain);
      return json(res, 200, { answer, sources: CONSTITUTION.sources, basis: CONSTITUTION.version });
    }

    if (req.method === 'POST' && url.pathname === '/api/payments/dexpay/checkout') {
      const body = JSON.parse((await readRawBody(req)).toString('utf8') || '{}');
      const amount = PLAN_PRICES[body.planId];
      if (!amount) return json(res, 400, { error: 'Offre de paiement inconnue.' });

      const orderReference = `GRF-${crypto.randomUUID()}`;
      const localSession = {
        orderReference,
        amount,
        currency: 'XOF',
        planId: body.planId,
        operator: body.operator || 'WAVE',
        userId: body.userId,
        caseId: body.caseId,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      if (MODE === 'demo') {
        sessions.set(orderReference, localSession);
        persistSessions();
        return json(res, 201, {
          providerReference: orderReference,
          checkoutUrl: `/paiement/checkout/${orderReference}`,
          sandbox: true
        });
      }

      if (MODE === 'dexpay') {
        const localReturnUrl = MODE === 'dexpay' && /^http:\/\/localhost(:\d+)?$/.test(APP_URL);
        if ((!APP_URL.startsWith('https://') && !localReturnUrl) || !API_URL.startsWith('https://')) {
          return json(res, 503, { error: 'PUBLIC_API_URL doit être une adresse HTTPS publique pour le webhook DEXPAY. APP_URL peut rester localhost pendant un test sandbox.' });
        }
        const checkout = await dexpay('/checkout-sessions', {
          method: 'POST',
          body: JSON.stringify({
            reference: orderReference,
            item_name: body.planId === 'adhesion' ? 'Adhésion membre GRF CONSULTING' : 'Réponse rapide GRF CONSULTING',
            amount,
            currency: 'XOF',
            webhook_url: `${API_URL}/webhooks/dexpay`,
            success_url: `${APP_URL}/paiement/confirmation?ref=${encodeURIComponent(orderReference)}`,
            failure_url: `${APP_URL}/paiement/echec`
          })
        });
        const sandboxUrl = process.env.DEXPAY_API_URL?.includes('api-sandbox') !== false;
        const checkoutUrl = (sandboxUrl && findValue(checkout, ['sandbox_payment_url', 'sandboxPaymentUrl']))
          || findValue(checkout, ['payment_url', 'paymentUrl']);
        if (!checkoutUrl || !checkoutUrl.startsWith('https://')) {
          return json(res, 502, { error: 'Réponse DEXPAY invalide : payment_url HTTPS absent.' });
        }
        sessions.set(orderReference, localSession);
        persistSessions();
        return json(res, 201, { providerReference: orderReference, checkoutUrl });
      }

      if (MODE !== 'senepay') return json(res, 503, { error: 'Mode de paiement inconnu.' });
      if (!APP_URL.startsWith('https://') || !API_URL.startsWith('https://')) {
        return json(res, 503, { error: 'APP_URL et PUBLIC_API_URL doivent être des adresses HTTPS pour les paiements réels.' });
      }

      const checkout = await senepay('/api/v1/checkout/sessions', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          currency: 'XOF',
          orderReference,
          description: body.planId === 'adhesion' ? 'Adhésion membre GRF CONSULTING' : 'Réponse rapide GRF CONSULTING',
          returnUrl: `${APP_URL}/paiement/confirmation?ref=${encodeURIComponent(orderReference)}`,
          cancelUrl: `${APP_URL}/paiement/echec`,
          webhookUrl: `${API_URL}/webhooks/senepay`,
          country: 'SN',
          metadata: { userId: body.userId, planId: body.planId, caseId: body.caseId || '' },
          expiresInMinutes: 30
        })
      });
      if (!checkout.sessionToken || !checkout.checkoutUrl || !checkout.checkoutUrl.startsWith('https://')) {
        return json(res, 502, { error: 'Réponse SenePay invalide : session ou URL de checkout absente.' });
      }
      localSession.providerSessionToken = checkout.sessionToken;
      sessions.set(orderReference, localSession);
      persistSessions();
      return json(res, 201, { providerReference: orderReference, checkoutUrl: checkout.checkoutUrl });
    }

    if (req.method === 'POST' && url.pathname === '/api/payments/dexpay/confirm') {
      const body = JSON.parse((await readRawBody(req)).toString('utf8') || '{}');
      const session = sessions.get(body.reference);
      if (!session) return json(res, 404, { error: 'Session de paiement introuvable.' });
      if (session.status === 'PAID') return json(res, 200, { paid: true, message: 'Paiement déjà confirmé.' });

      if (MODE === 'demo') {
        if (typeof body.phone !== 'string' || body.phone.replace(/\D/g, '').length < 9) {
          return json(res, 400, { error: 'Veuillez saisir un numéro de téléphone valide.' });
        }
        session.status = 'PAID';
        session.paidAt = new Date().toISOString();
        persistSessions();
        return json(res, 200, { paid: true, message: 'Paiement de démonstration confirmé.' });
      }
      if (MODE === 'dexpay') {
        if (session.status !== 'PAID') {
          const result = await dexpay(`/checkout-sessions/${encodeURIComponent(session.orderReference)}`);
          const remote = result.data && typeof result.data === 'object' ? result.data : result;
          const remoteStatus = String(remote.status || '').toLowerCase();
          if (remote.reference && remote.reference !== session.orderReference) {
            return json(res, 409, { paid: false, message: 'La référence renvoyée par DEXPAY ne correspond pas à cette commande.' });
          }
          if (Number(remote.amount) !== session.amount || remote.currency !== session.currency) {
            return json(res, 409, { paid: false, message: 'Le montant ou la devise de la session DEXPAY ne correspond pas à la commande.' });
          }
          if (remoteStatus !== 'completed') {
            if (remoteStatus === 'failed') session.status = 'FAILED';
            if (remoteStatus === 'cancelled') session.status = 'CANCELLED';
            persistSessions();
            return json(res, 409, { paid: false, message: `Paiement DEXPAY non confirmé (statut : ${remoteStatus || 'inconnu'}).` });
          }
          session.status = 'PAID';
          session.paidAt = remote.completed_at || remote.updatedAt || new Date().toISOString();
          session.transactionId = remote.transaction_id;
          persistSessions();
        }
        return json(res, 200, { paid: true, message: 'Paiement confirmé par DEXPAY.' });
      }
      if (MODE !== 'senepay' || !session.providerSessionToken) return json(res, 503, { error: 'La session ne peut pas être vérifiée.' });

      const remote = await senepay(`/api/v1/checkout/sessions/${encodeURIComponent(session.providerSessionToken)}`);
      if (remote.orderReference !== session.orderReference || remote.amount !== session.amount || remote.currency !== session.currency) {
        return json(res, 409, { error: 'Les informations confirmées ne correspondent pas à la commande.' });
      }
      if (remote.status !== 'Complete') {
        return json(res, 409, { paid: false, message: `Paiement non terminé (statut : ${remote.status || 'inconnu'}).` });
      }
      session.status = 'PAID';
      session.paidAt = remote.completedAt || new Date().toISOString();
      session.transactionId = remote.payment?.transactionId;
      persistSessions();
      return json(res, 200, { paid: true, message: 'Paiement confirmé par SenePay.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/webhooks/senepay') {
      const raw = await readRawBody(req);
      const signature = req.headers['x-senepay-signature'];
      const webhookSecret = process.env.SENEPAY_WEBHOOK_SECRET;
      if (!webhookSecret || typeof signature !== 'string') return json(res, 401, { error: 'Signature webhook absente.' });
      const expected = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');
      const expectedBuffer = Buffer.from(expected, 'hex');
      const providedBuffer = Buffer.from(signature, 'hex');
      if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
        return json(res, 401, { error: 'Signature webhook invalide.' });
      }

      const event = JSON.parse(raw.toString('utf8'));
      const session = sessions.get(event.orderReference);
      if (session && event.status === 'Complete' && event.amount === session.amount && event.currency === session.currency) {
        session.status = 'PAID';
        session.paidAt = event.timestamp || new Date().toISOString();
        session.transactionId = event.transactionId;
        persistSessions();
      } else if (session && event.status === 'Failed') {
        session.status = 'FAILED';
        persistSessions();
      }
      return json(res, 200, { received: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/webhooks/dexpay') {
      const raw = await readRawBody(req);
      const signature = req.headers['x-webhook-signature'];
      let config;
      try { config = dexpPayConfig(); } catch { return json(res, 503, { error: 'Configuration webhook DEXPAY manquante.' }); }
      if (!config.apiSecret) return json(res, 503, { error: 'Ajoutez DEXPAY_API_SECRET dans .env pour vérifier les webhooks.' });
      if (typeof signature !== 'string') return json(res, 401, { error: 'Signature webhook absente.' });
      const expected = crypto.createHmac('sha256', config.apiSecret).update(raw).digest('hex');
      const cleanSignature = signature.replace(/^sha256=/i, '').trim();
      const expectedBuffer = Buffer.from(expected, 'hex');
      const providedBuffer = Buffer.from(cleanSignature, 'hex');
      if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
        return json(res, 401, { error: 'Signature webhook invalide.' });
      }
      const event = JSON.parse(raw.toString('utf8'));
      const eventName = event.event || event.type;
      const eventData = event.data || event.payload || event;
      const reference = findValue(eventData, ['reference', 'merchant_reference', 'merchantReference']);
      const session = reference && sessions.get(reference);
      if (!session) return json(res, 200, { received: true });
      if (eventName === 'checkout.completed') {
        session.status = 'PAID';
        session.paidAt = new Date().toISOString();
      } else if (eventName === 'checkout.failed') {
        session.status = 'FAILED';
      } else if (eventName === 'checkout.cancelled') {
        session.status = 'CANCELLED';
      }
      persistSessions();
      return json(res, 200, { received: true });
    }

    return json(res, 404, { error: 'Route introuvable.' });
  } catch (error) {
    if (error instanceof SyntaxError) return json(res, 400, { error: 'Corps JSON invalide.' });
    console.error('Payment API error:', error.message);
    return json(res, error.status || 500, { error: error.message || 'Erreur interne de la passerelle de paiement.' });
  }
});

server.listen(PORT, () => console.log(`GRF payment API listening on http://localhost:${PORT} (${MODE})`));
