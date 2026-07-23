package com.planora.module.notification.mapper;

import com.planora.module.notification.dto.response.NotificationResponseDto;
import com.planora.module.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponseDto toResponseDto(Notification n) {
        return NotificationResponseDto.builder()
                .notificationId(n.getNotificationId())
                .userId(n.getUser() != null ? n.getUser().getUserId() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.isRead())
                .type(n.getType())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
