package com.planora.module.resource.dto.request;

import lombok.Data;

@Data
public class ResourceUpdateRequestDto {

    private String resourceType;
    private String skillSet;
    private String description;
    private Integer availabilityHours;
    private Boolean isAvailable;
}
