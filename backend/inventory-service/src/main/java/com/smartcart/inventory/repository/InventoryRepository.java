package com.smartcart.inventory.repository;

import com.smartcart.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Finds inventory using the Product Service's product ID.
    Optional<Inventory> findByProductId(Long productId);

    // Checks whether inventory already exists for a product.
    boolean existsByProductId(Long productId);

    // Deletes inventory using the Product Service's product ID.
    void deleteByProductId(Long productId);
}