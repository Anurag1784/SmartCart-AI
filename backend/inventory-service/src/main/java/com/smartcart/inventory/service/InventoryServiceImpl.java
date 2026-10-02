package com.smartcart.inventory.service;

import com.smartcart.inventory.dto.InventoryRequest;
import com.smartcart.inventory.dto.InventoryResponse;
import com.smartcart.inventory.entity.Inventory;
import com.smartcart.inventory.exception.DuplicateInventoryException;
import com.smartcart.inventory.exception.InsufficientStockException;
import com.smartcart.inventory.exception.InvalidQuantityException;
import com.smartcart.inventory.exception.InventoryNotFoundException;
import com.smartcart.inventory.repository.InventoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    // =========================================================
    // CREATE INVENTORY
    // =========================================================

    @Override
    public InventoryResponse createInventory(InventoryRequest request) {

        if (inventoryRepository.existsByProductId(request.getProductId())) {
            throw new DuplicateInventoryException(
                    "Inventory already exists for product ID: " + request.getProductId()
            );
        }

        if (request.getReservedQuantity() > request.getAvailableQuantity()) {
            throw new InvalidQuantityException(
                    "Reserved quantity cannot be greater than available quantity"
            );
        }

        Inventory inventory = new Inventory();

        inventory.setProductId(request.getProductId());
        inventory.setAvailableQuantity(request.getAvailableQuantity());
        inventory.setReservedQuantity(request.getReservedQuantity());
        inventory.setReorderLevel(request.getReorderLevel());
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory savedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(savedInventory);
    }


    // =========================================================
    // GET INVENTORY BY PRODUCT ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductId(Long productId) {

        Inventory inventory =
                findInventoryByProductId(productId);

        return mapToResponse(inventory);
    }


    // =========================================================
    // GET LOW-STOCK INVENTORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockInventory() {

        return inventoryRepository.findLowStockInventory()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // ADMIN - GET ALL INVENTORY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllInventory() {

        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // UPDATE INVENTORY
    // =========================================================

    @Override
    public InventoryResponse updateInventory(
            Long productId,
            InventoryRequest request) {

        Inventory inventory =
                findInventoryByProductId(productId);

        if (!productId.equals(request.getProductId())) {
            throw new InvalidQuantityException(
                    "Product ID in request does not match the inventory product ID"
            );
        }

        if (request.getReservedQuantity() >
                request.getAvailableQuantity()) {

            throw new InvalidQuantityException(
                    "Reserved quantity cannot be greater than available quantity"
            );
        }

        inventory.setAvailableQuantity(
                request.getAvailableQuantity()
        );

        inventory.setReservedQuantity(
                request.getReservedQuantity()
        );

        inventory.setReorderLevel(
                request.getReorderLevel()
        );

        inventory.setUpdatedAt(
                LocalDateTime.now()
        );

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }


    // =========================================================
    // INCREASE STOCK
    // =========================================================

    @Override
    public InventoryResponse increaseStock(
            Long productId,
            Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory =
                findInventoryByProductId(productId);

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() + quantity
        );

        inventory.setUpdatedAt(
                LocalDateTime.now()
        );

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }


    // =========================================================
    // DECREASE STOCK
    // =========================================================

    @Override
    public InventoryResponse decreaseStock(
            Long productId,
            Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory =
                findInventoryByProductId(productId);

        if (quantity > inventory.getAvailableQuantity()) {

            throw new InsufficientStockException(
                    "Insufficient available stock for product ID: "
                            + productId
            );
        }

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() - quantity
        );

        inventory.setUpdatedAt(
                LocalDateTime.now()
        );

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }


    // =========================================================
    // RESERVE STOCK
    // =========================================================

    @Override
    public InventoryResponse reserveStock(
            Long productId,
            Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory =
                findInventoryByProductId(productId);

        if (quantity > inventory.getAvailableQuantity()) {

            throw new InsufficientStockException(
                    "Insufficient available stock for product ID: "
                            + productId
            );
        }

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() - quantity
        );

        inventory.setReservedQuantity(
                inventory.getReservedQuantity() + quantity
        );

        inventory.setUpdatedAt(
                LocalDateTime.now()
        );

        Inventory updatedInventory =
                inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }


    // =========================================================
    // RELEASE RESERVED STOCK
    // =========================================================

    @Override
    public InventoryResponse releaseStock(
            Long productId,
            Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory =
                findInventoryByProductId(productId);

        if (quantity > inventory.getReservedQuantity()) {

            throw new InvalidQuantityException(
                    "Release quantity cannot be greater than reserved quantity"
            );
        }

        inventory.setReservedQuantity(
                inventory.getReservedQuantity() - quantity
        );

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() + quantity
        );

        inventory.setUpdatedAt(
                LocalDateTime.now()
        );

        InventoryResponse response =
                mapToResponse(inventory);

        inventoryRepository.save(inventory);

        return response;
    }


    // =========================================================
    // CHECK STOCK AVAILABILITY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public boolean checkAvailability(
            Long productId,
            Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory =
                findInventoryByProductId(productId);

        return inventory.getAvailableQuantity() >= quantity;
    }


    // =========================================================
    // DELETE INVENTORY
    // =========================================================

    // Deletes the inventory record belonging to the given product.
    @Override
    public void deleteInventoryByProductId(Long productId) {

        // Check whether inventory actually exists before deleting it.
        if (!inventoryRepository.existsByProductId(productId)) {

            throw new InventoryNotFoundException(
                    "Inventory not found for product ID: "
                            + productId
            );
        }

        // Delete only the inventory belonging to this product.
        inventoryRepository.deleteByProductId(productId);
    }


    // =========================================================
    // FIND INVENTORY BY PRODUCT ID
    // =========================================================

    private Inventory findInventoryByProductId(Long productId) {

        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new InventoryNotFoundException(
                                "Inventory not found for product ID: "
                                        + productId
                        )
                );
    }


    // =========================================================
    // VALIDATE QUANTITY
    // =========================================================

    private void validateQuantity(Integer quantity) {

        if (quantity == null || quantity <= 0) {

            throw new InvalidQuantityException(
                    "Quantity must be greater than 0"
            );
        }
    }


    // =========================================================
    // MAP ENTITY → RESPONSE
    // =========================================================

    private InventoryResponse mapToResponse(
            Inventory inventory) {

        return new InventoryResponse(
                inventory.getInventoryId(),
                inventory.getProductId(),
                inventory.getAvailableQuantity(),
                inventory.getReservedQuantity(),
                inventory.getReorderLevel(),
                inventory.getUpdatedAt()
        );
    }
}