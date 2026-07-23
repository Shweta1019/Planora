package com.planora.module.user.dto.request;

import lombok.Data;

@Data
public class UserUpdateRequestDto {

    private String firstName;
    private String lastName;
    private String phoneNo;
    private String department;
    private String designation;
    private String profileImage;
    private Long managerId;
}
