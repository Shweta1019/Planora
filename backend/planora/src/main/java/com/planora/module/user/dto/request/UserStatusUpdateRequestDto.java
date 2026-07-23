package com.planora.module.user.dto.request;

import com.planora.common.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusUpdateRequestDto {

    @NotNull(message = "Status is required")
    private UserStatus status;
}
