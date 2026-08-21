package com.smartcart.product.client;

import com.smartcart.product.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "inventory-service",
        url = "${inventory.service.url}",
        configuration = FeignClientConfig.class
)
public interface InventoryClient {

    @GetMapping(
            "/api/inventory/product/{productId}/availability"
    )
    Boolean checkAvailability(
            @PathVariable("productId")
            Long productId,

            @RequestParam("quantity")
            Integer quantity
    );
}