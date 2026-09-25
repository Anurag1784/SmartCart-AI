package com.smartcart.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "wishlist",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_wishlist_customer_product",
                        columnNames = {
                                "customer_id",
                                "product_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist {

    // =========================================================
    // WISHLIST ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wishlist_id")
    private Long wishlistId;


    // =========================================================
    // CUSTOMER ID
    // =========================================================

    /*
     * ID of the customer who added the product.
     *
     * We will NOT trust this value from the frontend.
     * WishlistService will set it using the authenticated
     * user's JWT identity.
     */

    @Column(
            name = "customer_id",
            nullable = false
    )
    private Long customerId;


    // =========================================================
    // PRODUCT ID
    // =========================================================

    /*
     * ID of the product added to the wishlist.
     *
     * Product belongs to Product Service, so we store
     * only the productId here instead of creating a
     * cross-microservice JPA relationship.
     */

    @Column(
            name = "product_id",
            nullable = false
    )
    private Long productId;


    // =========================================================
    // CREATED AT
    // =========================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;
}