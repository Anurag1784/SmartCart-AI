package com.smartcart.inventory.service;

import com.smartcart.inventory.dto.InventoryRequest;
import com.smartcart.inventory.dto.InventoryResponse;

public interface InventoryService {

    // Creates inventory for a product.
    InventoryResponse createInventory(InventoryRequest request);

    // Gets inventory using product ID.
    InventoryResponse getInventoryByProductId(Long productId);

    // Updates inventory information.
    InventoryResponse updateInventory(Long productId, InventoryRequest request);

    // Increases available stock.
    InventoryResponse increaseStock(Long productId, Integer quantity);

    // Decreases available stock.
    InventoryResponse decreaseStock(Long productId, Integer quantity);

    // Moves stock from available quantity to reserved quantity.
    InventoryResponse reserveStock(Long productId, Integer quantity);

    // Moves stock from reserved quantity back to available quantity.
    InventoryResponse releaseStock(Long productId, Integer quantity);

    // Checks whether enough available stock exists.
    boolean checkAvailability(Long productId, Integer quantity);

    // Deletes inventory belonging to a product.
    void deleteInventoryByProductId(Long productId);
}