package com.planora.module.project.dto.response;

import com.planora.common.enums.Role;
import com.planora.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ProjectMemberResponseDto {

    private Long memberId;
    private Long projectId;
    private String projectName;
    private Long userId;
    private String fullName;

    private String email;
    private Role role;
    private UserStatus status;
    private String roleInProject;
    private Integer allocationPercentage;
    private String profileImage;
    private LocalDate assignedDate;
    private LocalDate releaseDate;
}
