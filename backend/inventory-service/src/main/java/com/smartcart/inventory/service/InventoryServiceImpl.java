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

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

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

        Inventory savedInventory = inventoryRepository.save(inventory);

        return mapToResponse(savedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventoryByProductId(Long productId) {

        Inventory inventory = findInventoryByProductId(productId);

        return mapToResponse(inventory);
    }

    @Override
    public InventoryResponse updateInventory(Long productId, InventoryRequest request) {

        Inventory inventory = findInventoryByProductId(productId);

        if (!productId.equals(request.getProductId())) {
            throw new InvalidQuantityException(
                    "Product ID in request does not match the inventory product ID"
            );
        }

        if (request.getReservedQuantity() > request.getAvailableQuantity()) {
            throw new InvalidQuantityException(
                    "Reserved quantity cannot be greater than available quantity"
            );
        }

        inventory.setAvailableQuantity(request.getAvailableQuantity());
        inventory.setReservedQuantity(request.getReservedQuantity());
        inventory.setReorderLevel(request.getReorderLevel());
        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Override
    public InventoryResponse increaseStock(Long productId, Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory = findInventoryByProductId(productId);

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() + quantity
        );

        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Override
    public InventoryResponse decreaseStock(Long productId, Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory = findInventoryByProductId(productId);

        if (quantity > inventory.getAvailableQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient available stock for product ID: " + productId
            );
        }

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() - quantity
        );

        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Override
    public InventoryResponse reserveStock(Long productId, Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory = findInventoryByProductId(productId);

        if (quantity > inventory.getAvailableQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient available stock for product ID: " + productId
            );
        }

        inventory.setAvailableQuantity(
                inventory.getAvailableQuantity() - quantity
        );

        inventory.setReservedQuantity(
                inventory.getReservedQuantity() + quantity
        );

        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Override
    public InventoryResponse releaseStock(Long productId, Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory = findInventoryByProductId(productId);

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

        inventory.setUpdatedAt(LocalDateTime.now());

        Inventory updatedInventory = inventoryRepository.save(inventory);

        return mapToResponse(updatedInventory);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long productId, Integer quantity) {

        validateQuantity(quantity);

        Inventory inventory = findInventoryByProductId(productId);

        return inventory.getAvailableQuantity() >= quantity;
    }

    private Inventory findInventoryByProductId(Long productId) {

        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException(
                        "Inventory not found for product ID: " + productId
                ));
    }

    private void validateQuantity(Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new InvalidQuantityException(
                    "Quantity must be greater than 0"
            );
        }
    }

    private InventoryResponse mapToResponse(Inventory inventory) {

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