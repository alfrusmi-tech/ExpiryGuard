package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Purchase;
import com.expiryguard.server.entity.Supplier;
import com.expiryguard.server.repository.PurchaseRepository;
import com.expiryguard.server.repository.SupplierRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseRepository purchases;
    private final SupplierRepository suppliers;

    public PurchaseController(PurchaseRepository purchases,
                              SupplierRepository suppliers) {
        this.purchases = purchases;
        this.suppliers = suppliers;
    }

    public record PurchaseRequest(
            @NotBlank String referenceNumber,
            @NotNull LocalDate purchaseDate,
            @NotNull Long supplierId
    ) {}

    public record PurchaseResponse(
            Long id,
            String referenceNumber,
            LocalDate purchaseDate,
            Long supplierId
    ) {}

    @GetMapping
    public List<PurchaseResponse> getAll() {
        return purchases.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseResponse create(
            @Valid @RequestBody PurchaseRequest request
    ) {
        String reference = request.referenceNumber().trim();

        if (purchases.existsByReferenceNumber(reference)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Purchase reference already exists"
            );
        }

        Supplier supplier = suppliers.findById(request.supplierId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Supplier not found"
                ));

        Purchase purchase = new Purchase();
        purchase.setReferenceNumber(reference);
        purchase.setPurchaseDate(request.purchaseDate());
        purchase.setSupplier(supplier);

        return toResponse(purchases.save(purchase));
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        return new PurchaseResponse(
                purchase.getId(),
                purchase.getReferenceNumber(),
                purchase.getPurchaseDate(),
                purchase.getSupplier().getId()
        );
    }
}
