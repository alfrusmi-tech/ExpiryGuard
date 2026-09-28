package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Supplier;
import com.expiryguard.server.repository.SupplierRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierRepository suppliers;

    public SupplierController(SupplierRepository suppliers) {
        this.suppliers = suppliers;
    }

    public record SupplierRequest(@NotBlank String name, String email) {}

    @GetMapping
    public List<Supplier> getAll() {
        return suppliers.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Supplier create(@Valid @RequestBody SupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.name().trim());
        supplier.setEmail(request.email());
        return suppliers.save(supplier);
    }
}