package com.planora.module.user.service;

import com.planora.module.user.dto.request.UserCreateRequestDto;
import com.planora.module.user.dto.request.UserStatusUpdateRequestDto;
import com.planora.module.user.dto.request.UserUpdateRequestDto;
import com.planora.module.user.dto.response.UserResponseDto;
import com.planora.module.user.dto.response.UserSummaryResponseDto;
import com.planora.module.user.dto.response.ManagerStatsResponseDto;

import java.util.List;

public interface UserService {

    UserResponseDto createUser(UserCreateRequestDto requestDto);
    UserResponseDto updateUser(Long userId, UserUpdateRequestDto requestDto);
    UserResponseDto updateUserStatus(Long userId, UserStatusUpdateRequestDto requestDto);
    UserResponseDto getUserById(Long userId);
    List<UserSummaryResponseDto> getAllUsers();
    List<ManagerStatsResponseDto> getManagerStats();
    void deleteUser(Long userId);
}
