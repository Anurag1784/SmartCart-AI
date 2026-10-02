package com.smartcart.product.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcart.product.entity.Category;
import com.smartcart.product.exception.CategoryNotFoundException;
import com.smartcart.product.repository.CategoryRepository;
import com.smartcart.product.repository.ProductRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            ProductRepository productRepository) {

        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }
    // =========================================================
    // CREATE CATEGORY
    // =========================================================

    public Category createCategory(Category category) {

        if (categoryRepository.existsByCategoryName(
                category.getCategoryName())) {

            throw new RuntimeException(
                    "Category already exists: "
                            + category.getCategoryName());
        }

        category.setCreatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }

    // =========================================================
    // GET ALL CATEGORIES
    // =========================================================

    public List<Category> getAllCategories() {

        return categoryRepository.findAll();
    }

    // =========================================================
    // GET CATEGORY BY ID
    // =========================================================

    public Category getCategoryById(Long categoryId) {

        return categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with ID: "
                                        + categoryId));
    }

    // =========================================================
    // UPDATE CATEGORY
    // =========================================================

    public Category updateCategory(
            Long categoryId,
            Category updatedCategory) {

        Category existingCategory =
                getCategoryById(categoryId);

        if (!existingCategory.getCategoryName()
                .equalsIgnoreCase(
                        updatedCategory.getCategoryName())
                && categoryRepository.existsByCategoryName(
                        updatedCategory.getCategoryName())) {

            throw new RuntimeException(
                    "Category already exists: "
                            + updatedCategory.getCategoryName());
        }

        existingCategory.setCategoryName(
                updatedCategory.getCategoryName());

        existingCategory.setDescription(
                updatedCategory.getDescription());

        return categoryRepository.save(existingCategory);
    }

 // =========================================================
 // DELETE CATEGORY
 // =========================================================

 public void deleteCategory(Long categoryId) {

     // ---------------------------------------------------------
     // STEP 1: Check whether the category actually exists.
     // ---------------------------------------------------------

     Category category = getCategoryById(categoryId);


     // ---------------------------------------------------------
     // STEP 2: Check whether any product is using this category.
     //
     // ProductRepository checks:
     //
     // product.category.categoryId = categoryId
     //
     // If at least one product uses this category,
     // deletion must be prevented.
     // ---------------------------------------------------------

     if (productRepository.existsByCategory_CategoryId(categoryId)) {

         throw new RuntimeException(
                 "Cannot delete category because products are using it: "
                         + category.getCategoryName()
         );
     }


     // ---------------------------------------------------------
     // STEP 3: No products are using the category.
     //
     // Therefore, it is safe to delete the category.
     // ---------------------------------------------------------

     categoryRepository.delete(category);
 }
}