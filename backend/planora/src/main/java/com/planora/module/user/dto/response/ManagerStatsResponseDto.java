package com.planora.module.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerStatsResponseDto {
    private String managerName;
    private String department;
    private Long employeeCount;
    private java.util.List<String> employeeNames;
    private String profileImage;
}
