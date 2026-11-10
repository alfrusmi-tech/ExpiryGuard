
package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Product;
import com.expiryguard.server.service.InventoryThresholdService;
import com.expiryguard.server.repository.BatchRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final BatchRepository batchRepository;
    private final InventoryThresholdService thresholds;

    public InventoryController(BatchRepository batchRepository,
                               InventoryThresholdService thresholds) {
        this.batchRepository = batchRepository;
        this.thresholds = thresholds;
    }

    // Inventory response DTO
    public record InventoryRow(
            String id,
            String productId,
            String name,
            String categoryId,
            String sku,
            String batchNumber,
            Integer quantity,
            LocalDate expiryDate,
            String supplier,
            Integer reorderLevel,
            String status,
            String barcode,
            LocalDate manufacturingDate,
            BigDecimal unitPrice
    ) {}

    // GET /api/inventory
    @GetMapping
    @Transactional(readOnly = true)
    public List<InventoryRow> getInventory() {

        LocalDate today = LocalDate.now();
        int warningDays = thresholds.currentSettings().getExpiringSoonDays();

        return batchRepository.findAllForInventory()
                .stream()
                .map(batch -> {

                    Product product = batch.getProduct();
                    LocalDate expiry = batch.getExpiryDate();

                    String status = thresholds.expiryStatus(
                            expiry, today, warningDays
                    );

                    return new InventoryRow(
                            batch.getId().toString(),
                            product.getId().toString(),
                            product.getName(),
                            product.getCategory().getId().toString(),
                            product.getSku(),
                            batch.getBatchNumber(),
                            batch.getQuantity(),
                            expiry,
                            batch.getSupplier().getName(),
                            product.getReorderLevel(),
                            status,
                            product.getBarcode(),
                            batch.getManufacturingDate(),
                            batch.getUnitPrice()
                    );
                })
                .toList();
    }
}
