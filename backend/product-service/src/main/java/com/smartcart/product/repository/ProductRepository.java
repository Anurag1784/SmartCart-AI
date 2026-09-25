package com.smartcart.product.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcart.product.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // =========================================================
    // FIND PRODUCT BY SKU
    // =========================================================
    
    Optional<Product> findBySku(String sku);


    // =========================================================
    // CHECK WHETHER SKU ALREADY EXISTS
    // =========================================================

    boolean existsBySku(String sku);


    // =========================================================
    // CHECK WHETHER PRODUCT NAME ALREADY EXISTS
    // =========================================================

    boolean existsByProductName(String productName);


    // =========================================================
    // FIND PRODUCTS BY NAME OR DESCRIPTION
    // =========================================================

    List<Product> findByProductNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String productName,
            String description);


    // =========================================================
    // FIND PRODUCTS WITHIN PRICE RANGE
    // =========================================================

    List<Product> findByPriceBetween(
            BigDecimal minPrice,
            BigDecimal maxPrice);


    // =========================================================
    // FIND PRODUCTS BELONGING TO A SELLER
    // =========================================================
    
    /*
     * This method allows us to retrieve only the products
     * owned by a particular seller.
     *
     * Spring Data JPA automatically understands:
     *
     * findBySellerId(...)
     *        ↓
     * WHERE seller_id = ?
     *
     * Example:
     *
     * Seller ID = 8
     *
     * findBySellerId(8L)
     *
     * returns only products whose sellerId is 8.
     *
     * This is important because the Seller Dashboard should
     * NOT fetch every seller's products and filter them in
     * React.
     */
    List<Product> findBySellerId(Long sellerId);
}