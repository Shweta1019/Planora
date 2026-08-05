package com.planora.module.user.mapper;

import com.planora.module.user.dto.response.UserResponseDto;
import com.planora.module.user.dto.response.UserSummaryResponseDto;
import com.planora.module.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponseDto toResponseDto(User user) {
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNo(user.getPhoneNo())
                .role(user.getRole())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .profileImage(user.getProfileImage())
                .status(user.getStatus())
                .managerId(user.getManagerId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserSummaryResponseDto toSummaryDto(User user) {
        return UserSummaryResponseDto.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
