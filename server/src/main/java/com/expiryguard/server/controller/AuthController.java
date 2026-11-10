
package com.expiryguard.server.controller;

import com.expiryguard.server.dto.AuthResponse;
import com.expiryguard.server.dto.LoginRequest;
import com.expiryguard.server.entity.User;
import com.expiryguard.server.entity.UserRole;
import com.expiryguard.server.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final PasswordEncoder passwordEncoder;
    private final boolean autoApprove;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            SecurityContextRepository securityContextRepository,
            SessionAuthenticationStrategy sessionAuthenticationStrategy,
            PasswordEncoder passwordEncoder,
            @Value("${expiryguard.registration.auto-approve:false}")
            boolean autoApprove) {

        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.securityContextRepository = securityContextRepository;
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
        this.passwordEncoder = passwordEncoder;
        this.autoApprove = autoApprove;
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        Authentication authentication;

        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            loginRequest.identifier().trim(),
                            loginRequest.password()
                    )
            );
        } catch (DisabledException ex) {
            // Only reveal "pending" when the password is correct.
            String id = loginRequest.identifier().trim();
            boolean passwordOk = userRepository
                    .findByEmailIgnoreCaseOrUsernameIgnoreCase(id, id)
                    .map(u -> passwordEncoder.matches(
                            loginRequest.password(), u.getPasswordHash()))
                    .orElse(false);

            if (passwordOk) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Your account is waiting for administrator approval"
                );
            }
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }

        User user = userRepository
                .findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Account unavailable"
                ));

        AuthResponse authResponse = AuthResponse.from(user);

        // Rotate the session ID and reset the CSRF token.
        request.getSession(true);
        sessionAuthenticationStrategy.onAuthentication(
                authentication, request, response
        );

        // Store authentication for subsequent requests.
        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        securityContextRepository.saveContext(
                context, request, response
        );

        return authResponse;
    }

    public record RegisterRequest(
            @NotBlank @Pattern(regexp = "[a-zA-Z0-9._-]{3,50}",
                    message = "must be 3-50 letters, numbers, . _ -")
            String username,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(
            @Valid @RequestBody RegisterRequest r) {

        if (userRepository.existsByUsernameIgnoreCase(r.username().trim())
                || userRepository.existsByEmailIgnoreCase(r.email().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username or email already exists"
            );
        }

        User user = new User();
        user.setUsername(r.username().trim());
        user.setEmail(r.email().trim());
        user.setName(r.name().trim());
        user.setPasswordHash(passwordEncoder.encode(r.password()));
        user.setRole(UserRole.PHARMACIST); // self-registration is never ADMIN
        user.setEnabled(autoApprove);
        userRepository.save(user);

        return Map.of(
                "approved", autoApprove,
                "message", autoApprove
                        ? "Account created. You can sign in now."
                        : "Account created. An administrator must approve it before you can sign in."
        );
    }

    @GetMapping("/me")
    public AuthResponse currentUser(
            Authentication authentication) {

        User user = userRepository
                .findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Account unavailable"
                ));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Account disabled"
            );
        }

        return AuthResponse.from(user);
    }
}