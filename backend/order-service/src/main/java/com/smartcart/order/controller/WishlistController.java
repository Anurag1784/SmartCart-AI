package com.smartcart.order.controller;

import com.smartcart.order.entity.Wishlist;
import com.smartcart.order.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(
            WishlistService wishlistService) {

        this.wishlistService = wishlistService;
    }


    // =========================================================
    // GET MY WISHLIST
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Wishlist>> getMyWishlist() {

        return ResponseEntity.ok(
                wishlistService.getMyWishlist()
        );
    }


    // =========================================================
    // ADD PRODUCT TO WISHLIST
    // =========================================================

    @PostMapping("/{productId}")
    public ResponseEntity<Wishlist> addToWishlist(
            @PathVariable Long productId) {

        Wishlist wishlist =
                wishlistService.addToWishlist(productId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(wishlist);
    }


    // =========================================================
    // REMOVE PRODUCT FROM WISHLIST
    // =========================================================

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long productId) {

        wishlistService.removeFromWishlist(productId);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =========================================================
    // CHECK WHETHER PRODUCT IS WISHLISTED
    // =========================================================

    @GetMapping("/{productId}/exists")
    public ResponseEntity<Boolean> isProductInWishlist(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                wishlistService.isProductInWishlist(
                        productId
                )
        );
    }
}