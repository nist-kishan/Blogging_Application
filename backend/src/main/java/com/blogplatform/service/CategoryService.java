package com.blogplatform.service;

import com.blogplatform.dto.CategoryRequest;
import com.blogplatform.entity.Category;
import com.blogplatform.exception.BadRequestException;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional(readOnly = true)
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
    }

    @Transactional
    public Category createCategory(CategoryRequest request) {
        String slug = formatSlug(request.getSlug());
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category with this name already exists.");
        }
        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category with this slug already exists.");
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .build();

        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        String slug = formatSlug(request.getSlug());

        if (!category.getName().equalsIgnoreCase(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category with this name already exists.");
        }
        if (!category.getSlug().equalsIgnoreCase(slug) && categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category with this slug already exists.");
        }

        category.setName(request.getName().trim());
        category.setSlug(slug);
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category); // triggers soft delete
    }

    private String formatSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            return "";
        }
        return slug.toLowerCase()
                .replaceAll("[^a-z0-9-\\s]", "")
                .replaceAll("\\s+", "-")
                .trim();
    }
}
