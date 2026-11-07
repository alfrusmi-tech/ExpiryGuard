package com.expiryguard.server.repository;

import com.expiryguard.server.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findFirstByNameIgnoreCase(String name);
}