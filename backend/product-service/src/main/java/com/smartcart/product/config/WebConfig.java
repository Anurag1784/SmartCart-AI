package com.smartcart.product.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        /*
         * =========================================================
         * PRODUCT IMAGE RESOURCE HANDLER
         * =========================================================
         *
         * Uploaded images are physically stored in:
         *
         * uploads/products/
         *
         * Example:
         *
         * uploads/products/
         *     550e8400-e29b-41d4-a716-446655440000.jpg
         *
         * We expose this folder through:
         *
         * /uploads/products/**
         *
         * Therefore:
         *
         * Browser request:
         *
         * http://localhost:8081/uploads/products/image.jpg
         *
         * will be mapped to:
         *
         * uploads/products/image.jpg
         */

        String uploadLocation =
                Paths.get("uploads", "products")
                        .toAbsolutePath()
                        .normalize()
                        .toUri()
                        .toString();

        registry.addResourceHandler(
                "/uploads/products/**"
        )
        .addResourceLocations(
                uploadLocation
        );
    }
}