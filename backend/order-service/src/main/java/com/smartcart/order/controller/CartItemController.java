package com.smartcart.order.controller;

import com.smartcart.order.entity.CartItem;
import com.smartcart.order.service.CartItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
public class CartItemController {

    private final CartItemService cartItemService;

    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    @GetMapping("/cart/{cartId}")
    public ResponseEntity<List<CartItem>> getItemsByCartId(
            @PathVariable Long cartId) {

        return ResponseEntity.ok(
                cartItemService.getItemsByCartId(cartId)
        );
    }

    @GetMapping("/cart/{cartId}/product/{productId}")
    public ResponseEntity<CartItem> getItem(
            @PathVariable Long cartId,
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                cartItemService.getItem(cartId, productId)
        );
    }

    @PostMapping("/cart/{cartId}")
    public ResponseEntity<CartItem> addItem(
            @PathVariable Long cartId,
            @RequestBody CartItem cartItem) {

        CartItem savedItem =
                cartItemService.addItem(cartId, cartItem);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedItem);
    }

    @PutMapping("/cart/{cartId}/product/{productId}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable Long cartId,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartItemService.updateQuantity(
                        cartId,
                        productId,
                        quantity
                )
        );
    }

    @DeleteMapping("/cart/{cartId}/product/{productId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long cartId,
            @PathVariable Long productId) {

        cartItemService.removeItem(cartId, productId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cart/{cartId}")
    public ResponseEntity<Void> removeAllItems(
            @PathVariable Long cartId) {

        cartItemService.removeAllItems(cartId);

        return ResponseEntity.noContent().build();
    }
}