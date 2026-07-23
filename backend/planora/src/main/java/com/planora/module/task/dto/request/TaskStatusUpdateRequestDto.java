package com.planora.module.task.dto.request;

import com.planora.common.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskStatusUpdateRequestDto {

    @NotNull(message = "Status is required")
    private TaskStatus status;
}
