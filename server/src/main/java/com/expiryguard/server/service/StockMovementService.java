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

@Service
public class StockMovementService {

    private final BatchRepository batches;
    private final StockMovementRepository movements;

    public StockMovementService(BatchRepository batches,
                                StockMovementRepository movements) {
        this.batches = batches;
        this.movements = movements;
    }

    @Transactional
    public StockMovement record(Long batchId, MovementType type,
                                int quantity, String note) {
        if (quantity <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Quantity must be greater than zero"
            );
        }

        Batch batch = batches.findByIdForUpdate(batchId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Batch not found"
                ));

        int current = batch.getQuantity();

        if (type == MovementType.RECEIVED) {
            batch.setQuantity(current + quantity);
        } else if (type == MovementType.SOLD ||
                type == MovementType.DISPOSED) {
            if (quantity > current) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Insufficient stock"
                );
            }
            batch.setQuantity(current - quantity);
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid movement type"
            );
        }

        StockMovement movement = new StockMovement();
        movement.setBatch(batch);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setNote(note);

        batches.save(batch);
        return movements.save(movement);
    }
}