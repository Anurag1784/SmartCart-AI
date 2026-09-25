import {
  MapPin,
  Home,
  Briefcase,
  Star,
  Plus,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { orderApi } from '../services/api'

import './Addresses.css'


function Addresses() {

  // ============================================================
  // AUTHENTICATED USER
  // ============================================================

  const user = useSelector(
    (state) => state.auth.user
  )


  // ============================================================
  // ADDRESS STATE
  // ============================================================

  const [addresses, setAddresses] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [settingDefault, setSettingDefault] = useState(null)

  const [deletingAddressId, setDeletingAddressId] =
    useState(null)


  // ============================================================
  // ADD / EDIT FORM STATE
  // ============================================================

  const [showAddressForm, setShowAddressForm] =
    useState(false)

  const [editingAddressId, setEditingAddressId] =
    useState(null)

  const [savingAddress, setSavingAddress] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')


  // ============================================================
  // ADDRESS FORM DATA
  // ============================================================

  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false,
  })


  // ============================================================
  // GET CUSTOMER ID
  // ============================================================

  const customerId = user?.userId


  // ============================================================
  // FETCH ADDRESSES
  // ============================================================

  useEffect(() => {

    const fetchAddresses = async () => {

      try {

        setLoading(true)

        setError('')

        if (!customerId) {

          setError(
            'Unable to identify the logged-in customer.'
          )

          return
        }

        const response = await orderApi.get(
          `/api/addresses/customer/${customerId}`
        )

        setAddresses(response.data)

      } catch (error) {

        console.error(
          'Addresses Fetch Error:',
          error
        )

        if (error.response) {

          setError(
            `Unable to load addresses. Server returned ${error.response.status}.`
          )

        } else if (error.request) {

          setError(
            'Unable to connect to Order Service. Please make sure it is running.'
          )

        } else {

          setError(
            'Something went wrong while loading your addresses.'
          )
        }

      } finally {

        setLoading(false)
      }
    }

    fetchAddresses()

  }, [customerId])


  // ============================================================
  // RESET FORM
  // ============================================================

  const resetAddressForm = () => {

    setAddressForm({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'HOME',
      isDefault: false,
    })

    setEditingAddressId(null)

    setShowAddressForm(false)
  }


  // ============================================================
  // OPEN ADD ADDRESS FORM
  // ============================================================

  const handleOpenAddForm = () => {

    setError('')

    setSuccessMessage('')

    setEditingAddressId(null)

    setAddressForm({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'HOME',
      isDefault: false,
    })

    setShowAddressForm(true)
  }


  // ============================================================
  // OPEN EDIT ADDRESS FORM
  // ============================================================

  const handleOpenEditForm = (address) => {

    setError('')

    setSuccessMessage('')

    setEditingAddressId(
      address.addressId
    )

    setAddressForm({
      addressLine1:
        address.addressLine1 || '',

      addressLine2:
        address.addressLine2 || '',

      city:
        address.city || '',

      state:
        address.state || '',

      postalCode:
        address.postalCode || '',

      country:
        address.country || 'India',

      addressType:
        address.addressType || 'HOME',

      isDefault:
        address.default === true,
    })

    setShowAddressForm(true)

    // Scroll to the form so the user immediately sees it.
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  // ============================================================
  // HANDLE FORM INPUT
  // ============================================================

  const handleAddressChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setAddressForm((currentAddress) => ({
      ...currentAddress,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }


  // ============================================================
  // SAVE ADDRESS
  // ============================================================

  const handleSaveAddress = async (event) => {

    event.preventDefault()

    try {

      setSavingAddress(true)

      setError('')

      setSuccessMessage('')


      // ========================================================
      // EDIT EXISTING ADDRESS
      // ========================================================

      if (editingAddressId) {

        const response = await orderApi.put(
          `/api/addresses/${editingAddressId}`,
          addressForm
        )

        const updatedAddress =
          response.data


        /*
         * Update only the edited address
         * in the existing frontend state.
         */

        setAddresses((currentAddresses) =>
          currentAddresses.map((address) => {

            if (
              address.addressId ===
              updatedAddress.addressId
            ) {

              return updatedAddress
            }

            /*
             * If edited address became default,
             * all other addresses become non-default.
             */

            if (
              updatedAddress.default
            ) {

              return {
                ...address,
                default: false,
              }
            }

            return address
          })
        )


        setSuccessMessage(
          'Address updated successfully.'
        )

      }


      // ========================================================
      // CREATE NEW ADDRESS
      // ========================================================

      else {

        const newAddress = {
          customerId: customerId,

          addressLine1:
            addressForm.addressLine1.trim(),

          addressLine2:
            addressForm.addressLine2.trim(),

          city:
            addressForm.city.trim(),

          state:
            addressForm.state.trim(),

          postalCode:
            addressForm.postalCode.trim(),

          country:
            addressForm.country.trim(),

          addressType:
            addressForm.addressType,

          isDefault:
            addressForm.isDefault,

          createdAt:
            new Date()
              .toISOString()
              .slice(0, 19),
        }

        const response = await orderApi.post(
          '/api/addresses',
          newAddress
        )

        const savedAddress =
          response.data


        /*
         * If the new address is default,
         * remove default status from all
         * existing frontend addresses.
         */

        setAddresses((currentAddresses) => {

          if (savedAddress.default) {

            return [
              ...currentAddresses.map(
                (address) => ({
                  ...address,
                  default: false,
                })
              ),

              savedAddress,
            ]
          }


          return [
            ...currentAddresses,
            savedAddress,
          ]
        })


        setSuccessMessage(
          'Address added successfully.'
        )
      }


      // ========================================================
      // RESET FORM
      // ========================================================

      setAddressForm({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'HOME',
        isDefault: false,
      })

      setEditingAddressId(null)

      setShowAddressForm(false)

    } catch (error) {

      console.error(
        'Save Address Error:',
        error
      )


      if (error.response) {

        setError(
          `Unable to save address. Server returned ${error.response.status}.`
        )

      } else if (error.request) {

        setError(
          'Unable to connect to Order Service.'
        )

      } else {

        setError(
          'Something went wrong while saving the address.'
        )
      }

    } finally {

      setSavingAddress(false)
    }
  }


  // ============================================================
  // CANCEL FORM
  // ============================================================

  const handleCancelForm = () => {

    resetAddressForm()

    setError('')
  }


  // ============================================================
  // SET DEFAULT ADDRESS
  // ============================================================

  const handleSetDefault = async (addressId) => {

    try {

      setSettingDefault(addressId)

      setError('')

      setSuccessMessage('')


      const response = await orderApi.put(
        `/api/addresses/${addressId}/default`
      )


      /*
       * Backend returns the address that
       * became default.
       */

      setAddresses((currentAddresses) =>
        currentAddresses.map((address) => ({
          ...address,

          default:
            address.addressId ===
            response.data.addressId,
        }))
      )


      setSuccessMessage(
        'Default address updated successfully.'
      )

    } catch (error) {

      console.error(
        'Set Default Address Error:',
        error
      )


      if (error.response) {

        setError(
          `Unable to set default address. Server returned ${error.response.status}.`
        )

      } else if (error.request) {

        setError(
          'Unable to connect to Order Service.'
        )

      } else {

        setError(
          'Something went wrong while setting the default address.'
        )
      }

    } finally {

      setSettingDefault(null)
    }
  }


  // ============================================================
  // DELETE ADDRESS
  // ============================================================

  const handleDeleteAddress = async (address) => {

    // Ask the customer for confirmation before deleting.
    const confirmed = window.confirm(
      `Are you sure you want to delete your ${address.addressType} address?`
    )


    // Stop if the customer clicks Cancel.
    if (!confirmed) {

      return
    }


    try {

      setDeletingAddressId(
        address.addressId
      )

      setError('')

      setSuccessMessage('')


      // ========================================================
      // DELETE ADDRESS FROM BACKEND
      // ========================================================

      await orderApi.delete(
        `/api/addresses/${address.addressId}`
      )


      // ========================================================
      // FETCH UPDATED ADDRESS LIST
      // ========================================================

      /*
       * We fetch the addresses again instead of manually
       * changing the frontend state.
       *
       * This is important because if the deleted address
       * was the default address, the backend automatically
       * chooses another address as the new default.
       */

      const response = await orderApi.get(
        `/api/addresses/customer/${customerId}`
      )

      setAddresses(response.data)


      setSuccessMessage(
        'Address deleted successfully.'
      )

    } catch (error) {

      console.error(
        'Delete Address Error:',
        error
      )


      // ========================================================
      // HANDLE DELETE ERROR
      // ========================================================

      if (error.response) {

        /*
         * HTTP 409 Conflict means that the address
         * is already linked to an existing order.
         *
         * The backend sends the exact message, so
         * display that message directly to the customer.
         */

        if (error.response.status === 409) {

          setError(
            error.response.data ||
            'This address is linked to an existing order and cannot be deleted.'
          )

        } else {

          setError(
            `Unable to delete address. Server returned ${error.response.status}.`
          )
        }

      } else if (error.request) {

        setError(
          'Unable to connect to Order Service.'
        )

      } else {

        setError(
          'Something went wrong while deleting the address.'
        )
      }

    } finally {

      setDeletingAddressId(null)
    }
  }


  // ============================================================
  // ADDRESS TYPE ICON
  // ============================================================

  const getAddressIcon = (addressType) => {

    if (
      addressType?.toUpperCase() === 'WORK'
    ) {

      return <Briefcase size={20} />
    }

    return <Home size={20} />
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <main className="addresses-page">

      <div className="addresses-container">


        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <div className="addresses-header">

          <p className="addresses-label">
            YOUR ACCOUNT
          </p>

          <h1>
            My <span>Addresses</span>
          </h1>

          <p className="addresses-description">
            Manage your saved delivery addresses
            for a faster checkout experience.
          </p>

        </div>


        {/* =====================================================
            SUCCESS MESSAGE
            ===================================================== */}

        {successMessage && (

          <div className="addresses-success">

            <span>
              {successMessage}
            </span>

          </div>

        )}


        {/* =====================================================
            ERROR MESSAGE
            ===================================================== */}

        {error && (

          <div className="addresses-error">

            <MapPin size={20} />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* =====================================================
            ADD / EDIT FORM
            ===================================================== */}

        {showAddressForm && (

          <section className="address-form-section">

            <div className="address-form-header">

              <div>

                <p className="addresses-section-label">

                  {editingAddressId
                    ? 'EDIT ADDRESS'
                    : 'NEW ADDRESS'}

                </p>

                <h2>

                  {editingAddressId
                    ? 'Edit Delivery Address'
                    : 'Add Delivery Address'}

                </h2>

              </div>


              <button
                type="button"
                className="address-form-close"
                onClick={handleCancelForm}
                aria-label="Close address form"
              >

                <X size={20} />

              </button>

            </div>


            <form
              className="address-form"
              onSubmit={handleSaveAddress}
            >

              {/* =============================================
                  ADDRESS LINE 1
                  ============================================= */}

              <div className="address-form-group address-form-full">

                <label htmlFor="addressLine1">
                  Address Line 1
                </label>

                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={handleAddressChange}
                  placeholder="House number, street name"
                  required
                />

              </div>


              {/* =============================================
                  ADDRESS LINE 2
                  ============================================= */}

              <div className="address-form-group address-form-full">

                <label htmlFor="addressLine2">

                  Address Line 2

                  <span>
                    Optional
                  </span>

                </label>

                <input
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={handleAddressChange}
                  placeholder="Apartment, landmark, area"
                />

              </div>


              {/* =============================================
                  CITY
                  ============================================= */}

              <div className="address-form-group">

                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  placeholder="Enter city"
                  required
                />

              </div>


              {/* =============================================
                  STATE
                  ============================================= */}

              <div className="address-form-group">

                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  placeholder="Enter state"
                  required
                />

              </div>


              {/* =============================================
                  POSTAL CODE
                  ============================================= */}

              <div className="address-form-group">

                <label htmlFor="postalCode">
                  Postal Code
                </label>

                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={addressForm.postalCode}
                  onChange={handleAddressChange}
                  placeholder="Enter postal code"
                  required
                />

              </div>


              {/* =============================================
                  COUNTRY
                  ============================================= */}

              <div className="address-form-group">

                <label htmlFor="country">
                  Country
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                  placeholder="Enter country"
                  required
                />

              </div>


              {/* =============================================
                  ADDRESS TYPE
                  ============================================= */}

              <div className="address-form-group">

                <label htmlFor="addressType">
                  Address Type
                </label>

                <select
                  id="addressType"
                  name="addressType"
                  value={addressForm.addressType}
                  onChange={handleAddressChange}
                  required
                >

                  <option value="HOME">
                    Home
                  </option>

                  <option value="WORK">
                    Work
                  </option>

                </select>

              </div>


              {/* =============================================
                  DEFAULT ADDRESS
                  ============================================= */}

              <div className="address-default-option">

                <label>

                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    disabled={
                      editingAddressId &&
                      addressForm.isDefault
                    }
                    onChange={handleAddressChange}
                  />

                  <span>

                    {editingAddressId &&
                    addressForm.isDefault
                      ? 'This is your default address'
                      : 'Set this as my default address'}

                  </span>

                </label>

              </div>


              {/* =============================================
                  FORM ACTIONS
                  ============================================= */}

              <div className="address-form-actions">

                <button
                  type="button"
                  className="address-cancel-button"
                  onClick={handleCancelForm}
                  disabled={savingAddress}
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="address-save-button"
                  disabled={savingAddress}
                >

                  {editingAddressId ? (
                    <Pencil size={17} />
                  ) : (
                    <Plus size={17} />
                  )}


                  {savingAddress
                    ? 'Saving...'
                    : editingAddressId
                      ? 'Update Address'
                      : 'Save Address'}

                </button>

              </div>

            </form>

          </section>

        )}


        {/* =====================================================
            LOADING
            ===================================================== */}

        {loading && (

          <section className="addresses-section">

            <div className="addresses-empty">

              <MapPin size={32} />

              <h3>
                Loading Addresses...
              </h3>

              <p>
                Please wait while we fetch
                your saved addresses.
              </p>

            </div>

          </section>

        )}


        {/* =====================================================
            EMPTY STATE
            ===================================================== */}

        {!loading &&
          !error &&
          addresses.length === 0 && (

          <section className="addresses-section">

            <div className="addresses-empty">

              <MapPin size={32} />

              <h3>
                No Saved Addresses
              </h3>

              <p>
                You haven't added a delivery
                address yet.
              </p>

            </div>

          </section>

        )}


        {/* =====================================================
            ADDRESS LIST
            ===================================================== */}

        {!loading &&
          addresses.length > 0 && (

          <section className="addresses-section">

            <div className="addresses-section-header">

              <div>

                <p className="addresses-section-label">
                  SAVED LOCATIONS
                </p>

                <h2>
                  Your Addresses
                </h2>

              </div>


              <div className="addresses-header-actions">

                <div className="addresses-section-icon">

                  <MapPin size={24} />

                </div>


                <button
                  type="button"
                  className="add-address-button"
                  onClick={handleOpenAddForm}
                >

                  <Plus size={18} />

                  Add Address

                </button>

              </div>

            </div>


            <div className="addresses-list">

              {addresses.map((address) => (

                <article
                  className={`address-card ${
                    address.default
                      ? 'address-card-default'
                      : ''
                  }`}
                  key={address.addressId}
                >


                  {/* =========================================
                      ADDRESS CARD HEADER
                      ========================================= */}

                  <div className="address-card-header">

                    <div className="address-card-title">

                      <div className="address-type-icon">

                        {getAddressIcon(
                          address.addressType
                        )}

                      </div>


                      <div>

                        <h3>
                          {address.addressType ||
                            'Address'}
                        </h3>


                        {address.default && (

                          <span className="default-badge">

                            <Star size={13} />

                            Default

                          </span>

                        )}

                      </div>

                    </div>


                    <div className="address-card-actions">

                      {!address.default && (

                        <button
                          type="button"
                          className="set-default-button"
                          disabled={
                            settingDefault ===
                            address.addressId
                          }
                          onClick={() =>
                            handleSetDefault(
                              address.addressId
                            )
                          }
                        >

                          {settingDefault ===
                          address.addressId
                            ? 'Setting...'
                            : 'Set as Default'}

                        </button>

                      )}


                      {/* EDIT BUTTON */}

                      <button
                        type="button"
                        className="edit-address-button"
                        onClick={() =>
                          handleOpenEditForm(
                            address
                          )
                        }
                      >

                        <Pencil size={15} />

                        Edit

                      </button>


                      {/* DELETE BUTTON */}

                      <button
                        type="button"
                        className="delete-address-button"
                        disabled={
                          deletingAddressId ===
                          address.addressId
                        }
                        onClick={() =>
                          handleDeleteAddress(
                            address
                          )
                        }
                      >

                        {deletingAddressId ===
                        address.addressId
                          ? 'Deleting...'
                          : (
                            <>
                              <Trash2 size={15} />
                              Delete
                            </>
                          )}

                      </button>

                    </div>

                  </div>


                  {/* =========================================
                      ADDRESS DETAILS
                      ========================================= */}

                  <div className="address-details">

                    <p>
                      {address.addressLine1}
                    </p>


                    {address.addressLine2 && (

                      <p>
                        {address.addressLine2}
                      </p>

                    )}


                    <p>
                      {address.city},{' '}
                      {address.state}{' '}
                      {address.postalCode}
                    </p>


                    <p>
                      {address.country}
                    </p>

                  </div>

                </article>

              ))}

            </div>

          </section>

        )}


        {/* =====================================================
            ADD FIRST ADDRESS
            ===================================================== */}

        {!loading &&
          addresses.length === 0 && (

          <div className="addresses-empty-action">

            <button
              type="button"
              className="add-address-button"
              onClick={handleOpenAddForm}
            >

              <Plus size={18} />

              Add Your First Address

            </button>

          </div>

        )}

      </div>

    </main>
  )
}


export default Addresses