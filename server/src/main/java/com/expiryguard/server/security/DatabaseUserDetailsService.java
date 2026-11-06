
package com.expiryguard.server.security;

import com.expiryguard.server.entity.User;
import com.expiryguard.server.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public DatabaseUserDetailsService(
            UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String identifier) {

        String login = identifier.trim();

        User user = userRepository
                .findByEmailIgnoreCaseOrUsernameIgnoreCase(
                        login, login
                )
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Invalid credentials"
                        )
                );

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .disabled(!user.isEnabled())
                .build();
    }
}
