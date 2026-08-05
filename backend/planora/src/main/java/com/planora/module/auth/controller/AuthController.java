package com.planora.module.auth.controller;

import com.planora.common.enums.Role;
import com.planora.common.response.ApiResponse;
import com.planora.module.auth.dto.request.LoginRequestDto;
import com.planora.module.auth.dto.request.RegisterRequestDto;
import com.planora.module.auth.dto.response.JwtResponseDto;
import com.planora.module.user.entity.User;
import com.planora.module.user.repository.UserRepository;
import com.planora.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.planora.module.notification.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    /* ── LOGIN ─────────────────────────────────────────────── */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponseDto>> login(@Valid @RequestBody LoginRequestDto dto) {
        System.out.println("--- LOGIN ATTEMPT ---");
        System.out.println("Email: " + dto.getEmail());
        
        // 1. Manual Validation for custom error messages ("Wrong user" / "Wrong password")
        Optional<User> userOpt = userRepository.findByEmail(dto.getEmail());
        if (userOpt.isEmpty()) {
            System.out.println("Result: User not found in database.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Wrong user"));
        }

        User user = userOpt.get();
        System.out.println("User found: " + user.getEmail() + " | Role: " + user.getRole());
        
        // 2. Check if user is blocked / inactive first
        if (user.getStatus() != null && (user.getStatus().name().equals("INACTIVE") || user.getStatus().name().equals("BLOCKED"))) {
            System.out.println("Result: Account is blocked/inactive for user " + user.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("ACCOUNT_BLOCKED"));
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            System.out.println("Result: Password mismatch for user " + user.getEmail());
            
            // Track failed attempts and block if necessary (exclude ADMIN)
            if (user.getRole() != Role.ADMIN) {
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                
                if (user.getFailedLoginAttempts() >= 4) {
                    user.setStatus(com.planora.common.enums.UserStatus.BLOCKED);
                    userRepository.save(user);
                    System.out.println("Result: Account blocked due to too many failed attempts: " + user.getEmail());
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("ACCOUNT_BLOCKED"));
                }
                
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Wrong password. " + (4 - user.getFailedLoginAttempts()) + " attempt(s) remaining before account is blocked."));
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Wrong password"));
        }
        System.out.println("Password matched successfully.");

        // Reset failed login attempts on successful password match
        if (user.getFailedLoginAttempts() > 0) {
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }

        // 4. Standard Spring Security Authentication
        try {
            System.out.println("Attempting Spring Security Authentication...");
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );
            System.out.println("Spring Security Authentication passed.");
        } catch (Exception e) {
            System.out.println("Spring Security Authentication failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication failed: " + e.getMessage()));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(dto.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        System.out.println("Token generated successfully.");

        return ResponseEntity.ok(ApiResponse.success("Login successful", buildResponse(token, user)));
    }

    /* ── REGISTER (public — any role) ─────────────────────── */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<JwtResponseDto>> register(@Valid @RequestBody RegisterRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email is already registered"));
        }

        // Use the role from request, default to EMPLOYEE if not provided
        Role assignedRole = (dto.getRole() == null) ? Role.EMPLOYEE : dto.getRole();

        User newUser = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .phoneNo(dto.getPhoneNo())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .role(assignedRole)
                .build();

        userRepository.save(newUser);

        // notify all admins that a new user signed up
        String roleName = assignedRole.name().replace('_', ' ');
        String notifTitle = "New User Registered";
        String notifMsg   = newUser.getFullName() + " (" + roleName + ") has registered. Email: " + newUser.getEmail();
        notificationService.sendToAllAdmins(notifTitle, notifMsg, "NEW_USER");

        // Auto-login after register
        UserDetails userDetails = userDetailsService.loadUserByUsername(dto.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", buildResponse(token, newUser)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPassword = body.get("newPassword");
        
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }
        
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error("New password must be at least 6 characters"));
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    /* ── GET ME — returns current logged-in user profile ──── */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMe(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("userId",      user.getUserId());
        profile.put("firstName",   user.getFirstName());
        profile.put("lastName",    user.getLastName());
        profile.put("fullName",    user.getFullName());
        profile.put("email",       user.getEmail());
        profile.put("phoneNo",     user.getPhoneNo());
        profile.put("role",        user.getRole());
        profile.put("department",  user.getDepartment());
        profile.put("designation", user.getDesignation());
        profile.put("profileImage",user.getProfileImage());
        profile.put("status",      user.getStatus());
        profile.put("createdAt",   user.getCreatedAt());

        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }

    /* ── CHANGE PASSWORD (requires current password) ─────── */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> body) {

        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("New password must be at least 6 characters"));
        }

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password updated successfully"));
    }

    /* ── RESET PASSWORD (no current password — dashboard flow) */
    @PutMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> body) {

        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("New password must be at least 6 characters"));
        }

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    /* ── UPDATE OWN PROFILE ───────────────────────────────── */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (body.containsKey("firstName"))   user.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName"))    user.setLastName(body.get("lastName"));
        if (body.containsKey("phoneNo"))     user.setPhoneNo(body.get("phoneNo"));
        if (body.containsKey("phone"))       user.setPhoneNo(body.get("phone"));
        if (body.containsKey("department"))  user.setDepartment(body.get("department"));
        if (body.containsKey("designation")) user.setDesignation(body.get("designation"));
        if (body.containsKey("profileImage")) user.setProfileImage(body.get("profileImage"));

        userRepository.save(user);

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("userId",      user.getUserId());
        profile.put("firstName",   user.getFirstName());
        profile.put("lastName",    user.getLastName());
        profile.put("fullName",    user.getFullName());
        profile.put("email",       user.getEmail());
        profile.put("phoneNo",     user.getPhoneNo());
        profile.put("role",        user.getRole());
        profile.put("department",  user.getDepartment());
        profile.put("designation", user.getDesignation());
        profile.put("profileImage",user.getProfileImage());
        profile.put("status",      user.getStatus());
        profile.put("createdAt",   user.getCreatedAt());

        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }

    /* ── helper ─────────────────────────────────────────────── */
    private JwtResponseDto buildResponse(String token, User user) {
        return JwtResponseDto.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getUserId())
                .profileImage(user.getProfileImage())
                .build();
    }
}