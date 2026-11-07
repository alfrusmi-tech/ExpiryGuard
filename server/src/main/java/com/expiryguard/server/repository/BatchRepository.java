
package com.expiryguard.server.repository;

import com.expiryguard.server.entity.Batch;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BatchRepository
        extends JpaRepository<Batch, Long> {

    // Get batches belonging to a product
    List<Batch> findByProduct_Id(Long productId);

    // Check for duplicate batch numbers
    boolean existsByProduct_IdAndBatchNumber(
            Long productId,
            String batchNumber
    );

    // READ INVENTORY - NO PESSIMISTIC LOCK
    @EntityGraph(attributePaths = {
            "product",
            "product.category",
            "supplier"
    })
    @Query("SELECT b FROM Batch b")
    List<Batch> findAllForInventory();

    // STOCK UPDATE - PESSIMISTIC LOCK REQUIRED
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Batch b WHERE b.id = :id")
    Optional<Batch> findByIdForUpdate(
            @Param("id") Long id
    );
}
