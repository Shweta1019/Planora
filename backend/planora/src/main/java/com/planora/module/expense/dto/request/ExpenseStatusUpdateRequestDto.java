package com.planora.module.expense.dto.request;

import com.planora.common.enums.ExpenseStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExpenseStatusUpdateRequestDto {

    @NotNull(message = "Status is required")
    private ExpenseStatus status;
}
