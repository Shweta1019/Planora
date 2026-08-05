package com.planora.module.project.dto.request;

import com.planora.common.enums.ProjectPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreateRequestDto {
    @NotBlank(message = "Project name is required")
    private String projectName;

    private com.planora.common.enums.ProjectStatus status;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private BigDecimal budget;
    private ProjectPriority priority;

    private Long managerId;
    private List<ProjectMemberAssignRequestDto> members;
}
