import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

function Welcome() {
    const { nextSetupStep } = useApp();

    useEffect(() => {
        // Auto-advance to remote calibration after 3 seconds
        const timer = setTimeout(() => {
            nextSetupStep();
        }, 3000);

        return () => clearTimeout(timer);
    }, [nextSetupStep]);

    return (
        <div className="w-full h-full flex items-center justify-center screen-transition">
            <div className="text-center">
                <h1 className="text-white text-6xl font-bold mb-4">Welcome</h1>
                <p className="text-gray-300 text-2xl">Smart Mirror Setup</p>
                <div className="mt-8">
                    <div className="inline-block">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Welcome;