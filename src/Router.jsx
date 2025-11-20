import { useEffect, useState } from 'react';
import App from './App';
import GoogleCallback from './components/OAuth/GoogleCallback';
import AppleCallback from './components/OAuth/AppleCallback';

/**
 * Simple router for handling OAuth callbacks without react-router
 */
export default function Router() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        // Listen for popstate event (browser back/forward)
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Route to appropriate component
    if (currentPath === '/auth/google/callback') {
        return <GoogleCallback />;
    }

    if (currentPath === '/auth/apple/callback') {
        return <AppleCallback />;
    }

    // Default route - main app
    return <App />;
}
