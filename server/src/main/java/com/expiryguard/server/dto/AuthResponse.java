
package com.expiryguard.server.dto;

import com.expiryguard.server.entity.User;
import com.expiryguard.server.entity.UserRole;

public record AuthResponse(
        Long id,
        String username,
        String email,
        String name,
        UserRole role
) {
    public static AuthResponse from(User user) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );
    }
}
