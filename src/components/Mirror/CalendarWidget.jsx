import React from 'react';
import { useApp } from '../../context/AppContext';

function CalendarWidget() {
    const { state } = useApp();

    // Mock calendar events (will be replaced with API)
    const mockEvents = [
        { title: 'Team meeting', time: '2:00 PM', type: 'event' },
        { title: 'Grocery shopping', type: 'todo' },
        { title: 'Dentist appointment', time: '4:30 PM', type: 'event' },
        { title: 'Call with client', time: '5:15 PM', type: 'event' },
    ];

    const events = state.calendarConnected ? mockEvents : [];

    if (!state.calendarConnected || events.length === 0) {
        return (
            <div className="text-white">
                <h3 className="text-2xl font-semibold mb-4">Calendar</h3>
                <p className="text-gray-400 text-lg">No events today</p>
            </div>
        );
    }

    return (
        <div className="text-white">
            <h3 className="text-2xl font-semibold mb-4">Today's Schedule</h3>
            <div className="space-y-3">
                {events.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="mt-1">
                            {event.type === 'event' ? (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            ) : (
                                <div className="w-2 h-2 border-2 border-gray-400 rounded-sm"></div>
                            )}
                        </div>
                        <div>
                            <div className="text-xl font-medium">{event.title}</div>
                            {event.time && (
                                <div className="text-lg text-gray-400">{event.time}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CalendarWidget;