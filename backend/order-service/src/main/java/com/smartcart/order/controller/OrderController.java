package com.smartcart.order.controller;

import com.smartcart.order.entity.Order;
import com.smartcart.order.entity.OrderItem;
import com.smartcart.order.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {

        this.orderService = orderService;
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request) {

        Order savedOrder = orderService.createOrder(
                request.getOrder(),
                request.getOrderItems()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedOrder);
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }

    // =========================================================
    // GET ORDERS BY CUSTOMER
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomerId(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getOrdersByCustomerId(customerId)
        );
    }

    // =========================================================
    // GET ORDERS BY STATUS
    // =========================================================

    @GetMapping("/status/{orderStatus}")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @PathVariable String orderStatus) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(orderStatus)
        );
    }

    // =========================================================
    // GET ORDERS BY PAYMENT STATUS
    // =========================================================

    @GetMapping("/payment-status/{paymentStatus}")
    public ResponseEntity<List<Order>> getOrdersByPaymentStatus(
            @PathVariable String paymentStatus) {

        return ResponseEntity.ok(
                orderService.getOrdersByPaymentStatus(paymentStatus)
        );
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        orderId,
                        status
                )
        );
    }

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.cancelOrder(orderId)
        );
    }

    // =========================================================
    // ORDER REQUEST DTO
    // =========================================================

    public static class OrderRequest {

        private Order order;

        private List<OrderItem> orderItems;

        public Order getOrder() {

            return order;
        }

        public void setOrder(Order order) {

            this.order = order;
        }

        public List<OrderItem> getOrderItems() {

            return orderItems;
        }

        public void setOrderItems(
                List<OrderItem> orderItems) {

            this.orderItems = orderItems;
        }
    }
}