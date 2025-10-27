import React from 'react';
import { useApp } from '../../context/AppContext';

function CalendarWidget() {
    const { state } = useApp();
    const { calendarEvents, focusedCalendarIndex } = state;

    const events = calendarEvents || [];

    if (events.length === 0) {
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
                {events.slice(0, 5).map((event, index) => {
                    const isFocused = focusedCalendarIndex === index;
                    const isCompleted = event.completed;

                    return (
                        <div
                            key={event.id}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                                isFocused
                                    ? 'bg-blue-500/30 border-2 border-blue-500'
                                    : 'border-2 border-transparent'
                            }`}
                        >
                            <div className="mt-1">
                                {event.type === 'event' ? (
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            isCompleted ? 'bg-gray-500' : 'bg-blue-500'
                                        }`}
                                    ></div>
                                ) : (
                                    <div
                                        className={`w-2 h-2 border-2 rounded-sm ${
                                            isCompleted
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-gray-400'
                                        }`}
                                    >
                                        {isCompleted && (
                                            <svg
                                                className="w-1.5 h-1.5 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 12 12"
                                            >
                                                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div
                                    className={`text-xl font-medium ${
                                        isCompleted
                                            ? 'line-through text-gray-500'
                                            : ''
                                    }`}
                                >
                                    {event.title}
                                </div>
                                {event.time && (
                                    <div
                                        className={`text-lg ${
                                            isCompleted ? 'text-gray-600' : 'text-gray-400'
                                        }`}
                                    >
                                        {event.time}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {focusedCalendarIndex >= 0 && (
                <div className="mt-4 text-gray-400 text-sm text-center">
                    Press OK to mark as {events[focusedCalendarIndex]?.completed ? 'incomplete' : 'complete'}
                </div>
            )}
        </div>
    );
}

export default CalendarWidget;