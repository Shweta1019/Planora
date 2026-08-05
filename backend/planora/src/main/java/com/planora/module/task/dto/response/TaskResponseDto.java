package com.planora.module.task.dto.response;

import com.planora.common.enums.TaskPriority;
import com.planora.common.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskResponseDto {

    private Long taskId;
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Integer completionPercentage;
    private Long projectId;
    private String projectName;
    private Long assignedToId;
    private String assignedToName;
    private Long assignedById;
    private String assignedByName;
    private String assignedToProfileImage;
    private String assignedByProfileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
