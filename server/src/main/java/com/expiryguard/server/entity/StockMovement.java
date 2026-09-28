package com.expiryguard.server.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private String note;

    @PrePersist
    public void setTimestamp() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }

    public MovementType getType() { return type; }
    public void setType(MovementType type) { this.type = type; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Instant getCreatedAt() { return createdAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
