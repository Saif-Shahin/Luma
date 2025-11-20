import React from 'react';
import { useApp } from '../../context/AppContext';
import { getWifiIcon, getSignalDescription, formatSecurity } from '../../utils/wifiService';

function WifiSettings() {
    const { state } = useApp();
    const { wifiScreen } = state;

    // Render different screens based on WiFi state
    switch (wifiScreen) {
        case 'network-list':
            return <NetworkList />;
        case 'password-entry':
            return <PasswordEntry />;
        case 'connecting':
            return <ConnectingScreen />;
        case 'success':
            return <SuccessScreen />;
        case 'error':
            return <ErrorScreen />;
        default:
            return <NetworkList />;
    }
}

// Network List Screen
function NetworkList() {
    const { state } = useApp();
    const { wifiNetworks, wifiSelectedNetworkIndex, wifiConnected, wifiSSID } = state;

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-8">
            <div className="max-w-3xl w-full">
                <h1 className="text-white text-4xl font-bold mb-6 text-center">WiFi Networks</h1>

                {/* Current Connection Status */}
                {wifiConnected && (
                    <div className="mb-6 p-4 bg-green-900/30 border-2 border-green-600 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-400 text-sm mb-1">Connected to</p>
                                <p className="text-white text-xl font-semibold">{wifiSSID}</p>
                            </div>
                            <span className="text-3xl">✓</span>
                        </div>
                    </div>
                )}

                <p className="text-gray-400 text-lg mb-6 text-center">
                    {wifiNetworks.length} networks found
                </p>

                {/* Network List */}
                <div className="space-y-3 max-h-[600px] overflow-hidden">
                    {wifiNetworks.slice(0, 6).map((network, index) => {
                        const isFocused = index === wifiSelectedNetworkIndex;
                        const isConnected = wifiConnected && network.ssid === wifiSSID;
                        const signalDesc = getSignalDescription(network.signalStrength);

                        return (
                            <div
                                key={`${network.ssid}-${index}`}
                                className={`p-5 rounded-xl border-2 transition-all ${
                                    isFocused
                                        ? 'bg-blue-600/30 border-blue-500 scale-105'
                                        : isConnected
                                            ? 'bg-green-900/20 border-green-600'
                                            : 'bg-gray-800/50 border-gray-700'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-white text-2xl font-semibold">
                                                {network.ssid}
                                            </p>
                                            {isConnected && (
                                                <span className="text-green-400 text-sm bg-green-900/50 px-2 py-1 rounded">
                                                    Connected
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                                            <span>
                                                {network.secured ? '🔒' : '🔓'} {formatSecurity(network.security)}
                                            </span>
                                            <span>• {network.frequency}</span>
                                            <span>• {signalDesc}</span>
                                        </div>
                                    </div>

                                    {/* Signal Strength Indicator */}
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-3xl">{getWifiIcon(network.signalStrength)}</span>
                                        <span className="text-gray-400 text-xs">
                                            {network.signalStrength}%
                                        </span>
                                    </div>

                                    {isFocused && !isConnected && (
                                        <span className="text-blue-400 text-3xl ml-4">→</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center text-gray-500 text-lg">
                    <p>Use ↑↓ to navigate • Press OK to connect • Press BACK to return</p>
                </div>
            </div>
        </div>
    );
}

// Password Entry Screen with On-Screen Keyboard
function PasswordEntry() {
    const { state } = useApp();
    const { wifiPassword, wifiPasswordCursorRow, wifiPasswordCursorCol, wifiNetworks, wifiSelectedNetworkIndex } = state;

    const selectedNetwork = wifiNetworks[wifiSelectedNetworkIndex];

    // Keyboard layout with numbers for WiFi passwords
    const keyboard = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '⌫'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?'],
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['SPACE', 'DONE'],
    ];

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-white text-4xl font-bold mb-4 text-center">Enter WiFi Password</h1>

                {selectedNetwork && (
                    <p className="text-gray-400 text-xl mb-8 text-center">
                        Connecting to <span className="text-white font-semibold">{selectedNetwork.ssid}</span>
                    </p>
                )}

                {/* Password Input Display */}
                <div className="bg-gray-800 rounded-xl p-5 mb-6 border-2 border-gray-700">
                    <div className="text-white text-2xl font-mono">
                        {wifiPassword ? (
                            // Show dots for password privacy
                            <span>{'•'.repeat(wifiPassword.length)}</span>
                        ) : (
                            <span className="text-gray-500">Enter password (min 8 characters)...</span>
                        )}
                        <span className="animate-pulse text-blue-400">|</span>
                    </div>
                    {wifiPassword.length > 0 && (
                        <p className="text-gray-400 text-sm mt-2">
                            {wifiPassword.length} characters
                            {wifiPassword.length < 8 && (
                                <span className="text-yellow-400 ml-2">
                                    (minimum 8 required)
                                </span>
                            )}
                        </p>
                    )}
                </div>

                {/* On-Screen Keyboard */}
                <div className="space-y-2">
                    {keyboard.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-2">
                            {row.map((key, colIndex) => {
                                const isFocused =
                                    wifiPasswordCursorRow === rowIndex &&
                                    (rowIndex === 4
                                        ? (key === 'SPACE' && wifiPasswordCursorCol === 0) ||
                                        (key === 'DONE' && wifiPasswordCursorCol === 1)
                                        : wifiPasswordCursorCol === colIndex);

                                const isSpaceKey = key === 'SPACE';
                                const isDoneKey = key === 'DONE';
                                const isBackspace = key === '⌫';
                                const isNumber = !isNaN(key);

                                // Disable DONE if password is too short
                                const isDoneDisabled = isDoneKey && wifiPassword.length < 8;

                                return (
                                    <div
                                        key={colIndex}
                                        className={`
                                            ${isSpaceKey ? 'flex-1 max-w-md' : isDoneKey ? 'w-32' : 'w-12'}
                                            h-12
                                            rounded-lg
                                            flex items-center justify-center
                                            font-semibold text-lg
                                            transition-all
                                            ${
                                            isFocused
                                                ? isDoneDisabled
                                                    ? 'bg-gray-600 text-gray-400 border-2 border-gray-500'
                                                    : 'bg-blue-600 text-white border-2 border-blue-400 scale-105'
                                                : isDoneKey
                                                    ? isDoneDisabled
                                                        ? 'bg-gray-700 text-gray-500 border-2 border-gray-600'
                                                        : 'bg-green-700 text-white border-2 border-green-600'
                                                    : isBackspace
                                                        ? 'bg-red-700 text-white border-2 border-red-600'
                                                        : isNumber
                                                            ? 'bg-purple-700 text-white border-2 border-purple-600'
                                                            : 'bg-gray-700 text-white border-2 border-gray-600'
                                        }
                                        `}
                                    >
                                        {key}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-center text-gray-500">
                    <p>Use ↑↓←→ to navigate • Press OK to select • Press BACK to cancel</p>
                </div>
            </div>
        </div>
    );
}

// Connecting Screen
function ConnectingScreen() {
    const { state } = useApp();
    const { wifiNetworks, wifiSelectedNetworkIndex } = state;
    const selectedNetwork = wifiNetworks[wifiSelectedNetworkIndex];

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition">
            <div className="text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <h1 className="text-white text-4xl font-bold mb-4">Connecting...</h1>
                {selectedNetwork && (
                    <p className="text-gray-400 text-2xl">
                        Connecting to <span className="text-white">{selectedNetwork.ssid}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

// Success Screen
function SuccessScreen() {
    const { state } = useApp();
    const { wifiSSID, wifiIPAddress } = state;

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-8">
            <div className="text-center max-w-2xl">
                <div className="mb-8">
                    <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-8xl">✓</span>
                    </div>
                </div>
                <h1 className="text-white text-5xl font-bold mb-6">Connected!</h1>
                <div className="bg-gray-800/50 rounded-2xl p-6 border-2 border-green-600 mb-8">
                    <p className="text-gray-400 text-lg mb-2">Network</p>
                    <p className="text-white text-3xl font-semibold mb-4">{wifiSSID}</p>
                    {wifiIPAddress && (
                        <>
                            <p className="text-gray-400 text-lg mb-2">IP Address</p>
                            <p className="text-green-400 text-xl font-mono">{wifiIPAddress}</p>
                        </>
                    )}
                </div>
                <p className="text-gray-500 text-lg">Press OK or BACK to return to settings</p>
            </div>
        </div>
    );
}

// Error Screen
function ErrorScreen() {
    const { state } = useApp();
    const { wifiErrorMessage, wifiNetworks, wifiSelectedNetworkIndex } = state;
    const selectedNetwork = wifiNetworks[wifiSelectedNetworkIndex];

    return (
        <div className="w-full h-full bg-black flex items-center justify-center screen-transition p-8">
            <div className="text-center max-w-2xl">
                <div className="mb-8">
                    <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-8xl">✕</span>
                    </div>
                </div>
                <h1 className="text-white text-5xl font-bold mb-6">Connection Failed</h1>
                {selectedNetwork && (
                    <p className="text-gray-400 text-xl mb-4">
                        Could not connect to <span className="text-white font-semibold">{selectedNetwork.ssid}</span>
                    </p>
                )}
                <div className="bg-red-900/20 border-2 border-red-600 rounded-xl p-6 mb-8">
                    <p className="text-red-400 text-lg">{wifiErrorMessage}</p>
                </div>
                <p className="text-gray-500 text-lg">Press OK or BACK to try again</p>
            </div>
        </div>
    );
}

export default WifiSettings;
