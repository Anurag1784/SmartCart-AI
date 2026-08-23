package com.smartcart.order.feign;

import com.smartcart.order.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "product-service",
        url = "http://localhost:8081"
)
public interface ProductClient {

    @GetMapping("/api/products/{productId}")
    ProductResponse getProductById(
            @PathVariable("productId") Long productId
    );
}