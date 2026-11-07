package com.expiryguard.server.repository;

import com.expiryguard.server.entity.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingsRepository
        extends JpaRepository<SystemSettings, Long> {
}