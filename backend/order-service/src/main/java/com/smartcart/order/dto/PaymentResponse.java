package com.smartcart.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;

    private Long orderId;

    private Long customerId;

    private BigDecimal amount;

    /*
     * Payment Service sends the payment method as JSON.
     * We receive it as String because PaymentMethod enum
     * belongs to the Payment Service.
     */
    private String paymentMethod;

    private String gatewayOrderId;

    private String gatewayPaymentId;

    /*
     * Payment Service sends values such as:
     * PENDING
     * SUCCESS
     * FAILED
     * REFUNDED
     */
    private String paymentStatus;

    private String failureReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}