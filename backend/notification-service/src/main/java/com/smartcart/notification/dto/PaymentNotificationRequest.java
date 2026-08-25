package com.smartcart.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentNotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "Payment status is required")
    @Size(max = 40, message = "Payment status must not exceed 40 characters")
    private String paymentStatus;
}