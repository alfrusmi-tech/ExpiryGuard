
package com.expiryguard.server.controller;

import com.expiryguard.server.service.InventoryCreateService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/inventory")
public class InventoryWriteController {

    private final InventoryCreateService service;

    public InventoryWriteController(InventoryCreateService service) {
        this.service = service;
    }

    public record CreateRequest(
            @NotBlank String name,
            @NotBlank String sku,
            @Size(max = 64) String barcode,
            @NotNull Long categoryId,
            @Min(0) Integer reorderLevel,
            @NotBlank String batchNumber,
            @NotNull @Min(1) Integer quantity,
            @NotNull LocalDate expiryDate,
            LocalDate manufacturingDate,
            @DecimalMin("0.00")
            @Digits(integer = 10, fraction = 2)
            BigDecimal unitPrice,
            @NotBlank String supplier
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryCreateService.CreatedInventory create(
            @Valid @RequestBody CreateRequest request) {

        return service.create(request);
    }
}