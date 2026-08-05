package com.planora.module.project.dto.request;

import com.planora.common.enums.ProjectPriority;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProjectUpdateRequestDto {

    private String projectName;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private ProjectPriority priority;
    private Integer completionPercentage;
    private Long managerId;
}
