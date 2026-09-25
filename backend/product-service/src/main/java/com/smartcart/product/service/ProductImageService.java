package com.smartcart.product.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductImageService {

    // Folder where uploaded product images will be stored.
    private final Path uploadDirectory =
            Paths.get("uploads", "products");

    // Allowed image content types.
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    // Maximum image size: 5 MB.
    private static final long MAX_FILE_SIZE =
            5 * 1024 * 1024;

    /**
     * Save the uploaded product image.
     *
     * @param file image selected by the seller
     * @return generated file name
     */
    public String saveImage(MultipartFile file) {

        // Make sure an image was actually selected.
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Product image is required"
            );
        }

        // Check the image size.
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Product image must not exceed 5 MB"
            );
        }

        // Read the uploaded file's content type.
        String contentType = file.getContentType();

        // Check whether the image type is supported.
        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType)) {

            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP images are allowed"
            );
        }

        try {

            // Create the upload directory if it does not exist.
            Files.createDirectories(uploadDirectory);

            /*
             * Generate a unique filename.
             *
             * Example:
             *
             * original:
             * samsung-phone.jpg
             *
             * stored:
             * 550e8400-e29b-41d4-a716-446655440000.jpg
             */
            String extension =
                    getFileExtension(file.getOriginalFilename());

            String uniqueFileName =
                    UUID.randomUUID() + extension;

            // Build the complete file path.
            Path targetPath =
                    uploadDirectory.resolve(uniqueFileName);

            // Save the uploaded file.
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // Return only the generated filename.
            return uniqueFileName;

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Failed to save product image",
                    exception
            );
        }
    }

    /**
     * Extract the file extension from the original filename.
     */
    private String getFileExtension(String fileName) {

        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException(
                    "Invalid image file name"
            );
        }

        int lastDotIndex =
                fileName.lastIndexOf('.');

        if (lastDotIndex == -1) {
            throw new IllegalArgumentException(
                    "Product image must have a valid extension"
            );
        }

        return fileName.substring(lastDotIndex)
                .toLowerCase();
    }
}