package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Batch;
import com.expiryguard.server.entity.Product;
import com.expiryguard.server.repository.BatchRepository;
import com.expiryguard.server.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final BatchRepository batches;
    private final ProductRepository products;

    public AlertController(BatchRepository batches,
                           ProductRepository products) {
        this.batches = batches;
        this.products = products;
    }

    public record AlertResponse(
            String id,
            Long productId,
            Long batchId,
            String type,
            String message,
            LocalDate date,
            boolean resolved
    ) {}

    @GetMapping
    public List<AlertResponse> getAlerts() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(30);

        List<AlertResponse> alerts = new ArrayList<>();
        Map<Long, Long> availableStock = new HashMap<>();

        for (Batch batch : batches.findAll()) {
            if (batch.getQuantity() <= 0) {
                continue;
            }

            Long productId = batch.getProduct().getId();
            String productName = batch.getProduct().getName();
            LocalDate expiry = batch.getExpiryDate();

            if (expiry.isBefore(today)) {
                alerts.add(new AlertResponse(
                        "expired-" + batch.getId(),
                        productId,
                        batch.getId(),
                        "expired",
                        productName + " batch " + batch.getBatchNumber()
                                + " has expired",
                        today,
                        false
                ));
            } else {
                // Expired stock is not counted as available stock.
                availableStock.merge(
                        productId,
                        batch.getQuantity().longValue(),
                        Long::sum
                );

                if (!expiry.isAfter(warningDate)) {
                    alerts.add(new AlertResponse(
                            "expiring-" + batch.getId(),
                            productId,
                            batch.getId(),
                            "expiring_soon",
                            productName + " batch " + batch.getBatchNumber()
                                    + " expires on " + expiry,
                            today,
                            false
                    ));
                }
            }
        }

        for (Product product : products.findAll()) {
            long stock = availableStock.getOrDefault(product.getId(), 0L);

            if (stock <= product.getReorderLevel()) {
                alerts.add(new AlertResponse(
                        "low-stock-" + product.getId(),
                        product.getId(),
                        null,
                        "low_stock",
                        product.getName() + " is low on stock: "
                                + stock + " available",
                        today,
                        false
                ));
            }
        }

        return alerts;
    }
}
