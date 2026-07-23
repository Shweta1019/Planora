package com.planora.module.project.dto.request;

import com.planora.common.enums.ProjectStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProjectStatusUpdateRequestDto {

    @NotNull(message = "Status is required")
    private ProjectStatus status;
}
