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

    @PostMapping
    public ResponseEntity<Address> createAddress(
            @RequestBody Address address) {

        Address savedAddress =
                addressService.createAddress(address);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAddress);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Address>> getAddressesByCustomerId(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                addressService.getAddressesByCustomerId(customerId)
        );
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<Address> getAddressById(
            @PathVariable Long addressId) {

        return ResponseEntity.ok(
                addressService.getAddressById(addressId)
        );
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long addressId,
            @RequestBody Address address) {

        return ResponseEntity.ok(
                addressService.updateAddress(addressId, address)
        );
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId) {

        addressService.deleteAddress(addressId);

        return ResponseEntity.noContent().build();
    }
}