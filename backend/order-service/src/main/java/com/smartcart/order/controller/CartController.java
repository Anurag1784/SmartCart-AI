package com.smartcart.order.controller;

import com.smartcart.order.entity.Cart;
import com.smartcart.order.entity.CartItem;
import com.smartcart.order.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Get cart for customer
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Cart> getCart(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                cartService.getOrCreateCart(customerId)
        );
    }

    // Get all items in customer's cart
    @GetMapping("/customer/{customerId}/items")
    public ResponseEntity<List<CartItem>> getCartItems(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                cartService.getCartItems(customerId)
        );
    }

    // Add item to customer's cart
    @PostMapping("/customer/{customerId}/items")
    public ResponseEntity<CartItem> addItem(
            @PathVariable Long customerId,
            @RequestBody CartItem cartItem) {

        CartItem savedItem =
                cartService.addItem(customerId, cartItem);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedItem);
    }

    // Update cart item quantity
    @PutMapping("/customer/{customerId}/items/{productId}")
    public ResponseEntity<CartItem> updateItem(
            @PathVariable Long customerId,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartService.updateItem(
                        customerId,
                        productId,
                        quantity
                )
        );
    }

    // Remove one item
    @DeleteMapping("/customer/{customerId}/items/{productId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long customerId,
            @PathVariable Long productId) {

        cartService.removeItem(customerId, productId);

        return ResponseEntity.noContent().build();
    }

    // Clear entire cart
    @DeleteMapping("/customer/{customerId}/items")
    public ResponseEntity<Void> clearCart(
            @PathVariable Long customerId) {

        cartService.clearCart(customerId);

        return ResponseEntity.noContent().build();
    }
}