package com.smartcart.order.service;

import com.smartcart.order.entity.Address;
import com.smartcart.order.repository.AddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public Address createAddress(Address address) {
        return addressRepository.save(address);
    }

    public List<Address> getAddressesByCustomerId(Long customerId) {
        return addressRepository.findByCustomerId(customerId);
    }

    public Address getAddressById(Long addressId) {
        return addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
    }

    public Address updateAddress(Long addressId, Address updatedAddress) {

        Address existingAddress = getAddressById(addressId);

        existingAddress.setAddressLine1(updatedAddress.getAddressLine1());
        existingAddress.setAddressLine2(updatedAddress.getAddressLine2());
        existingAddress.setCity(updatedAddress.getCity());
        existingAddress.setState(updatedAddress.getState());
        existingAddress.setPostalCode(updatedAddress.getPostalCode());
        existingAddress.setCountry(updatedAddress.getCountry());
        existingAddress.setAddressType(updatedAddress.getAddressType());

        return addressRepository.save(existingAddress);
    }

    public void deleteAddress(Long addressId) {

        Address existingAddress = getAddressById(addressId);

        addressRepository.delete(existingAddress);
    }
}