package com.smartcart.order.repository;

import com.smartcart.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ============================================================
    // FIND ORDERS BY CUSTOMER
    // ============================================================

    List<Order> findByCustomerId(Long customerId);


    // ============================================================
    // FIND ORDERS BY ORDER STATUS
    // ============================================================

    List<Order> findByOrderStatus(String orderStatus);


    // ============================================================
    // FIND ORDERS BY PAYMENT STATUS
    // ============================================================

    List<Order> findByPaymentStatus(String paymentStatus);


    // ============================================================
    // CHECK WHETHER ADDRESS IS USED BY AN ORDER
    // ============================================================

    /*
     * Checks whether any order currently references
     * the specified address.
     *
     * Order contains:
     *
     *     private Address address;
     *
     * Address contains:
     *
     *     private Long addressId;
     *
     * Therefore Spring Data follows:
     *
     * Order -> Address -> addressId
     *
     * and returns true if at least one order uses
     * the given address.
     */
    boolean existsByAddress_AddressId(Long addressId);
}