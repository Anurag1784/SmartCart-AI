import { useEffect, useState } from 'react'
import {
  User,
  ShieldCheck,
  Monitor,
  LogOut,
  Info,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { logout } from '../redux/slices/authSlice'
import './Settings.css'

function Settings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const adminEmail =
    user?.email ||
    user?.userName ||
    user?.username ||
    'Admin'

  const adminRole = user?.role || 'ADMIN'

  const [theme, setTheme] = useState(
    localStorage.getItem('admin-theme') || 'light'
  )

  // Apply the selected theme to the entire application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('admin-theme', theme)
  }, [theme])

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <span className="settings-eyebrow">ADMIN CONFIGURATION</span>

        <h1>Settings</h1>

        <p>
          Manage your Admin profile, preferences and session.
        </p>
      </div>

      <div className="settings-grid">

        {/* ADMIN PROFILE */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon profile-icon">
              <User size={24} />
            </div>

            <div>
              <h2>Admin Profile</h2>
              <p>
                Information about the currently authenticated Admin.
              </p>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="admin-profile-main">
            <div className="admin-avatar">
              {adminEmail.charAt(0).toUpperCase()}
            </div>

            <div className="admin-identity">
              <strong>{adminEmail}</strong>

              <span className="admin-role-badge">
                <ShieldCheck size={14} />
                {adminRole}
              </span>
            </div>
          </div>

          <div className="settings-info-list">
            <div className="settings-info-row">
              <span>Email</span>
              <strong>{adminEmail}</strong>
            </div>

            <div className="settings-info-row">
              <span>Role</span>
              <strong>{adminRole}</strong>
            </div>

            <div className="settings-info-row">
              <span>Authentication</span>

              <strong className="authenticated-status">
                <CheckCircle2 size={17} />
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </strong>
            </div>
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon appearance-icon">
              <Monitor size={24} />
            </div>

            <div>
              <h2>Appearance</h2>
              <p>
                Choose your preferred Admin interface theme.
              </p>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="theme-options">

            {/* LIGHT */}
            <button
              type="button"
              className={`theme-option ${
                theme === 'light' ? 'active' : ''
              }`}
              onClick={() => handleThemeChange('light')}
            >
              <div className="theme-option-icon light-theme-icon">
                <Sun size={23} />
              </div>

              <div className="theme-option-content">
                <strong>Light</strong>

                <span>
                  Use the standard light Admin interface.
                </span>
              </div>

              {theme === 'light' && (
                <CheckCircle2
                  className="theme-check"
                  size={22}
                />
              )}
            </button>

            {/* DARK */}
            <button
              type="button"
              className={`theme-option ${
                theme === 'dark' ? 'active' : ''
              }`}
              onClick={() => handleThemeChange('dark')}
            >
              <div className="theme-option-icon dark-theme-icon">
                <Moon size={23} />
              </div>

              <div className="theme-option-content">
                <strong>Dark</strong>

                <span>
                  Use the dark Admin interface.
                </span>
              </div>

              {theme === 'dark' && (
                <CheckCircle2
                  className="theme-check"
                  size={22}
                />
              )}
            </button>

          </div>

          <p className="theme-note">
            Theme preference is stored locally in this browser.
          </p>
        </section>

        {/* SESSION & SECURITY */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon security-icon">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h2>Session &amp; Security</h2>
              <p>
                Information about your current Admin session.
              </p>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="session-active-box">
            <div className="session-active-icon">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <strong>Admin session is active</strong>

              <span>
                Your authentication is maintained for the current browser session.
              </span>
            </div>
          </div>

          <div className="session-info-grid">
            <div className="session-info-box">
              <span>Storage</span>
              <strong>Session Storage</strong>
            </div>

            <div className="session-info-box">
              <span>Authentication</span>
              <strong>JWT</strong>
            </div>

            <div className="session-info-box">
              <span>Access Level</span>
              <strong>{adminRole}</strong>
            </div>
          </div>
        </section>

        {/* APPLICATION INFORMATION */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon application-icon">
              <Info size={24} />
            </div>

            <div>
              <h2>Application Information</h2>
              <p>
                Information about the SmartCart AI Admin application.
              </p>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-info-list application-info">
            <div className="settings-info-row">
              <span>Application</span>
              <strong>SmartCart AI</strong>
            </div>

            <div className="settings-info-row">
              <span>Module</span>
              <strong>Admin Portal</strong>
            </div>

            <div className="settings-info-row">
              <span>Frontend</span>
              <strong>React + Vite</strong>
            </div>

            <div className="settings-info-row">
              <span>Authentication</span>
              <strong>JWT</strong>
            </div>
          </div>
        </section>

      </div>

      {/* SIGN OUT */}
      <section className="settings-logout-card">
        <div className="logout-content">
          <div className="logout-icon">
            <LogOut size={22} />
          </div>

          <div>
            <h2>Sign Out</h2>
            <p>
              End your current Admin session and return to the login page.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </section>

    </div>
  )
}

export default Settings