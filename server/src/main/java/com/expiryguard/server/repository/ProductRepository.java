package com.expiryguard.server.repository;

import com.expiryguard.server.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
}
