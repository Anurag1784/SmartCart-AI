package com.smartcart.inventory.controller;

import com.smartcart.inventory.dto.InventoryRequest;
import com.smartcart.inventory.dto.InventoryResponse;
import com.smartcart.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Create inventory
    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(
            @Valid @RequestBody InventoryRequest request) {

        InventoryResponse response = inventoryService.createInventory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get inventory by product ID
    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryResponse> getInventoryByProductId(
            @PathVariable Long productId) {

        InventoryResponse response =
                inventoryService.getInventoryByProductId(productId);

        return ResponseEntity.ok(response);
    }

    // Update inventory
    @PutMapping("/product/{productId}")
    public ResponseEntity<InventoryResponse> updateInventory(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryRequest request) {

        InventoryResponse response =
                inventoryService.updateInventory(productId, request);

        return ResponseEntity.ok(response);
    }

    // Increase stock
    @PatchMapping("/product/{productId}/increase")
    public ResponseEntity<InventoryResponse> increaseStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        InventoryResponse response =
                inventoryService.increaseStock(productId, quantity);

        return ResponseEntity.ok(response);
    }

    // Decrease stock
    @PatchMapping("/product/{productId}/decrease")
    public ResponseEntity<InventoryResponse> decreaseStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        InventoryResponse response =
                inventoryService.decreaseStock(productId, quantity);

        return ResponseEntity.ok(response);
    }

    // Reserve stock
    @PatchMapping("/product/{productId}/reserve")
    public ResponseEntity<InventoryResponse> reserveStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        InventoryResponse response =
                inventoryService.reserveStock(productId, quantity);

        return ResponseEntity.ok(response);
    }

    // Release reserved stock
    @PatchMapping("/product/{productId}/release")
    public ResponseEntity<InventoryResponse> releaseStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        InventoryResponse response =
                inventoryService.releaseStock(productId, quantity);

        return ResponseEntity.ok(response);
    }

    // Check stock availability
    @GetMapping("/product/{productId}/availability")
    public ResponseEntity<Boolean> checkAvailability(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        boolean available =
                inventoryService.checkAvailability(productId, quantity);

        return ResponseEntity.ok(available);
    }
}