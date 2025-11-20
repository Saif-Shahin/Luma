/**
 * Google OAuth Device Code Flow
 * Handles TV-remote friendly authentication using device codes
 *
 * This flow is used by YouTube, Netflix, and other smart TV apps
 * Users authenticate on their phone/computer instead of the TV
 */

import { storeTokens } from './oauthService';

/**
 * Initiate device code flow
 * Returns device code, user code, and verification URL
 */
export async function initiateDeviceCodeFlow() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const scope = 'https://www.googleapis.com/auth/calendar.readonly';

    if (!clientId) {
        throw new Error('Google Client ID not configured');
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/device/code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                scope: scope,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || 'Failed to initiate device code flow');
        }

        const data = await response.json();

        /**
         * Response contains:
         * - device_code: Used for polling token endpoint
         * - user_code: Code user enters on their phone (e.g., "ABCD-1234")
         * - verification_url: URL user visits (e.g., "google.com/device")
         * - expires_in: How long the codes are valid (usually 1800 seconds)
         * - interval: How often to poll (usually 5 seconds)
         */
        return {
            deviceCode: data.device_code,
            userCode: data.user_code,
            verificationUrl: data.verification_url,
            verificationUrlComplete: data.verification_url_complete, // URL with code pre-filled
            expiresIn: data.expires_in,
            interval: data.interval || 5, // Default to 5 seconds if not provided
        };
    } catch (error) {
        console.error('Error initiating device code flow:', error);
        throw error;
    }
}

/**
 * Poll for device code authorization
 * Checks if user has completed authorization on their device
 */
export async function pollForAuthorization(deviceCode, interval = 5) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
    }

    return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        device_code: deviceCode,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Success! User has authorized
                    clearInterval(pollInterval);
                    storeTokens(data);
                    resolve(data);
                } else if (data.error === 'authorization_pending') {
                    // User hasn't authorized yet, keep polling
                    console.log('Waiting for user authorization...');
                } else if (data.error === 'slow_down') {
                    // We're polling too fast, increase interval
                    console.warn('Polling too fast, slowing down...');
                    clearInterval(pollInterval);
                    // Restart with longer interval
                    setTimeout(() => {
                        pollForAuthorization(deviceCode, interval + 5)
                            .then(resolve)
                            .catch(reject);
                    }, (interval + 5) * 1000);
                } else if (data.error === 'expired_token') {
                    // Device code has expired
                    clearInterval(pollInterval);
                    reject(new Error('Device code expired. Please try again.'));
                } else if (data.error === 'access_denied') {
                    // User denied access
                    clearInterval(pollInterval);
                    reject(new Error('User denied access'));
                } else {
                    // Unknown error
                    clearInterval(pollInterval);
                    reject(new Error(data.error_description || 'Authorization failed'));
                }
            } catch (error) {
                clearInterval(pollInterval);
                reject(error);
            }
        }, interval * 1000);

        // Stop polling after 30 minutes (device codes usually expire after 30 mins)
        setTimeout(() => {
            clearInterval(pollInterval);
            reject(new Error('Authorization timeout. Please try again.'));
        }, 30 * 60 * 1000);
    });
}

/**
 * Start device code authorization flow
 * This is the main function to use for TV remote authentication
 *
 * @param {Function} onCodeReady - Callback when device code is ready to display
 * @returns {Promise} Resolves when user completes authorization
 */
export async function authenticateWithDeviceCode(onCodeReady) {
    try {
        // Step 1: Get device code and user code
        const codeData = await initiateDeviceCodeFlow();

        // Step 2: Display code to user (via callback)
        if (onCodeReady) {
            onCodeReady(codeData);
        }

        // Step 3: Poll for authorization
        const tokens = await pollForAuthorization(codeData.deviceCode, codeData.interval);

        return {
            success: true,
            tokens,
        };
    } catch (error) {
        console.error('Device code authentication failed:', error);
        throw error;
    }
}
