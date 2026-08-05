package com.planora.module.resource.dto.response;

import com.planora.common.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResourceResponseDto {

    private Long resourceId;
    private String resourceType;
    private String skillSet;
    private String description;
    private Integer availabilityHours;
    private boolean isAvailable;
    private Long userId;
    private String userFullName;
    private String email;
    private Role userRole;
    private String department;
    private String userProfileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
