package com.expiryguard.server.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referenceNumber;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    public Long getId() { return id; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }
}
