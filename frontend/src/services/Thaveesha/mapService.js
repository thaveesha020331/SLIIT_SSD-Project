/**
 * Map / Geocoding – Thaveesha
 * Uses OpenStreetMap Nominatim (free, no API key). Be nice: 1 request per second, set User-Agent.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'EcoMart-App/1.0 (Order & Cart)';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Convert lat/lng to address (reverse geocoding).
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>} formatted address
 */
export async function reverseGeocode(lat, lng) {
  await delay(1100); // Nominatim policy: max 1 req/sec
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
  });
  const res = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error('Address lookup failed');
  const data = await res.json();
  const a = data.address || {};
  const parts = [
    a.road,
    a.suburb || a.neighbourhood,
    a.city || a.town || a.village,
    a.state,
    a.postcode,
    a.country,
  ].filter(Boolean);
  return parts.join(', ') || data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Convert address string to lat/lng (geocoding).
 * @param {string} address
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function geocodeAddress(address) {
  if (!address || !address.trim()) return null;
  await delay(1100);
  const params = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
  });
  const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data[0]) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}
