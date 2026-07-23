package com.planora.module.user.service;

import com.planora.module.user.dto.request.UserCreateRequestDto;
import com.planora.module.user.dto.request.UserStatusUpdateRequestDto;
import com.planora.module.user.dto.request.UserUpdateRequestDto;
import com.planora.module.user.dto.response.UserResponseDto;
import com.planora.module.user.dto.response.UserSummaryResponseDto;
import com.planora.module.user.entity.User;
import com.planora.module.user.exception.UserNotFoundException;
import com.planora.module.user.mapper.UserMapper;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDto createUser(UserCreateRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + dto.getEmail());
        }

        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .phoneNo(dto.getPhoneNo())
                .role(dto.getRole())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .managerId(dto.getManagerId())
                .build();

        return userMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    public UserResponseDto updateUser(Long userId, UserUpdateRequestDto dto) {
        User user = findOrThrow(userId);

        if (dto.getFirstName() != null)    user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null)     user.setLastName(dto.getLastName());
        if (dto.getPhoneNo() != null)      user.setPhoneNo(dto.getPhoneNo());
        if (dto.getDepartment() != null)   user.setDepartment(dto.getDepartment());
        if (dto.getDesignation() != null)  user.setDesignation(dto.getDesignation());
        if (dto.getProfileImage() != null) user.setProfileImage(dto.getProfileImage());
        if (dto.getManagerId() != null)    user.setManagerId(dto.getManagerId());

        return userMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    public UserResponseDto updateUserStatus(Long userId, UserStatusUpdateRequestDto dto) {
        User user = findOrThrow(userId);
        user.setStatus(dto.getStatus());
        return userMapper.toResponseDto(userRepository.save(user));
    }

    @Override
    public UserResponseDto getUserById(Long userId) {
        return userMapper.toResponseDto(findOrThrow(userId));
    }

    @Override
    public List<UserSummaryResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) throw new UserNotFoundException(userId);
        userRepository.deleteById(userId);
    }

    private User findOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }
}
