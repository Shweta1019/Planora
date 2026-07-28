package com.planora.module.project.service;

import com.planora.module.project.dto.request.*;
import com.planora.module.project.dto.response.ProjectMemberResponseDto;
import com.planora.module.project.dto.response.ProjectResponseDto;
import com.planora.module.project.dto.response.ProjectSummaryResponseDto;
import com.planora.module.project.entity.Project;
import com.planora.module.project.entity.ProjectMember;
import com.planora.module.project.exception.ProjectNotFoundException;
import com.planora.module.project.mapper.ProjectMapper;
import com.planora.module.project.repository.ProjectMemberRepository;
import com.planora.module.project.repository.ProjectRepository;
import com.planora.module.notification.service.NotificationService;
import com.planora.module.user.entity.User;
import com.planora.module.user.exception.UserNotFoundException;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final NotificationService notificationService;

    @Override
    public ProjectResponseDto createProject(ProjectCreateRequestDto dto) {
        if (projectRepository.existsByProjectNameIgnoreCase(dto.getProjectName())) {
            throw new IllegalArgumentException("Project name already exists: " + dto.getProjectName());
        }

        Project.ProjectBuilder builder = Project.builder()
                .projectName(dto.getProjectName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .budget(dto.getBudget())
                .status(dto.getStatus() != null ? dto.getStatus() : com.planora.common.enums.ProjectStatus.PLANNING)
                .priority(dto.getPriority() != null ? dto.getPriority() : com.planora.common.enums.ProjectPriority.MEDIUM);

        // manager is optional
        if (dto.getManagerId() != null) {
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new UserNotFoundException(dto.getManagerId()));
            builder.manager(manager);
        }

        Project saved = projectRepository.save(builder.build());
        int total = (int) memberRepository.countByProjectProjectId(saved.getProjectId());
        return projectMapper.toResponseDto(saved, total);
    }

    @Override
    public ProjectResponseDto updateProject(Long projectId, ProjectUpdateRequestDto dto) {
        Project project = findOrThrow(projectId);

        if (dto.getProjectName() != null)        project.setProjectName(dto.getProjectName());
        if (dto.getDescription() != null)        project.setDescription(dto.getDescription());
        if (dto.getStartDate() != null)          project.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)            project.setEndDate(dto.getEndDate());
        if (dto.getBudget() != null)             project.setBudget(dto.getBudget());
        if (dto.getPriority() != null)           project.setPriority(dto.getPriority());
        if (dto.getCompletionPercentage() != null) project.setCompletionPercentage(dto.getCompletionPercentage());

        Project saved = projectRepository.save(project);
        int total = (int) memberRepository.countByProjectProjectId(projectId);
        
        // Notify all project members about the update
        List<ProjectMember> members = memberRepository.findByProjectProjectId(projectId);
        for (ProjectMember m : members) {
            notificationService.send(
                m.getUser().getUserId(),
                "Project Updated",
                "Project \"" + project.getProjectName() + "\" has been updated.",
                "PROJECT_UPDATED"
            );
        }

        return projectMapper.toResponseDto(saved, total);
    }

    @Override
    public ProjectResponseDto updateProjectStatus(Long projectId, ProjectStatusUpdateRequestDto dto) {
        Project project = findOrThrow(projectId);
        project.setStatus(dto.getStatus());

        Project saved = projectRepository.save(project);
        int total = (int) memberRepository.countByProjectProjectId(projectId);
        return projectMapper.toResponseDto(saved, total);
    }

    @Override
    public ProjectResponseDto getProjectById(Long projectId) {
        Project project = findOrThrow(projectId);
        int total = (int) memberRepository.countByProjectProjectId(projectId);
        return projectMapper.toResponseDto(project, total);
    }

    @Override
    public List<ProjectSummaryResponseDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(p -> {
                    int total = (int) memberRepository.countByProjectProjectId(p.getProjectId());
                    return projectMapper.toSummaryDto(p, total);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        if (!projectRepository.existsByProjectId(projectId)) throw new ProjectNotFoundException(projectId);
        projectRepository.deleteById(projectId);
    }

    @Override
    public ProjectMemberResponseDto assignMemberToProject(Long projectId, ProjectMemberAssignRequestDto dto) {
        Project project = findOrThrow(projectId);
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException(dto.getUserId()));

        if (memberRepository.existsByProjectProjectIdAndUserUserId(projectId, dto.getUserId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .roleInProject(dto.getRoleInProject())
                .allocationPercentage(dto.getAllocationPercentage() != null ? dto.getAllocationPercentage() : 100)
                .assignedDate(LocalDate.now())
                .build();

        notificationService.send(
            user.getUserId(),
            "Assigned to Project",
            "You have been assigned to the project \"" + project.getProjectName() + "\".",
            "PROJECT_ASSIGNED"
        );

        return projectMapper.toMemberDto(memberRepository.save(member));
    }

    @Override
    public List<ProjectMemberResponseDto> getProjectMembers(Long projectId) {
        return memberRepository.findByProjectProjectId(projectId).stream()
                .map(projectMapper::toMemberDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeMemberFromProject(Long projectId, Long userId) {
        memberRepository.deleteByProjectProjectIdAndUserUserId(projectId, userId);
    }

    private Project findOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));
    }
}
