package com.planora.module.user.dto.response;

import com.planora.common.enums.Role;
import com.planora.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDto {

    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNo;
    private Role role;
    private String department;
    private String designation;
    private String profileImage;
    private UserStatus status;
    private Long managerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
