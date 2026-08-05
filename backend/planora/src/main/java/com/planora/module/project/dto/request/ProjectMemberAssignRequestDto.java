package com.planora.module.project.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberAssignRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    private String roleInProject;
    private Integer allocationPercentage;
}
