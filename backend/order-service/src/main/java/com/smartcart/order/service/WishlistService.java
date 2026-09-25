package com.smartcart.order.service;

import com.smartcart.order.entity.Wishlist;
import com.smartcart.order.repository.WishlistRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    public WishlistService(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }


    // =========================================================
    // GET AUTHENTICATED CUSTOMER ID
    // =========================================================

    /*
     * Our JWT AuthenticationFilter stores the authenticated
     * user's database ID as the SecurityContext principal.
     *
     * Therefore we get the customer ID directly from JWT
     * authentication instead of trusting a customerId sent
     * by the frontend.
     */

    private Long getAuthenticatedCustomerId() {

        return (Long) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }


    // =========================================================
    // GET CUSTOMER WISHLIST
    // =========================================================

    public List<Wishlist> getMyWishlist() {

        Long customerId =
                getAuthenticatedCustomerId();

        return wishlistRepository
                .findByCustomerId(customerId);
    }


    // =========================================================
    // ADD PRODUCT TO WISHLIST
    // =========================================================

    public Wishlist addToWishlist(Long productId) {

        Long customerId =
                getAuthenticatedCustomerId();

        /*
         * Prevent duplicate wishlist entries.
         */

        if (wishlistRepository
                .existsByCustomerIdAndProductId(
                        customerId,
                        productId
                )) {

            throw new RuntimeException(
                    "Product is already in your wishlist."
            );
        }


        /*
         * Create a new wishlist entry.
         */

        Wishlist wishlist =
                new Wishlist();

        wishlist.setCustomerId(customerId);

        wishlist.setProductId(productId);

        wishlist.setCreatedAt(
                LocalDateTime.now()
        );


        return wishlistRepository.save(wishlist);
    }


    // =========================================================
    // REMOVE PRODUCT FROM WISHLIST
    // =========================================================

    public void removeFromWishlist(Long productId) {

        Long customerId =
                getAuthenticatedCustomerId();


        /*
         * Check whether the product actually exists
         * in this customer's wishlist.
         */

        Wishlist wishlist =
                wishlistRepository
                        .findByCustomerIdAndProductId(
                                customerId,
                                productId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product is not in your wishlist."
                                )
                        );


        /*
         * Delete only the authenticated customer's
         * wishlist entry.
         */

        wishlistRepository.delete(wishlist);
    }


    // =========================================================
    // CHECK WHETHER PRODUCT IS WISHLISTED
    // =========================================================

    public boolean isProductInWishlist(
            Long productId) {

        Long customerId =
                getAuthenticatedCustomerId();

        return wishlistRepository
                .existsByCustomerIdAndProductId(
                        customerId,
                        productId
                );
    }
}