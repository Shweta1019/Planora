package com.planora.module.expense.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BudgetSummaryResponseDto {

    private Long projectId;
    private String projectName;
    private BigDecimal totalBudget;
    private BigDecimal approvedExpenses;
    private BigDecimal remaining;
    private boolean overBudget;
}
