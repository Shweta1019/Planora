package com.planora.module.project.dto.response;

import com.planora.common.enums.ProjectPriority;
import com.planora.common.enums.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProjectResponseDto {

    private Long projectId;
    private String projectName;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private ProjectStatus status;
    private ProjectPriority priority;
    private BigDecimal budget;
    private BigDecimal spentAmount;
    private Integer completionPercentage;
    private Long managerId;
    private String managerName;
    private Integer totalMembers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
