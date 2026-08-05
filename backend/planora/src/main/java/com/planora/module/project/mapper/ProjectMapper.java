package com.planora.module.project.mapper;

import com.planora.module.project.dto.response.ProjectMemberResponseDto;
import com.planora.module.project.dto.response.ProjectResponseDto;
import com.planora.module.project.dto.response.ProjectSummaryResponseDto;
import com.planora.module.project.entity.Project;
import com.planora.module.project.entity.ProjectMember;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponseDto toResponseDto(Project p, Integer totalMembers) {
        // null-safe manager extraction
        Long managerId   = p.getManager() != null ? p.getManager().getUserId() : null;
        String managerName = p.getManager() != null ? p.getManager().getFullName() : null;

        return ProjectResponseDto.builder()
                .projectId(p.getProjectId())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .status(p.getStatus())
                .priority(p.getPriority())
                .budget(p.getBudget())
                .spentAmount(p.getSpentAmount())
                .budgetOverrun(p.isBudgetOverrun())
                .completionPercentage(p.getCompletionPercentage())
                .managerId(managerId)
                .managerName(managerName)
                .totalMembers(totalMembers)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    public ProjectSummaryResponseDto toSummaryDto(Project p, Integer totalMembers) {
        String managerName = p.getManager() != null ? p.getManager().getFullName() : null;
        Long managerId = p.getManager() != null ? p.getManager().getUserId() : null;

        return ProjectSummaryResponseDto.builder()
                .projectId(p.getProjectId())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .status(p.getStatus())
                .priority(p.getPriority())
                .managerName(managerName)
                .managerId(managerId)
                .totalMembers(totalMembers)
                .completionPercentage(p.getCompletionPercentage())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .budget(p.getBudget())
                .budgetOverrun(p.isBudgetOverrun())
                .createdAt(p.getCreatedAt())
                .build();
    }

    public ProjectMemberResponseDto toMemberDto(ProjectMember m) {
        // null-safe project and user extractions
        Long projectId     = m.getProject() != null ? m.getProject().getProjectId() : null;
        String projectName = m.getProject() != null ? m.getProject().getProjectName() : null;
        Long userId        = m.getUser() != null ? m.getUser().getUserId() : null;
        String fullName    = m.getUser() != null ? m.getUser().getFullName() : null;
        String email       = m.getUser() != null ? m.getUser().getEmail() : null;

        return ProjectMemberResponseDto.builder()
                .memberId(m.getMemberId())
                .projectId(projectId)
                .projectName(projectName)
                .userId(userId)
                .fullName(fullName)
                .email(email)
                .role(m.getUser() != null ? m.getUser().getRole() : null)
                .status(m.getUser() != null ? m.getUser().getStatus() : null)
                .roleInProject(m.getRoleInProject())
                .allocationPercentage(m.getAllocationPercentage())
                .assignedDate(m.getAssignedDate())
                .releaseDate(m.getReleaseDate())
                .profileImage(m.getUser() != null ? m.getUser().getProfileImage() : null)
                .build();
    }
}
