package com.planora.module.expense.dto.response;

import com.planora.common.enums.ExpenseStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponseDto {

    private Long expenseId;
    private String title;
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String category;
    private Long projectId;
    private String projectName;
    private Long submittedById;
    private String submittedByName;
    private ExpenseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
