const axios = require('axios');

// Simple in-memory cache: city -> { data, fetchedAt }, valid for 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;
const weatherCache = new Map();

// Run one external API call with: ms timing log, one retry on failure.
// A 404 answer from the external API is final: do not retry it.
async function callExternalApi(config, label) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const startedAt = Date.now();
    try {
      const response = await axios.get(config.url, config);
      console.log(`${label} took ${Date.now() - startedAt}ms (attempt ${attempt})`);
      return response;
    } catch (error) {
      console.log(`${label} failed after ${Date.now() - startedAt}ms (attempt ${attempt}): ${error.code || error.message}`);

      if (error.response && error.response.status === 404) {
        throw error;
      }

      lastError = error;
    }
  }

  throw lastError;
}

async function getCoordinatesForCity(city) {
  const response = await callExternalApi({
    url: 'https://geocoding-api.open-meteo.com/v1/search',
    params: { name: city, count: 1 },
    timeout: 5000
  }, 'Geocoding API');

  const result = response.data.results && response.data.results[0];

  if (!result) {
    const err = new Error(`City "${city}" was not found`);
    err.status = 404;
    throw err;
  }

  return { latitude: result.latitude, longitude: result.longitude, resolvedName: result.name };
}

async function getCurrentWeather(city) {
  const cached = weatherCache.get(city);

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    const ageS = Math.round((Date.now() - cached.fetchedAt) / 1000);
    console.log(`[cache] HIT for "${city}" (${ageS}s old)`);
    return cached.data;
  }

  console.log(`[cache] MISS for "${city}" - fetching from Open-Meteo`);

  const { latitude, longitude, resolvedName } = await getCoordinatesForCity(city);

  const response = await callExternalApi({
    url: 'https://api.open-meteo.com/v1/forecast',
    params: { latitude, longitude, current_weather: true },
    timeout: 5000
  }, 'Forecast API');

  const current = response.data.current_weather;

  const weather = {
    city: resolvedName,
    temperatureC: current.temperature,
    windSpeedKmh: current.windspeed,
    observedAt: current.time
  };

  weatherCache.set(city, { data: weather, fetchedAt: Date.now() });

  return weather;
}

module.exports = { getCurrentWeather };
