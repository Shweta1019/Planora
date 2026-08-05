package com.planora.module.task.service;

import com.planora.module.notification.service.NotificationService;
import com.planora.module.project.entity.Project;
import com.planora.module.project.exception.ProjectNotFoundException;
import com.planora.module.project.repository.ProjectMemberRepository;
import com.planora.module.project.repository.ProjectRepository;
import com.planora.module.task.dto.request.CommentCreateRequestDto;
import com.planora.module.task.dto.request.TaskCreateRequestDto;
import com.planora.module.task.dto.request.TaskStatusUpdateRequestDto;
import com.planora.module.task.dto.request.TaskUpdateRequestDto;
import com.planora.module.task.dto.response.CommentResponseDto;
import com.planora.module.task.dto.response.TaskResponseDto;
import com.planora.module.task.entity.Comment;
import com.planora.module.task.entity.Task;
import com.planora.module.task.exception.TaskNotFoundException;
import com.planora.module.task.mapper.TaskMapper;
import com.planora.module.task.repository.CommentRepository;
import com.planora.module.task.repository.TaskRepository;
import com.planora.module.user.entity.User;
import com.planora.module.user.exception.UserNotFoundException;
import com.planora.module.user.repository.UserRepository;
import com.planora.module.activitylog.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository         taskRepository;
    private final CommentRepository      commentRepository;
    private final ProjectRepository      projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository         userRepository;
    private final TaskMapper             taskMapper;
    private final NotificationService    notificationService;
    private final ActivityLogService     activityLogService;

    private com.planora.module.user.entity.User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public TaskResponseDto createTask(TaskCreateRequestDto dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException(dto.getProjectId()));

        User assignedTo = null;
        if (dto.getAssignedToId() != null) {
            assignedTo = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new UserNotFoundException(dto.getAssignedToId()));
            checkUserCapacity(assignedTo);
            if (assignedTo.getRole() == com.planora.common.enums.Role.ADMIN) {
                throw new IllegalArgumentException("Tasks cannot be assigned to Admin.");
            }
            boolean isAssignedToProject = (project.getManager() != null && project.getManager().getUserId().equals(assignedTo.getUserId()))
                    || memberRepository.existsByProjectProjectIdAndUserUserId(project.getProjectId(), assignedTo.getUserId());
            if (!isAssignedToProject) {
                throw new IllegalArgumentException("User is not assigned to project \"" + project.getProjectName() + "\".");
            }
        }

        com.planora.module.user.entity.User currentUser = getCurrentUser();

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : com.planora.common.enums.TaskPriority.MEDIUM)
                .startDate(dto.getStartDate())
                .dueDate(dto.getDueDate())
                .completionPercentage(0)
                .project(project)
                .assignedTo(assignedTo)
                .assignedBy(currentUser)   // always set — whoever creates the task
                .build();

        Task saved = taskRepository.save(task);
        updateProjectCompletion(project);

        // fire notification to the assigned user
        if (assignedTo != null) {
            notificationService.send(
                    assignedTo.getUserId(),
                    "New Task Assigned",
                    "You have been assigned a new task \"" + dto.getTitle() + "\" in project " + project.getProjectName() + ".",
                    "TASK_ASSIGNED"
            );
        }

        if (currentUser != null) {
            activityLogService.log(
                    currentUser.getUserId(),
                    "Task Created",
                    "Created task \"" + task.getTitle() + "\" in project " + project.getProjectName(),
                    "TASK",
                    task.getTaskId()
            );
        }

        if (project.getManager() != null) {
            Long pmId = project.getManager().getUserId();
            if (currentUser == null || !currentUser.getUserId().equals(pmId)) {
                notificationService.send(
                        pmId,
                        "New Task in Project",
                        "A new task \"" + dto.getTitle() + "\" was created in your project " + project.getProjectName() + ".",
                        "PROJECT_TASK_CREATED"
                );
            }
        }

        return taskMapper.toResponseDto(saved);
    }

    @Override
    public TaskResponseDto updateTask(Long taskId, TaskUpdateRequestDto dto) {
        Task task = findOrThrow(taskId);

        if (dto.getTitle() != null)       task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getPriority() != null)    task.setPriority(dto.getPriority());
        if (dto.getStartDate() != null)   task.setStartDate(dto.getStartDate());
        if (dto.getDueDate() != null)     task.setDueDate(dto.getDueDate());

        if (dto.getCompletionPercentage() != null) task.setCompletionPercentage(dto.getCompletionPercentage());

        // Sync percentage based on status
        if (task.getStatus() == com.planora.common.enums.TaskStatus.COMPLETED) {
            task.setCompletionPercentage(100);
        } else if (task.getStatus() == com.planora.common.enums.TaskStatus.IN_REVIEW) {
            if (task.getCompletionPercentage() == null || task.getCompletionPercentage() == 0) task.setCompletionPercentage(75);
        } else if (task.getStatus() == com.planora.common.enums.TaskStatus.IN_PROGRESS) {
            if (task.getCompletionPercentage() == null || task.getCompletionPercentage() == 0) task.setCompletionPercentage(50);
        } else if (task.getStatus() == com.planora.common.enums.TaskStatus.TODO || task.getStatus() == com.planora.common.enums.TaskStatus.NOT_STARTED) {
            if (dto.getCompletionPercentage() == null) task.setCompletionPercentage(0);
        }

        Long currentAssigneeId = task.getAssignedTo() != null ? task.getAssignedTo().getUserId() : null;

        if (dto.getAssignedToId() != null) {
            User user = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new UserNotFoundException(dto.getAssignedToId()));
            if (!dto.getAssignedToId().equals(currentAssigneeId)) {
                checkUserCapacity(user);
            }
            if (user.getRole() == com.planora.common.enums.Role.ADMIN) {
                throw new IllegalArgumentException("Tasks cannot be assigned to Admin.");
            }
            Long targetProjectId = task.getProject() != null ? task.getProject().getProjectId() : null;
            boolean isAssignedToProject = (task.getProject() != null && task.getProject().getManager() != null && task.getProject().getManager().getUserId().equals(user.getUserId()))
                    || (targetProjectId != null && memberRepository.existsByProjectProjectIdAndUserUserId(targetProjectId, user.getUserId()));
            if (!isAssignedToProject) {
                throw new IllegalArgumentException("User is not assigned to this project.");
            }
            task.setAssignedTo(user);

            if (!dto.getAssignedToId().equals(currentAssigneeId)) {
                task.setAssignedBy(getCurrentUser());
                // re-assignment notification
                notificationService.send(
                        user.getUserId(),
                        "Task Re-assigned",
                        "Task \"" + task.getTitle() + "\" has been assigned to you.",
                        "TASK_ASSIGNED"
                );
            }
        }
        if (task.getAssignedTo() != null) {
            notificationService.send(
                    task.getAssignedTo().getUserId(),
                    "Task Updated",
                    "Task \"" + task.getTitle() + "\" has been updated.",
                    "TASK_UPDATED"
            );
        }

        com.planora.module.user.entity.User currentUser = getCurrentUser();
        if (currentUser != null) {
            activityLogService.log(
                    currentUser.getUserId(),
                    "Task Updated",
                    "Updated task \"" + task.getTitle() + "\"",
                    "TASK",
                    task.getTaskId()
            );
        }

        if (task.getProject() != null && task.getProject().getManager() != null) {
            Long pmId = task.getProject().getManager().getUserId();
            if (currentUser == null || !currentUser.getUserId().equals(pmId)) {
                notificationService.send(
                        pmId,
                        "Task Updated",
                        "Task \"" + task.getTitle() + "\" in your project " + task.getProject().getProjectName() + " has been updated.",
                        "PROJECT_TASK_UPDATED"
                );
            }
        }

        Task saved = taskRepository.save(task);
        updateProjectCompletion(task.getProject());
        return taskMapper.toResponseDto(saved);
    }

    @Override
    public TaskResponseDto updateTaskStatus(Long taskId, TaskStatusUpdateRequestDto dto) {
        Task task = findOrThrow(taskId);
        task.setStatus(dto.getStatus());
        
        // Auto-set completion based on status
        if (dto.getStatus() == com.planora.common.enums.TaskStatus.COMPLETED) {
            task.setCompletionPercentage(100);
        } else if (dto.getStatus() == com.planora.common.enums.TaskStatus.IN_REVIEW) {
            task.setCompletionPercentage(75);
        } else if (dto.getStatus() == com.planora.common.enums.TaskStatus.IN_PROGRESS) {
            task.setCompletionPercentage(50);
        } else {
            task.setCompletionPercentage(0);
        }
        if (task.getAssignedTo() != null) {
            notificationService.send(
                    task.getAssignedTo().getUserId(),
                    "Task Status Updated",
                    "Status of task \"" + task.getTitle() + "\" changed to " + dto.getStatus() + ".",
                    "TASK_UPDATED"
            );
        }

        com.planora.module.user.entity.User currentUser = getCurrentUser();
        if (currentUser != null) {
            activityLogService.log(
                    currentUser.getUserId(),
                    "Task Status Updated",
                    "Changed status of task \"" + task.getTitle() + "\" to " + dto.getStatus(),
                    "TASK",
                    task.getTaskId()
            );
        }
        
        if (task.getProject() != null && task.getProject().getManager() != null) {
            Long pmId = task.getProject().getManager().getUserId();
            if (currentUser == null || !currentUser.getUserId().equals(pmId)) {
                notificationService.send(
                        pmId,
                        "Task Status Changed",
                        "Task \"" + task.getTitle() + "\" in your project " + task.getProject().getProjectName() + " is now " + dto.getStatus() + ".",
                        "PROJECT_TASK_STATUS_CHANGED"
                );
            }
        }
        
        Task saved = taskRepository.save(task);
        updateProjectCompletion(task.getProject());
        return taskMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponseDto getTaskById(Long taskId) {
        return taskMapper.toResponseDto(findOrThrow(taskId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectProjectId(projectId).stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDto> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToUserId(userId).stream()
                .map(taskMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTask(Long taskId) {
        Task task = findOrThrow(taskId);
        Project project = task.getProject();
        String taskTitle = task.getTitle();
        taskRepository.delete(task);
        taskRepository.flush();
        updateProjectCompletion(project);

        com.planora.module.user.entity.User currentUser = getCurrentUser();
        if (currentUser != null) {
            activityLogService.log(
                    currentUser.getUserId(),
                    "Task Deleted",
                    "Deleted task \"" + taskTitle + "\"",
                    "PROJECT",
                    project.getProjectId()
            );
        }
    }

    @Override
    public CommentResponseDto addComment(Long taskId, CommentCreateRequestDto dto) {
        Task task = findOrThrow(taskId);
        User commenter = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new UserNotFoundException(dto.getUserId()));

        Comment comment = Comment.builder()
                .content(dto.getContent())
                .task(task)
                .user(commenter)
                .build();

        CommentResponseDto saved = taskMapper.toCommentDto(commentRepository.save(comment));

        // notify the task's assignee that someone commented (if not the same person)
        if (task.getAssignedTo() != null &&
                !task.getAssignedTo().getUserId().equals(commenter.getUserId())) {
            notificationService.send(
                    task.getAssignedTo().getUserId(),
                    "New Comment",
                    commenter.getFullName() + " commented on task \"" + task.getTitle() + "\".",
                    "NEW_COMMENT"
            );
        }
        
        if (task.getProject() != null && task.getProject().getManager() != null) {
            Long pmId = task.getProject().getManager().getUserId();
            if (!commenter.getUserId().equals(pmId)) {
                notificationService.send(
                        pmId,
                        "New Task Comment",
                        commenter.getFullName() + " commented on task \"" + task.getTitle() + "\" in your project.",
                        "PROJECT_TASK_COMMENT"
                );
            }
        }

        activityLogService.log(
                commenter.getUserId(),
                "New Comment",
                "Commented on task \"" + task.getTitle() + "\"",
                "TASK",
                task.getTaskId()
        );

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getComments(Long taskId) {
        findOrThrow(taskId);
        return commentRepository.findByTaskTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(taskMapper::toCommentDto)
                .collect(Collectors.toList());
    }

    private Task findOrThrow(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    private void updateProjectCompletion(Project project) {
        if (project == null) return;
        if (project.getStatus() == com.planora.common.enums.ProjectStatus.COMPLETED) {
            project.setCompletionPercentage(100);
            projectRepository.save(project);
            return;
        }
        List<Task> tasks = taskRepository.findByProjectProjectId(project.getProjectId());
        if (tasks.isEmpty()) {
            if (project.getStatus() == com.planora.common.enums.ProjectStatus.COMPLETED) {
                project.setCompletionPercentage(100);
            }
        } else {
            double totalPct = tasks.stream()
                    .mapToInt(t -> {
                        if (t.getStatus() == com.planora.common.enums.TaskStatus.COMPLETED) return 100;
                        if (t.getCompletionPercentage() != null && t.getCompletionPercentage() > 0) return t.getCompletionPercentage();
                        if (t.getStatus() == com.planora.common.enums.TaskStatus.IN_REVIEW) return 75;
                        if (t.getStatus() == com.planora.common.enums.TaskStatus.IN_PROGRESS) return 50;
                        return 0;
                    })
                    .sum();
            int avgPct = (int) Math.round(totalPct / tasks.size());
            project.setCompletionPercentage(avgPct);
        }
        projectRepository.save(project);
    }

    private void checkUserCapacity(User user) {
        if (user.getRole() == com.planora.common.enums.Role.ADMIN) return;
        
        long activeCount = 0;
        if (user.getRole() == com.planora.common.enums.Role.PROJECT_MANAGER) {
            java.util.List<Project> managed = projectRepository.findByManagerUserId(user.getUserId());
            activeCount = managed.stream()
                .filter(p -> p.getStatus() != com.planora.common.enums.ProjectStatus.COMPLETED 
                          && p.getStatus() != com.planora.common.enums.ProjectStatus.CANCELLED)
                .count();
            if (activeCount >= 2) {
                throw new IllegalArgumentException("User is currently unavailable (at maximum capacity of 2 active projects). Cannot assign tasks.");
            }
        } else {
            java.util.List<com.planora.module.project.entity.ProjectMember> memberships = memberRepository.findByUserUserId(user.getUserId());
            activeCount = memberships.stream()
                .filter(m -> m.getProject().getStatus() != com.planora.common.enums.ProjectStatus.COMPLETED 
                          && m.getProject().getStatus() != com.planora.common.enums.ProjectStatus.CANCELLED)
                .count();
            if (activeCount >= 3) {
                throw new IllegalArgumentException("User is currently unavailable (at maximum capacity of 3 active projects). Cannot assign tasks.");
            }
        }
    }
}
