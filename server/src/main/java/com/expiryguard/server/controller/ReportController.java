
package com.expiryguard.server.controller;

import com.expiryguard.server.entity.Batch;
import com.expiryguard.server.entity.MovementType;
import com.expiryguard.server.entity.StockMovement;
import com.expiryguard.server.repository.BatchRepository;
import com.expiryguard.server.repository.StockMovementRepository;
import com.expiryguard.server.service.InventoryThresholdService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final BatchRepository batches;
    private final StockMovementRepository movements;
    private final InventoryThresholdService thresholds;

    public ReportController(
            BatchRepository batches,
            StockMovementRepository movements,
            InventoryThresholdService thresholds) {
        this.batches = batches;
        this.movements = movements;
        this.thresholds = thresholds;
    }

    // Report 1: Current inventory
    @GetMapping(value = "/inventory.csv", produces = "text/csv")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> inventoryReport() {

        StringBuilder csv = new StringBuilder();

        csv.append(row(
                "Product ID", "Product Name", "SKU",
                "Batch ID", "Batch Number", "Quantity",
                "Expiry Date", "Supplier", "Status"
        ));

        LocalDate today = LocalDate.now();
        int warningDays = thresholds.currentSettings().getExpiringSoonDays();

        for (Batch batch : batches.findAllForInventory()) {

            String status = switch (thresholds.expiryStatus(
                    batch.getExpiryDate(), today, warningDays
            )) {
                case "expired" -> "Expired";
                case "expiring_soon" -> "Expiring Soon";
                default -> "Good";
            };

            csv.append(row(
                    batch.getProduct().getId().toString(),
                    batch.getProduct().getName(),
                    batch.getProduct().getSku(),
                    batch.getId().toString(),
                    batch.getBatchNumber(),
                    batch.getQuantity().toString(),
                    batch.getExpiryDate().toString(),
                    batch.getSupplier().getName(),
                    status
            ));
        }

        return download("inventory-report.csv", csv.toString());
    }

    // Report 2: Historical disposal transactions
    @GetMapping(value = "/disposals.csv", produces = "text/csv")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> disposalReport() {

        StringBuilder csv = new StringBuilder();

        csv.append(row(
                "Movement ID", "Date UTC", "Product",
                "Batch Number", "Quantity Disposed", "Note"
        ));

        for (StockMovement movement : movements.findAll()) {

            if (movement.getType() != MovementType.DISPOSED) {
                continue;
            }

            csv.append(row(
                    movement.getId().toString(),
                    movement.getCreatedAt().toString(),
                    movement.getBatch().getProduct().getName(),
                    movement.getBatch().getBatchNumber(),
                    movement.getQuantity().toString(),
                    movement.getNote()
            ));
        }

        return download("disposal-report.csv", csv.toString());
    }

    // Report 3: Expiry projection for 90 days
    @GetMapping(value = "/expiry.csv", produces = "text/csv")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> expiryReport() {

        StringBuilder csv = new StringBuilder();

        csv.append(row(
                "Product", "SKU", "Batch Number",
                "Quantity", "Expiry Date",
                "Days Remaining", "Expiry Window"
        ));

        LocalDate today = LocalDate.now();

        for (Batch batch : batches.findAllForInventory()) {

            if (batch.getQuantity() <= 0) {
                continue;
            }

            long days = ChronoUnit.DAYS.between(
                    today, batch.getExpiryDate()
            );

            if (days < 0 || days > 90) {
                continue;
            }

            String window =
                    days <= 30 ? "0-30 days" :
                            days <= 60 ? "31-60 days" :
                                    "61-90 days";

            csv.append(row(
                    batch.getProduct().getName(),
                    batch.getProduct().getSku(),
                    batch.getBatchNumber(),
                    batch.getQuantity().toString(),
                    batch.getExpiryDate().toString(),
                    Long.toString(days),
                    window
            ));
        }

        return download("expiry-report.csv", csv.toString());
    }

    private ResponseEntity<byte[]> download(
            String filename, String content) {

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\""
                )
                .contentType(MediaType.parseMediaType(
                        "text/csv;charset=UTF-8"
                ))
                .body(content.getBytes(StandardCharsets.UTF_8));
    }

    private String row(String... fields) {
        StringBuilder line = new StringBuilder();

        for (int i = 0; i < fields.length; i++) {
            if (i > 0) line.append(",");

            String value = fields[i] == null ? "" : fields[i];
            value = value.replace("\r", " ").replace("\n", " ");

            // Prevent spreadsheet formula injection.
            String leading = value.stripLeading();
            if (!leading.isEmpty() &&
                    "=+-@".indexOf(leading.charAt(0)) >= 0) {
                value = "'" + value;
            }

            line.append("\"")
                    .append(value.replace("\"", "\"\""))
                    .append("\"");
        }

        return line.append("\r\n").toString();
    }
}
