
package com.expiryguard.server.repository;

import com.expiryguard.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(
            String email);

    Optional<User> findByUsernameIgnoreCase(
            String username);

    Optional<User> findByEmailIgnoreCaseOrUsernameIgnoreCase(
            String email, String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(
            String username);
}
