package com.planora.module.report.service;

import com.planora.common.enums.Role;
import com.planora.common.enums.TaskStatus;
import com.planora.module.project.entity.Project;
import com.planora.module.project.repository.ProjectRepository;
import com.planora.module.report.dto.response.EmployeeReportDto;
import com.planora.module.report.dto.response.ProjectReportDto;
import com.planora.module.task.repository.TaskRepository;
import com.planora.module.user.entity.User;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<ProjectReportDto> getProjectReport() {
        return projectRepository.findAll().stream().map(p -> {
            long total     = taskRepository.countByProjectProjectId(p.getProjectId());
            long completed = taskRepository.countByProjectProjectIdAndStatus(p.getProjectId(), TaskStatus.COMPLETED);
            String manager = p.getManager() != null ? p.getManager().getFullName() : null;

            return ProjectReportDto.builder()
                    .projectId(p.getProjectId())
                    .projectName(p.getProjectName())
                    .status(p.getStatus())
                    .managerName(manager)
                    .totalTasks(total)
                    .completedTasks(completed)
                    .completionPercentage(p.getCompletionPercentage())
                    .budget(p.getBudget())
                    .spentAmount(p.getSpentAmount())
                    .build();
        }).collect(Collectors.toList());
    }

    public List<EmployeeReportDto> getEmployeeReport() {
        return userRepository.findByRole(Role.EMPLOYEE).stream().map(u -> {
            List<?> assigned  = taskRepository.findByAssignedToUserId(u.getUserId());
            long completed    = assigned.stream()
                    .filter(t -> ((com.planora.module.task.entity.Task) t).getStatus() == TaskStatus.COMPLETED)
                    .count();
            int total = assigned.size();
            double rate = total > 0 ? (completed * 100.0 / total) : 0.0;

            return EmployeeReportDto.builder()
                    .userId(u.getUserId())
                    .fullName(u.getFullName())
                    .department(u.getDepartment())
                    .assignedTasks(total)
                    .completedTasks((int) completed)
                    .completionRate(Math.round(rate * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());
    }
}
