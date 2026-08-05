package com.planora.module.project.dto.request;

import lombok.Data;

@Data
public class ProjectMemberUpdateRequestDto {
    private String roleInProject;
    private Integer allocationPercentage;
}
