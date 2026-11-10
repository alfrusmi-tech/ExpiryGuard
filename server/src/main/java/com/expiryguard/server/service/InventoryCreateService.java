
package com.expiryguard.server.service;

import com.expiryguard.server.controller.InventoryWriteController.CreateRequest;
import com.expiryguard.server.entity.*;
import com.expiryguard.server.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class InventoryCreateService {

    private final ProductRepository products;
    private final BatchRepository batches;
    private final CategoryRepository categories;
    private final SupplierRepository suppliers;
    private final StockMovementRepository movements;
    private final InventoryThresholdService thresholds;

    public InventoryCreateService(
            ProductRepository products,
            BatchRepository batches,
            CategoryRepository categories,
            SupplierRepository suppliers,
            StockMovementRepository movements,
            InventoryThresholdService thresholds) {
        this.products = products;
        this.batches = batches;
        this.categories = categories;
        this.suppliers = suppliers;
        this.movements = movements;
        this.thresholds = thresholds;
    }

    public record CreatedInventory(
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

    @Transactional
    public CreatedInventory create(CreateRequest r) {

        var settings = thresholds.currentSettings();

        if (r.manufacturingDate() != null &&
                r.manufacturingDate().isAfter(r.expiryDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Manufacturing date must not exceed expiry date"
            );
        }

        Category category = categories.findById(r.categoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"
                ));

        String sku = r.sku().trim();
        String name = r.name().trim();
        String barcode = r.barcode() == null ||
                r.barcode().isBlank()
                ? null : r.barcode().trim();

        Product product = products.findBySku(sku).orElse(null);

        if (product == null) {
            if (barcode != null && products.existsByBarcode(barcode)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Barcode already exists"
                );
            }

            product = new Product();
            product.setName(name);
            product.setSku(sku);
            product.setCategory(category);
            product.setBarcode(barcode);
            product.setReorderLevel(
                    thresholds.effectiveReorderLevel(r.reorderLevel(), settings)
            );

            product = products.save(product);
        } else {
            if (!product.getName().equalsIgnoreCase(name) ||
                    !product.getCategory().getId()
                            .equals(category.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Existing SKU belongs to another product"
                );
            }

            if (barcode != null &&
                    !barcode.equals(product.getBarcode())) {
                if (product.getBarcode() != null ||
                        products.existsByBarcode(barcode)) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Barcode conflicts with an existing product"
                    );
                }

                product.setBarcode(barcode);
            }
        }

        String batchNumber = r.batchNumber().trim();

        if (batches.existsByProduct_IdAndBatchNumber(
                product.getId(), batchNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Batch already exists for this product"
            );
        }

        String supplierName = r.supplier().trim();

        Supplier supplier = suppliers
                .findFirstByNameIgnoreCase(supplierName)
                .orElseGet(() -> {
                    Supplier created = new Supplier();
                    created.setName(supplierName);
                    return suppliers.save(created);
                });

        Batch batch = new Batch();
        batch.setProduct(product);
        batch.setSupplier(supplier);
        batch.setBatchNumber(batchNumber);
        batch.setQuantity(r.quantity());
        batch.setManufacturingDate(r.manufacturingDate());
        batch.setExpiryDate(r.expiryDate());
        batch.setUnitPrice(r.unitPrice());

        Batch saved = batches.save(batch);

        StockMovement receipt = new StockMovement();
        receipt.setBatch(saved);
        receipt.setType(MovementType.RECEIVED);
        receipt.setQuantity(r.quantity());
        receipt.setNote("Initial inventory registration");

        movements.save(receipt);

        LocalDate today = LocalDate.now();
        String status = thresholds.expiryStatus(
                r.expiryDate(), today, settings.getExpiringSoonDays()
        );

        return new CreatedInventory(
                saved.getId().toString(),
                product.getId().toString(),
                product.getName(),
                category.getId().toString(),
                product.getSku(),
                saved.getBatchNumber(),
                saved.getQuantity(),
                saved.getExpiryDate(),
                supplier.getName(),
                product.getReorderLevel(),
                status,
                product.getBarcode(),
                saved.getManufacturingDate(),
                saved.getUnitPrice()
        );
    }
}
