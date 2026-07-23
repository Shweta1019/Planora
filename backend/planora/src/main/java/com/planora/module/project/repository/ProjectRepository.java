package com.planora.module.project.repository;

import com.planora.common.enums.ProjectStatus;
import com.planora.module.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByManagerUserId(Long managerId);
    List<Project> findByStatus(ProjectStatus status);
    List<Project> findByProjectNameContainingIgnoreCase(String projectName);
    boolean existsByProjectNameIgnoreCase(String projectName);
    List<Project> findByEndDateBefore(LocalDate endDate);
    boolean existsByProjectId(Long projectId);
}
