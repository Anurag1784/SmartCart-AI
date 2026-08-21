package com.smartcart.product.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcart.product.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    boolean existsByProductName(String productName);

    List<Product> findByProductNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String productName,
            String description);

    List<Product> findByPriceBetween(
            BigDecimal minPrice,
            BigDecimal maxPrice);
}