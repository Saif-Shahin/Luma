// Calendar API integration with OAuth support
import {
    initiateGoogleAuth,
    openOAuthPopup,
    getTokens,
    isAuthenticated,
    refreshGoogleToken,
    clearTokens,
} from './oauthService';

/**
 * Connect to Google Calendar
 * Initiates OAuth flow and returns connection status
 */
export async function connectGoogleCalendar() {
    try {
        // Check if already authenticated
        if (isAuthenticated()) {
            const events = await fetchGoogleCalendarEvents();
            return {
                connected: true,
                type: 'google',
                events: events,
            };
        }

        // Initiate OAuth flow
        const authUrl = initiateGoogleAuth();

        if (!authUrl) {
            console.warn('Google OAuth not configured, using mock data');
            return {
                connected: true,
                type: 'google',
                events: getGoogleMockEvents(),
            };
        }

        // Open OAuth popup
        await openOAuthPopup(authUrl);

        // Fetch events after successful authentication
        const events = await fetchGoogleCalendarEvents();

        return {
            connected: true,
            type: 'google',
            events: events,
        };
    } catch (error) {
        console.error('Error connecting to Google Calendar:', error);

        // Fallback to mock data
        return {
            connected: true,
            type: 'google',
            events: getGoogleMockEvents(),
        };
    }
}

/**
 * Disconnect calendar
 */
export function disconnectCalendar() {
    clearTokens();
}

/**
 * Sync calendar events
 * Fetches real events from Google Calendar or falls back to mock data
 */
export async function syncCalendarEvents() {
    try {
        if (isAuthenticated()) {
            return await fetchGoogleCalendarEvents();
        }

        // Fallback to mock data if not authenticated
        return getGoogleMockEvents();
    } catch (error) {
        console.error('Error syncing calendar events:', error);

        // Fallback to mock data on error
        return getGoogleMockEvents();
    }
}

/**
 * Fetch events from Google Calendar API
 */
async function fetchGoogleCalendarEvents() {
    try {
        let { accessToken } = getTokens();

        // Refresh token if expired
        if (!accessToken) {
            await refreshGoogleToken();
            ({ accessToken } = getTokens());
        }

        // Get today's date range
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Fetch events from Google Calendar API
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `timeMin=${startOfDay.toISOString()}` +
            `&timeMax=${endOfDay.toISOString()}` +
            `&singleEvents=true` +
            `&orderBy=startTime`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Google Calendar events');
        }

        const data = await response.json();

        // Transform Google Calendar events to our format
        return transformGoogleEvents(data.items || []);
    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        throw error;
    }
}

/**
 * Transform Google Calendar events to our event format
 */
function transformGoogleEvents(googleEvents) {
    const today = new Date().toDateString();

    return googleEvents.map((event, index) => {
        const start = event.start?.dateTime || event.start?.date;
        const hasTime = !!event.start?.dateTime;

        let time = null;
        if (hasTime) {
            const startDate = new Date(start);
            time = formatTime(startDate);
        }

        return {
            id: event.id || `google-${index}`,
            title: event.summary || 'Untitled Event',
            time: time,
            type: hasTime ? 'event' : 'todo',
            date: today,
            color: event.colorId ? getGoogleEventColor(event.colorId) : '#4285F4',
            completed: false,
        };
    });
}

/**
 * Format time to 12-hour format
 */
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutesStr} ${period}`;
}

/**
 * Get Google Calendar event colors
 */
function getGoogleEventColor(colorId) {
    const colors = {
        '1': '#A4BDFC', // Lavender
        '2': '#7AE7BF', // Sage
        '3': '#DBADFF', // Grape
        '4': '#FF887C', // Flamingo
        '5': '#FBD75B', // Banana
        '6': '#FFB878', // Tangerine
        '7': '#46D6DB', // Peacock
        '8': '#E1E1E1', // Graphite
        '9': '#5484ED', // Blueberry
        '10': '#51B749', // Basil
        '11': '#DC2127', // Tomato
    };

    return colors[colorId] || '#4285F4';
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
