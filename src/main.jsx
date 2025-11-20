import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './Router.jsx'
import { AppProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppProvider>
            <Router />
        </AppProvider>
    </StrictMode>,
)