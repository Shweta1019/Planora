package com.planora.module.task.service;

import com.planora.module.notification.service.NotificationService;
import com.planora.module.project.entity.Project;
import com.planora.module.project.exception.ProjectNotFoundException;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository         taskRepository;
    private final CommentRepository      commentRepository;
    private final ProjectRepository      projectRepository;
    private final UserRepository         userRepository;
    private final TaskMapper             taskMapper;
    private final NotificationService    notificationService;

    @Override
    public TaskResponseDto createTask(TaskCreateRequestDto dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException(dto.getProjectId()));

        User assignedTo = null;
        if (dto.getAssignedToId() != null) {
            assignedTo = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new UserNotFoundException(dto.getAssignedToId()));
        }

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : com.planora.common.enums.TaskPriority.MEDIUM)
                .dueDate(dto.getDueDate())
                .project(project)
                .assignedTo(assignedTo)
                .build();

        Task saved = taskRepository.save(task);

        // fire notification to the assigned employee
        if (assignedTo != null) {
            notificationService.send(
                    assignedTo.getUserId(),
                    "New Task Assigned",
                    "You have been assigned a new task \"" + dto.getTitle() + "\" in project " + project.getProjectName() + ".",
                    "TASK_ASSIGNED"
            );
        }

        return taskMapper.toResponseDto(saved);
    }

    @Override
    public TaskResponseDto updateTask(Long taskId, TaskUpdateRequestDto dto) {
        Task task = findOrThrow(taskId);

        if (dto.getTitle() != null)       task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getPriority() != null)    task.setPriority(dto.getPriority());
        if (dto.getDueDate() != null)     task.setDueDate(dto.getDueDate());

        if (dto.getAssignedToId() != null) {
            User user = userRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new UserNotFoundException(dto.getAssignedToId()));
            task.setAssignedTo(user);

            // re-assignment notification
            notificationService.send(
                    user.getUserId(),
                    "Task Re-assigned",
                    "Task \"" + task.getTitle() + "\" has been assigned to you.",
                    "TASK_ASSIGNED"
            );
        }

        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Override
    public TaskResponseDto updateTaskStatus(Long taskId, TaskStatusUpdateRequestDto dto) {
        Task task = findOrThrow(taskId);
        task.setStatus(dto.getStatus());
        return taskMapper.toResponseDto(taskRepository.save(task));
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
        taskRepository.delete(findOrThrow(taskId));
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
}
