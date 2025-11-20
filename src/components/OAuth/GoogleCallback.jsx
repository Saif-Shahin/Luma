import { useEffect } from 'react';
import { exchangeGoogleCode } from '../../utils/oauthService';

/**
 * Google OAuth Callback Handler
 * This component handles the OAuth callback from Google
 */
export default function GoogleCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        // Send error to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_error',
            provider: 'google',
            error: error,
          }, window.location.origin);
        }
        window.close();
        return;
      }

      if (code) {
        try {
          // Exchange code for tokens
          const tokens = await exchangeGoogleCode(code);

          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_success',
              provider: 'google',
              tokens: tokens,
            }, window.location.origin);
          }

          window.close();
        } catch (err) {
          console.error('Error during Google OAuth callback:', err);

          // Send error to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_error',
              provider: 'google',
              error: err.message,
            }, window.location.origin);
          }

          window.close();
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Google Calendar connection...</p>
      </div>
    </div>
  );
}
