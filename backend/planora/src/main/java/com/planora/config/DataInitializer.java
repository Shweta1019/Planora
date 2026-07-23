package com.planora.config;

import com.planora.common.constants.AppConstants;
import com.planora.common.enums.Role;
import com.planora.common.enums.UserStatus;
import com.planora.module.user.entity.User;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // create default admin only if it doesn't exist yet
        if (!userRepository.existsByEmail(AppConstants.DEFAULT_ADMIN_EMAIL)) {
            User admin = User.builder()
                    .firstName(AppConstants.DEFAULT_ADMIN_FNAME)
                    .lastName(AppConstants.DEFAULT_ADMIN_LNAME)
                    .email(AppConstants.DEFAULT_ADMIN_EMAIL)
                    .password(passwordEncoder.encode(AppConstants.DEFAULT_ADMIN_PASS))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .department("Administration")
                    .designation("System Administrator")
                    .build();
            userRepository.save(admin);
            log.info("Default admin created: {}", AppConstants.DEFAULT_ADMIN_EMAIL);
        }
    }
}
