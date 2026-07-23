package com.planora.module.report.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.report.dto.response.EmployeeReportDto;
import com.planora.module.report.dto.response.ProjectReportDto;
import com.planora.module.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectReportDto>>> projectReport() {
        return ResponseEntity.ok(ApiResponse.success("Project report", reportService.getProjectReport()));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<EmployeeReportDto>>> employeeReport() {
        return ResponseEntity.ok(ApiResponse.success("Employee report", reportService.getEmployeeReport()));
    }
}
