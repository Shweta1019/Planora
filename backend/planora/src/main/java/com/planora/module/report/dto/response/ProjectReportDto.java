package com.planora.module.report.dto.response;

import com.planora.common.enums.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProjectReportDto {

    private Long projectId;
    private String projectName;
    private ProjectStatus status;
    private String managerName;
    private long totalTasks;
    private long completedTasks;
    private Integer completionPercentage;
    private BigDecimal budget;
    private BigDecimal spentAmount;
}
