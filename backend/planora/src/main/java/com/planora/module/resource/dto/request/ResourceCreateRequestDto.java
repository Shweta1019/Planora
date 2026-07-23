package com.planora.module.resource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceCreateRequestDto {

    @NotBlank(message = "Resource type is required")
    private String resourceType;

    private String skillSet;
    private String description;
    private Integer availabilityHours;

    @NotNull(message = "User ID is required")
    private Long userId;
}
