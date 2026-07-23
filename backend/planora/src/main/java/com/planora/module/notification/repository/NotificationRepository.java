package com.planora.module.notification.repository;

import com.planora.module.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserUserIdAndIsReadFalse(Long userId);
    long countByUserUserIdAndIsReadFalse(Long userId);
}
