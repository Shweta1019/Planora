package com.planora.module.expense.service;

import com.planora.module.expense.dto.request.ExpenseCreateRequestDto;
import com.planora.module.expense.dto.request.ExpenseStatusUpdateRequestDto;
import com.planora.module.expense.dto.response.BudgetSummaryResponseDto;
import com.planora.module.expense.dto.response.ExpenseResponseDto;
import com.planora.module.expense.entity.Expense;
import com.planora.module.expense.exception.ExpenseNotFoundException;
import com.planora.module.expense.mapper.ExpenseMapper;
import com.planora.module.expense.repository.ExpenseRepository;
import com.planora.module.project.entity.Project;
import com.planora.module.project.exception.ProjectNotFoundException;
import com.planora.module.project.repository.ProjectRepository;
import com.planora.module.user.entity.User;
import com.planora.module.user.exception.UserNotFoundException;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ExpenseMapper expenseMapper;

    @Override
    public ExpenseResponseDto createExpense(ExpenseCreateRequestDto dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException(dto.getProjectId()));

        User submittedBy = null;
        if (dto.getSubmittedById() != null) {
            submittedBy = userRepository.findById(dto.getSubmittedById())
                    .orElseThrow(() -> new UserNotFoundException(dto.getSubmittedById()));
        }

        Expense expense = Expense.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .expenseDate(dto.getExpenseDate() != null ? dto.getExpenseDate() : LocalDate.now())
                .category(dto.getCategory())
                .project(project)
                .submittedBy(submittedBy)
                .build();

        return expenseMapper.toResponseDto(expenseRepository.save(expense));
    }

    @Override
    public ExpenseResponseDto updateExpenseStatus(Long expenseId, ExpenseStatusUpdateRequestDto dto) {
        Expense expense = findOrThrow(expenseId);
        expense.setStatus(dto.getStatus());
        return expenseMapper.toResponseDto(expenseRepository.save(expense));
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponseDto getExpenseById(Long expenseId) {
        return expenseMapper.toResponseDto(findOrThrow(expenseId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponseDto> getExpensesByProject(Long projectId) {
        return expenseRepository.findByProjectProjectId(projectId).stream()
                .map(expenseMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteExpense(Long expenseId) {
        expenseRepository.delete(findOrThrow(expenseId));
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetSummaryResponseDto getBudgetSummary(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        BigDecimal approved = expenseRepository.sumApprovedAmountByProject(projectId);
        BigDecimal budget   = project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO;
        BigDecimal remaining = budget.subtract(approved);

        return BudgetSummaryResponseDto.builder()
                .projectId(projectId)
                .projectName(project.getProjectName())
                .totalBudget(budget)
                .approvedExpenses(approved)
                .remaining(remaining)
                .overBudget(remaining.compareTo(BigDecimal.ZERO) < 0)
                .build();
    }

    private Expense findOrThrow(Long expenseId) {
        return expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException(expenseId));
    }
}
