package com.planora.module.expense.service;

import com.planora.module.expense.dto.request.ExpenseCreateRequestDto;
import com.planora.module.expense.dto.request.ExpenseStatusUpdateRequestDto;
import com.planora.module.expense.dto.response.BudgetSummaryResponseDto;
import com.planora.module.expense.dto.response.ExpenseResponseDto;

import java.util.List;

public interface ExpenseService {

    ExpenseResponseDto createExpense(ExpenseCreateRequestDto requestDto);
    ExpenseResponseDto updateExpenseStatus(Long expenseId, ExpenseStatusUpdateRequestDto requestDto);
    ExpenseResponseDto getExpenseById(Long expenseId);
    List<ExpenseResponseDto> getExpensesByProject(Long projectId);
    void deleteExpense(Long expenseId);
    BudgetSummaryResponseDto getBudgetSummary(Long projectId);
}
