import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  MdDashboard,
  MdPlaylistAdd,
  MdReceiptLong,
  MdLogout,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdAttachMoney,
  MdHandshake,
  MdGetApp
} from 'react-icons/md'
import { GiKnifeFork } from 'react-icons/gi'
import ThemeSwitcher from './ThemeSwitcher'
import { useAuth } from '../context/AuthContext'
import { usePwa } from '../context/PwaContext'

const Sidebar = ({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { logout } = useAuth()
  const { installApp, isInstalled } = usePwa()

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Sidebar navigation"
    >
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <GiKnifeFork />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <h1>MeatbyAlvi</h1>
              <span>Business Tracker</span>
            </div>
          )}
        </div>

        <div className="sidebar-header-actions">
          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
            </button>
          )}

          {/* Mobile drawer close button */}
          {onClose && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              title="Close navigation"
              aria-label="Close navigation"
            >
              <MdClose size={22} />
            </button>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          onClick={handleLinkClick}
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          title="Dashboard"
        >
          <MdDashboard size={20} />
          <span className="sidebar-link-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/add-entry"
          onClick={handleLinkClick}
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          title="Add Daily Entry"
        >
          <MdPlaylistAdd size={20} />
          <span className="sidebar-link-label">Add Daily Entry</span>
        </NavLink>

        <NavLink
          to="/expenses"
          onClick={handleLinkClick}
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          title="Expenses"
        >
          <MdAttachMoney size={20} />
          <span className="sidebar-link-label">Expenses</span>
        </NavLink>

        <NavLink
          to="/dues"
          onClick={handleLinkClick}
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          title="Dues"
        >
          <MdHandshake size={20} />
          <span className="sidebar-link-label">Dues</span>
        </NavLink>

        <NavLink
          to="/receipt"
          onClick={handleLinkClick}
          className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
          title="Receipt Printer"
        >
          <MdReceiptLong size={20} />
          <span className="sidebar-link-label">Receipt Printer</span>
        </NavLink>
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          Fresh • Halal • Premium Quality
          <br />
          Track every day's numbers to see your real profit.
        </div>
      )}

      <div className="sidebar-bottom-controls">
        <button
          type="button"
          className="sidebar-pwa-btn"
          onClick={installApp}
          title={isInstalled ? 'MeatbyAlvi App Installed' : 'Download MeatbyAlvi App (Desktop / Mobile)'}
        >
          <MdGetApp size={19} />
          {!isCollapsed && (
            <div className="sidebar-pwa-btn-text">
              <span>{isInstalled ? 'App Installed' : 'Download App'}</span>
              <small>{isInstalled ? 'Running Standalone' : 'Desktop / Mobile'}</small>
            </div>
          )}
        </button>

        <ThemeSwitcher />

        <button type="button" className="sidebar-logout" onClick={logout} title="Logout">
          <MdLogout size={18} />
          <span className="sidebar-link-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
