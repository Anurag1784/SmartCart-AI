package com.smartcart.order.service;

import com.smartcart.order.entity.Address;
import com.smartcart.order.repository.AddressRepository;
import com.smartcart.order.repository.OrderRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    private final OrderRepository orderRepository;

    public AddressService(
            AddressRepository addressRepository,
            OrderRepository orderRepository) {

        this.addressRepository = addressRepository;

        this.orderRepository = orderRepository;
    }

    // ============================================================
    // GET LOGGED-IN CUSTOMER ID
    // ============================================================

    private Long getAuthenticatedCustomerId() {

        return (Long) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    // ============================================================
    // CREATE ADDRESS
    // ============================================================

    public Address createAddress(Address address) {

        Long customerId = getAuthenticatedCustomerId();

        // Always take customer ID from JWT.
        // Do not trust customerId sent by frontend.
        address.setCustomerId(customerId);

        // Set creation timestamp explicitly.
        address.setCreatedAt(LocalDateTime.now());

        List<Address> existingAddresses =
                addressRepository.findByCustomerId(customerId);

        /*
         * If this is the customer's first address,
         * automatically make it the default address.
         *
         * If the frontend explicitly marks this address
         * as default, it will also become the default.
         */
        if (existingAddresses.isEmpty()
                || address.isDefault()) {

            for (Address existingAddress : existingAddresses) {

                existingAddress.setDefault(false);
            }

            address.setDefault(true);
        }

        return addressRepository.save(address);
    }

    // ============================================================
    // GET CUSTOMER ADDRESSES
    // ============================================================

    public List<Address> getAddressesByCustomerId(Long customerId) {

        Long authenticatedCustomerId =
                getAuthenticatedCustomerId();

        // Customer can only view their own addresses.
        if (!authenticatedCustomerId.equals(customerId)) {

            throw new RuntimeException(
                    "You are not authorized to access these addresses"
            );
        }

        return addressRepository.findByCustomerId(customerId);
    }

    // ============================================================
    // GET ADDRESS BY ID
    // ============================================================

    public Address getAddressById(Long addressId) {

        Address address =
                addressRepository.findById(addressId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found"
                                )
                        );

        Long authenticatedCustomerId =
                getAuthenticatedCustomerId();

        // Verify address belongs to logged-in customer.
        if (!authenticatedCustomerId.equals(
                address.getCustomerId())) {

            throw new RuntimeException(
                    "You are not authorized to access this address"
            );
        }

        return address;
    }

    // ============================================================
    // UPDATE ADDRESS
    // ============================================================

    public Address updateAddress(
            Long addressId,
            Address updatedAddress) {

        Address existingAddress =
                getAddressById(addressId);

        existingAddress.setAddressLine1(
                updatedAddress.getAddressLine1()
        );

        existingAddress.setAddressLine2(
                updatedAddress.getAddressLine2()
        );

        existingAddress.setCity(
                updatedAddress.getCity()
        );

        existingAddress.setState(
                updatedAddress.getState()
        );

        existingAddress.setPostalCode(
                updatedAddress.getPostalCode()
        );

        existingAddress.setCountry(
                updatedAddress.getCountry()
        );

        existingAddress.setAddressType(
                updatedAddress.getAddressType()
        );

        /*
         * If user marks this address as default,
         * remove default status from all other addresses.
         */
        if (updatedAddress.isDefault()) {

            List<Address> customerAddresses =
                    addressRepository.findByCustomerId(
                            existingAddress.getCustomerId()
                    );

            for (Address address : customerAddresses) {

                if (!address.getAddressId()
                        .equals(existingAddress.getAddressId())) {

                    address.setDefault(false);
                }
            }

            existingAddress.setDefault(true);
        }

        return addressRepository.save(existingAddress);
    }

    // ============================================================
    // SET DEFAULT ADDRESS
    // ============================================================

    public Address setDefaultAddress(Long addressId) {

        Address address =
                getAddressById(addressId);

        List<Address> customerAddresses =
                addressRepository.findByCustomerId(
                        address.getCustomerId()
                );

        // Make every other address non-default.
        for (Address customerAddress : customerAddresses) {

            customerAddress.setDefault(
                    customerAddress.getAddressId()
                            .equals(addressId)
            );
        }

        return addressRepository.save(address);
    }

    // ============================================================
    // DELETE ADDRESS
    // ============================================================

    @Transactional
    public void deleteAddress(Long addressId) {

        /*
         * getAddressById() performs two important checks:
         *
         * 1. Address must exist.
         * 2. Address must belong to the logged-in customer.
         */
        Address existingAddress =
                getAddressById(addressId);

        Long customerId =
                existingAddress.getCustomerId();

        boolean wasDefault =
                existingAddress.isDefault();

        // ========================================================
        // CHECK WHETHER ADDRESS IS USED BY AN ORDER
        // ========================================================

        /*
         * We cannot delete an address that is already linked
         * to an order.
         *
         * Orders must preserve the delivery address used
         * during checkout.
         */
        boolean addressUsedByOrder =
                orderRepository.existsByAddress_AddressId(
                        addressId
                );

        if (addressUsedByOrder) {

            throw new RuntimeException(
                    "This address is linked to an existing order and cannot be deleted."
            );
        }

        // ========================================================
        // GET CUSTOMER ADDRESSES
        // ========================================================

        List<Address> customerAddresses =
                addressRepository.findByCustomerId(
                        customerId
                );

        // ========================================================
        // DELETE ADDRESS
        // ========================================================

        addressRepository.delete(existingAddress);

        // ========================================================
        // SELECT NEW DEFAULT ADDRESS
        // ========================================================

        /*
         * If the deleted address was the default address,
         * choose another address as the new default.
         */
        if (wasDefault) {

            Address newDefaultAddress = null;

            for (Address address : customerAddresses) {

                if (!address.getAddressId()
                        .equals(addressId)) {

                    newDefaultAddress = address;

                    break;
                }
            }

            /*
             * If another address exists,
             * automatically make it the default.
             */
            if (newDefaultAddress != null) {

                newDefaultAddress.setDefault(true);

                addressRepository.save(
                        newDefaultAddress
                );
            }
        }
    }
}