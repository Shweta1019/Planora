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
public class ProjectSummaryResponseDto {

    private Long projectId;
    private String projectName;
    private String description;
    private ProjectStatus status;
    private ProjectPriority priority;
    private String managerName;
    private Long managerId;
    private Integer totalMembers;
    private Integer completionPercentage;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private boolean budgetOverrun;
    private LocalDateTime createdAt;
}
