import React from 'react';

function RemoteButton({ label, onClick, isActive, variant = 'default', className = '' }) {
    const baseClasses = 'font-semibold rounded-lg transition-all duration-100 active:scale-95 select-none';

    const variantClasses = {
        power: 'bg-red-600 hover:bg-red-700 text-white py-3 text-lg',
        direction: 'bg-gray-700 hover:bg-gray-600 text-white py-4 text-2xl',
        ok: 'bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-bold',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-white py-3',
        brightness: 'bg-gray-700 hover:bg-gray-600 text-white py-3 text-2xl',
        default: 'bg-gray-700 hover:bg-gray-600 text-white py-3',
    };

    const activeClasses = isActive ? 'scale-95 brightness-75' : '';

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${activeClasses} ${className}`}
        >
            {label}
        </button>
    );
}

export default RemoteButton;