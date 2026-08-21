package com.smartcart.inventory.service;

import com.smartcart.inventory.dto.InventoryRequest;
import com.smartcart.inventory.dto.InventoryResponse;

public interface InventoryService {

    InventoryResponse createInventory(InventoryRequest request);

    InventoryResponse getInventoryByProductId(Long productId);

    InventoryResponse updateInventory(Long productId, InventoryRequest request);

    InventoryResponse increaseStock(Long productId, Integer quantity);

    InventoryResponse decreaseStock(Long productId, Integer quantity);

    InventoryResponse reserveStock(Long productId, Integer quantity);

    InventoryResponse releaseStock(Long productId, Integer quantity);

    boolean checkAvailability(Long productId, Integer quantity);
}