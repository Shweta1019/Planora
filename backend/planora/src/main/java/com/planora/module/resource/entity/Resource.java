package com.planora.module.resource.entity;

import com.planora.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceId;

    // e.g. "Java Developer", "UI Designer", "DevOps Engineer"
    @Column(nullable = false)
    private String resourceType;

    private String skillSet;

    private String description;

    // availability in hours per week
    @Builder.Default
    private Integer availabilityHours = 40;

    @Builder.Default
    private boolean isAvailable = true;

    // the employee this resource profile belongs to
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
