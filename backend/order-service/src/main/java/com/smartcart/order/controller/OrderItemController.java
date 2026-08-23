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

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItem>> getItemsByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderItemService.getItemsByOrderId(orderId)
        );
    }

    @GetMapping("/{orderItemId}")
    public ResponseEntity<OrderItem> getOrderItemById(
            @PathVariable Long orderItemId) {

        return ResponseEntity.ok(
                orderItemService.getOrderItemById(orderItemId)
        );
    }

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

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<OrderItem>> getItemsByProductId(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                orderItemService.getItemsByProductId(productId)
        );
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<OrderItem>> getItemsBySellerId(
            @PathVariable Long sellerId) {

        return ResponseEntity.ok(
                orderItemService.getItemsBySellerId(sellerId)
        );
    }

    @DeleteMapping("/{orderItemId}")
    public ResponseEntity<Void> deleteOrderItem(
            @PathVariable Long orderItemId) {

        orderItemService.deleteOrderItem(orderItemId);

        return ResponseEntity.noContent().build();
    }
}