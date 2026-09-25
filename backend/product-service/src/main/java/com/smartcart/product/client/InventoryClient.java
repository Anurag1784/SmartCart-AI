package com.smartcart.product.client;

import com.smartcart.product.config.FeignClientConfig;
import com.smartcart.product.dto.InventoryRequest;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "inventory-service",
        url = "${inventory.service.url}",
        configuration = FeignClientConfig.class
)
public interface InventoryClient {

    // =========================================================
    // CREATE INVENTORY
    // =========================================================

    /*
     * Sends a request to Inventory Service:
     *
     * POST /api/inventory
     *
     * The Authorization header is automatically forwarded by
     * FeignClientConfig.
     */

    @PostMapping("/api/inventory")
    void createInventory(
            @RequestBody InventoryRequest request
    );

    // =========================================================
    // CHECK INVENTORY AVAILABILITY
    // =========================================================

    /*
     * Checks whether enough stock is available for a product.
     */

    @GetMapping(
            "/api/inventory/product/{productId}/availability"
    )
    Boolean checkAvailability(
            @PathVariable("productId")
            Long productId,

            @RequestParam("quantity")
            Integer quantity
    );

    // =========================================================
    // DELETE INVENTORY
    // =========================================================

    /*
     * Sends a request to Inventory Service:
     *
     * DELETE /api/inventory/product/{productId}
     *
     * This removes the inventory record belonging to the
     * product that is being deleted.
     */

    @DeleteMapping("/api/inventory/product/{productId}")
    void deleteInventory(
            @PathVariable("productId")
            Long productId
    );
}