import React from 'react';
import { useApp } from '../../context/AppContext';

function OnScreenKeyboard({ onComplete }) {
    const { state } = useApp();
    const { keyboardCursorRow, keyboardCursorCol, keyboardInput } = state;

    // Keyboard layout
    const keyboard = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '⌫'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?'],
        ['SPACE', 'DONE'],
    ];

    const getCurrentKey = () => {
        if (keyboardCursorRow === 3) {
            // Special row
            return keyboardCursorCol === 0 ? 'SPACE' : 'DONE';
        }
        return keyboard[keyboardCursorRow][keyboardCursorCol];
    };

    return (
        <div className="w-full max-w-3xl">
            {/* Input Display */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6 border-2 border-gray-700">
                <div className="text-white text-2xl font-mono">
                    {keyboardInput || <span className="text-gray-500">Type city name...</span>}
                    <span className="animate-pulse">|</span>
                </div>
            </div>

            {/* Keyboard */}
            <div className="space-y-3">
                {keyboard.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2">
                        {row.map((key, colIndex) => {
                            const isFocused =
                                keyboardCursorRow === rowIndex &&
                                (rowIndex === 3
                                    ? (key === 'SPACE' && keyboardCursorCol === 0) ||
                                    (key === 'DONE' && keyboardCursorCol === 1)
                                    : keyboardCursorCol === colIndex);

                            const isSpaceKey = key === 'SPACE';
                            const isDoneKey = key === 'DONE';
                            const isBackspace = key === '⌫';

                            return (
                                <div
                                    key={colIndex}
                                    className={`
                    ${isSpaceKey ? 'flex-1 max-w-md' : isDoneKey ? 'w-32' : 'w-14'}
                    h-14
                    rounded-lg
                    flex items-center justify-center
                    font-semibold text-lg
                    transition-all
                    ${
                                        isFocused
                                            ? 'bg-blue-600 text-white border-2 border-blue-400 scale-105'
                                            : isDoneKey
                                                ? 'bg-green-700 text-white border-2 border-green-600'
                                                : isBackspace
                                                    ? 'bg-red-700 text-white border-2 border-red-600'
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

            <div className="mt-6 text-center text-gray-400 text-lg">
                Use ▲▼⏮⏭ to navigate • Press ⏯ to select key
            </div>
        </div>
    );
}

export default OnScreenKeyboard;