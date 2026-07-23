package com.planora.module.activitylog.repository;

import com.planora.module.activitylog.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    List<ActivityLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();
}
