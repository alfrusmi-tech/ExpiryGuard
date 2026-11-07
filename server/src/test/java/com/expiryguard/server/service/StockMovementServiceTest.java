
package com.expiryguard.server.service;

import com.expiryguard.server.entity.Batch;
import com.expiryguard.server.entity.MovementType;
import com.expiryguard.server.repository.BatchRepository;
import com.expiryguard.server.repository.StockMovementRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockMovementServiceTest {

    @Mock
    private BatchRepository batches;

    @Mock
    private StockMovementRepository movements;

    @InjectMocks
    private StockMovementService service;

    @Test
    void expiredMedicineCannotBeSold() {
        Batch batch = new Batch();
        batch.setQuantity(10);
        batch.setExpiryDate(LocalDate.now().minusDays(1));

        when(batches.findByIdForUpdate(1L))
                .thenReturn(Optional.of(batch));

        ResponseStatusException exception =
                assertThrows(
                        ResponseStatusException.class,
                        () -> service.record(
                                1L,
                                MovementType.SOLD,
                                1,
                                "Test sale"
                        )
                );

        assertEquals(
                HttpStatus.CONFLICT,
                exception.getStatusCode()
        );

        assertEquals(10, batch.getQuantity());

        verifyNoInteractions(movements);
    }
}