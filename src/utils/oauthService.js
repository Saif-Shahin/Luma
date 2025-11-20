/**
 * OAuth Service
 * Handles OAuth authentication flows for Google Calendar
 */

// Token storage keys
const TOKEN_KEYS = {
  GOOGLE_ACCESS_TOKEN: 'luma_google_access_token',
  GOOGLE_REFRESH_TOKEN: 'luma_google_refresh_token',
  GOOGLE_TOKEN_EXPIRY: 'luma_google_token_expiry',
};

/**
 * Store tokens in localStorage
 */
export function storeTokens(tokens) {
  if (tokens.access_token) {
    localStorage.setItem(TOKEN_KEYS.GOOGLE_ACCESS_TOKEN, tokens.access_token);
  }

  if (tokens.refresh_token) {
    localStorage.setItem(TOKEN_KEYS.GOOGLE_REFRESH_TOKEN, tokens.refresh_token);
  }

  if (tokens.expires_in) {
    const expiryTime = Date.now() + (tokens.expires_in * 1000);
    localStorage.setItem(TOKEN_KEYS.GOOGLE_TOKEN_EXPIRY, expiryTime.toString());
  }
}

/**
 * Retrieve tokens from localStorage
 */
export function getTokens() {
  return {
    accessToken: localStorage.getItem(TOKEN_KEYS.GOOGLE_ACCESS_TOKEN),
    refreshToken: localStorage.getItem(TOKEN_KEYS.GOOGLE_REFRESH_TOKEN),
    expiryTime: localStorage.getItem(TOKEN_KEYS.GOOGLE_TOKEN_EXPIRY),
  };
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.GOOGLE_ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.GOOGLE_REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.GOOGLE_TOKEN_EXPIRY);
}

/**
 * Check if token is expired
 */
export function isTokenExpired() {
  const { expiryTime } = getTokens();

  if (!expiryTime) return true;

  // Add 5-minute buffer for token refresh
  return Date.now() >= (parseInt(expiryTime) - 300000);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  const { accessToken } = getTokens();
  return accessToken && !isTokenExpired();
}

// ============================================================================
// GOOGLE CALENDAR OAUTH
// ============================================================================

/**
 * Initiate Google OAuth flow
 */
export function initiateGoogleAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  if (!clientId) {
    console.error('Google Client ID not configured');
    return null;
  }

  const scope = 'https://www.googleapis.com/auth/calendar.readonly';
  const responseType = 'code';
  const accessType = 'offline';
  const prompt = 'consent';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=${responseType}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=${accessType}` +
    `&prompt=${prompt}`;

  return authUrl;
}

/**
 * Exchange Google authorization code for tokens
 */
export async function exchangeGoogleCode(code) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    storeTokens(tokens);

    return tokens;
  } catch (error) {
    console.error('Error exchanging Google code:', error);
    throw error;
  }
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken() {
  const { refreshToken } = getTokens();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    storeTokens(tokens);

    return tokens;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    throw error;
  }
}

// ============================================================================
// OAUTH POPUP HANDLER
// ============================================================================

/**
 * Open OAuth popup and handle callback
 */
export function openOAuthPopup(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('OAuth URL not configured'));
      return;
    }

    // Open popup window
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'google_oauth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    if (!popup) {
      reject(new Error('Failed to open popup. Please allow popups for this site.'));
      return;
    }

    // Check for popup closure
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        reject(new Error('OAuth popup was closed'));
      }
    }, 1000);

    // Listen for OAuth callback
    const handleMessage = (event) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'oauth_success' && event.data.provider === 'google') {
        clearInterval(checkPopup);
        window.removeEventListener('message', handleMessage);

        if (popup && !popup.closed) {
          popup.close();
        }

        resolve(event.data.tokens);
      } else if (event.data.type === 'oauth_error' && event.data.provider === 'google') {
        clearInterval(checkPopup);
        window.removeEventListener('message', handleMessage);

        if (popup && !popup.closed) {
          popup.close();
        }

        reject(new Error(event.data.error || 'OAuth failed'));
      }
    };

    window.addEventListener('message', handleMessage);
  });
}
