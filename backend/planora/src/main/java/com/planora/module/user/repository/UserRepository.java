package com.planora.module.user.repository;

import com.planora.common.enums.Role;
import com.planora.common.enums.UserStatus;
import com.planora.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByStatus(UserStatus status);
    List<User> findByRoleAndStatus(Role role, UserStatus status);
}
