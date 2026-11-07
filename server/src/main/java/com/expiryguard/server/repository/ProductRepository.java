package com.expiryguard.server.repository;

import com.expiryguard.server.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    Optional<Product> findBySku(String sku);

    boolean existsByBarcode(String barcode);
    Optional<Product> findByBarcode(String barcode);

}
