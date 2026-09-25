package com.smartcart.order.controller;

import com.smartcart.order.entity.OrderItem;
import com.smartcart.order.service.OrderItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    // ============================================================
    // GET ALL ITEMS OF A PARTICULAR ORDER
    // ============================================================
    // Example:
    // GET /api/order-items/order/30
    //
    // This returns all products/items that belong to Order #30.
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItem>> getItemsByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderItemService.getItemsByOrderId(orderId)
        );
    }


    // ============================================================
    // GET ONE ORDER ITEM BY ID
    // ============================================================
    // Example:
    // GET /api/order-items/101
    //
    // Returns one specific OrderItem.
    @GetMapping("/{orderItemId}")
    public ResponseEntity<OrderItem> getOrderItemById(
            @PathVariable Long orderItemId) {

        return ResponseEntity.ok(
                orderItemService.getOrderItemById(orderItemId)
        );
    }


    // ============================================================
    // CREATE ORDER ITEM
    // ============================================================
    // Example:
    // POST /api/order-items/order/30
    //
    // This is the existing generic endpoint.
    @PostMapping("/order/{orderId}")
    public ResponseEntity<OrderItem> addOrderItem(
            @PathVariable Long orderId,
            @RequestBody OrderItem orderItem) {

        OrderItem savedItem =
                orderItemService.addOrderItem(orderId, orderItem);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedItem);
    }


    // ============================================================
    // GET ITEMS BY PRODUCT ID
    // ============================================================
    // Example:
    // GET /api/order-items/product/7
    //
    // Returns all order items that contain product ID 7.
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<OrderItem>> getItemsByProductId(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                orderItemService.getItemsByProductId(productId)
        );
    }


    // ============================================================
    // GET ITEMS BY SELLER ID
    // ============================================================
    // Existing endpoint.
    //
    // We are keeping this for now so we don't accidentally
    // break any existing functionality.
    //
    // IMPORTANT:
    // The new Seller Workspace should NOT use this endpoint.
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<OrderItem>> getItemsBySellerId(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                orderItemService.getItemsBySellerId(sellerId)
        );
    }


    // ============================================================
    // GET MY ORDER ITEMS — SECURE SELLER ENDPOINT
    // ============================================================
    // Example:
    // GET /api/order-items/my-orders
    //
    // The frontend does NOT send sellerId.
    //
    // Instead:
    //
    // JWT
    //   ↓
    // JwtAuthenticationFilter
    //   ↓
    // Authentication principal
    //   ↓
    // Logged-in seller's userId
    //   ↓
    // OrderItemService
    //   ↓
    // Only this seller's OrderItems
    //
    // This is the endpoint that our Seller Orders page
    // will use.
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderItem>> getMyOrderItems(
            org.springframework.security.core.Authentication authentication) {

        // The JwtAuthenticationFilter stores the user's
        // Long userId as the Authentication principal.
        Long sellerId = (Long) authentication.getPrincipal();

        // Use the authenticated seller's ID instead of
        // trusting an ID supplied by the frontend.
        return ResponseEntity.ok(
                orderItemService.getItemsBySellerId(sellerId)
        );
    }


    // ============================================================
    // DELETE ORDER ITEM
    // ============================================================
    // Example:
    // DELETE /api/order-items/101
    //
    // Existing functionality is preserved.
    @DeleteMapping("/{orderItemId}")
    public ResponseEntity<Void> deleteOrderItem(
            @PathVariable Long orderItemId) {

        orderItemService.deleteOrderItem(orderItemId);

        return ResponseEntity.noContent().build();
    }
}