package com.expiryguard.server.service;

import com.expiryguard.server.entity.SystemSettings;
import com.expiryguard.server.repository.SystemSettingsRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class InventoryThresholdService {

    private final SystemSettingsRepository settingsRepository;

    public InventoryThresholdService(SystemSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public SystemSettings currentSettings() {
        return settingsRepository.findById(1L)
                .orElseGet(SystemSettings::new);
    }

    public String expiryStatus(LocalDate expiryDate, LocalDate today, int warningDays) {
        if (expiryDate.isBefore(today)) {
            return "expired";
        }
        if (!expiryDate.isAfter(today.plusDays(warningDays))) {
            return "expiring_soon";
        }
        return "good";
    }

    public int effectiveReorderLevel(Integer requested, SystemSettings settings) {
        return requested != null
                ? requested
                : settings.getDefaultLowStockThreshold();
    }
}
