package com.planora.module.activitylog.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.activitylog.dto.response.ActivityLogResponseDto;
import com.planora.module.activitylog.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activity-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE')")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLogResponseDto>>> getRecent() {
        return ResponseEntity.ok(ApiResponse.success("Recent activity", activityLogService.getRecentActivity()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ActivityLogResponseDto>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User activity", activityLogService.getByUser(userId)));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<ActivityLogResponseDto>>> getByEntity(@PathVariable String entityType,
                                                                                  @PathVariable Long entityId) {
        return ResponseEntity.ok(ApiResponse.success("Entity activity", activityLogService.getByEntity(entityType, entityId)));
    }
}
