package com.planora.module.project.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProjectMemberAssignRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    private String roleInProject;
    private Integer allocationPercentage;
}
