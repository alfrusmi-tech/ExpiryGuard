package com.expiryguard.server.controller;

import com.expiryguard.server.entity.MovementType;
import com.expiryguard.server.entity.StockMovement;
import com.expiryguard.server.repository.StockMovementRepository;
import com.expiryguard.server.service.StockMovementService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService service;
    private final StockMovementRepository movements;

    public StockMovementController(StockMovementService service,
                                   StockMovementRepository movements) {
        this.service = service;
        this.movements = movements;
    }

    public record MovementRequest(
            @NotNull Long batchId,
            @NotNull MovementType type,
            @NotNull @Min(1) Integer quantity,
            String note
    ) {}

    public record MovementResponse(
            Long id,
            Long batchId,
            MovementType type,
            Integer quantity,
            Instant createdAt,
            String note
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse create(@Valid @RequestBody MovementRequest request) {
        StockMovement saved = service.record(
                request.batchId(),
                request.type(),
                request.quantity(),
                request.note()
        );
        return toResponse(saved);
    }

    @GetMapping
    public List<MovementResponse> getByBatch(@RequestParam Long batchId) {
        return movements.findByBatch_IdOrderByCreatedAtDesc(batchId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MovementResponse toResponse(StockMovement movement) {
        return new MovementResponse(
                movement.getId(),
                movement.getBatch().getId(),
                movement.getType(),
                movement.getQuantity(),
                movement.getCreatedAt(),
                movement.getNote()
        );
    }
}