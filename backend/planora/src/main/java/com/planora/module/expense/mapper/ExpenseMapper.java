package com.planora.module.expense.mapper;

import com.planora.module.expense.dto.response.ExpenseResponseDto;
import com.planora.module.expense.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public ExpenseResponseDto toResponseDto(Expense expense) {
        Long projectId     = expense.getProject() != null ? expense.getProject().getProjectId() : null;
        String projectName = expense.getProject() != null ? expense.getProject().getProjectName() : null;
        Long userId        = expense.getSubmittedBy() != null ? expense.getSubmittedBy().getUserId() : null;
        String userName    = expense.getSubmittedBy() != null ? expense.getSubmittedBy().getFullName() : null;

        return ExpenseResponseDto.builder()
                .expenseId(expense.getExpenseId())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .expenseDate(expense.getExpenseDate())
                .category(expense.getCategory())
                .projectId(projectId)
                .projectName(projectName)
                .submittedById(userId)
                .submittedByName(userName)
                .status(expense.getStatus())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
