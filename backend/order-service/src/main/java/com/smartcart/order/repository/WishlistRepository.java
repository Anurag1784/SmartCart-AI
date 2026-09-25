package com.smartcart.order.repository;

import com.smartcart.order.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository
        extends JpaRepository<Wishlist, Long> {

    // =========================================================
    // GET ALL WISHLIST ITEMS OF A CUSTOMER
    // =========================================================

    List<Wishlist> findByCustomerId(Long customerId);


    // =========================================================
    // CHECK WHETHER PRODUCT IS ALREADY IN WISHLIST
    // =========================================================

    Optional<Wishlist> findByCustomerIdAndProductId(
            Long customerId,
            Long productId
    );


    // =========================================================
    // CHECK EXISTENCE
    // =========================================================

    boolean existsByCustomerIdAndProductId(
            Long customerId,
            Long productId
    );


    // =========================================================
    // DELETE PRODUCT FROM CUSTOMER WISHLIST
    // =========================================================

    void deleteByCustomerIdAndProductId(
            Long customerId,
            Long productId
    );
}