import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Index.css'
import App from './App.jsx'

if (import.meta.env.DEV && typeof window !== 'undefined') {
  const originalWarn = console.warn
  const originalInfo = console.info

  const shouldIgnoreMessage = (args) => {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : arg?.message ?? ''))
      .join(' ')

    return (
      message.includes('Download the React DevTools') ||
      message.includes('THREE.Clock') ||
      message.includes('Program Info Log') ||
      message.includes('warning X4122')
    )
  }

  console.warn = (...args) => {
    if (!shouldIgnoreMessage(args)) {
      originalWarn(...args)
    }
  }

  console.info = (...args) => {
    if (!shouldIgnoreMessage(args)) {
      originalInfo(...args)
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)