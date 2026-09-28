package com.expiryguard.server.repository;

import com.expiryguard.server.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByBatch_IdOrderByCreatedAtDesc(Long batchId);
}
