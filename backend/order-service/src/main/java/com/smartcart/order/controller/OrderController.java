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

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomerId(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getOrdersByCustomerId(customerId)
        );
    }

    @GetMapping("/status/{orderStatus}")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @PathVariable String orderStatus) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(orderStatus)
        );
    }

    @GetMapping("/payment-status/{paymentStatus}")
    public ResponseEntity<List<Order>> getOrdersByPaymentStatus(
            @PathVariable String paymentStatus) {

        return ResponseEntity.ok(
                orderService.getOrdersByPaymentStatus(paymentStatus)
        );
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.cancelOrder(orderId)
        );
    }

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

        public void setOrderItems(List<OrderItem> orderItems) {
            this.orderItems = orderItems;
        }
    }
}