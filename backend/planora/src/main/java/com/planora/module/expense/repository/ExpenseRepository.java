package com.planora.module.expense.repository;

import com.planora.common.enums.ExpenseStatus;
import com.planora.module.expense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByProjectProjectId(Long projectId);
    List<Expense> findBySubmittedByUserId(Long userId);
    List<Expense> findByStatus(ExpenseStatus status);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.project.projectId = :projectId")
    BigDecimal sumApprovedAmountByProject(@Param("projectId") Long projectId);
}
