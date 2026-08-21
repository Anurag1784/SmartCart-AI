package com.smartcart.product.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcart.product.entity.Category;
import com.smartcart.product.entity.Product;
import com.smartcart.product.exception.CategoryNotFoundException;
import com.smartcart.product.exception.DuplicateProductException;
import com.smartcart.product.exception.ProductNotFoundException;
import com.smartcart.product.repository.CategoryRepository;
import com.smartcart.product.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    public Product createProduct(Product product) {

        if (productRepository.existsBySku(product.getSku())) {

            throw new DuplicateProductException(
                    "Product already exists with SKU: "
                            + product.getSku());
        }

        if (productRepository.existsByProductName(
                product.getProductName())) {

            throw new DuplicateProductException(
                    "Product already exists with name: "
                            + product.getProductName());
        }

        Category category = categoryRepository
                .findById(product.getCategory().getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with ID: "
                                        + product.getCategory()
                                                .getCategoryId()));

        product.setCategory(category);

        if (product.getStatus() == null ||
                product.getStatus().isBlank()) {

            product.setStatus("ACTIVE");
        }

        return productRepository.save(product);
    }

    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    public List<Product> getAllProducts() {

        return productRepository.findAll();
    }

    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    public Product getProductById(Long productId) {

        return productRepository.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with ID: "
                                        + productId));
    }

    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    public Product updateProduct(
            Long productId,
            Product updatedProduct) {

        Product existingProduct =
                getProductById(productId);

        if (!existingProduct.getSku()
                .equals(updatedProduct.getSku())
                && productRepository.existsBySku(
                        updatedProduct.getSku())) {

            throw new DuplicateProductException(
                    "Product already exists with SKU: "
                            + updatedProduct.getSku());
        }

        if (!existingProduct.getProductName()
                .equalsIgnoreCase(
                        updatedProduct.getProductName())
                && productRepository.existsByProductName(
                        updatedProduct.getProductName())) {

            throw new DuplicateProductException(
                    "Product already exists with name: "
                            + updatedProduct.getProductName());
        }

        Category category = categoryRepository
                .findById(
                        updatedProduct
                                .getCategory()
                                .getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with ID: "
                                        + updatedProduct
                                                .getCategory()
                                                .getCategoryId()));

        existingProduct.setCategory(category);

        existingProduct.setSellerId(
                updatedProduct.getSellerId());

        existingProduct.setProductName(
                updatedProduct.getProductName());

        existingProduct.setDescription(
                updatedProduct.getDescription());

        existingProduct.setPrice(
                updatedProduct.getPrice());

        existingProduct.setBrand(
                updatedProduct.getBrand());

        existingProduct.setSku(
                updatedProduct.getSku());

        if (updatedProduct.getStatus() != null &&
                !updatedProduct.getStatus().isBlank()) {

            existingProduct.setStatus(
                    updatedProduct.getStatus());
        }

        return productRepository.save(existingProduct);
    }

    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    public void deleteProduct(Long productId) {

        Product product = getProductById(productId);

        productRepository.delete(product);
    }

    // =========================================================
    // SEARCH PRODUCTS
    // =========================================================

    public List<Product> searchProducts(String keyword) {

        if (keyword == null || keyword.isBlank()) {

            return productRepository.findAll();
        }

        return productRepository
                .findByProductNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        keyword,
                        keyword);
    }

    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    public List<Product> filterProducts(
            Long categoryId,
            String brand,
            String status,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        List<Product> products =
                productRepository.findAll();

        List<Product> filteredProducts =
                new ArrayList<>();

        for (Product product : products) {

            boolean matches = true;

            // Category filter
            if (categoryId != null &&
                    (product.getCategory() == null ||
                            !product.getCategory()
                                    .getCategoryId()
                                    .equals(categoryId))) {

                matches = false;
            }

            // Brand filter
            if (brand != null &&
                    !brand.isBlank() &&
                    (product.getBrand() == null ||
                            !product.getBrand()
                                    .equalsIgnoreCase(brand))) {

                matches = false;
            }

            // Status filter
            if (status != null &&
                    !status.isBlank() &&
                    (product.getStatus() == null ||
                            !product.getStatus()
                                    .equalsIgnoreCase(status))) {

                matches = false;
            }

            // Minimum price filter
            if (minPrice != null &&
                    (product.getPrice() == null ||
                            product.getPrice()
                                    .compareTo(minPrice) < 0)) {

                matches = false;
            }

            // Maximum price filter
            if (maxPrice != null &&
                    (product.getPrice() == null ||
                            product.getPrice()
                                    .compareTo(maxPrice) > 0)) {

                matches = false;
            }

            if (matches) {

                filteredProducts.add(product);
            }
        }

        return filteredProducts;
    }
}