package com.smartcart.order.service;

import com.smartcart.order.entity.Order;
import com.smartcart.order.entity.OrderItem;
import com.smartcart.order.feign.InventoryClient;
import com.smartcart.order.feign.ProductClient;
import com.smartcart.order.repository.OrderItemRepository;
import com.smartcart.order.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductClient productClient,
            InventoryClient inventoryClient) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    @Transactional
    public Order createOrder(
            Order order,
            List<OrderItem> orderItems) {

        if (orderItems == null || orderItems.isEmpty()) {
            throw new RuntimeException(
                    "Order must contain at least one item"
            );
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> preparedItems = new ArrayList<>();

        // =====================================================
        // VALIDATE PRODUCTS + CHECK + RESERVE INVENTORY
        // =====================================================

        for (OrderItem item : orderItems) {

            if (item.getProductId() == null) {
                throw new RuntimeException(
                        "Product ID is required"
                );
            }

            if (item.getQuantity() == null ||
                    item.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Quantity must be greater than 0"
                );
            }

            if (item.getUnitPrice() == null ||
                    item.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {

                throw new RuntimeException(
                        "Unit price must be valid"
                );
            }

            // =================================================
            // 1. VERIFY PRODUCT EXISTS
            // =================================================

            productClient.getProductById(
                    item.getProductId()
            );

            // =================================================
            // 2. CHECK INVENTORY AVAILABILITY
            // =================================================

            Boolean available =
                    inventoryClient.checkAvailability(
                            item.getProductId(),
                            item.getQuantity()
                    );

            if (!Boolean.TRUE.equals(available)) {
                throw new RuntimeException(
                        "Insufficient stock for product ID: "
                                + item.getProductId()
                );
            }

            // =================================================
            // 3. RESERVE INVENTORY
            // =================================================

            inventoryClient.reserveStock(
                    item.getProductId(),
                    item.getQuantity()
            );

            // =================================================
            // 4. CALCULATE SUBTOTAL
            // =================================================

            BigDecimal subtotal =
                    item.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            item.setSubtotal(subtotal);

            totalAmount =
                    totalAmount.add(subtotal);

            preparedItems.add(item);
        }

        // =====================================================
        // SET ORDER INFORMATION
        // =====================================================

        LocalDateTime now = LocalDateTime.now();

        order.setTotalAmount(totalAmount);
        order.setOrderStatus("PENDING_PAYMENT");
        order.setPaymentStatus("PENDING");
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        // =====================================================
        // SAVE ORDER
        // =====================================================

        Order savedOrder =
                orderRepository.save(order);

        // =====================================================
        // SAVE ORDER ITEMS
        // =====================================================

        for (OrderItem item : preparedItems) {

            item.setOrder(savedOrder);

            orderItemRepository.save(item);
        }

        savedOrder.setOrderItems(preparedItems);

        return savedOrder;
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        )
                );
    }

    // =========================================================
    // GET ORDERS BY CUSTOMER
    // =========================================================

    public List<Order> getOrdersByCustomerId(
            Long customerId) {

        return orderRepository.findByCustomerId(
                customerId
        );
    }

    // =========================================================
    // GET ORDERS BY STATUS
    // =========================================================

    public List<Order> getOrdersByStatus(
            String orderStatus) {

        return orderRepository.findByOrderStatus(
                orderStatus
        );
    }

    // =========================================================
    // GET ORDERS BY PAYMENT STATUS
    // =========================================================

    public List<Order> getOrdersByPaymentStatus(
            String paymentStatus) {

        return orderRepository.findByPaymentStatus(
                paymentStatus
        );
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @Transactional
    public Order updateOrderStatus(
            Long orderId,
            String newStatus) {

        Order order = getOrderById(orderId);

        String currentStatus = order.getOrderStatus();

        // =====================================================
        // VALIDATE CURRENT STATUS
        // =====================================================

        if (currentStatus == null ||
                currentStatus.trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Current order status is missing"
            );
        }

        currentStatus = currentStatus.trim().toUpperCase();

        // =====================================================
        // VALIDATE NEW STATUS
        // =====================================================

        if (newStatus == null ||
                newStatus.trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order status is required"
            );
        }

        newStatus = newStatus.trim().toUpperCase();

        // =====================================================
        // DO NOT UPDATE TO SAME STATUS
        // =====================================================

        if (currentStatus.equals(newStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order is already in status: "
                            + currentStatus
            );
        }

        // =====================================================
        // CANCELLED ORDER CANNOT BE UPDATED
        // =====================================================

        if ("CANCELLED".equals(currentStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancelled order cannot be updated"
            );
        }

        // =====================================================
        // COMPLETED ORDER CANNOT BE UPDATED
        // =====================================================

        if ("COMPLETED".equals(currentStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Completed order cannot be updated"
            );
        }

        // =====================================================
        // VALID ORDER STATUS TRANSITIONS
        // =====================================================

        boolean validTransition = false;

        switch (currentStatus) {

            // -------------------------------------------------
            // PENDING_PAYMENT -> CONFIRMED
            // -------------------------------------------------

            case "PENDING_PAYMENT":

                if ("CONFIRMED".equals(newStatus)) {
                    validTransition = true;
                }

                break;

            // -------------------------------------------------
            // CONFIRMED -> PROCESSING
            // -------------------------------------------------

            case "CONFIRMED":

                if ("PROCESSING".equals(newStatus)) {
                    validTransition = true;
                }

                break;

            // -------------------------------------------------
            // PROCESSING -> SHIPPED
            // -------------------------------------------------

            case "PROCESSING":

                if ("SHIPPED".equals(newStatus)) {
                    validTransition = true;
                }

                break;

            // -------------------------------------------------
            // SHIPPED -> DELIVERED
            // -------------------------------------------------

            case "SHIPPED":

                if ("DELIVERED".equals(newStatus)) {
                    validTransition = true;
                }

                break;

            // -------------------------------------------------
            // DELIVERED -> COMPLETED
            // -------------------------------------------------

            case "DELIVERED":

                if ("COMPLETED".equals(newStatus)) {
                    validTransition = true;
                }

                break;

            // -------------------------------------------------
            // UNKNOWN CURRENT STATUS
            // -------------------------------------------------

            default:

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid current order status: "
                                + currentStatus
                );
        }

        // =====================================================
        // INVALID STATUS TRANSITION
        // =====================================================

        if (!validTransition) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order status transition: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        // =====================================================
        // UPDATE STATUS
        // =====================================================

        order.setOrderStatus(newStatus);

        order.setUpdatedAt(
                LocalDateTime.now()
        );

        return orderRepository.save(order);
    }

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @Transactional
    public Order cancelOrder(Long orderId) {

        Order order = getOrderById(orderId);

        String currentStatus = order.getOrderStatus();

        // =====================================================
        // ALREADY CANCELLED
        // =====================================================

        if ("CANCELLED".equals(currentStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order is already cancelled"
            );
        }

        // =====================================================
        // COMPLETED ORDER CANNOT BE CANCELLED
        // =====================================================

        if ("COMPLETED".equals(currentStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Completed order cannot be cancelled"
            );
        }

        // =====================================================
        // DELIVERED ORDER CANNOT BE CANCELLED
        // =====================================================

        if ("DELIVERED".equals(currentStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Delivered order cannot be cancelled"
            );
        }

        // =====================================================
        // RELEASE RESERVED STOCK
        // =====================================================

        if (order.getOrderItems() != null) {

            for (OrderItem item :
                    order.getOrderItems()) {

                inventoryClient.releaseStock(
                        item.getProductId(),
                        item.getQuantity()
                );
            }
        }

        // =====================================================
        // UPDATE ORDER
        // =====================================================

        order.setOrderStatus("CANCELLED");

        order.setCancelledAt(
                LocalDateTime.now()
        );

        order.setUpdatedAt(
                LocalDateTime.now()
        );

        return orderRepository.save(order);
    }
}