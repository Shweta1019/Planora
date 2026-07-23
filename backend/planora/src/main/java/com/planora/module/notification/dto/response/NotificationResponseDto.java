package com.planora.module.notification.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDto {

    private Long notificationId;
    private Long userId;
    private String title;
    private String message;
    private boolean isRead;
    private String type;
    private LocalDateTime createdAt;
}
