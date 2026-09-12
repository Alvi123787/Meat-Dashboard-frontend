import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import PasswordGate from './components/PasswordGate'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import EntryForm from './pages/EntryForm'
import Expenses from './pages/Expenses'
import ReceiptPrinter from './pages/ReceiptPrinter'

const AppContent = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <PasswordGate />
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-entry" element={<EntryForm />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/receipt" element={<ReceiptPrinter />} />
        </Routes>
      </main>
    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 28px rgba(0,0,0,0.16)'
            },
            success: { iconTheme: { primary: 'var(--color-profit)', secondary: '#fff' } },
            error: { iconTheme: { primary: 'var(--color-loss)', secondary: '#fff' } }
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
