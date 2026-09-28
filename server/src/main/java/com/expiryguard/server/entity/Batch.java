package com.expiryguard.server.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "batches",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_batch_product_number",
                columnNames = {"product_id", "batch_number"}
        )
)
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_number", nullable = false)
    private String batchNumber;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "purchase_id")
    private Purchase purchase;

    public Long getId() { return id; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Product getProduct() { return product; }
    public void setProduct(Product product) {
        this.product = product;
    }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }
    public Purchase getPurchase() {
        return purchase;
    }

    public void setPurchase(Purchase purchase) {
        this.purchase = purchase;
    }
}
