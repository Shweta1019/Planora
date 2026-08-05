package com.planora.module.project.repository;

import com.planora.module.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProjectProjectId(Long projectId);
    List<ProjectMember> findByUserUserId(Long userId);
    java.util.Optional<ProjectMember> findByProjectProjectIdAndUserUserId(Long projectId, Long userId);
    boolean existsByProjectProjectIdAndUserUserId(Long projectId, Long userId);

    @Transactional
    void deleteByProjectProjectIdAndUserUserId(Long projectId, Long userId);

    long countByProjectProjectId(Long projectId);
}
