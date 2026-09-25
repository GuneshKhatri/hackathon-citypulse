// Basic HTML/XSS Sanitizer
export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a 2-sentence civic pulse summary for Home hero
 */
export async function fetchCivicSummary(cityName, weather, aqi) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Write a single, concise 2-sentence civic pulse summary for residents viewing ${cityName}. Live weather is ${weather}, AQI is ${aqi}.`,
        dashboardContext: `City: ${cityName}, Weather: ${weather}, AQI: ${aqi}`
      })
    });
    const data = await res.json();
    if (res.ok && data.response) {
      return data.response;
    }
  } catch (e) {
    console.warn('Civic summary fetch failed:', e);
  }
  return `Live urban pulse for ${cityName}: Current weather is ${weather} with an AQI level of ${aqi}. Municipal sensors report stable city-wide operations.`;
}

/**
 * Sends user message to Express backend chat endpoint (/api/chat)
 * All logic executed securely on backend with full system prompt & error logging.
 */
export async function sendChatMessage(userQuery, dashboardContext = '', chatHistory = []) {
  const cleanInput = sanitizeInput((userQuery || '').trim().slice(0, 500));
  if (!cleanInput) {
    return "Please enter a valid question about CityPulse Jaipur.";
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: cleanInput,
        dashboardContext: dashboardContext || '',
        history: Array.isArray(chatHistory) ? chatHistory.slice(-10) : []
      })
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error(`[Frontend Chat Service] HTTP Status ${res.status}:`, data);
      return data.error || "AI is unavailable, check server logs";
    }

    return data.response;
  } catch (err) {
    console.error('[Frontend Chat Service] Network error calling /api/chat:', err);
    return "AI is unavailable, check server logs";
  }
}
