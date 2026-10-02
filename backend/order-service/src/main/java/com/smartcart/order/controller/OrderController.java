package com.smartcart.order.controller;

import com.smartcart.order.entity.Address;
import com.smartcart.order.entity.Order;
import com.smartcart.order.entity.OrderItem;
import com.smartcart.order.repository.AddressRepository;
import com.smartcart.order.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AddressRepository addressRepository;

    public OrderController(
            OrderService orderService,
            AddressRepository addressRepository) {

        this.orderService = orderService;
        this.addressRepository = addressRepository;
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request) {

        // -----------------------------------------------------
        // Validate request
        // -----------------------------------------------------

        if (request == null ||
                request.getOrder() == null ||
                request.getOrderItems() == null ||
                request.getOrderItems().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        // -----------------------------------------------------
        // Find address using addressId
        // -----------------------------------------------------

        if (request.getAddressId() == null) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        Address address = addressRepository
                .findById(request.getAddressId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Address not found with id: "
                                        + request.getAddressId()
                        )
                );

        // -----------------------------------------------------
        // Validate that address belongs to customer
        // -----------------------------------------------------

        if (!address.getCustomerId()
                .equals(request.getOrder().getCustomerId())) {

            throw new RuntimeException(
                    "Address does not belong to the customer"
            );
        }

        // -----------------------------------------------------
        // Attach Address entity to Order
        // -----------------------------------------------------

        request.getOrder().setAddress(address);

        // -----------------------------------------------------
        // Create order using existing OrderService
        // -----------------------------------------------------

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
        // GET TOTAL ORDER COUNT
       // =========================================================

        @GetMapping("/count")
         public ResponseEntity<Long> getTotalOrderCount() {

             return ResponseEntity.ok(
             orderService.countOrders()
         );
       }
        
        
     // =========================================================
     // GET ALL ORDERS
     // =========================================================

     @GetMapping
     public ResponseEntity<List<Order>> getAllOrders() {

         return ResponseEntity.ok(
             orderService.getAllOrders()
         );
     }

    // =========================================================
    // GET ORDERS BY CUSTOMER
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomerId(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getOrdersByCustomerId(
                        customerId
                )
        );
    }

    // =========================================================
    // GET ORDERS BY STATUS
    // =========================================================

    @GetMapping("/status/{orderStatus}")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @PathVariable String orderStatus) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(
                        orderStatus
                )
        );
    }

    // =========================================================
    // GET ORDERS BY PAYMENT STATUS
    // =========================================================

    @GetMapping("/payment-status/{paymentStatus}")
    public ResponseEntity<List<Order>> getOrdersByPaymentStatus(
            @PathVariable String paymentStatus) {

        return ResponseEntity.ok(
                orderService.getOrdersByPaymentStatus(
                        paymentStatus
                )
        );
    }

    // =========================================================
    // UPDATE PAYMENT STATUS
    // =========================================================

    @PutMapping("/{orderId}/payment-status")
    public ResponseEntity<Order> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        return ResponseEntity.ok(
                orderService.updatePaymentStatus(
                        orderId,
                        status
                )
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

        private Long addressId;

        private List<OrderItem> orderItems;

        // -----------------------------------------------------
        // Order
        // -----------------------------------------------------

        public Order getOrder() {

            return order;
        }

        public void setOrder(Order order) {

            this.order = order;
        }

        // -----------------------------------------------------
        // Address ID
        // -----------------------------------------------------

        public Long getAddressId() {

            return addressId;
        }

        public void setAddressId(Long addressId) {

            this.addressId = addressId;
        }

        // -----------------------------------------------------
        // Order Items
        // -----------------------------------------------------

        public List<OrderItem> getOrderItems() {

            return orderItems;
        }

        public void setOrderItems(
                List<OrderItem> orderItems) {

            this.orderItems = orderItems;
        }
    }
}