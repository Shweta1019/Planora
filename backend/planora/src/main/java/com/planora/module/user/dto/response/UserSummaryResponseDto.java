package com.planora.module.user.dto.response;

import com.planora.common.enums.Role;
import com.planora.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryResponseDto {

    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private UserStatus status;
    private String department;
    private String designation;
    private String profileImage;
    private java.time.LocalDateTime createdAt;
}
