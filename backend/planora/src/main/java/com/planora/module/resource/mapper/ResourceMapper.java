package com.planora.module.resource.mapper;

import com.planora.module.resource.dto.response.ResourceResponseDto;
import com.planora.module.resource.entity.Resource;
import org.springframework.stereotype.Component;

@Component
public class ResourceMapper {

    public ResourceResponseDto toResponseDto(Resource r) {
        return ResourceResponseDto.builder()
                .resourceId(r.getResourceId())
                .resourceType(r.getResourceType())
                .skillSet(r.getSkillSet())
                .description(r.getDescription())
                .availabilityHours(r.getAvailabilityHours())
                .isAvailable(r.isAvailable())
                .userId(r.getUser() != null ? r.getUser().getUserId() : null)
                .userFullName(r.getUser() != null ? r.getUser().getFullName() : null)
                .email(r.getUser() != null ? r.getUser().getEmail() : null)
                .userRole(r.getUser() != null ? r.getUser().getRole() : null)
                .department(r.getUser() != null ? r.getUser().getDepartment() : null)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
