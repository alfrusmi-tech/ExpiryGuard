
package com.expiryguard.server.config;

import com.expiryguard.server.entity.User;
import com.expiryguard.server.entity.UserRole;
import com.expiryguard.server.repository.UserRepository;

import java.nio.charset.StandardCharsets;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class FirstAdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public FirstAdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Environment environment) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {

        String password = environment.getProperty(
                "EXPIRYGUARD_BOOTSTRAP_PASSWORD"
        );

        // Normal startup: do not create an account.
        if (password == null || password.isBlank()) {
            return;
        }

        // Allow bootstrapping only an empty users table.
        if (userRepository.count() != 0) {
            throw new IllegalStateException(
                    "Admin bootstrap refused: users already exist."
            );
        }

        String username = environment.getProperty(
                "EXPIRYGUARD_BOOTSTRAP_USERNAME"
        );

        String email = environment.getProperty(
                "EXPIRYGUARD_BOOTSTRAP_EMAIL"
        );

        if (username == null ||
                !username.matches("[a-zA-Z0-9._-]{3,50}")) {
            throw new IllegalArgumentException(
                    "Invalid admin username."
            );
        }

        if (email == null || email.isBlank()
                || email.length() > 254) {
            throw new IllegalArgumentException(
                    "Invalid admin email."
            );
        }

        int passwordBytes =
                password.getBytes(StandardCharsets.UTF_8).length;

        if (password.length() < 8 || passwordBytes > 72) {
            throw new IllegalArgumentException(
                    "Password must have at least 8 characters " +
                            "and at most 72 UTF-8 bytes."
            );
        }

        User admin = new User();

        admin.setUsername(username);
        admin.setEmail(email);
        admin.setName("ExpiryGuard Administrator");
        admin.setPasswordHash(
                passwordEncoder.encode(password)
        );
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);

        System.out.println(
                "Initial administrator created successfully."
        );
    }
}
