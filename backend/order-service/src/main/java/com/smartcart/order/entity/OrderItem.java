package com.smartcart.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    // ============================================================
    // ORDER ITEM ID
    // ============================================================
    // Unique ID of this particular item inside an order.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long orderItemId;


    // ============================================================
    // PARENT ORDER
    // ============================================================
    // Every OrderItem belongs to one Order.
    //
    // LAZY:
    // The Order object is loaded only when it is actually needed.
    //
    // JsonIgnore:
    // We do NOT serialize the complete Order object.
    //
    // Why?
    // Because Order also contains a List<OrderItem>.
    //
    // Without JsonIgnore, JSON could become:
    //
    // Order
    //   → OrderItems
    //       → Order
    //           → OrderItems
    //               → Order...
    //
    // That would create a recursive JSON structure.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;


    // ============================================================
    // PRODUCT ID
    // ============================================================
    // Logical reference to Product Service.
    //
    // This is NOT a database foreign key because Product Service
    // owns the product database separately.
    @Column(name = "product_id", nullable = false)
    private Long productId;


    // ============================================================
    // SELLER ID
    // ============================================================
    // Identifies which seller owns this product.
    //
    // This is important for the marketplace because one customer
    // order can contain products from multiple sellers.
    @Column(name = "seller_id", nullable = false)
    private Long sellerId;


    // ============================================================
    // QUANTITY
    // ============================================================
    @Column(name = "quantity", nullable = false)
    private Integer quantity;


    // ============================================================
    // UNIT PRICE
    // ============================================================
    // Price of one unit at the time the order was created.
    //
    // We store this because product prices can change later.
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;


    // ============================================================
    // SUBTOTAL
    // ============================================================
    // quantity × unitPrice
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;


    // ============================================================
    // SELLER ORDER INFORMATION
    // ============================================================
    // These methods expose selected information from the parent
    // Order without exposing the complete Order object.
    //
    // IMPORTANT:
    // These are Java methods only.
    //
    // They do NOT create new database columns.
    //
    // They simply add useful properties to the JSON response.


    // ------------------------------------------------------------
    // ORDER ID
    // ------------------------------------------------------------
    // Allows the Seller Orders frontend to know which order
    // contains this OrderItem.
    @JsonProperty("orderId")
    public Long getOrderId() {

        return order != null
                ? order.getOrderId()
                : null;
    }


    // ------------------------------------------------------------
    // CUSTOMER ID
    // ------------------------------------------------------------
    // Allows the seller side to identify the customer associated
    // with this order.
    @JsonProperty("customerId")
    public Long getCustomerId() {

        return order != null
                ? order.getCustomerId()
                : null;
    }


    // ------------------------------------------------------------
    // ORDER STATUS
    // ------------------------------------------------------------
    // Example:
    // PENDING_PAYMENT
    // CONFIRMED
    // PROCESSING
    // SHIPPED
    // DELIVERED
    //
    // The Seller Orders page will use this to display the
    // current order state.
    @JsonProperty("orderStatus")
    public String getOrderStatus() {

        return order != null
                ? order.getOrderStatus()
                : null;
    }


    // ------------------------------------------------------------
    // PAYMENT STATUS
    // ------------------------------------------------------------
    // Example:
    // PENDING
    // SUCCESS
    // FAILED
    // REFUNDED
    //
    // This lets the seller know the payment state associated
    // with the order.
    @JsonProperty("paymentStatus")
    public String getPaymentStatus() {

        return order != null
                ? order.getPaymentStatus()
                : null;
    }


    // ------------------------------------------------------------
    // ORDER CREATED TIME
    // ------------------------------------------------------------
    // Useful for displaying when the customer placed the order.
    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() {

        return order != null
                ? order.getCreatedAt()
                : null;
    }
}