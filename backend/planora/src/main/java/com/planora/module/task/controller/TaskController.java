package com.planora.module.task.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.task.dto.request.CommentCreateRequestDto;
import com.planora.module.task.dto.request.TaskCreateRequestDto;
import com.planora.module.task.dto.request.TaskStatusUpdateRequestDto;
import com.planora.module.task.dto.request.TaskUpdateRequestDto;
import com.planora.module.task.dto.response.CommentResponseDto;
import com.planora.module.task.dto.response.TaskResponseDto;
import com.planora.module.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponseDto>> createTask(@Valid @RequestBody TaskCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", taskService.createTask(dto)));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponseDto>> getById(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success("Task fetched", taskService.getTaskById(taskId)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched", taskService.getTasksByProject(projectId)));
    }

    @GetMapping("/assigned/{userId}")
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched", taskService.getTasksByUser(userId)));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponseDto>> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Task updated", taskService.updateTask(taskId, dto)));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskResponseDto>> updateStatus(
            @PathVariable Long taskId,
            @RequestBody TaskStatusUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", taskService.updateTaskStatus(taskId, dto)));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Task deleted"));
    }

    // ---- Comments ----

    @PostMapping("/{taskId}/comments")
    public ResponseEntity<ApiResponse<CommentResponseDto>> addComment(
            @PathVariable Long taskId,
            @Valid @RequestBody CommentCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", taskService.addComment(taskId, dto)));
    }

    @GetMapping("/{taskId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponseDto>>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success("Comments fetched", taskService.getComments(taskId)));
    }
}
