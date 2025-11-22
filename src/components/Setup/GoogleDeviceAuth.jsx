import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Google Device Code Authentication Screen
 * Displays a code and QR code for TV-remote friendly authentication
 */
function GoogleDeviceAuth({ deviceCodeData, onSuccess, onError, onCancel }) {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [status, setStatus] = useState('waiting'); // 'waiting', 'success', 'error'

    useEffect(() => {
        if (!deviceCodeData) return;

        // Calculate time remaining
        const expiresAt = Date.now() + (deviceCodeData.expiresIn * 1000);

        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setTimeRemaining(remaining);

            if (remaining === 0) {
                clearInterval(timer);
                setStatus('error');
                if (onError) {
                    onError(new Error('Code expired. Please try again.'));
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [deviceCodeData, onError]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!deviceCodeData) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-2xl">Preparing authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-4xl px-8">
                <h1 className="text-white text-5xl font-bold mb-6">
                    Connect Google Calendar
                </h1>

                {status === 'waiting' && (
                    <>
                        <p className="text-gray-300 text-2xl mb-8">
                            Scan the QR code or visit the URL below on your phone
                        </p>

                        {/* QR Code */}
                        <div className="mb-8 flex justify-center">
                            <div className="bg-white p-8 rounded-3xl shadow-2xl">
                                <QRCodeSVG
                                    value={deviceCodeData.verificationUrlComplete || deviceCodeData.verificationUrl}
                                    size={280}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        {/* User Code Display */}
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 shadow-xl">
                                <p className="text-blue-100 text-xl mb-2">Enter this code:</p>
                                <p className="text-white text-6xl font-mono font-bold tracking-wider">
                                    {deviceCodeData.userCode}
                                </p>
                            </div>
                        </div>

                        {/* URL Display */}
                        <div className="mb-6">
                            <p className="text-gray-400 text-lg mb-2">Or visit:</p>
                            <p className="text-blue-400 text-3xl font-semibold">
                                {deviceCodeData.verificationUrl}
                            </p>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex items-center justify-center gap-8 mb-8">
                            {/* Animated Waiting Indicator */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                                </div>
                                <span className="text-gray-300 text-lg">Waiting for authorization</span>
                            </div>

                            {/* Time Remaining */}
                            {timeRemaining !== null && (
                                <div className="text-gray-400 text-lg">
                                    <span className="font-mono">{formatTime(timeRemaining)}</span> remaining
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-white text-xl font-semibold mb-3">Instructions:</h3>
                            <ol className="text-gray-300 text-lg space-y-2 text-left max-w-2xl mx-auto">
                                <li>1. Scan the QR code with your phone camera</li>
                                <li>2. Or visit <span className="text-blue-400">{deviceCodeData.verificationUrl}</span></li>
                                <li>3. Enter the code: <span className="font-mono font-bold text-white">{deviceCodeData.userCode}</span></li>
                                <li>4. Sign in with your Google account</li>
                                <li>5. Grant calendar access permissions</li>
                            </ol>
                        </div>

                        {/* Cancel Button Hint */}
                        <div className="mt-8 text-gray-500 text-lg">
                            <p>Press BACK (hold |◀◀ for 2 seconds) to cancel</p>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-white text-4xl font-bold mb-4">Successfully Connected!</h2>
                        <p className="text-gray-300 text-2xl">Your Google Calendar is now synced</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-white text-4xl font-bold mb-4">Connection Failed</h2>
                        <p className="text-gray-300 text-2xl mb-6">Please try again</p>
                        <div className="text-gray-500 text-lg">
                            <p>Press BACK to return</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GoogleDeviceAuth;