package com.smartcart.order.feign;

import com.smartcart.order.dto.InventoryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "inventory-service",
        url = "http://localhost:8082",
        configuration = FeignConfig.class
)
public interface InventoryClient {

    @GetMapping("/api/inventory/product/{productId}")
    InventoryResponse getInventoryByProductId(
            @PathVariable("productId") Long productId
    );

    @GetMapping("/api/inventory/product/{productId}/availability")
    Boolean checkAvailability(
            @PathVariable("productId") Long productId,
            @RequestParam("quantity") Integer quantity
    );

    @PatchMapping("/api/inventory/product/{productId}/reserve")
    InventoryResponse reserveStock(
            @PathVariable("productId") Long productId,
            @RequestParam("quantity") Integer quantity
    );

    @PatchMapping("/api/inventory/product/{productId}/release")
    InventoryResponse releaseStock(
            @PathVariable("productId") Long productId,
            @RequestParam("quantity") Integer quantity
    );
}