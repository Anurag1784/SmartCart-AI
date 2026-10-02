package com.smartcart.inventory.repository;

import com.smartcart.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Finds inventory using the Product Service's product ID.
    Optional<Inventory> findByProductId(Long productId);

    // Checks whether inventory already exists for a product.
    boolean existsByProductId(Long productId);

    // Deletes inventory using the Product Service's product ID.
    void deleteByProductId(Long productId);

    // =========================================================
    // FIND LOW-STOCK INVENTORY
    // =========================================================

    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.availableQuantity <= i.reorderLevel
            """)
    List<Inventory> findLowStockInventory();
}