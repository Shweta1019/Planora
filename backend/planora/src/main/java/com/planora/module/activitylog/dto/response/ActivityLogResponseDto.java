package com.planora.module.activitylog.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActivityLogResponseDto {

    private Long logId;
    private Long userId;
    private String userFullName;
    private String action;
    private String description;
    private String entityType;
    private Long entityId;
    private LocalDateTime createdAt;
}
