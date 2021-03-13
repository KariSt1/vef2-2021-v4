/**
 * Fetches earthquake data of a certain type and period
 * from the proxy server.
 * @param {string} type Earthquake strength
 * @param {string} period Period of time when earthquakes happened
 * @returns Earthquake data or null if it didn't work
 */
export async function fetchEarthquakes(type, period) {
  const url = new URL(`/proxy?period=${period}&type=${type}`, window.location).href;
  let result;
  try {
    result = await fetch(url);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();
  return data;
}
