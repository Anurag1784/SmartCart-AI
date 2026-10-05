package com.smartcart.order.feign;

import com.smartcart.order.dto.CustomerResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "auth-service",
        url = "http://localhost:8080",
        configuration = FeignConfig.class
)
public interface AuthClient {

    @GetMapping("/api/auth/users/{userId}/summary")
    CustomerResponse getCustomerSummary(
            @PathVariable("userId") Long userId
    );
}