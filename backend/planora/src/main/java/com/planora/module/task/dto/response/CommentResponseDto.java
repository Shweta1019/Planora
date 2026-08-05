package com.planora.module.task.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponseDto {

    private Long commentId;
    private String content;
    private Long taskId;
    private Long userId;
    private String userFullName;
    private String userProfileImage;
    private LocalDateTime createdAt;
}
