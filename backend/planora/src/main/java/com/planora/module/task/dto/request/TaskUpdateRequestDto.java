package com.planora.module.task.dto.request;

import com.planora.common.enums.TaskPriority;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskUpdateRequestDto {

    private String title;
    private String description;
    private Long assignedToId;
    private TaskPriority priority;
    private LocalDate dueDate;
}
