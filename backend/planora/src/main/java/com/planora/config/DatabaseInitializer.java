package com.planora.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("Executing database schema fixes...");
            jdbcTemplate.execute("ALTER TABLE tasks MODIFY COLUMN status VARCHAR(255)");
            logger.info("Successfully updated tasks status column.");
        } catch (Exception e) {
            logger.warn("Could not alter tasks status column: " + e.getMessage());
        }

        // Backfill assigned_by for tasks where it is NULL — set to the project's manager
        try {
            int updated = jdbcTemplate.update(
                "UPDATE tasks t " +
                "JOIN projects p ON t.project_id = p.project_id " +
                "SET t.assigned_by = p.manager_id " +
                "WHERE t.assigned_by IS NULL AND p.manager_id IS NOT NULL"
            );
            logger.info("Backfilled assigned_by for {} tasks.", updated);
        } catch (Exception e) {
            logger.warn("Could not backfill assigned_by: " + e.getMessage());
        }

        // Fix completion_percentage for existing IN_REVIEW tasks to 75
        try {
            int updated = jdbcTemplate.update(
                "UPDATE tasks SET completion_percentage = 75 WHERE status = 'IN_REVIEW'"
            );
            logger.info("Updated {} IN_REVIEW tasks to 75% completion.", updated);
        } catch (Exception e) {
            logger.warn("Could not update IN_REVIEW completion: " + e.getMessage());
        }
    }
}
