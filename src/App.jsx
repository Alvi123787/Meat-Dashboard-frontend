import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MdMenu } from 'react-icons/md'
import { GiKnifeFork } from 'react-icons/gi'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PwaProvider } from './context/PwaContext'
import PasswordGate from './components/PasswordGate'
import Sidebar from './components/Sidebar'
import PwaInstallModal from './components/PwaInstallModal'
import Dashboard from './pages/Dashboard'
import EntryForm from './pages/EntryForm'
import Expenses from './pages/Expenses'
import Dues from './pages/Dues'
import ReceiptPrinter from './pages/ReceiptPrinter'

const AppContent = () => {
  const { isAuthenticated } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const location = useLocation()

  // Automatically close mobile sidebar on route navigation
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  if (!isAuthenticated) {
    return <PasswordGate />
  }

  return (
    <div className={`app-shell ${desktopCollapsed ? 'app-shell--collapsed' : ''}`}>
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-topbar no-print">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileSidebarOpen}
        >
          <MdMenu size={24} />
        </button>

        <div className="mobile-topbar-brand">
          <div className="sidebar-brand-mark mobile-brand-mark">
            <GiKnifeFork />
          </div>
          <div className="mobile-brand-text">
            <span className="mobile-brand-title">MeatbyAlvi</span>
            <span className="mobile-brand-subtitle">Business Tracker</span>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop no-print"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={desktopCollapsed}
        onToggleCollapse={() => setDesktopCollapsed((prev) => !prev)}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-entry" element={<EntryForm />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/dues" element={<Dues />} />
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
        <PwaProvider>
          <AppContent />
          <PwaInstallModal />
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
        </PwaProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
