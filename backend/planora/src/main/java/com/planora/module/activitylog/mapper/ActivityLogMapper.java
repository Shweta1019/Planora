package com.planora.module.activitylog.mapper;

import com.planora.module.activitylog.dto.response.ActivityLogResponseDto;
import com.planora.module.activitylog.entity.ActivityLog;
import org.springframework.stereotype.Component;

@Component
public class ActivityLogMapper {

    public ActivityLogResponseDto toResponseDto(ActivityLog log) {
        Long userId     = log.getUser() != null ? log.getUser().getUserId() : null;
        String fullName = log.getUser() != null ? log.getUser().getFullName() : null;
        String profileImage = log.getUser() != null ? log.getUser().getProfileImage() : null;

        return ActivityLogResponseDto.builder()
                .logId(log.getLogId())
                .userId(userId)
                .userFullName(fullName)
                .userProfileImage(profileImage)
                .action(log.getAction())
                .description(log.getDescription())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
