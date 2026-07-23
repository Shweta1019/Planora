package com.planora.module.user.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.user.dto.request.UserCreateRequestDto;
import com.planora.module.user.dto.request.UserStatusUpdateRequestDto;
import com.planora.module.user.dto.request.UserUpdateRequestDto;
import com.planora.module.user.dto.response.UserResponseDto;
import com.planora.module.user.dto.response.UserSummaryResponseDto;
import com.planora.module.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> createUser(@Valid @RequestBody UserCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created", userService.createUser(dto)));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(@PathVariable Long userId,
            @RequestBody UserUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.updateUser(userId, dto)));
    }

    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateStatus(@PathVariable Long userId,
            @Valid @RequestBody UserStatusUpdateRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", userService.updateUserStatus(userId, dto)));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User fetched", userService.getUserById(userId)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<List<UserSummaryResponseDto>>> getUserSummaries() {
        return ResponseEntity.ok(ApiResponse.success("User summaries fetched", userService.getAllUsers()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<List<UserSummaryResponseDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userService.getAllUsers()));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }
}
