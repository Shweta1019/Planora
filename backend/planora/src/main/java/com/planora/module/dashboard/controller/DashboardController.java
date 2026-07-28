package com.planora.module.dashboard.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.dashboard.dto.response.DashboardStatsResponseDto;
import com.planora.module.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<DashboardStatsResponseDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", dashboardService.getStats()));
    }
}
