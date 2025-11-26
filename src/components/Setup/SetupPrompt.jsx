import React from 'react';
import { useApp } from '../../context/AppContext';

function SetupPrompt() {
    const { state, updateState } = useApp();
    const { currentFocus } = state;

    // Default to 'yes' if no focus set
    const selectedOption = currentFocus || 'yes';

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <h1 className="text-white text-5xl font-bold mb-8">Setup Your Mirror</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Would you like to setup your mirror now?
                </p>

                <div className="flex gap-6 justify-center">
                    {/* Yes Option */}
                    <div
                        className={`bg-gray-800/50 rounded-2xl p-8 border-2 transition-all cursor-pointer ${
                            selectedOption === 'yes'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-700'
                        }`}
                    >
                        <p className="text-white text-3xl font-semibold mb-2">Yes</p>
                        <p className="text-gray-400 text-sm">Set up now</p>
                    </div>

                    {/* Later Option */}
                    <div
                        className={`bg-gray-800/50 rounded-2xl p-8 border-2 transition-all cursor-pointer ${
                            selectedOption === 'later'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-700'
                        }`}
                    >
                        <p className="text-white text-3xl font-semibold mb-2">Later</p>
                        <p className="text-gray-400 text-sm">Skip for now</p>
                    </div>
                </div>

                <div className="mt-12 text-gray-500">
                    <p className="text-lg">Use ⏮ ⏭ to select, press ⏯ to continue</p>
                </div>
            </div>
        </div>
    );
}

export default SetupPrompt;