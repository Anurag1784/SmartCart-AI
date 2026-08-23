package com.smartcart.order.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "product-service",
        url = "http://localhost:8081",
        configuration = FeignConfig.class
)
public interface ProductClient {

    @GetMapping("/api/products/{productId}")
    Object getProductById(
            @PathVariable("productId") Long productId
    );

    @GetMapping("/api/products/{productId}/availability")
    Boolean checkInventoryAvailability(
            @PathVariable("productId") Long productId,
            @RequestParam("quantity") Integer quantity
    );
}