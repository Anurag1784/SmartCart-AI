package com.smartcart.order.feign;

import com.smartcart.order.dto.InternalOrderNotificationRequest;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "notification-service",
        url = "http://localhost:8085"
)
public interface NotificationClient {

    @PostMapping("/api/internal/notifications/order")
    void createSellerOrderNotification(
            @RequestHeader("X-Internal-Service-Secret")
            String internalSecret,

            @RequestBody
            InternalOrderNotificationRequest request
    );
}