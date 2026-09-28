package com.expiryguard.server.repository;

import com.expiryguard.server.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    boolean existsByReferenceNumber(String referenceNumber);
}