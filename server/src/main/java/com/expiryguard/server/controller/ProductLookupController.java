
package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Product;
import com.expiryguard.server.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/products")
public class ProductLookupController {

    private final ProductRepository products;

    public ProductLookupController(ProductRepository products) {
        this.products = products;
    }

    public record LookupResponse(
            Long id,
            String name,
            String sku,
            String barcode,
            Long categoryId,
            Integer reorderLevel
    ) {}

    @GetMapping("/lookup")
    @Transactional(readOnly = true)
    public LookupResponse lookup(@RequestParam String code) {

        String search = code.trim();

        if (search.isEmpty() || search.length() > 64) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid barcode or SKU"
            );
        }

        Product product = products.findByBarcode(search)
                .or(() -> products.findBySku(search))
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"
                        )
                );

        return new LookupResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getBarcode(),
                product.getCategory().getId(),
                product.getReorderLevel()
        );
    }
}
