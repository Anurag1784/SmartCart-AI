package com.smartcart.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "order-service",
        url = "http://localhost:8083"
)
public interface OrderClient {

    @PutMapping("/api/orders/{orderId}/payment-status")
    void updatePaymentStatus(
            @PathVariable("orderId") Long orderId,
            @RequestParam("status") String status
    );
}