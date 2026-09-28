package com.expiryguard.server.repository;

import com.expiryguard.server.entity.Batch;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    // Get every batch belonging to one product
    List<Batch> findByProduct_Id(Long productId);

    // Check whether this product already has the batch number
    boolean existsByProduct_IdAndBatchNumber(
            Long productId,
            String batchNumber
    );

    // Lock one batch while changing its stock quantity
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Batch b where b.id = :id")
    Optional<Batch> findByIdForUpdate(@Param("id") Long id);
}
