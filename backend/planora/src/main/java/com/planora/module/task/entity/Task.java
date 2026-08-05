package com.planora.module.task.entity;

import com.planora.common.enums.TaskPriority;
import com.planora.common.enums.TaskStatus;
import com.planora.module.project.entity.Project;
import com.planora.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(255)")
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Builder.Default
    private Integer completionPercentage = 0;

    private LocalDate startDate;

    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void syncCompletionPercentage() {
        if (this.status == TaskStatus.COMPLETED) {
            this.completionPercentage = 100;
        } else if (this.status == TaskStatus.IN_REVIEW) {
            if (this.completionPercentage == null || this.completionPercentage == 0) {
                this.completionPercentage = 75;
            }
        } else if (this.status == TaskStatus.IN_PROGRESS) {
            if (this.completionPercentage == null || this.completionPercentage == 0) {
                this.completionPercentage = 50;
            }
        } else if (this.status == TaskStatus.TODO || this.status == TaskStatus.NOT_STARTED) {
            if (this.completionPercentage == null) {
                this.completionPercentage = 0;
            }
        }
    }
}
