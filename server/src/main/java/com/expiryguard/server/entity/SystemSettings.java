
package com.expiryguard.server.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    private Long id = 1L;

    @Column(name = "expiring_soon_days", nullable = false)
    private int expiringSoonDays = 30;

    @Column(name = "critical_expiry_days", nullable = false)
    private int criticalExpiryDays = 7;

    @Column(name = "default_low_stock_threshold", nullable = false)
    private int defaultLowStockThreshold = 15;

    @Column(name = "daily_email_enabled", nullable = false)
    private boolean dailyEmailEnabled = false;

    @Column(name = "instant_expired_alert_enabled", nullable = false)
    private boolean instantExpiredAlertEnabled = false;

    @Column(name = "notification_email", length = 254)
    private String notificationEmail = "";

    public Long getId() {
        return id;
    }

    public int getExpiringSoonDays() {
        return expiringSoonDays;
    }

    public void setExpiringSoonDays(int value) {
        this.expiringSoonDays = value;
    }

    public int getCriticalExpiryDays() {
        return criticalExpiryDays;
    }

    public void setCriticalExpiryDays(int value) {
        this.criticalExpiryDays = value;
    }

    public int getDefaultLowStockThreshold() {
        return defaultLowStockThreshold;
    }

    public void setDefaultLowStockThreshold(int value) {
        this.defaultLowStockThreshold = value;
    }

    public boolean isDailyEmailEnabled() {
        return dailyEmailEnabled;
    }

    public void setDailyEmailEnabled(boolean value) {
        this.dailyEmailEnabled = value;
    }

    public boolean isInstantExpiredAlertEnabled() {
        return instantExpiredAlertEnabled;
    }

    public void setInstantExpiredAlertEnabled(boolean value) {
        this.instantExpiredAlertEnabled = value;
    }

    public String getNotificationEmail() {
        return notificationEmail;
    }

    public void setNotificationEmail(String value) {
        this.notificationEmail = value;
    }
}
