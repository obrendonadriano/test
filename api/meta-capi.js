import crypto from 'node:crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || '1438737224689672';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

function normalize(value = '') {
  return String(value).trim().toLowerCase();
}

function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

function hash(value) {
  const normalized = normalize(value);
  if (!normalized) return undefined;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function hashPhone(value) {
  const digits = onlyDigits(value);
  if (!digits) return undefined;
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return crypto.createHash('sha256').update(withCountry).digest('hex');
}

function splitName(fullName = '') {
  const parts = normalize(fullName).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : undefined,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ACCESS_TOKEN) {
    return res.status(200).json({ skipped: true, reason: 'META_CAPI_ACCESS_TOKEN not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { eventName, eventId, eventSourceUrl, userData = {}, customData = {} } = body || {};
    const { firstName, lastName } = splitName(userData.fullName);

    const event = {
      event_name: eventName || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: {
        client_ip_address: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress,
        client_user_agent: req.headers['user-agent'],
        ph: hashPhone(userData.phone),
        fn: hash(firstName),
        ln: hash(lastName),
        external_id: hash(userData.cpf),
        fbp: userData.fbp,
        fbc: userData.fbc,
      },
      custom_data: customData,
    };

    Object.keys(event.user_data).forEach((key) => {
      if (!event.user_data[key]) delete event.user_data[key];
    });

    const payload = {
      data: [event],
      ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    };

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();
    return res.status(response.ok ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'CAPI error' });
  }
}
