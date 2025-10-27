import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

function TimeWidget() {
    const { state } = useApp();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date, is24Hour) => {
        if (is24Hour) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        } else {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const is24Hour = state.timeFormat === '24';

    return (
        <div className="text-white">
            <div className="text-6xl font-bold mb-2">
                {formatTime(currentTime, is24Hour)}
            </div>
            <div className="text-2xl text-gray-300">
                {formatDate(currentTime)}
            </div>
        </div>
    );
}

export default TimeWidget;