package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Category;
import com.expiryguard.server.entity.Product;
import com.expiryguard.server.repository.CategoryRepository;
import com.expiryguard.server.repository.ProductRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductController(ProductRepository products,
                             CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    public record ProductRequest(
            @NotBlank String name,
            @NotBlank String sku,
            @NotNull @Min(0) Integer reorderLevel,
            @NotNull Long categoryId
    ) {}

    public record ProductResponse(
            Long id,
            String name,
            String sku,
            Integer reorderLevel,
            Long categoryId
    ) {}

    @GetMapping
    public List<ProductResponse> getAll() {
        return products.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        String sku = request.sku().trim();

        if (products.existsBySku(sku)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "SKU already exists"
            );
        }

        Category category = categories.findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"
                ));

        Product product = new Product();
        product.setName(request.name().trim());
        product.setSku(sku);
        product.setReorderLevel(request.reorderLevel());
        product.setCategory(category);

        return toResponse(products.save(product));
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getReorderLevel(),
                product.getCategory().getId()
        );
    }
}
