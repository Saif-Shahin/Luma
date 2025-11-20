/**
 * OAuth Service
 * Handles OAuth authentication flows for Google and Apple Calendar
 */

// Token storage keys
const TOKEN_KEYS = {
  GOOGLE_ACCESS_TOKEN: 'luma_google_access_token',
  GOOGLE_REFRESH_TOKEN: 'luma_google_refresh_token',
  GOOGLE_TOKEN_EXPIRY: 'luma_google_token_expiry',
  APPLE_ACCESS_TOKEN: 'luma_apple_access_token',
  APPLE_REFRESH_TOKEN: 'luma_apple_refresh_token',
  APPLE_TOKEN_EXPIRY: 'luma_apple_token_expiry',
};

/**
 * Store tokens in localStorage
 */
export function storeTokens(provider, tokens) {
  const prefix = provider === 'google' ? 'GOOGLE' : 'APPLE';

  if (tokens.access_token) {
    localStorage.setItem(TOKEN_KEYS[`${prefix}_ACCESS_TOKEN`], tokens.access_token);
  }

  if (tokens.refresh_token) {
    localStorage.setItem(TOKEN_KEYS[`${prefix}_REFRESH_TOKEN`], tokens.refresh_token);
  }

  if (tokens.expires_in) {
    const expiryTime = Date.now() + (tokens.expires_in * 1000);
    localStorage.setItem(TOKEN_KEYS[`${prefix}_TOKEN_EXPIRY`], expiryTime.toString());
  }
}

/**
 * Retrieve tokens from localStorage
 */
export function getTokens(provider) {
  const prefix = provider === 'google' ? 'GOOGLE' : 'APPLE';

  return {
    accessToken: localStorage.getItem(TOKEN_KEYS[`${prefix}_ACCESS_TOKEN`]),
    refreshToken: localStorage.getItem(TOKEN_KEYS[`${prefix}_REFRESH_TOKEN`]),
    expiryTime: localStorage.getItem(TOKEN_KEYS[`${prefix}_TOKEN_EXPIRY`]),
  };
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens(provider) {
  const prefix = provider === 'google' ? 'GOOGLE' : 'APPLE';

  localStorage.removeItem(TOKEN_KEYS[`${prefix}_ACCESS_TOKEN`]);
  localStorage.removeItem(TOKEN_KEYS[`${prefix}_REFRESH_TOKEN`]);
  localStorage.removeItem(TOKEN_KEYS[`${prefix}_TOKEN_EXPIRY`]);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(provider) {
  const { expiryTime } = getTokens(provider);

  if (!expiryTime) return true;

  // Add 5-minute buffer for token refresh
  return Date.now() >= (parseInt(expiryTime) - 300000);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(provider) {
  const { accessToken } = getTokens(provider);
  return accessToken && !isTokenExpired(provider);
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
    storeTokens('google', tokens);

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
  const { refreshToken } = getTokens('google');
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
    storeTokens('google', tokens);

    return tokens;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    throw error;
  }
}

// ============================================================================
// APPLE CALENDAR OAUTH
// ============================================================================

/**
 * Initiate Apple OAuth flow
 * Note: Apple uses Sign in with Apple which requires Apple Developer account
 */
export function initiateAppleAuth() {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_APPLE_REDIRECT_URI;

  if (!clientId) {
    console.error('Apple Client ID not configured');
    return null;
  }

  const scope = 'name email';
  const responseType = 'code';
  const responseMode = 'form_post';

  const authUrl = `https://appleid.apple.com/auth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=${responseType}` +
    `&response_mode=${responseMode}` +
    `&scope=${encodeURIComponent(scope)}`;

  return authUrl;
}

/**
 * Exchange Apple authorization code for tokens
 * Note: This requires server-side implementation due to client secret requirements
 */
export async function exchangeAppleCode(code) {
  // Apple OAuth requires server-side token exchange due to client secret
  // This is a placeholder for the client-side portion
  // You'll need to implement a backend endpoint to handle this

  try {
    // Call your backend endpoint
    const response = await fetch('/api/auth/apple/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    storeTokens('apple', tokens);

    return tokens;
  } catch (error) {
    console.error('Error exchanging Apple code:', error);
    throw error;
  }
}

/**
 * Refresh Apple access token
 */
export async function refreshAppleToken() {
  const { refreshToken } = getTokens('apple');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // Call your backend endpoint
    const response = await fetch('/api/auth/apple/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    storeTokens('apple', tokens);

    return tokens;
  } catch (error) {
    console.error('Error refreshing Apple token:', error);
    throw error;
  }
}

// ============================================================================
// OAUTH POPUP HANDLER
// ============================================================================

/**
 * Open OAuth popup and handle callback
 */
export function openOAuthPopup(url, provider) {
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
      `${provider}_oauth`,
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

      if (event.data.type === 'oauth_success' && event.data.provider === provider) {
        clearInterval(checkPopup);
        window.removeEventListener('message', handleMessage);

        if (popup && !popup.closed) {
          popup.close();
        }

        resolve(event.data.tokens);
      } else if (event.data.type === 'oauth_error' && event.data.provider === provider) {
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
