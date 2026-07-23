package com.planora.module.task.mapper;

import com.planora.module.task.dto.response.CommentResponseDto;
import com.planora.module.task.dto.response.TaskResponseDto;
import com.planora.module.task.entity.Comment;
import com.planora.module.task.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponseDto toResponseDto(Task task) {
        // null-safe project extraction
        Long projectId     = task.getProject() != null ? task.getProject().getProjectId() : null;
        String projectName = task.getProject() != null ? task.getProject().getProjectName() : null;

        // null-safe assignedTo extraction
        Long assignedToId   = task.getAssignedTo() != null ? task.getAssignedTo().getUserId() : null;
        String assignedToName = task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null;

        return TaskResponseDto.builder()
                .taskId(task.getTaskId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .projectId(projectId)
                .projectName(projectName)
                .assignedToId(assignedToId)
                .assignedToName(assignedToName)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    public CommentResponseDto toCommentDto(Comment comment) {
        Long userId       = comment.getUser() != null ? comment.getUser().getUserId() : null;
        String fullName   = comment.getUser() != null ? comment.getUser().getFullName() : null;
        Long taskId       = comment.getTask() != null ? comment.getTask().getTaskId() : null;

        return CommentResponseDto.builder()
                .commentId(comment.getCommentId())
                .content(comment.getContent())
                .taskId(taskId)
                .userId(userId)
                .userFullName(fullName)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
