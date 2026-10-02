package com.smartcart.order.service;

import com.smartcart.order.dto.PaymentResponse;

import com.smartcart.order.dto.InternalOrderNotificationRequest;

import com.smartcart.order.feign.NotificationClient;

import com.smartcart.order.dto.ProductResponse;

import com.smartcart.order.entity.Order;

import com.smartcart.order.entity.OrderItem;

import com.smartcart.order.feign.InventoryClient;

import com.smartcart.order.feign.PaymentClient;

import com.smartcart.order.feign.ProductClient;

import com.smartcart.order.repository.OrderItemRepository;

import com.smartcart.order.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpStatus;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;

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

    private final PaymentClient paymentClient;

    private final NotificationClient notificationClient;

    @Value("${notification.internal.secret}")
    private String notificationInternalSecret;


    public OrderService(

            OrderRepository orderRepository,

            OrderItemRepository orderItemRepository,

            ProductClient productClient,

            InventoryClient inventoryClient,

            PaymentClient paymentClient,

            NotificationClient notificationClient) {

        this.orderRepository = orderRepository;

        this.orderItemRepository = orderItemRepository;

        this.productClient = productClient;

        this.inventoryClient = inventoryClient;

        this.paymentClient = paymentClient;

        this.notificationClient = notificationClient;

    }

    // =========================================================

    // CREATE ORDER

    // =========================================================

    @Transactional

    public Order createOrder(

            Order order,

            List<OrderItem> orderItems) {

        // =====================================================

        // VALIDATE ORDER

        // =====================================================

        if (order == null) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Order information is required"

            );

        }

        // =====================================================

        // VALIDATE CUSTOMER

        // =====================================================

        if (order.getCustomerId() == null) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Customer ID is required"

            );

        }

        // =====================================================

        // VALIDATE ADDRESS

        // =====================================================

        if (order.getAddress() == null ||

                order.getAddress().getAddressId() == null) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Address ID is required"

            );

        }

        // =====================================================

        // VALIDATE ORDER ITEMS

        // =====================================================

        if (orderItems == null || orderItems.isEmpty()) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Order must contain at least one item"

            );

        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        List<OrderItem> preparedItems = new ArrayList<>();

        // =====================================================

        // PROCESS EACH ORDER ITEM

        // =====================================================

        for (OrderItem item : orderItems) {

            // =================================================

            // VALIDATE ORDER ITEM

            // =================================================

            if (item == null) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Order item cannot be null"

                );

            }

            // =================================================

            // VALIDATE PRODUCT ID

            // =================================================

            if (item.getProductId() == null) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Product ID is required"

                );

            }

            // =================================================

            // VALIDATE QUANTITY

            // =================================================

            if (item.getQuantity() == null ||

                    item.getQuantity() <= 0) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Quantity must be greater than 0"

                );

            }

            // =================================================

            // GET PRODUCT FROM PRODUCT SERVICE

            // =================================================

            ProductResponse product =

                    productClient.getProductById(

                            item.getProductId()

                    );

            // =================================================

            // PRODUCT NOT FOUND

            // =================================================

            if (product == null) {

                throw new ResponseStatusException(

                        HttpStatus.NOT_FOUND,

                        "Product not found with ID: "

                                + item.getProductId()

                );

            }

            // =================================================

            // VERIFY SELLER ID

            // =================================================

            if (product.getSellerId() == null) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Seller ID is missing for product: "

                                + item.getProductId()

                );

            }

            // =================================================

            // VERIFY PRODUCT PRICE

            // =================================================

            if (product.getPrice() == null ||

                    product.getPrice()

                            .compareTo(BigDecimal.ZERO) <= 0) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Product price is invalid for product ID: "

                                + item.getProductId()

                );

            }

            // =================================================

            // VERIFY PRODUCT STATUS

            // =================================================

            if (product.getStatus() == null ||

                    !product.getStatus()

                            .trim()

                            .equalsIgnoreCase("ACTIVE")) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Product is not active for product ID: "

                                + item.getProductId()

                );

            }

            // =================================================

            // SET SELLER ID FROM PRODUCT SERVICE

            // =================================================

            item.setSellerId(

                    product.getSellerId()

            );

            // =================================================

            // SET UNIT PRICE FROM PRODUCT SERVICE

            // =================================================

            // Product Service is the source of truth

            // for product price.

            BigDecimal unitPrice =

                    product.getPrice();

            item.setUnitPrice(unitPrice);

            // =================================================

            // CHECK INVENTORY AVAILABILITY

            // =================================================

            Boolean available;

            try {

                available =

                        inventoryClient.checkAvailability(

                                item.getProductId(),

                                item.getQuantity()

                        );

            } catch (Exception exception) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Unable to check inventory for product ID: "

                                + item.getProductId(),

                        exception

                );

            }

            // =================================================

            // STOCK NOT AVAILABLE

            // =================================================

            if (!Boolean.TRUE.equals(available)) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Insufficient stock for product ID: "

                                + item.getProductId()

                );

            }

            // =================================================

            // RESERVE INVENTORY

            // =================================================

            try {

                inventoryClient.reserveStock(

                        item.getProductId(),

                        item.getQuantity()

                );

            } catch (Exception exception) {

                throw new ResponseStatusException(

                        HttpStatus.BAD_REQUEST,

                        "Unable to reserve stock for product ID: "

                                + item.getProductId(),

                        exception

                );

            }

            // =================================================

            // CALCULATE SUBTOTAL

            // =================================================

            BigDecimal subtotal =

                    unitPrice.multiply(

                            BigDecimal.valueOf(

                                    item.getQuantity()

                            )

                    );

            item.setSubtotal(subtotal);

            // =================================================

            // ADD TO TOTAL ORDER AMOUNT

            // =================================================

            totalAmount =

                    totalAmount.add(subtotal);

            // =================================================

            // ADD PREPARED ITEM

            // =================================================

            preparedItems.add(item);

        }

        // =====================================================

        // SET ORDER INFORMATION

        // =====================================================

        LocalDateTime now =

                LocalDateTime.now();

        order.setTotalAmount(

                totalAmount

        );

        order.setOrderStatus(

                "PENDING_PAYMENT"

        );

        order.setPaymentStatus(

                "PENDING"

        );

        order.setCreatedAt(

                now

        );

        order.setUpdatedAt(

                now

        );

        // =====================================================

        // SAVE ORDER

        // =====================================================

        Order savedOrder =

                orderRepository.save(order);

        // =====================================================

        // SAVE ORDER ITEMS

        // =====================================================

        for (OrderItem item : preparedItems) {

            item.setOrder(

                    savedOrder

            );

            orderItemRepository.save(

                    item

            );

        }

        // =====================================================

        // SET ORDER ITEMS

        // =====================================================

        savedOrder.setOrderItems(

                preparedItems

        );

        return savedOrder;

    }

    // =========================================================

    // GET ORDER BY ID

    // =========================================================

    public Order getOrderById(

            Long orderId) {

        if (orderId == null) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Order ID is required"

            );

        }

        return orderRepository.findById(

                orderId

        ).orElseThrow(() ->

                new ResponseStatusException(

                        HttpStatus.NOT_FOUND,

                        "Order not found with ID: "

                                + orderId

                )

        );

    }
    
        // =========================================================
        // COUNT TOTAL ORDERS
        // =========================================================

        public long countOrders() {

                return orderRepository.count();
        }
        
        
     // =========================================================
     // GET ALL ORDERS
     // =========================================================

     public List<Order> getAllOrders() {

         return orderRepository.findAll();
     }

    // =========================================================

    // GET ORDERS BY CUSTOMER

    // =========================================================

    public List<Order> getOrdersByCustomerId(

            Long customerId) {

        if (customerId == null) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Customer ID is required"

            );

        }

        return orderRepository.findByCustomerId(

                customerId

        );

    }

    // =========================================================

    // GET ORDERS BY STATUS

    // =========================================================

    public List<Order> getOrdersByStatus(

            String orderStatus) {

        if (orderStatus == null ||

                orderStatus.trim().isEmpty()) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Order status is required"

            );

        }

        return orderRepository.findByOrderStatus(

                orderStatus.trim().toUpperCase()

        );

    }

    // =========================================================

    // GET ORDERS BY PAYMENT STATUS

    // =========================================================

    public List<Order> getOrdersByPaymentStatus(

            String paymentStatus) {

        if (paymentStatus == null ||

                paymentStatus.trim().isEmpty()) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Payment status is required"

            );

        }

        return orderRepository.findByPaymentStatus(

                paymentStatus.trim().toUpperCase()

        );

    }

    // =========================================================

    // UPDATE PAYMENT STATUS

    // =========================================================

    @Transactional

    public Order updatePaymentStatus(

            Long orderId,

            String newPaymentStatus) {

        Order order =

                getOrderById(orderId);

        // =====================================================

        // VALIDATE PAYMENT STATUS

        // =====================================================

        if (newPaymentStatus == null ||

                newPaymentStatus.trim().isEmpty()) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Payment status is required"

            );

        }

        newPaymentStatus =

                newPaymentStatus

                        .trim()

                        .toUpperCase();

        // =====================================================

        // ALLOWED PAYMENT STATUSES

        // =====================================================

        if (!"PENDING".equals(newPaymentStatus) &&

                !"SUCCESS".equals(newPaymentStatus) &&

                !"FAILED".equals(newPaymentStatus) &&

                !"REFUNDED".equals(newPaymentStatus)) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Invalid payment status: "

                            + newPaymentStatus

            );

        }

        // =====================================================

        // CANCELLED ORDER

        // =====================================================

        if ("CANCELLED".equalsIgnoreCase(

                order.getOrderStatus()

        )) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Cancelled order payment status cannot be updated"

            );

        }

        // =====================================================

        // DO NOT UPDATE TO SAME PAYMENT STATUS

        // =====================================================

        String currentPaymentStatus =

                order.getPaymentStatus();

        if (currentPaymentStatus != null &&

                currentPaymentStatus

                        .trim()

                        .equalsIgnoreCase(

                                newPaymentStatus

                        )) {

            throw new ResponseStatusException(

                    HttpStatus.BAD_REQUEST,

                    "Order payment is already in status: "

                            + currentPaymentStatus

            );

        }

        // =====================================================

        // UPDATE PAYMENT STATUS

        // =====================================================

        order.setPaymentStatus(

                newPaymentStatus

        );

        // =====================================================

        // AUTOMATIC ORDER STATUS UPDATE

        // =====================================================

        /*

         * Payment SUCCESS means the customer has

         * successfully paid for the order.

         *

         * Therefore:

         *

         * PENDING_PAYMENT

         *        ↓

         *    CONFIRMED

         *

         * This happens automatically.

         */

        if ("SUCCESS".equals(newPaymentStatus)) {

            String currentOrderStatus =

                    order.getOrderStatus();

            if ("PENDING_PAYMENT".equalsIgnoreCase(

                    currentOrderStatus

            )) {

                order.setOrderStatus(

                        "CONFIRMED"

                );

            }

        }

        // =====================================================

        // FAILED PAYMENT

        // =====================================================

        /*

         * When payment fails, the order remains

         * PENDING_PAYMENT.

         *

         * The customer can attempt payment again.

         */

        if ("FAILED".equals(newPaymentStatus)) {

            if ("PENDING_PAYMENT".equalsIgnoreCase(

                    order.getOrderStatus()

            )) {

                order.setOrderStatus(

                        "PENDING_PAYMENT"

                );

            }

        }

        // =====================================================

        // REFUNDED PAYMENT

        // =====================================================

        /*

         * REFUNDED does not automatically change the

         * fulfillment status.

         *

         * Example:

         *

         * DELIVERED + REFUNDED

         *

         * remains:

         *

         * DELIVERED + REFUNDED

         */

        order.setUpdatedAt(

                LocalDateTime.now()

        );

        order.setUpdatedAt(

                LocalDateTime.now()

        );

        // =====================================================

        // SAVE UPDATED ORDER

        // =====================================================

        Order savedOrder =

                orderRepository.save(order);

        // =====================================================

        // CREATE SELLER NOTIFICATIONS

        // =====================================================

        //

        // Only notify sellers when payment was successful

        // and the order became CONFIRMED.

        //

        if ("SUCCESS".equals(newPaymentStatus) &&

                "CONFIRMED".equalsIgnoreCase(

                        savedOrder.getOrderStatus())) {

            if (savedOrder.getOrderItems() != null) {

                for (OrderItem item :

                        savedOrder.getOrderItems()) {

                    // -------------------------------------------------

                    // Get seller ID

                    // -------------------------------------------------

                    Long sellerId =

                            item.getSellerId();

                    // -------------------------------------------------

                    // Validate seller ID

                    // -------------------------------------------------

                    if (sellerId == null) {

                        continue;

                    }

                    try {

                        // -------------------------------------------------

                        // Prepare notification request

                        // -------------------------------------------------

                        InternalOrderNotificationRequest

                                notificationRequest =

                                new InternalOrderNotificationRequest(

                                        sellerId,

                                        savedOrder.getOrderId(),

                                        savedOrder.getOrderStatus()

                                );

                        // -------------------------------------------------

                        // Send notification to Notification Service

                        // -------------------------------------------------

                        notificationClient

                                .createSellerOrderNotification(

                                        notificationInternalSecret,

                                        notificationRequest

                                );

                    } catch (Exception exception) {

                        /*

                         * Notification failure must NOT cancel or

                         * rollback a successful customer payment/order.

                         *

                         * The order has already been successfully

                         * saved above.

                         */

                        System.err.println(

                                "Failed to create seller notification "

                                        + "for order ID: "

                                        + savedOrder.getOrderId()

                                        + ", seller ID: "

                                        + sellerId

                        );

                        exception.printStackTrace();

                    }

                }

            }

        }

        return savedOrder;

    }

    // =========================================================

    // UPDATE ORDER STATUS

    // =========================================================

    @Transactional

    public Order updateOrderStatus(

            Long orderId,

            String newStatus) {

        Order order =

                getOrderById(orderId);

        String currentStatus =

                order.getOrderStatus();

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

        currentStatus =

                currentStatus

                        .trim()

                        .toUpperCase();

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

        newStatus =

                newStatus

                        .trim()

                        .toUpperCase();

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

        boolean validTransition =

                false;

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

        order.setOrderStatus(

                newStatus

        );

        order.setUpdatedAt(

                LocalDateTime.now()

        );

        return orderRepository.save(

                order

        );

    }



 // =========================================================

 // CANCEL ORDER

 // =========================================================

 @Transactional

 public Order cancelOrder(

         Long orderId) {

     // =====================================================

     // GET AUTHENTICATED CUSTOMER

     // =====================================================

     /*

      * JwtAuthenticationFilter stores the authenticated

      * customer's database userId as the principal.

      */

     Authentication authentication =

             SecurityContextHolder

                     .getContext()

                     .getAuthentication();

     if (authentication == null ||

             authentication.getPrincipal() == null) {

         throw new ResponseStatusException(

                 HttpStatus.UNAUTHORIZED,

                 "Authentication is required"

         );

     }

     Object principal =

             authentication.getPrincipal();

     if (!(principal instanceof Long)) {

         throw new ResponseStatusException(

                 HttpStatus.UNAUTHORIZED,

                 "Invalid authenticated customer"

         );

     }

     Long authenticatedCustomerId =

             (Long) principal;

     // =====================================================

     // GET ORDER

     // =====================================================

     Order order =

             getOrderById(orderId);

     // =====================================================

     // VERIFY ORDER OWNERSHIP

     // =====================================================

     /*

      * A customer can cancel only their own order.

      */

     if (order.getCustomerId() == null ||

             !order.getCustomerId()

                     .equals(authenticatedCustomerId)) {

         throw new ResponseStatusException(

                 HttpStatus.FORBIDDEN,

                 "You are not allowed to cancel this order"

         );

     }

     // =====================================================

     // GET CURRENT ORDER STATUS

     // =====================================================

     String currentStatus =

             order.getOrderStatus();

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

     currentStatus =

             currentStatus

                     .trim()

                     .toUpperCase();

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

     // GET PAYMENT FOR THIS ORDER

     // =====================================================

     PaymentResponse payment;

     try {

         payment =

                 paymentClient.getPaymentByOrderId(

                         orderId

                 );

     } catch (Exception exception) {

         /*

          * A payment may not exist if payment creation

          * failed before a payment record was created.

          *

          * We do not automatically fail cancellation here.

          * The order can still be cancelled and its

          * reserved inventory can be released.

          */

         payment = null;

     }

     // =====================================================

     // REFUND SUCCESSFUL PAYMENT

     // =====================================================

     if (payment != null &&

             "SUCCESS".equalsIgnoreCase(

                     payment.getPaymentStatus())) {

         try {

             /*

              * Payment Service changes:

              *

              * SUCCESS

              *    ↓

              * REFUNDED

              */

             paymentClient.refundPayment(

                     payment.getPaymentId()

             );

         } catch (Exception exception) {

             throw new ResponseStatusException(

                     HttpStatus.BAD_REQUEST,

                     "Unable to refund payment for order ID: "

                             + orderId,

                     exception

             );

         }

     }

     // =====================================================

     // RELEASE RESERVED STOCK

     // =====================================================

     if (order.getOrderItems() != null) {

         for (OrderItem item :

                 order.getOrderItems()) {

             if (item.getProductId() == null ||

                     item.getQuantity() == null ||

                     item.getQuantity() <= 0) {

                 continue;

             }

             try {

                 inventoryClient.releaseStock(

                         item.getProductId(),

                         item.getQuantity()

                 );

             } catch (Exception exception) {

                 throw new ResponseStatusException(

                         HttpStatus.BAD_REQUEST,

                         "Unable to release stock for product ID: "

                                 + item.getProductId(),

                         exception

                 );

             }

         }

     }

     // =====================================================

     // UPDATE ORDER

     // =====================================================

     LocalDateTime now =

             LocalDateTime.now();

     order.setOrderStatus(

             "CANCELLED"

     );

     order.setCancelledAt(

             now

     );

     order.setUpdatedAt(

             now

     );

     return orderRepository.save(

             order

     );

 }

}