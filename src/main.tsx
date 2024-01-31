import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'

import { ThemeProvider } from './providers'
import App from './App'

import './App.css'

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <Toaster />
            <App />
        </ThemeProvider>
    </React.StrictMode>
)
