package com.planora.module.task.repository;

import com.planora.common.enums.TaskStatus;
import com.planora.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectProjectId(Long projectId);
    List<Task> findByAssignedToUserId(Long userId);
    List<Task> findByStatus(TaskStatus status);
    long countByProjectProjectId(Long projectId);
    long countByProjectProjectIdAndStatus(Long projectId, TaskStatus status);
}
