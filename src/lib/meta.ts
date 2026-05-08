const DEFAULT_PIXEL_ID = '1438737224689672';
const pixelId = import.meta.env.VITE_META_PIXEL_ID || DEFAULT_PIXEL_ID;
const capiEndpoint = import.meta.env.VITE_META_CAPI_ENDPOINT || '/api/meta-capi';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

type LeadPayload = {
  contentName: string;
  fullName: string;
  phone: string;
  value: number;
  productType: 'veiculo' | 'imovel';
};

type CapiPayload = {
  eventName: 'PageView' | 'Lead';
  eventId: string;
  userData?: {
    fullName?: string;
    phone?: string;
    fbp?: string;
    fbc?: string;
  };
  customData?: Record<string, string | number>;
};

function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

function getFbc() {
  const currentFbc = getCookie('_fbc');
  if (currentFbc) return currentFbc;

  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (!fbclid) return undefined;

  return `fb.1.${Date.now()}.${fbclid}`;
}

function createEventId(eventName: string) {
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${eventName}-${id}`;
}

function sendCapiEvent({ eventName, eventId, userData = {}, customData = {} }: CapiPayload) {
  fetch(capiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      userData: {
        ...userData,
        fbp: getCookie('_fbp'),
        fbc: getFbc(),
      },
      customData,
    }),
  }).catch(() => {
    // Pixel already fired; CAPI may be unavailable on static hosting.
  });
}

export function initMetaPixel() {
  if (!pixelId || window.fbq) return;

  const fbq = function (...args: unknown[]) {
    (fbq as any).callMethod
      ? (fbq as any).callMethod(...args)
      : (fbq as any).queue.push(args);
  };

  if (!window._fbq) window._fbq = fbq;
  (fbq as any).push = fbq;
  (fbq as any).loaded = true;
  (fbq as any).version = '2.0';
  (fbq as any).queue = [];
  window.fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', pixelId);
}

export function trackPageView() {
  const eventId = createEventId('PageView');

  window.fbq?.('track', 'PageView', {}, { eventID: eventId });
  sendCapiEvent({
    eventName: 'PageView',
    eventId,
  });
}

export function trackLead(payload: LeadPayload) {
  const eventId = createEventId('Lead');
  const customData = {
    content_name: payload.contentName,
    content_category: payload.productType,
    value: payload.value,
    currency: 'BRL',
  };

  window.fbq?.('track', 'Lead', customData, { eventID: eventId });

  sendCapiEvent({
    eventName: 'Lead',
    eventId,
    userData: {
      fullName: payload.fullName,
      phone: payload.phone,
    },
    customData,
  });
}
