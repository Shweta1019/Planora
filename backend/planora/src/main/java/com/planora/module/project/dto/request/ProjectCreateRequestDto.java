package com.planora.module.project.dto.request;

import com.planora.common.enums.ProjectPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProjectCreateRequestDto {

    @NotBlank(message = "Project name is required")
    private String projectName;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;
    private BigDecimal budget;
    private ProjectPriority priority;

    private Long managerId;
}
