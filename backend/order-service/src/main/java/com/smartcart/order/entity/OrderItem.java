package com.smartcart.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartcart.order.dto.CustomerResponse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

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
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long orderItemId;


    // ============================================================
    // PARENT ORDER
    // ============================================================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;


    // ============================================================
    // PRODUCT ID
    // ============================================================
    @Column(name = "product_id", nullable = false)
    private Long productId;


    // ============================================================
    // SELLER ID
    // ============================================================
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
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;


    // ============================================================
    // SUBTOTAL
    // ============================================================
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;


    // ============================================================
    // CUSTOMER INFORMATION
    // ============================================================
    /*
     * Customer information belongs to Auth Service.
     *
     * This field is NOT stored in the Order Service database.
     *
     * OrderItemService obtains this information through AuthClient
     * and temporarily places it here so Jackson can include it
     * in the Seller Orders API response.
     *
     * @Transient means:
     *
     *     - No database column is created.
     *     - JPA does not persist this field.
     *
     * The data exists only for the API response.
     */
    @Transient
    @JsonProperty("customer")
    private CustomerResponse customer;


    // ============================================================
    // SELLER ORDER INFORMATION
    // ============================================================
    // These methods expose selected information from the parent
    // Order without exposing the complete Order object.
    //
    // IMPORTANT:
    // These are Java methods only.
    //
    // They do NOT create database columns.


    // ------------------------------------------------------------
    // ORDER ID
    // ------------------------------------------------------------
    @JsonProperty("orderId")
    public Long getOrderId() {

        return order != null
                ? order.getOrderId()
                : null;
    }


    // ------------------------------------------------------------
    // CUSTOMER ID
    // ------------------------------------------------------------
    @JsonProperty("customerId")
    public Long getCustomerId() {

        return order != null
                ? order.getCustomerId()
                : null;
    }


    // ------------------------------------------------------------
    // ORDER STATUS
    // ------------------------------------------------------------
    @JsonProperty("orderStatus")
    public String getOrderStatus() {

        return order != null
                ? order.getOrderStatus()
                : null;
    }


    // ------------------------------------------------------------
    // PAYMENT STATUS
    // ------------------------------------------------------------
    @JsonProperty("paymentStatus")
    public String getPaymentStatus() {

        return order != null
                ? order.getPaymentStatus()
                : null;
    }


    // ------------------------------------------------------------
    // ORDER CREATED TIME
    // ------------------------------------------------------------
    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() {

        return order != null
                ? order.getCreatedAt()
                : null;
    }


    // ============================================================
    // DELIVERY ADDRESS
    // ============================================================
    /*
     * Delivery address belongs to the specific Order.
     *
     * We expose only the information required by the seller.
     *
     * We intentionally do NOT expose:
     *
     *     customerId
     *     isDefault
     *     createdAt
     *
     * This is also a Java-only JSON property.
     * It does NOT create database columns.
     */
    @JsonProperty("deliveryAddress")
    public Map<String, String> getDeliveryAddress() {

        if (order == null || order.getAddress() == null) {
            return null;
        }

        Map<String, String> address = new LinkedHashMap<>();

        address.put(
                "addressLine1",
                order.getAddress().getAddressLine1()
        );

        address.put(
                "addressLine2",
                order.getAddress().getAddressLine2()
        );

        address.put(
                "city",
                order.getAddress().getCity()
        );

        address.put(
                "state",
                order.getAddress().getState()
        );

        address.put(
                "postalCode",
                order.getAddress().getPostalCode()
        );

        address.put(
                "country",
                order.getAddress().getCountry()
        );

        return address;
    }
}