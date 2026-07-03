import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          color: '#e11d48',
          background: '#fff1f2',
          border: '1px solid #f43f5e',
          borderRadius: '16px',
          maxWidth: '600px',
          margin: '40px auto',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
            Application Crash Detected
          </h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#9f1239' }}>
            A runtime error occurred in the React component tree. Please inspect the details below:
          </p>
          <pre style={{
            background: '#ffe4e6',
            padding: '16px',
            borderRadius: '12px',
            overflowX: 'auto',
            fontSize: '12px',
            lineHeight: '1.5',
            margin: '0 0 20px 0',
            border: '1px solid #fda4af'
          }}>
            {this.state.error?.toString()}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.3)'
            }}
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in frontend/.env")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
)
