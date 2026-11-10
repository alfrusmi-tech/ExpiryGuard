package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Category;
import com.expiryguard.server.repository.CategoryRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public record CategoryRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 255) String description
    ) {}

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category createCategory(
            @Valid @RequestBody CategoryRequest request) {

        String name = request.name().trim();

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Category already exists"
            );
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(
                request.description() == null
                        ? null
                        : request.description().trim()
        );
        return categoryRepository.save(category);
    }
}