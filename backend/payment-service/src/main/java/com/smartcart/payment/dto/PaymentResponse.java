package com.smartcart.payment.dto;

import com.smartcart.payment.enums.PaymentMethod;
import com.smartcart.payment.enums.PaymentStatus;

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

    private PaymentMethod paymentMethod;

    private String gatewayOrderId;

    private String gatewayPaymentId;

    private PaymentStatus paymentStatus;

    private String failureReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}