package com.planora.module.report.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeReportDto {

    private Long userId;
    private String fullName;
    private String department;
    private int assignedTasks;
    private int completedTasks;
    private double completionRate;
}
