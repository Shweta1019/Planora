package com.planora.module.user.config;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SchemaUpdater {

    @PersistenceContext
    private EntityManager entityManager;

    @PostConstruct
    @Transactional
    public void updateSchema() {
        try {
            log.info("Updating profile_image column to LONGTEXT if needed...");
            entityManager.createNativeQuery("ALTER TABLE users MODIFY profile_image LONGTEXT").executeUpdate();
            log.info("Successfully ensured profile_image is LONGTEXT.");
        } catch (Exception e) {
            log.warn("Could not alter users table (might already be LONGTEXT or missing): {}", e.getMessage());
        }
    }
}
