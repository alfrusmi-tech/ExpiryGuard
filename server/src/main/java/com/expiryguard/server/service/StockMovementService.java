
package com.expiryguard.server.service;

import com.expiryguard.server.entity.Batch;
import com.expiryguard.server.entity.MovementType;
import com.expiryguard.server.entity.StockMovement;
import com.expiryguard.server.repository.BatchRepository;
import com.expiryguard.server.repository.StockMovementRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
public class StockMovementService {

    private final BatchRepository batches;
    private final StockMovementRepository movements;

    public StockMovementService(
            BatchRepository batches,
            StockMovementRepository movements) {
        this.batches = batches;
        this.movements = movements;
    }

    @Transactional
    public StockMovement record(
            Long batchId,
            MovementType type,
            int quantity,
            String note) {

        // 1. Validate quantity
        if (quantity <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero"
            );
        }

        // 2. Lock batch during stock update
        Batch batch = batches.findByIdForUpdate(batchId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Batch not found"
                        )
                );

        // 3. Block expired medicine sales
        if (type == MovementType.SOLD &&
                batch.getExpiryDate()
                        .isBefore(LocalDate.now())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Expired medicine cannot be sold"
            );
        }

        int current = batch.getQuantity();

        // 4. Calculate the new stock quantity
        if (type == MovementType.RECEIVED) {

            if (quantity > Integer.MAX_VALUE - current) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock quantity exceeds allowed limit"
                );
            }

            batch.setQuantity(current + quantity);

        } else if (type == MovementType.SOLD ||
                type == MovementType.DISPOSED) {

            if (quantity > current) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock"
                );
            }

            batch.setQuantity(current - quantity);

        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid movement type"
            );
        }

        // 5. Record stock movement history
        StockMovement movement = new StockMovement();

        movement.setBatch(batch);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setNote(note);

        batches.save(batch);

        return movements.save(movement);
    }
}