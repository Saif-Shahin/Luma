import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

function SetupComplete() {
    const { updateState } = useApp();

    useEffect(() => {
        // Auto-transition to mirror display after 3 seconds
        const timer = setTimeout(() => {
            updateState({
                setupComplete: true,
                currentScreen: 'mirror',
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [updateState]);

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center max-w-2xl">
                <div className="mb-8">
                    <div className="inline-block w-32 h-32 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-white text-6xl font-bold mb-6">Setup Complete!</h1>
                <p className="text-gray-300 text-2xl mb-12">
                    Your smart mirror is ready to use
                </p>

                <div className="bg-gray-800/50 rounded-2xl p-8 border-2 border-gray-700">
                    <p className="text-gray-400 text-xl mb-4">
                        To access settings later, navigate to the
                    </p>
                    <div className="inline-flex items-center gap-3 bg-gray-700 px-6 py-3 rounded-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-2xl font-semibold">Settings Icon</span>
                    </div>
                    <p className="text-gray-400 text-lg mt-4">
                        in the bottom-left corner using your remote
                    </p>
                </div>

                <div className="mt-8">
                    <div className="inline-block">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-500 text-lg mt-4">Starting your mirror...</p>
                </div>
            </div>
        </div>
    );
}

export default SetupComplete;