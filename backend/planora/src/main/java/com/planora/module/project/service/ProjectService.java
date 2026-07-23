package com.planora.module.project.service;

import com.planora.module.project.dto.request.*;
import com.planora.module.project.dto.response.ProjectMemberResponseDto;
import com.planora.module.project.dto.response.ProjectResponseDto;
import com.planora.module.project.dto.response.ProjectSummaryResponseDto;

import java.util.List;

public interface ProjectService {

    ProjectResponseDto createProject(ProjectCreateRequestDto requestDto);
    ProjectResponseDto updateProject(Long projectId, ProjectUpdateRequestDto requestDto);
    ProjectResponseDto updateProjectStatus(Long projectId, ProjectStatusUpdateRequestDto requestDto);
    ProjectResponseDto getProjectById(Long projectId);
    List<ProjectSummaryResponseDto> getAllProjects();
    void deleteProject(Long projectId);

    ProjectMemberResponseDto assignMemberToProject(Long projectId, ProjectMemberAssignRequestDto requestDto);
    List<ProjectMemberResponseDto> getProjectMembers(Long projectId);
    void removeMemberFromProject(Long projectId, Long userId);
}
