package com.planora.module.task.service;

import com.planora.module.task.dto.request.CommentCreateRequestDto;
import com.planora.module.task.dto.request.TaskCreateRequestDto;
import com.planora.module.task.dto.request.TaskStatusUpdateRequestDto;
import com.planora.module.task.dto.request.TaskUpdateRequestDto;
import com.planora.module.task.dto.response.CommentResponseDto;
import com.planora.module.task.dto.response.TaskResponseDto;

import java.util.List;

public interface TaskService {

    TaskResponseDto createTask(TaskCreateRequestDto requestDto);
    TaskResponseDto updateTask(Long taskId, TaskUpdateRequestDto requestDto);
    TaskResponseDto updateTaskStatus(Long taskId, TaskStatusUpdateRequestDto requestDto);
    TaskResponseDto getTaskById(Long taskId);
    List<TaskResponseDto> getTasksByProject(Long projectId);
    List<TaskResponseDto> getTasksByUser(Long userId);
    void deleteTask(Long taskId);

    CommentResponseDto addComment(Long taskId, CommentCreateRequestDto requestDto);
    List<CommentResponseDto> getComments(Long taskId);
}
