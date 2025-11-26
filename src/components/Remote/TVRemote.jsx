import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import RemoteButton from './RemoteButton';

function TVRemote() {
    const [activeButton, setActiveButton] = useState(null);
    const { handleRemoteAction } = useApp();

    const handleButtonPress = (buttonName) => {
        setActiveButton(buttonName);
        console.log(`Button pressed: ${buttonName}`);

        // Call the context handler
        handleRemoteAction(buttonName);

        // Reset active state after animation
        setTimeout(() => {
            setActiveButton(null);
        }, 100);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-xs border-2 border-gray-700">
                {/* Remote Title */}
                <div className="text-center mb-8">
                    <h2 className="text-white text-xl font-bold">TV Remote</h2>
                    <p className="text-gray-400 text-xs mt-1">Smart Mirror Control</p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs">IR Remote Ready</span>
                    </div>
                </div>

                {/* Power Button */}
                <div className="mb-6">
                    <RemoteButton
                        label="POWER"
                        onClick={() => handleButtonPress('POWER')}
                        isActive={activeButton === 'POWER'}
                        variant="power"
                        className="w-full"
                    />
                </div>

                {/* Directional Pad */}
                <div className="mb-6">
                    <div className="grid grid-cols-3 gap-2">
                        <div></div>
                        <RemoteButton
                            label="▲"
                            onClick={() => handleButtonPress('UP')}
                            isActive={activeButton === 'UP'}
                            variant="direction"
                        />
                        <div></div>

                        <RemoteButton
                            label="⏮"
                            onClick={() => handleButtonPress('LEFT')}
                            isActive={activeButton === 'LEFT'}
                            variant="direction"
                        />
                        <RemoteButton
                            label="OK"
                            onClick={() => handleButtonPress('OK')}
                            isActive={activeButton === 'OK'}
                            variant="ok"
                        />
                        <RemoteButton
                            label="⏭"
                            onClick={() => handleButtonPress('RIGHT')}
                            isActive={activeButton === 'RIGHT'}
                            variant="direction"
                        />

                        <div></div>
                        <RemoteButton
                            label="▼"
                            onClick={() => handleButtonPress('DOWN')}
                            isActive={activeButton === 'DOWN'}
                            variant="direction"
                        />
                        <div></div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mb-6">
                    <RemoteButton
                        label="BACK"
                        onClick={() => handleButtonPress('BACK')}
                        isActive={activeButton === 'BACK'}
                        variant="secondary"
                        className="w-full"
                    />
                </div>

                {/* Channel Controls */}
                <div className="mb-6">
                    <p className="text-gray-400 text-xs text-center mb-3">CHANNEL</p>
                    <div className="flex gap-3">
                        <RemoteButton
                            label="CH−"
                            onClick={() => handleButtonPress('CHANNEL_DOWN')}
                            isActive={activeButton === 'CHANNEL_DOWN'}
                            variant="secondary"
                            className="flex-1"
                        />
                        <RemoteButton
                            label="CH+"
                            onClick={() => handleButtonPress('CHANNEL_UP')}
                            isActive={activeButton === 'CHANNEL_UP'}
                            variant="secondary"
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Brightness Controls */}
                <div className="border-t border-gray-700 pt-6">
                    <p className="text-gray-400 text-xs text-center mb-3">BRIGHTNESS</p>
                    <div className="flex gap-3">
                        <RemoteButton
                            label="−"
                            onClick={() => handleButtonPress('BRIGHTNESS_DOWN')}
                            isActive={activeButton === 'BRIGHTNESS_DOWN'}
                            variant="brightness"
                            className="flex-1"
                        />
                        <RemoteButton
                            label="+"
                            onClick={() => handleButtonPress('BRIGHTNESS_UP')}
                            isActive={activeButton === 'BRIGHTNESS_UP'}
                            variant="brightness"
                            className="flex-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TVRemote;