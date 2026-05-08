const ATTRIBUTION_STORAGE_KEY = 'averbai_attribution';

export type AttributionData = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  campaign_id: string;
  adset_id: string;
  ad_id: string;
  placement: string;
  site_source_name: string;
  referrer: string;
  landing_page: string;
};

const getParam = (params: URLSearchParams, key: string) => params.get(key) || '';

export const captureAttribution = (): AttributionData => {
  const params = new URLSearchParams(window.location.search);
  const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
  let previous: Partial<AttributionData> = {};

  try {
    previous = stored ? JSON.parse(stored) as Partial<AttributionData> : {};
  } catch {
    previous = {};
  }

  const attribution: AttributionData = {
    utm_source: getParam(params, 'utm_source') || previous.utm_source || '',
    utm_medium: getParam(params, 'utm_medium') || previous.utm_medium || '',
    utm_campaign: getParam(params, 'utm_campaign') || previous.utm_campaign || '',
    utm_content: getParam(params, 'utm_content') || previous.utm_content || '',
    utm_term: getParam(params, 'utm_term') || previous.utm_term || '',
    fbclid: getParam(params, 'fbclid') || previous.fbclid || '',
    campaign_id: getParam(params, 'campaign_id') || getParam(params, 'utm_campaign_id') || previous.campaign_id || '',
    adset_id: getParam(params, 'adset_id') || getParam(params, 'utm_adset_id') || previous.adset_id || '',
    ad_id: getParam(params, 'ad_id') || getParam(params, 'utm_ad_id') || previous.ad_id || '',
    placement: getParam(params, 'placement') || previous.placement || '',
    site_source_name: getParam(params, 'site_source_name') || previous.site_source_name || '',
    referrer: previous.referrer || document.referrer || '',
    landing_page: previous.landing_page || window.location.href,
  };

  localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  return attribution;
};

export const getTrafficSourceLabel = (lead: Partial<AttributionData>) => {
  const source = `${lead.utm_source || ''} ${lead.site_source_name || ''} ${lead.placement || ''}`.toLowerCase();

  if (source.includes('instagram') || source.includes('ig')) return 'Instagram';
  if (source.includes('facebook') || source.includes('fb')) return 'Facebook';
  if (lead.fbclid) return 'Meta Ads';
  if (lead.utm_source) return lead.utm_source;
  if (lead.referrer) return 'Referência';

  return 'Direto';
};
