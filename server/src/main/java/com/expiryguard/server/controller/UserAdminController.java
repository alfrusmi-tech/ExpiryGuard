package com.expiryguard.server.controller;

import com.expiryguard.server.entity.User;
import com.expiryguard.server.entity.UserRole;
import com.expiryguard.server.repository.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserAdminController {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    public UserAdminController(UserRepository users,
                               PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    public record UserRow(
            Long id,
            String username,
            String email,
            String name,
            UserRole role,
            boolean enabled,
            Instant createdAt
    ) {}

    public record CreateUserRequest(
            @NotBlank @Pattern(regexp = "[a-zA-Z0-9._-]{3,50}",
                    message = "must be 3-50 letters, numbers, . _ -")
            String username,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotNull UserRole role
    ) {}

    public record UpdateUserRequest(UserRole role, Boolean enabled) {}

    private UserRow toRow(User u) {
        return new UserRow(
                u.getId(), u.getUsername(), u.getEmail(), u.getName(),
                u.getRole(), u.isEnabled(), u.getCreatedAt()
        );
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<UserRow> list() {
        return users.findAll().stream()
                // pending accounts first, then newest
                .sorted(Comparator
                        .comparing(User::isEnabled)
                        .thenComparing(User::getCreatedAt,
                                Comparator.reverseOrder()))
                .map(this::toRow)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public UserRow create(@Valid @RequestBody CreateUserRequest r) {
        if (users.existsByUsernameIgnoreCase(r.username().trim())
                || users.existsByEmailIgnoreCase(r.email().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username or email already exists"
            );
        }

        User u = new User();
        u.setUsername(r.username().trim());
        u.setEmail(r.email().trim());
        u.setName(r.name().trim());
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(r.role());
        u.setEnabled(true);
        return toRow(users.save(u));
    }

    @PatchMapping("/{id}")
    @Transactional
    public UserRow update(@PathVariable Long id,
                          @RequestBody UpdateUserRequest body,
                          Authentication auth) {

        User u = users.findById(id).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (u.getUsername().equalsIgnoreCase(auth.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You cannot change your own account"
            );
        }

        if (body.role() != null) {
            u.setRole(body.role());
        }
        if (body.enabled() != null) {
            u.setEnabled(body.enabled());
        }
        return toRow(users.save(u));
    }
}