
package com.expiryguard.server.controller;

import com.expiryguard.server.entity.SystemSettings;
import com.expiryguard.server.repository.SystemSettingsRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingsController {

    private final SystemSettingsRepository repository;

    public SystemSettingsController(
            SystemSettingsRepository repository) {
        this.repository = repository;
    }

    public record SettingsData(
            @NotNull @Min(1) @Max(365)
            Integer expiringSoonDays,

            @NotNull @Min(1) @Max(365)
            Integer criticalExpiryDays,

            @NotNull @Min(1) @Max(1000000)
            Integer defaultLowStockThreshold,

            @NotNull Boolean dailyEmailEnabled,

            @NotNull Boolean instantExpiredAlertEnabled,

            @Email
            String notificationEmail
    ) {}

    private SettingsData toResponse(SystemSettings s) {
        return new SettingsData(
                s.getExpiringSoonDays(),
                s.getCriticalExpiryDays(),
                s.getDefaultLowStockThreshold(),
                s.isDailyEmailEnabled(),
                s.isInstantExpiredAlertEnabled(),
                s.getNotificationEmail()
        );
    }

    @GetMapping
    @Transactional(readOnly = true)
    public SettingsData getSettings() {
        SystemSettings settings = repository.findById(1L)
                .orElseGet(SystemSettings::new);

        return toResponse(settings);
    }

    @PutMapping
    @Transactional
    public SettingsData saveSettings(
            @Valid @RequestBody SettingsData request) {

        if (request.criticalExpiryDays() >
                request.expiringSoonDays()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Critical threshold cannot exceed " +
                            "expiring-soon threshold"
            );
        }

        String email = request.notificationEmail() == null
                ? ""
                : request.notificationEmail().trim();

        if (request.dailyEmailEnabled() &&
                email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email address is required for daily summaries"
            );
        }

        SystemSettings settings = repository.findById(1L)
                .orElseGet(SystemSettings::new);

        settings.setExpiringSoonDays(
                request.expiringSoonDays()
        );
        settings.setCriticalExpiryDays(
                request.criticalExpiryDays()
        );
        settings.setDefaultLowStockThreshold(
                request.defaultLowStockThreshold()
        );
        settings.setDailyEmailEnabled(
                request.dailyEmailEnabled()
        );
        settings.setInstantExpiredAlertEnabled(
                request.instantExpiredAlertEnabled()
        );
        settings.setNotificationEmail(email);

        SystemSettings saved = repository.save(settings);

        return toResponse(saved);
    }
}
