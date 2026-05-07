const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function setConsentCookie(name: string, value = 'accepted') {
  document.cookie = `${name}=${value}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax`;
}

export function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

export function saveContactConsent() {
  const acceptedAt = new Date().toISOString();
  setConsentCookie('averbai_contact_consent');
  localStorage.setItem('averbai_contact_consent', acceptedAt);
  return acceptedAt;
}
