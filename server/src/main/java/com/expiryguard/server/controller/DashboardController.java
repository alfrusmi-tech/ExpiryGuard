
package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Batch;
import com.expiryguard.server.entity.Product;
import com.expiryguard.server.repository.BatchRepository;
import com.expiryguard.server.repository.ProductRepository;
import com.expiryguard.server.entity.SystemSettings;
import com.expiryguard.server.repository.SystemSettingsRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ProductRepository products;
    private final BatchRepository batches;
    private final SystemSettingsRepository settingsRepository;


    public DashboardController(
            ProductRepository products,
            BatchRepository batches,
            SystemSettingsRepository settingsRepository) {

        this.products = products;
        this.batches = batches;
        this.settingsRepository = settingsRepository;
    }


    public record DashboardStatsResponse(
            long totalProducts,
            long totalItems,
            int expiringSoon,
            int expiredProducts,
            int lowStock
    ) {}

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {

        LocalDate today = LocalDate.now();
        SystemSettings settings = settingsRepository.findById(1L)
                .orElseGet(SystemSettings::new);

        LocalDate warningDate =
                today.plusDays(settings.getExpiringSoonDays());

        long totalItems = 0;
        int expiringSoon = 0;
        int expiredBatches = 0;

        Map<Long, Long> availableStock = new HashMap<>();

        for (Batch batch : batches.findAllForInventory()) {

            int quantity = batch.getQuantity();

            if (quantity <= 0) {
                continue;
            }

            // Physical inventory includes expired stock.
            totalItems += quantity;

            LocalDate expiry = batch.getExpiryDate();

            if (expiry.isBefore(today)) {
                expiredBatches++;
            } else {
                // Only non-expired stock is available.
                Long productId = batch.getProduct().getId();

                availableStock.merge(
                        productId,
                        (long) quantity,
                        Long::sum
                );

                if (!expiry.isAfter(warningDate)) {
                    expiringSoon++;
                }
            }
        }

        List<Product> allProducts = products.findAll();

        int lowStock = 0;

        for (Product product : allProducts) {
            long available = availableStock.getOrDefault(
                    product.getId(), 0L
            );

            if (available <= product.getReorderLevel()) {
                lowStock++;
            }
        }

        return new DashboardStatsResponse(
                allProducts.size(),
                totalItems,
                expiringSoon,
                expiredBatches,
                lowStock
        );
    }
}