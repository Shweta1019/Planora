package com.planora.module.dashboard.service;

import com.planora.common.enums.ProjectStatus;
import com.planora.common.enums.TaskStatus;
import com.planora.module.dashboard.dto.response.DashboardStatsResponseDto;
import com.planora.module.project.repository.ProjectRepository;
import com.planora.module.task.repository.TaskRepository;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DashboardStatsResponseDto getStats() {
        long totalTasks     = taskRepository.count();
        long completedTasks = taskRepository.findByStatus(TaskStatus.COMPLETED).size();
        long activeProjects = projectRepository.findByStatus(ProjectStatus.ACTIVE).size();
        long completedProj  = projectRepository.findByStatus(ProjectStatus.COMPLETED).size();

        return DashboardStatsResponseDto.builder()
                .totalUsers(userRepository.count())
                .totalProjects(projectRepository.count())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(totalTasks - completedTasks)
                .activeProjects(activeProjects)
                .completedProjects(completedProj)
                .build();
    }
}
