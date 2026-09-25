package com.smartcart.order.controller;

import com.smartcart.order.entity.Address;
import com.smartcart.order.service.AddressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    // ============================================================
    // CREATE ADDRESS
    // ============================================================

    @PostMapping
    public ResponseEntity<Address> createAddress(
            @RequestBody Address address) {

        Address savedAddress =
                addressService.createAddress(address);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAddress);
    }


    // ============================================================
    // GET CUSTOMER ADDRESSES
    // ============================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Address>> getAddressesByCustomerId(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                addressService.getAddressesByCustomerId(customerId)
        );
    }


    // ============================================================
    // GET ADDRESS BY ID
    // ============================================================

    @GetMapping("/{addressId}")
    public ResponseEntity<Address> getAddressById(
            @PathVariable Long addressId) {

        return ResponseEntity.ok(
                addressService.getAddressById(addressId)
        );
    }


    // ============================================================
    // UPDATE ADDRESS
    // ============================================================

    @PutMapping("/{addressId}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long addressId,
            @RequestBody Address address) {

        return ResponseEntity.ok(
                addressService.updateAddress(
                        addressId,
                        address
                )
        );
    }


    // ============================================================
    // SET DEFAULT ADDRESS
    // ============================================================

    @PutMapping("/{addressId}/default")
    public ResponseEntity<Address> setDefaultAddress(
            @PathVariable Long addressId) {

        return ResponseEntity.ok(
                addressService.setDefaultAddress(
                        addressId
                )
        );
    }


    // ============================================================
    // DELETE ADDRESS
    // ============================================================

    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> deleteAddress(
            @PathVariable Long addressId) {

        try {

            addressService.deleteAddress(addressId);

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException exception) {

            /*
             * Address is linked to an existing order.
             *
             * Returning 409 Conflict tells the frontend
             * that the request itself was valid, but the
             * address cannot be deleted because of an
             * existing relationship.
             */

            if (exception.getMessage() != null
                    && exception.getMessage().contains(
                            "linked to an existing order"
                    )) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                exception.getMessage()
                        );
            }


            /*
             * Preserve other existing runtime errors.
             */

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            exception.getMessage()
                    );
        }
    }
}