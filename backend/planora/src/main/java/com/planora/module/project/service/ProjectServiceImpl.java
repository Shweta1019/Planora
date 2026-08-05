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
import com.planora.module.expense.repository.ExpenseRepository;
import com.planora.module.user.entity.User;
import com.planora.module.user.exception.UserNotFoundException;
import com.planora.module.user.repository.UserRepository;
import com.planora.common.enums.ProjectStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final NotificationService notificationService;
    private final ExpenseRepository expenseRepository;
    private final EntityManager entityManager;

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
            List<Project> managedProjects = projectRepository.findByManagerUserId(dto.getManagerId());
            long activeCount = managedProjects.stream()
                .filter(p -> p.getStatus() != com.planora.common.enums.ProjectStatus.COMPLETED 
                          && p.getStatus() != com.planora.common.enums.ProjectStatus.CANCELLED)
                .count();
            if (activeCount >= 2) {
                throw new IllegalArgumentException("User is currently unavailable (at maximum capacity of 2 active projects).");
            }
            User manager = userRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new UserNotFoundException(dto.getManagerId()));
            builder.manager(manager);
        }

        Project saved = projectRepository.save(builder.build());

        // Process Manager Notification and Membership
        if (dto.getManagerId() != null) {
            User manager = saved.getManager();
            if (!memberRepository.existsByProjectProjectIdAndUserUserId(saved.getProjectId(), manager.getUserId())) {
                ProjectMember pm = ProjectMember.builder()
                        .project(saved)
                        .user(manager)
                        .roleInProject("Project Manager")
                        .allocationPercentage(100)
                        .assignedDate(LocalDate.now())
                        .build();
                memberRepository.save(pm);
            }

            notificationService.send(
                manager.getUserId(),
                "Project Created",
                "You have been assigned as the manager for the new project \"" + saved.getProjectName() + "\".",
                "PROJECT_CREATED"
            );
        }

        // Process Teammates
        if (dto.getMembers() != null && !dto.getMembers().isEmpty()) {
            for (ProjectMemberAssignRequestDto memDto : dto.getMembers()) {
                // Skip if it's the manager again
                if (dto.getManagerId() != null && dto.getManagerId().equals(memDto.getUserId())) continue;

                User user = userRepository.findById(memDto.getUserId()).orElse(null);
                if (user != null) {
                    checkUserCapacity(user, null);
                    ProjectMember member = ProjectMember.builder()
                            .project(saved)
                            .user(user)
                            .roleInProject(memDto.getRoleInProject() != null && !memDto.getRoleInProject().trim().isEmpty() ? memDto.getRoleInProject() : "Team Member")
                            .allocationPercentage(memDto.getAllocationPercentage() != null ? memDto.getAllocationPercentage() : 100)
                            .assignedDate(LocalDate.now())
                            .build();
                    memberRepository.save(member);

                    notificationService.send(
                        user.getUserId(),
                        "Assigned to Project",
                        "You have been assigned to the new project \"" + saved.getProjectName() + "\" as " + member.getRoleInProject() + ".",
                        "PROJECT_ASSIGNED"
                    );
                }
            }
        }

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
        if (project.getStatus() == ProjectStatus.COMPLETED) {
            project.setCompletionPercentage(100);
        }

        if (dto.getManagerId() != null) {
            if (project.getManager() == null || !project.getManager().getUserId().equals(dto.getManagerId())) {
                List<Project> managedProjects = projectRepository.findByManagerUserId(dto.getManagerId());
                if (managedProjects != null) {
                    long activeCount = managedProjects.stream()
                        .filter(p -> p.getStatus() != com.planora.common.enums.ProjectStatus.COMPLETED 
                                  && p.getStatus() != com.planora.common.enums.ProjectStatus.CANCELLED
                                  && !p.getProjectId().equals(projectId))
                        .count();
                    if (activeCount >= 2) {
                        throw new IllegalArgumentException("User is currently unavailable (at maximum capacity of 2 active projects).");
                    }
                }
                User manager = userRepository.findById(dto.getManagerId())
                        .orElseThrow(() -> new UserNotFoundException(dto.getManagerId()));
                project.setManager(manager);
            }
        }
        
        if (dto.getBudget() != null) {
            java.math.BigDecimal approved = expenseRepository.sumApprovedAmountByProject(projectId);
            if (approved == null) approved = java.math.BigDecimal.ZERO;
            project.setSpentAmount(approved);

            boolean wasOverrun = project.isBudgetOverrun();
            boolean isOverrun = project.getBudget().compareTo(java.math.BigDecimal.ZERO) > 0 && approved.compareTo(project.getBudget()) > 0;

            if (isOverrun && !wasOverrun) {
                project.setBudgetOverrun(true);
                if (project.getManager() != null) {
                    notificationService.send(
                        project.getManager().getUserId(),
                        "Budget Overrun",
                        "Project \"" + project.getProjectName() + "\" has exceeded its budget.",
                        "BUDGET_OVERRUN"
                    );
                }
            } else if (!isOverrun && wasOverrun) {
                project.setBudgetOverrun(false);
            }
        }

        Project saved = projectRepository.save(project);
        int total = (int) memberRepository.countByProjectProjectId(projectId);
        
        // Notify all project members about the update safely
        try {
            List<ProjectMember> members = memberRepository.findByProjectProjectId(projectId);
            if (members != null) {
                for (ProjectMember m : members) {
                    if (m != null && m.getUser() != null && m.getUser().getUserId() != null) {
                        notificationService.send(
                            m.getUser().getUserId(),
                            "Project Updated",
                            "Project \"" + project.getProjectName() + "\" has been updated.",
                            "PROJECT_UPDATED"
                        );
                    }
                }
            }
        } catch (Exception ignored) {
            // Notification failure should not fail project update transaction
        }

        return projectMapper.toResponseDto(saved, total);
    }

    @Override
    public ProjectResponseDto updateProjectStatus(Long projectId, ProjectStatusUpdateRequestDto dto) {
        Project project = findOrThrow(projectId);
        project.setStatus(dto.getStatus());
        if (dto.getStatus() == ProjectStatus.COMPLETED) {
            project.setCompletionPercentage(100);
        }

        Project saved = projectRepository.save(project);
        int total = (int) memberRepository.countByProjectProjectId(projectId);
        return projectMapper.toResponseDto(saved, total);
    }

    @Override
    public ProjectResponseDto getProjectById(Long projectId) {
        Project project = findOrThrow(projectId);
        if (project.getStatus() == ProjectStatus.COMPLETED && (project.getCompletionPercentage() == null || project.getCompletionPercentage() < 100)) {
            project.setCompletionPercentage(100);
        }
        int total = (int) memberRepository.countByProjectProjectId(projectId);
        return projectMapper.toResponseDto(project, total);
    }

    @Override
    public List<ProjectSummaryResponseDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(p -> {
                    if (p.getStatus() == ProjectStatus.COMPLETED && (p.getCompletionPercentage() == null || p.getCompletionPercentage() < 100)) {
                        p.setCompletionPercentage(100);
                    }
                    int total = (int) memberRepository.countByProjectProjectId(p.getProjectId());
                    return projectMapper.toSummaryDto(p, total);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (project.getStatus() != ProjectStatus.COMPLETED && project.getStatus() != ProjectStatus.CANCELLED) {
            throw new IllegalArgumentException("Only COMPLETED or CANCELLED projects can be deleted.");
        }

        // Delete dependencies using native queries to bypass JPA cache/loading overhead
        // 1. Comments on tasks in this project
        entityManager.createNativeQuery("DELETE FROM comments WHERE task_id IN (SELECT task_id FROM tasks WHERE project_id = :pid)")
                .setParameter("pid", projectId).executeUpdate();

        // 2. Tasks
        entityManager.createNativeQuery("DELETE FROM tasks WHERE project_id = :pid")
                .setParameter("pid", projectId).executeUpdate();

        // 3. Project Members
        entityManager.createNativeQuery("DELETE FROM project_members WHERE project_id = :pid")
                .setParameter("pid", projectId).executeUpdate();

        // 4. Expenses
        entityManager.createNativeQuery("DELETE FROM expenses WHERE project_id = :pid")
                .setParameter("pid", projectId).executeUpdate();

        // 5. Documents
        entityManager.createNativeQuery("DELETE FROM documents WHERE project_id = :pid")
                .setParameter("pid", projectId).executeUpdate();

        projectRepository.delete(project);
    }

    @Override
    public ProjectMemberResponseDto assignMemberToProject(Long projectId, ProjectMemberAssignRequestDto dto) {
        Project project = findOrThrow(projectId);
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException(dto.getUserId()));

        checkUserCapacity(user, null);

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
    public ProjectMemberResponseDto updateProjectMember(Long projectId, Long userId, ProjectMemberUpdateRequestDto dto) {
        ProjectMember member = memberRepository.findByProjectProjectIdAndUserUserId(projectId, userId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of this project"));
        
        if (dto.getRoleInProject() != null) {
            member.setRoleInProject(dto.getRoleInProject());
        }
        if (dto.getAllocationPercentage() != null) {
            member.setAllocationPercentage(dto.getAllocationPercentage());
        }
        
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

    private void checkUserCapacity(User user, Long excludeProjectId) {
        if (user.getRole() == com.planora.common.enums.Role.ADMIN) return;
        
        long activeCount = 0;
        if (user.getRole() == com.planora.common.enums.Role.PROJECT_MANAGER) {
            List<Project> managed = projectRepository.findByManagerUserId(user.getUserId());
            activeCount = managed.stream()
                .filter(p -> p.getStatus() != com.planora.common.enums.ProjectStatus.COMPLETED 
                          && p.getStatus() != com.planora.common.enums.ProjectStatus.CANCELLED
                          && (excludeProjectId == null || !p.getProjectId().equals(excludeProjectId)))
                .count();
            if (activeCount >= 2) {
                throw new IllegalArgumentException("User is currently unavailable (at maximum capacity of 2 active projects).");
            }
        } else {
            List<ProjectMember> memberships = memberRepository.findByUserUserId(user.getUserId());
            activeCount = memberships.stream()
                .filter(m -> m.getProject().getStatus() != com.planora.common.enums.ProjectStatus.COMPLETED 
                          && m.getProject().getStatus() != com.planora.common.enums.ProjectStatus.CANCELLED
                          && (excludeProjectId == null || !m.getProject().getProjectId().equals(excludeProjectId)))
                .count();
            if (activeCount >= 3) {
                throw new IllegalArgumentException("User is currently unavailable (at maximum capacity of 3 active projects).");
            }
        }
    }
}
