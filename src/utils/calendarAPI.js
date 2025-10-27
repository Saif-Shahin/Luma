// Calendar API integration (simulated for prototype)

/**
 * Connect to Google Calendar
 * In production, this would handle OAuth flow
 * For prototype, we simulate the connection and return mock data
 */
export async function connectGoogleCalendar() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        connected: true,
        type: 'google',
        events: getGoogleMockEvents(),
    };
}

/**
 * Connect to Apple Calendar
 * In production, this would handle iCloud authentication
 * For prototype, we simulate the connection and return mock data
 */
export async function connectAppleCalendar() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        connected: true,
        type: 'apple',
        events: getAppleMockEvents(),
    };
}

/**
 * Sync calendar events
 * In production, this would fetch real events from the connected calendar
 */
export async function syncCalendarEvents(calendarType) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (calendarType === 'google') {
        return getGoogleMockEvents();
    } else if (calendarType === 'apple') {
        return getAppleMockEvents();
    }

    return [];
}

/**
 * Get mock Google Calendar events
 */
function getGoogleMockEvents() {
    const now = new Date();
    const today = now.toDateString();

    return [
        {
            id: '1',
            title: 'Team standup',
            time: '9:00 AM',
            type: 'event',
            date: today,
            color: '#4285F4', // Google Blue
        },
        {
            id: '2',
            title: 'Product review meeting',
            time: '2:00 PM',
            type: 'event',
            date: today,
            color: '#4285F4',
        },
        {
            id: '3',
            title: 'Review pull requests',
            type: 'todo',
            date: today,
            color: '#EA4335', // Google Red
        },
        {
            id: '4',
            title: 'Dentist appointment',
            time: '4:30 PM',
            type: 'event',
            date: today,
            color: '#34A853', // Google Green
        },
        {
            id: '5',
            title: 'Gym workout',
            time: '6:00 PM',
            type: 'event',
            date: today,
            color: '#FBBC04', // Google Yellow
        },
    ];
}

/**
 * Get mock Apple Calendar events
 */
function getAppleMockEvents() {
    const now = new Date();
    const today = now.toDateString();

    return [
        {
            id: '1',
            title: 'Morning coffee with Alex',
            time: '8:30 AM',
            type: 'event',
            date: today,
            color: '#FF3B30', // Apple Red
        },
        {
            id: '2',
            title: 'Finish project proposal',
            type: 'todo',
            date: today,
            color: '#FF9500', // Apple Orange
        },
        {
            id: '3',
            title: 'Client presentation',
            time: '1:00 PM',
            type: 'event',
            date: today,
            color: '#007AFF', // Apple Blue
        },
        {
            id: '4',
            title: 'Grocery shopping',
            type: 'todo',
            date: today,
            color: '#34C759', // Apple Green
        },
        {
            id: '5',
            title: 'Dinner reservation',
            time: '7:30 PM',
            type: 'event',
            date: today,
            color: '#AF52DE', // Apple Purple
        },
    ];
}

/**
 * Get events for today
 */
export function getTodayEvents(events) {
    const today = new Date().toDateString();
    return events.filter(event => event.date === today);
}

/**
 * Sort events by time
 */
export function sortEventsByTime(events) {
    return events.sort((a, b) => {
        // Todos come after timed events
        if (a.type === 'todo' && b.type !== 'todo') return 1;
        if (a.type !== 'todo' && b.type === 'todo') return -1;

        // Sort by time if both have times
        if (a.time && b.time) {
            return parseTime(a.time) - parseTime(b.time);
        }

        return 0;
    });
}

/**
 * Parse time string to minutes for sorting
 */
function parseTime(timeString) {
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

/**
 * Format relative time (e.g., "in 2 hours", "30 minutes ago")
 */
export function getRelativeTime(eventTime) {
    const now = new Date();
    const eventDate = new Date();

    const match = eventTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    eventDate.setHours(hours, minutes, 0, 0);

    const diffMs = eventDate - now;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) return 'passed';
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffMins < 120) return 'in 1h';

    const diffHours = Math.floor(diffMins / 60);
    return `in ${diffHours}h`;
}