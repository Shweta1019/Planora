package com.planora.module.project.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.project.dto.request.*;
import com.planora.module.project.dto.response.ProjectMemberResponseDto;
import com.planora.module.project.dto.response.ProjectResponseDto;
import com.planora.module.project.dto.response.ProjectSummaryResponseDto;
import com.planora.module.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> createProject(@Valid @RequestBody ProjectCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", projectService.createProject(dto)));
    }

    @PutMapping("/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> updateProject(@PathVariable Long projectId,
                                                                          @RequestBody ProjectUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Project updated", projectService.updateProject(projectId, dto)));
    }

    @PutMapping("/{projectId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> updateStatus(@PathVariable Long projectId,
                                                                         @Valid @RequestBody ProjectStatusUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", projectService.updateProjectStatus(projectId, dto)));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> getProjectById(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success("Project fetched", projectService.getProjectById(projectId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectSummaryResponseDto>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.success("Projects fetched", projectService.getAllProjects()));
    }

    @DeleteMapping("/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Project deleted"));
    }

    @PostMapping("/{projectId}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectMemberResponseDto>> assignMember(@PathVariable Long projectId,
                                                                               @Valid @RequestBody ProjectMemberAssignRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member assigned", projectService.assignMemberToProject(projectId, dto)));
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponseDto>>> getMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success("Members fetched", projectService.getProjectMembers(projectId)));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable Long projectId,
                                                           @PathVariable Long userId) {
        projectService.removeMemberFromProject(projectId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed"));
    }
}
