// ============================================================
// SELLER SETTINGS
// ============================================================
//
// Seller settings page for the SmartCart Seller Workspace.
//
// Current functionality:
// - Seller account information
// - Notification preferences
// - Dashboard preferences
// - Security information
// - Local browser preference storage
// - Navigation back to Seller Dashboard
//
// NOTE:
// These preferences are currently stored in the browser.
// They are not being sent to the backend because we have not
// created a dedicated seller-settings backend API yet.
//
// ============================================================

import {
  useEffect,
  useState,
} from 'react'

import {
  Bell,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  Save,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Info,
} from 'lucide-react'

import { useSelector } from 'react-redux'

import SellerNavLink from '../components/SellerNavLink'

import './SellerSettings.css'


// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
  orderNotifications: true,
  inventoryNotifications: true,
  paymentNotifications: true,
  dashboardRefresh: true,
}


// ============================================================
// STORAGE KEY
// ============================================================

const SETTINGS_STORAGE_KEY =
  'smartcart_seller_settings'


// ============================================================
// SELLER SETTINGS COMPONENT
// ============================================================

function SellerSettings() {

  // ==========================================================
  // AUTHENTICATED SELLER
  // ==========================================================

  const user =
    useSelector(
      (state) => state.auth.user
    )


  // ==========================================================
  // SELLER NAME
  // ==========================================================

  const sellerName =
    user?.firstName ||
    user?.userName ||
    user?.name ||
    'Seller'


  // ==========================================================
  // SELLER EMAIL
  // ==========================================================

  const sellerEmail =
    user?.email ||
    'Seller account'


  // ==========================================================
  // SETTINGS STATE
  // ==========================================================

  const [
    settings,
    setSettings,
  ] = useState(
    DEFAULT_SETTINGS
  )


  // ==========================================================
  // SAVE MESSAGE
  // ==========================================================

  const [
    saved,
    setSaved,
  ] = useState(false)


  // ==========================================================
  // LOAD SAVED SETTINGS
  // ==========================================================

  useEffect(() => {

    try {

      const storedSettings =
        localStorage.getItem(
          SETTINGS_STORAGE_KEY
        )

      if (storedSettings) {

        const parsedSettings =
          JSON.parse(
            storedSettings
          )

        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
        })

      }

    } catch (error) {

      console.error(
        'Seller Settings Load Error:',
        error
      )

    }

  }, [])


  // ==========================================================
  // HANDLE TOGGLE
  // ==========================================================

  const handleToggle =
    (settingName) => {

      setSettings(
        (currentSettings) => ({
          ...currentSettings,

          [settingName]:
            !currentSettings[settingName],
        })
      )

      setSaved(false)

    }


  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  const handleSave =
    () => {

      try {

        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(settings)
        )

        setSaved(true)

        setTimeout(
          () => {
            setSaved(false)
          },
          2500
        )

      } catch (error) {

        console.error(
          'Seller Settings Save Error:',
          error
        )

      }

    }


  // ==========================================================
  // RESET SETTINGS
  // ==========================================================

  const handleReset =
    () => {

      setSettings(
        DEFAULT_SETTINGS
      )

      localStorage.removeItem(
        SETTINGS_STORAGE_KEY
      )

      setSaved(false)

    }


  // ==========================================================
  // SETTING ROW
  // ==========================================================

  const SettingRow = ({
    icon,
    title,
    description,
    settingName,
  }) => (

    <div className="seller-setting-row">

      <div className="seller-setting-icon">
        {icon}
      </div>

      <div className="seller-setting-content">

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <button
        type="button"
        className={`seller-toggle ${
          settings[settingName]
            ? 'seller-toggle-active'
            : ''
        }`}
        onClick={() =>
          handleToggle(
            settingName
          )
        }
        aria-label={
          `${title} ${
            settings[settingName]
              ? 'enabled'
              : 'disabled'
          }`
        }
      >

        <span className="seller-toggle-knob" />

      </button>

    </div>

  )


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="seller-settings-page">


      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="seller-settings-header">

        <div className="seller-settings-header-left">

          <SellerNavLink
            to="/seller"
            className="seller-settings-back"
          >
            <ArrowLeft size={17} />

            <span>
              Back to Dashboard
            </span>
          </SellerNavLink>


          <div className="seller-settings-title">

            <span>
              SELLER WORKSPACE
            </span>

            <h1>
              Settings
            </h1>

            <p>
              Manage your Seller Workspace preferences.
            </p>

          </div>

        </div>


        <div className="seller-settings-user">

          <UserCircle size={22} />

          <div>

            <strong>
              {sellerName}
            </strong>

            <span>
              {sellerEmail}
            </span>

          </div>

        </div>

      </header>


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main className="seller-settings-main">


        {/* ====================================================
            ACCOUNT INFORMATION
            ==================================================== */}

        <section className="seller-settings-card">

          <div className="seller-settings-card-header">

            <div className="seller-settings-section-icon">
              <UserCircle size={20} />
            </div>

            <div>

              <span>
                ACCOUNT
              </span>

              <h2>
                Seller Account
              </h2>

            </div>

          </div>


          <div className="seller-account-details">

            <div className="seller-account-detail">

              <span>
                Seller Name
              </span>

              <strong>
                {sellerName}
              </strong>

            </div>


            <div className="seller-account-detail">

              <span>
                Email Address
              </span>

              <strong>
                {sellerEmail}
              </strong>

            </div>


            <div className="seller-account-detail">

              <span>
                Workspace
              </span>

              <strong>
                Seller Workspace
              </strong>

            </div>

          </div>

        </section>


        {/* ====================================================
            NOTIFICATION SETTINGS
            ==================================================== */}

        <section className="seller-settings-card">

          <div className="seller-settings-card-header">

            <div className="seller-settings-section-icon">
              <Bell size={20} />
            </div>

            <div>

              <span>
                NOTIFICATIONS
              </span>

              <h2>
                Notification Preferences
              </h2>

              <p>
                Choose which seller notification preferences
                you want enabled in this browser.
              </p>

            </div>

          </div>


          <div className="seller-settings-list">

            <SettingRow
              icon={<Bell size={18} />}
              title="Order Notifications"
              description="Keep order-related notifications enabled."
              settingName="orderNotifications"
            />


            <SettingRow
              icon={<Bell size={18} />}
              title="Inventory Notifications"
              description="Show notifications related to stock and inventory."
              settingName="inventoryNotifications"
            />


            <SettingRow
              icon={<Bell size={18} />}
              title="Payment Notifications"
              description="Keep payment-related seller notifications enabled."
              settingName="paymentNotifications"
            />

          </div>

        </section>


        {/* ====================================================
            DASHBOARD SETTINGS
            ==================================================== */}

        <section className="seller-settings-card">

          <div className="seller-settings-card-header">

            <div className="seller-settings-section-icon">
              <LayoutDashboard size={20} />
            </div>

            <div>

              <span>
                DASHBOARD
              </span>

              <h2>
                Dashboard Preferences
              </h2>

              <p>
                Configure basic Seller Workspace behavior.
              </p>

            </div>

          </div>


          <div className="seller-settings-list">

            <SettingRow
              icon={<RotateCcw size={18} />}
              title="Dashboard Refresh"
              description="Allow dashboard data to be refreshed when requested."
              settingName="dashboardRefresh"
            />

          </div>

        </section>


        {/* ====================================================
            SECURITY
            ==================================================== */}

        <section className="seller-settings-card">

          <div className="seller-settings-card-header">

            <div className="seller-settings-section-icon">
              <ShieldCheck size={20} />
            </div>

            <div>

              <span>
                SECURITY
              </span>

              <h2>
                Account Security
              </h2>

              <p>
                Your SmartCart account uses authenticated
                access for Seller Workspace pages.
              </p>

            </div>

          </div>


          <div className="seller-security-info">

            <div className="seller-security-status">

              <CheckCircle2 size={19} />

              <div>

                <strong>
                  Seller access protected
                </strong>

                <span>
                  Your seller workspace requires an authenticated
                  seller account.
                </span>

              </div>

            </div>


            <div className="seller-security-note">

              <Info size={16} />

              <span>
                Password and authentication changes are handled
                through the existing authentication system.
              </span>

            </div>

          </div>

        </section>


        {/* ====================================================
            BROWSER STORAGE INFORMATION
            ==================================================== */}

        <div className="seller-settings-info">

          <Info size={17} />

          <span>
            Seller preference changes on this page are currently
            stored locally in this browser. Backend synchronization
            can be added later when a dedicated settings API is introduced.
          </span>

        </div>


        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="seller-settings-actions">

          <button
            type="button"
            className="seller-reset-button"
            onClick={handleReset}
          >
            <RotateCcw size={16} />

            Reset Defaults
          </button>


          <button
            type="button"
            className="seller-save-button"
            onClick={handleSave}
          >
            <Save size={16} />

            Save Preferences
          </button>

        </div>


        {/* ====================================================
            SAVED MESSAGE
            ==================================================== */}

        {saved && (

          <div className="seller-settings-saved">

            <CheckCircle2 size={17} />

            <span>
              Preferences saved successfully.
            </span>

          </div>

        )}

      </main>

    </div>

  )

}


export default SellerSettings