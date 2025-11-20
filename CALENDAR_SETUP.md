# Calendar Integration Setup Guide

This guide explains how to set up Google Calendar and Apple Calendar integration for the Luma Smart Mirror.

## Overview

The Luma Smart Mirror now supports real calendar integration with:
- **Google Calendar** - Full OAuth 2.0 integration with automatic event syncing
- **Apple Calendar** - OAuth integration (requires backend implementation for full support)

## Features

- ✅ OAuth 2.0 authentication flow
- ✅ Automatic token refresh
- ✅ Periodic event syncing (every 15 minutes)
- ✅ Manual sync option in settings
- ✅ Connect/disconnect calendars from settings
- ✅ Switch between different calendar providers
- ✅ Secure token storage in localStorage
- ✅ Fallback to mock data when OAuth is not configured

## Prerequisites

### For Google Calendar Integration

1. A Google Cloud Platform account
2. Google Calendar API enabled
3. OAuth 2.0 credentials (Client ID and Client Secret)

### For Apple Calendar Integration

1. An Apple Developer account
2. Sign in with Apple configured
3. Backend server for token exchange (Apple requires server-side OAuth)

## Setup Instructions

### 1. Google Calendar Setup

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

#### Step 2: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure the OAuth consent screen if prompted:
   - Add your app name, support email, and developer contact
   - Add the scope: `https://www.googleapis.com/auth/calendar.readonly`
5. Add authorized redirect URIs:
   - For local development: `http://localhost:5173/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
6. Click "Create"
7. Copy your **Client ID** and **Client Secret**

#### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Calendar credentials to `.env.local`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
   ```

### 2. Apple Calendar Setup

Apple Calendar integration requires additional backend setup due to Apple's security requirements.

#### Step 1: Sign in with Apple Configuration

1. Go to [Apple Developer](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new Service ID for "Sign in with Apple"
4. Configure your domain and redirect URLs
5. Generate a private key for server-to-server authentication

#### Step 2: Backend Implementation

Apple OAuth requires server-side token exchange. You'll need to:

1. Set up a backend server (Node.js, Python, etc.)
2. Implement the following endpoints:
   - `POST /api/auth/apple/token` - Exchange authorization code for tokens
   - `POST /api/auth/apple/refresh` - Refresh access token
3. Use Apple's private key for JWT signing

#### Step 3: Configure Environment Variables

Add to `.env.local`:
```env
VITE_APPLE_CLIENT_ID=your_apple_service_id_here
VITE_APPLE_REDIRECT_URI=http://localhost:5173/auth/apple/callback
```

**Note:** Full Apple Calendar integration requires CalDAV protocol implementation, which is beyond the scope of this frontend-only setup. For now, the app will use mock data for Apple Calendar.

## Usage

### During Initial Setup

1. Start the app and go through the setup wizard
2. When prompted to "Connect Your Calendar":
   - Select "Google Calendar" or "Apple Calendar"
   - A popup window will open for authentication
   - Sign in with your Google/Apple account
   - Grant calendar read permissions
   - The popup will close automatically upon success
3. Your calendar events will appear on the mirror display

### In Settings

Access calendar settings by:
1. Press the settings icon on the main mirror display
2. Navigate to "Calendar" in the settings menu
3. Available options:
   - **Change Calendar** - Switch between Google and Apple Calendar
   - **Disconnect Calendar** - Remove calendar connection
   - **Sync Now** - Manually refresh calendar events

## Calendar Event Display

- Events are displayed on the main mirror screen
- Shows up to 5 upcoming events
- Displays event title, time, and type (event/todo)
- Color-coded based on calendar provider
- Automatically syncs every 15 minutes
- Navigate with remote control arrows
- Mark items as complete/incomplete with OK button

## Security Considerations

### Token Storage

- OAuth tokens are stored in browser localStorage
- Tokens are scoped to read-only calendar access
- Refresh tokens allow automatic re-authentication
- Tokens are cleared when disconnecting calendar

### Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Restrict OAuth scopes** - Only request calendar read access
4. **Rotate credentials regularly** - Update client secrets periodically
5. **Monitor API usage** - Stay within Google Calendar API quotas

## Troubleshooting

### OAuth Popup Blocked

If the OAuth popup is blocked by your browser:
1. Allow popups for localhost or your domain
2. Try the authentication flow again

### "OAuth not configured" Warning

If you see this warning in the console:
1. Check that `.env.local` exists with correct credentials
2. Verify environment variables are prefixed with `VITE_`
3. Restart the development server after adding env vars

### Calendar Events Not Syncing

1. Check browser console for error messages
2. Verify your OAuth tokens haven't expired
3. Try disconnecting and reconnecting the calendar
4. Use "Sync Now" in settings to manually refresh

### CORS Errors

Google Calendar API should not have CORS issues when using OAuth tokens. If you see CORS errors:
1. Verify your redirect URI is correctly configured in Google Cloud Console
2. Check that you're using the correct Client ID
3. Ensure the API is enabled in your Google Cloud project

## API Quotas

Google Calendar API has the following quotas:
- **Queries per day:** 1,000,000
- **Queries per 100 seconds per user:** 50

With automatic syncing every 15 minutes, you'll use approximately:
- 96 API calls per day per user
- Well within the free quota limits

## Development vs Production

### Development
- Uses `http://localhost:5173` as the base URL
- OAuth redirect: `http://localhost:5173/auth/google/callback`
- Popups may be blocked less frequently

### Production
- Update redirect URIs in Google Cloud Console
- Use HTTPS for all OAuth redirects
- Update `VITE_GOOGLE_REDIRECT_URI` to production URL
- Consider implementing rate limiting

## Mock Data Fallback

If OAuth is not configured, the app automatically falls back to mock data:
- Displays sample calendar events
- Allows testing UI without real credentials
- Useful for development and demonstrations
- Events are generated with realistic times and types

## File Structure

Calendar integration files:
```
src/
├── utils/
│   ├── oauthService.js          # OAuth authentication & token management
│   └── calendarAPI.js           # Calendar API integration & data fetching
├── components/
│   ├── OAuth/
│   │   ├── GoogleCallback.jsx   # Google OAuth callback handler
│   │   └── AppleCallback.jsx    # Apple OAuth callback handler
│   ├── Setup/
│   │   └── CalendarSync.jsx     # Setup wizard calendar selection
│   ├── Settings/
│   │   └── SettingsMenu.jsx     # Calendar settings management
│   └── Mirror/
│       └── CalendarWidget.jsx   # Calendar display widget
├── context/
│   └── AppContext.jsx           # State management (includes calendar state)
└── Router.jsx                    # Route handler for OAuth callbacks
```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Review Google Cloud Console OAuth configuration
4. Check that calendar API is enabled and quotas are not exceeded

## Next Steps

- Implement backend for Apple Calendar CalDAV integration
- Add support for multiple calendars (work/personal)
- Implement event creation and editing
- Add calendar color customization
- Support recurring events
- Add event reminders and notifications
