package com.planora.module.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponseDto {

    private long totalUsers;
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long activeProjects;
    private long completedProjects;
}
