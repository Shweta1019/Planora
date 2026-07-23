package com.planora.module.expense.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.expense.dto.request.ExpenseCreateRequestDto;
import com.planora.module.expense.dto.request.ExpenseStatusUpdateRequestDto;
import com.planora.module.expense.dto.response.BudgetSummaryResponseDto;
import com.planora.module.expense.dto.response.ExpenseResponseDto;
import com.planora.module.expense.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> createExpense(@Valid @RequestBody ExpenseCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created", expenseService.createExpense(dto)));
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> getById(@PathVariable Long expenseId) {
        return ResponseEntity.ok(ApiResponse.success("Expense fetched", expenseService.getExpenseById(expenseId)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDto>>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success("Expenses fetched", expenseService.getExpensesByProject(projectId)));
    }

    @GetMapping("/project/{projectId}/summary")
    public ResponseEntity<ApiResponse<BudgetSummaryResponseDto>> getBudgetSummary(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success("Budget summary fetched", expenseService.getBudgetSummary(projectId)));
    }

    @PatchMapping("/{expenseId}/status")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> updateStatus(
            @PathVariable Long expenseId,
            @RequestBody ExpenseStatusUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", expenseService.updateExpenseStatus(expenseId, dto)));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long expenseId) {
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted"));
    }
}
