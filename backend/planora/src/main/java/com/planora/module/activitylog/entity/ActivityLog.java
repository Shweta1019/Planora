package com.planora.module.activitylog.entity;

import com.planora.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // what happened — e.g. "CREATED", "UPDATED", "DELETED", "STATUS_CHANGED"
    @Column(nullable = false)
    private String action;

    // human-readable description
    @Column(columnDefinition = "TEXT")
    private String description;

    // e.g. "PROJECT", "TASK", "USER", "EXPENSE"
    private String entityType;

    // id of the entity that was affected
    private Long entityId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
