package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Batch;
import com.expiryguard.server.entity.MovementType;
import com.expiryguard.server.entity.Product;
import com.expiryguard.server.entity.Purchase;
import com.expiryguard.server.entity.StockMovement;
import com.expiryguard.server.entity.Supplier;
import com.expiryguard.server.repository.BatchRepository;
import com.expiryguard.server.repository.ProductRepository;
import com.expiryguard.server.repository.PurchaseRepository;
import com.expiryguard.server.repository.StockMovementRepository;
import com.expiryguard.server.repository.SupplierRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchRepository batches;
    private final ProductRepository products;
    private final SupplierRepository suppliers;
    private final PurchaseRepository purchases;
    private final StockMovementRepository movements;

    public BatchController(
            BatchRepository batches,
            ProductRepository products,
            SupplierRepository suppliers,
            PurchaseRepository purchases,
            StockMovementRepository movements
    ) {
        this.batches = batches;
        this.products = products;
        this.suppliers = suppliers;
        this.purchases = purchases;
        this.movements = movements;
    }

    public record BatchRequest(
            @NotNull Long productId,
            @NotNull Long supplierId,
            Long purchaseId,
            @NotBlank String batchNumber,
            @NotNull @Min(1) Integer quantity,
            @NotNull LocalDate expiryDate
    ) {}

    public record BatchResponse(
            Long id,
            Long productId,
            Long supplierId,
            Long purchaseId,
            String batchNumber,
            Integer quantity,
            LocalDate expiryDate
    ) {}

    @GetMapping
    public List<BatchResponse> getAll(
            @RequestParam(required = false) Long productId
    ) {
        List<Batch> result = productId == null
                ? batches.findAll()
                : batches.findByProduct_Id(productId);

        return result.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BatchResponse create(@Valid @RequestBody BatchRequest request) {
        Product product = products.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"
                ));

        Supplier supplier = suppliers.findById(request.supplierId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Supplier not found"
                ));

        Purchase purchase = null;

        if (request.purchaseId() != null) {
            purchase = purchases.findById(request.purchaseId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Purchase not found"
                    ));

            if (!purchase.getSupplier().getId().equals(supplier.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Purchase and batch must have the same supplier"
                );
            }
        }

        String number = request.batchNumber().trim();

        if (batches.existsByProduct_IdAndBatchNumber(
                product.getId(), number
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This batch number already exists for this product"
            );
        }

        Batch batch = new Batch();
        batch.setProduct(product);
        batch.setSupplier(supplier);
        batch.setPurchase(purchase);
        batch.setBatchNumber(number);
        batch.setQuantity(request.quantity());
        batch.setExpiryDate(request.expiryDate());

        Batch savedBatch = batches.save(batch);

        // Log the initial stock without adding it a second time.
        StockMovement receipt = new StockMovement();
        receipt.setBatch(savedBatch);
        receipt.setType(MovementType.RECEIVED);
        receipt.setQuantity(request.quantity());
        receipt.setNote("Initial stock received");
        movements.save(receipt);

        return toResponse(savedBatch);
    }

    private BatchResponse toResponse(Batch batch) {
        return new BatchResponse(
                batch.getId(),
                batch.getProduct().getId(),
                batch.getSupplier().getId(),
                batch.getPurchase() == null
                        ? null
                        : batch.getPurchase().getId(),
                batch.getBatchNumber(),
                batch.getQuantity(),
                batch.getExpiryDate()
        );
    }
}