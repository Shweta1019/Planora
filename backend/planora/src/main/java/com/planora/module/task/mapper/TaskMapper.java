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

        Long assignedById   = task.getAssignedBy() != null ? task.getAssignedBy().getUserId() : null;
        String assignedByName = task.getAssignedBy() != null ? task.getAssignedBy().getFullName() : null;
        
        String assignedToProfileImage = task.getAssignedTo() != null ? task.getAssignedTo().getProfileImage() : null;
        String assignedByProfileImage = task.getAssignedBy() != null ? task.getAssignedBy().getProfileImage() : null;

        return TaskResponseDto.builder()
                .taskId(task.getTaskId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .completionPercentage(task.getCompletionPercentage())
                .startDate(task.getStartDate())
                .dueDate(task.getDueDate())
                .projectId(projectId)
                .projectName(projectName)
                .assignedToId(assignedToId)
                .assignedToName(assignedToName)
                .assignedToProfileImage(assignedToProfileImage)
                .assignedById(assignedById)
                .assignedByName(assignedByName)
                .assignedByProfileImage(assignedByProfileImage)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    public CommentResponseDto toCommentDto(Comment comment) {
        Long userId       = comment.getUser() != null ? comment.getUser().getUserId() : null;
        String fullName   = comment.getUser() != null ? comment.getUser().getFullName() : null;
        Long taskId       = comment.getTask() != null ? comment.getTask().getTaskId() : null;

        String profileImage = comment.getUser() != null ? comment.getUser().getProfileImage() : null;

        return CommentResponseDto.builder()
                .commentId(comment.getCommentId())
                .content(comment.getContent())
                .taskId(taskId)
                .userId(userId)
                .userFullName(fullName)
                .userProfileImage(profileImage)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
