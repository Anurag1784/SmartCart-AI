package com.smartcart.product.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.smartcart.product.entity.Product;
import com.smartcart.product.service.ProductImageService;
import com.smartcart.product.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    private final ProductImageService productImageService;

    public ProductController(
            ProductService productService,
            ProductImageService productImageService) {

        this.productService = productService;
        this.productImageService = productImageService;
    }

    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    @PostMapping
    public ResponseEntity<Product> createProduct(

            @Valid @RequestBody Product product,

            Authentication authentication) {

        /*
         * The JWT AuthenticationFilter stores the authenticated
         * user's database ID as the Authentication principal.
         *
         * Therefore:
         *
         * authentication.getPrincipal()
         *              ↓
         *        authenticated userId
         *
         * We do NOT trust sellerId coming from the frontend.
         */

        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        /*
         * Check the role of the authenticated user.
         *
         * Only a SELLER is allowed to create products.
         */

        boolean isSeller =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_SELLER".equals(
                                        authority.getAuthority()
                                ));

        /*
         * If the authenticated user is not a SELLER,
         * reject the request.
         */

        if (!isSeller) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        /*
         * IMPORTANT SECURITY STEP:
         *
         * Ignore whatever sellerId the frontend sends.
         *
         * Instead, use the userId extracted from the
         * verified JWT.
         */

        product.setSellerId(authenticatedUserId);

        /*
         * Now ProductService receives a product whose sellerId
         * represents the authenticated seller.
         */

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productService.createProduct(product));
    }


    // =========================================================
    // UPLOAD PRODUCT IMAGE
    // =========================================================

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadProductImage(

            @RequestParam("image") MultipartFile image,

            Authentication authentication) {

        /*
         * Get the authenticated user's ID from the verified JWT.
         *
         * We do not accept sellerId from the frontend.
         */

        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        /*
         * Only SELLER users are allowed to upload
         * product images.
         */

        boolean isSeller =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_SELLER".equals(
                                        authority.getAuthority()
                                ));

        /*
         * Reject customers or other non-seller users.
         */

        if (!isSeller) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        /*
         * Save the image using ProductImageService.
         *
         * The service:
         *
         * 1. Validates the image
         * 2. Checks the file size
         * 3. Checks the file type
         * 4. Generates a unique filename
         * 5. Saves the image inside:
         *
         * uploads/products/
         */

        String fileName =
                productImageService.saveImage(image);

        /*
         * Build the URL that the frontend can use
         * to display the uploaded image.
         *
         * Example:
         *
         * http://localhost:8081/uploads/products/
         * 550e8400-e29b-41d4-a716-446655440000.jpg
         */

        String imageUrl =
                ServletUriComponentsBuilder
                        .fromCurrentContextPath()
                        .path("/uploads/products/")
                        .path(fileName)
                        .toUriString();

        /*
         * Return the generated image URL.
         */

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(imageUrl);
    }


    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts());
    }


    // =========================================================
    // GET PRODUCTS OF LOGGED-IN SELLER
    // =========================================================

    @GetMapping("/my-products")
    public ResponseEntity<List<Product>> getMyProducts(
            Authentication authentication) {

        /*
         * The JWT AuthenticationFilter stores the authenticated
         * user's database ID as the Authentication principal.
         */

        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        /*
         * Only SELLER users should be able to access
         * their seller product list.
         */

        boolean isSeller =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_SELLER".equals(
                                        authority.getAuthority()
                                ));

        /*
         * If the authenticated user is not a SELLER,
         * reject the request.
         */

        if (!isSeller) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        /*
         * Ask ProductService for products belonging only
         * to the authenticated seller.
         */

        return ResponseEntity.ok(
                productService.getProductsBySeller(
                        authenticatedUserId));
    }


    // =========================================================
    // SEARCH PRODUCTS
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(

            @RequestParam String name) {

        return ResponseEntity.ok(
                productService.searchProducts(name));
    }


    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterProducts(

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            String brand,

            @RequestParam(required = false)
            String status,

            @RequestParam(required = false)
            BigDecimal minPrice,

            @RequestParam(required = false)
            BigDecimal maxPrice) {

        return ResponseEntity.ok(
                productService.filterProducts(
                        categoryId,
                        brand,
                        status,
                        minPrice,
                        maxPrice));
    }


    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    @GetMapping("/{productId}")
    public ResponseEntity<Product> getProductById(

            @PathVariable Long productId) {

        return ResponseEntity.ok(
                productService.getProductById(productId));
    }


    // =========================================================
    // CHECK INVENTORY AVAILABILITY
    // =========================================================

    @GetMapping("/{productId}/availability")
    public ResponseEntity<Boolean> checkInventoryAvailability(

            @PathVariable Long productId,

            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                productService.checkInventoryAvailability(
                        productId,
                        quantity));
    }


    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    @PutMapping("/{productId}")
    public ResponseEntity<Product> updateProduct(

            @PathVariable Long productId,

            @Valid @RequestBody Product product,

            Authentication authentication) {

        /*
         * Get the authenticated user's ID from the verified JWT.
         *
         * We do not take sellerId from the request body.
         */

        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        /*
         * Only SELLER users are allowed to update products.
         */

        boolean isSeller =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_SELLER".equals(
                                        authority.getAuthority()
                                ));

        /*
         * Customer or any other non-seller user cannot
         * update a product.
         */

        if (!isSeller) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        /*
         * Pass the authenticated userId to ProductService.
         *
         * ProductService will verify that this seller actually
         * owns the product before allowing the update.
         */

        return ResponseEntity.ok(
                productService.updateProduct(
                        productId,
                        product,
                        authenticatedUserId));
    }


    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(

            @PathVariable Long productId,

            Authentication authentication) {

        /*
         * Get the authenticated user's ID from the verified JWT.
         */

        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        /*
         * Only SELLER users are allowed to delete products.
         */

        boolean isSeller =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_SELLER".equals(
                                        authority.getAuthority()
                                ));

        /*
         * Reject non-seller users.
         */

        if (!isSeller) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        /*
         * ProductService will verify that the authenticated seller
         * actually owns this product.
         */

        productService.deleteProduct(
                productId,
                authenticatedUserId);

        return ResponseEntity.noContent().build();
    }
}