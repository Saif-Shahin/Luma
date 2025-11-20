import { useEffect } from 'react';
import { exchangeAppleCode } from '../../utils/oauthService';

/**
 * Apple OAuth Callback Handler
 * This component handles the OAuth callback from Apple
 */
export default function AppleCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      // Apple uses form_post, so we need to check for POST data
      // In a real implementation, you'd handle this server-side
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        // Send error to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_error',
            provider: 'apple',
            error: error,
          }, window.location.origin);
        }
        window.close();
        return;
      }

      if (code) {
        try {
          // Exchange code for tokens (requires backend)
          const tokens = await exchangeAppleCode(code);

          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_success',
              provider: 'apple',
              tokens: tokens,
            }, window.location.origin);
          }

          window.close();
        } catch (err) {
          console.error('Error during Apple OAuth callback:', err);

          // Send error to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_error',
              provider: 'apple',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Apple Calendar connection...</p>
      </div>
    </div>
  );
}
