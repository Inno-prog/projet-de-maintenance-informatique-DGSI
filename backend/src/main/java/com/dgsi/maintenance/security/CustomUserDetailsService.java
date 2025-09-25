package com.dgsi.maintenance.security;

import com.dgsi.maintenance.entity.User;
import com.dgsi.maintenance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("Attempting to load user by email: {}", email);
        
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    String errorMsg = "User not found with email: " + email;
                    log.error(errorMsg);
                    return new UsernameNotFoundException(errorMsg);
                });
            
            log.info("User found in database: {}", user.getEmail());
            log.debug("User details: ID={}, Name={}, Role={}", 
                user.getId(), user.getNom(), user.getRole());
            
            UserDetails userDetails = UserPrincipal.create(user);
            log.debug("Created UserDetails with authorities: {}", userDetails.getAuthorities());
            
            return userDetails;
            
        } catch (Exception e) {
            log.error("Error loading user by email: " + email, e);
            throw e;
        }
    }
}