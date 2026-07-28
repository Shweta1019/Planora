package com.planora.module.user.dto.request;

import com.planora.common.enums.Role;
import lombok.Data;

@Data
public class UserUpdateRequestDto {

    private String firstName;
    private String lastName;
    private String email;
    private String phoneNo;
    private Role role;
    private String department;
    private String designation;
    private String profileImage;
    private Long managerId;
}
