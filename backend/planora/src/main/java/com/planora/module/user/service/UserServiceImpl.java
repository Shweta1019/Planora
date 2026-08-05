package com.planora.module.user.service;

import com.planora.module.user.dto.request.UserCreateRequestDto;
import com.planora.module.user.dto.request.UserStatusUpdateRequestDto;
import com.planora.module.user.dto.request.UserUpdateRequestDto;
import com.planora.module.user.dto.response.UserResponseDto;
import com.planora.module.user.dto.response.UserSummaryResponseDto;
import com.planora.module.user.dto.response.ManagerStatsResponseDto;
import com.planora.module.user.entity.User;
import com.planora.module.user.exception.UserNotFoundException;
import com.planora.module.user.mapper.UserMapper;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import com.planora.module.project.repository.ProjectRepository;
import com.planora.module.project.repository.ProjectMemberRepository;
import com.planora.module.project.entity.Project;
import com.planora.module.project.entity.ProjectMember;
import com.planora.common.enums.Role;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @PersistenceContext
    private EntityManager entityManager;

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
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + dto.getEmail());
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getPhoneNo() != null)      user.setPhoneNo(dto.getPhoneNo());
        if (dto.getRole() != null)         user.setRole(dto.getRole());
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
    @Transactional(readOnly = true)
    public List<UserSummaryResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManagerStatsResponseDto> getManagerStats() {
        List<User> managers = userRepository.findByRole(Role.PROJECT_MANAGER);
        
        List<ManagerStatsResponseDto> stats = new ArrayList<>();
        for (User manager : managers) {
            String managerName = manager.getFirstName() + " " + (manager.getLastName() == null ? "" : manager.getLastName());
            List<Project> projects = projectRepository.findByManagerUserId(manager.getUserId());
            Set<String> employeeNames = new HashSet<>();
            
            for (Project project : projects) {
                List<ProjectMember> members = projectMemberRepository.findByProjectProjectId(project.getProjectId());
                for (ProjectMember pm : members) {
                    if (!pm.getUser().getUserId().equals(manager.getUserId())) {
                        User employee = pm.getUser();
                        String empName = employee.getFirstName() + " " + (employee.getLastName() == null ? "" : employee.getLastName());
                        employeeNames.add(empName.trim());
                    }
                }
            }
            
            ManagerStatsResponseDto dto = new ManagerStatsResponseDto(
                managerName.trim(), 
                manager.getDepartment(), 
                (long) employeeNames.size(),
                new ArrayList<>(employeeNames),
                manager.getProfileImage()
            );
            stats.add(dto);
        }
        return stats;
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) throw new UserNotFoundException(userId);

        // Use native SQL to avoid JPQL entity-name mismatches and JPA cache issues.
        // Delete / nullify in child-first (leaf → parent) order to satisfy FK constraints.

        // Check if user is a manager of any projects — only block deletion for ACTIVE users.
        // Blocked / INACTIVE users should be deletable without reassignment.
        User targetUser = findOrThrow(userId);
        boolean isUserActive = targetUser.getStatus() == null
                || targetUser.getStatus().name().equalsIgnoreCase("ACTIVE");

        if (isUserActive) {
            long managedProjectsCount = ((Number) entityManager
                    .createNativeQuery("SELECT COUNT(*) FROM projects WHERE manager_id = :uid")
                    .setParameter("uid", userId).getSingleResult()).longValue();
            if (managedProjectsCount > 0) {
                throw new IllegalArgumentException("USER_IS_MANAGER");
            }
        }

        // 1. Notifications (user_id NOT NULL FK)
        entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 2. Activity logs (user_id nullable FK)
        entityManager.createNativeQuery("DELETE FROM activity_logs WHERE user_id = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 3. Comments written by this user (user_id nullable FK)
        entityManager.createNativeQuery("UPDATE comments SET user_id = NULL WHERE user_id = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 4. Tasks: nullify assigned_to and assigned_by
        entityManager.createNativeQuery("UPDATE tasks SET assigned_to = NULL WHERE assigned_to = :uid")
                .setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("UPDATE tasks SET assigned_by = NULL WHERE assigned_by = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 5. Project members (hard delete rows for this user)
        entityManager.createNativeQuery("DELETE FROM project_members WHERE user_id = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 6. Project manager constraint is checked above for active users. 
        // For inactive users, we must nullify the manager_id so they can be safely deleted.
        entityManager.createNativeQuery("UPDATE projects SET manager_id = NULL WHERE manager_id = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 7. Expenses submitted by this user
        entityManager.createNativeQuery("UPDATE expenses SET user_id = NULL WHERE user_id = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 8. Documents uploaded by this user
        entityManager.createNativeQuery("UPDATE documents SET uploaded_by = NULL WHERE uploaded_by = :uid")
                .setParameter("uid", userId).executeUpdate();

        // 9. Resources linked to this user (OneToOne)
        entityManager.createNativeQuery("UPDATE resources SET user_id = NULL WHERE user_id = :uid")
                .setParameter("uid", userId).executeUpdate();

        // Flush + clear the JPA session so Hibernate doesn't re-insert stale state
        entityManager.flush();
        entityManager.clear();

        // 10. Finally delete the user
        userRepository.deleteById(userId);
    }


    private User findOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }
}
