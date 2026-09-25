package com.smartcart.order.feign;

import com.smartcart.order.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(
        name = "payment-service",
        url = "http://localhost:8084",
        configuration = FeignConfig.class
)
public interface PaymentClient {

    // =========================================================
    // REFUND PAYMENT
    // =========================================================

    /*
     * Calls Payment Service:
     *
     * POST /api/payments/{paymentId}/refund
     *
     * The existing FeignConfig forwards the customer's
     * Authorization: Bearer <JWT> header to Payment Service.
     */
    @PostMapping("/api/payments/{paymentId}/refund")
    PaymentResponse refundPayment(
            @PathVariable("paymentId") Long paymentId
    );
    
    // =========================================================
    // GET PAYMENT BY ORDER ID
    // =========================================================

    /*
     * Calls Payment Service:
     *
     * GET /api/payments/order/{orderId}
     *
     * This allows Order Service to find the payment
     * belonging to a specific order.
     */
    @GetMapping("/api/payments/order/{orderId}")
    PaymentResponse getPaymentByOrderId(
            @PathVariable("orderId") Long orderId
    );
}