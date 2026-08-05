package com.planora.module.task.repository;

import com.planora.common.enums.TaskStatus;
import com.planora.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectProjectId(Long projectId);
    List<Task> findByAssignedToUserId(Long userId);
    List<Task> findByStatus(TaskStatus status);
    long countByProjectProjectId(Long projectId);
    long countByProjectProjectIdAndStatus(Long projectId, TaskStatus status);

    // Find tasks past due date that are not yet completed or already overdue
    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status NOT IN :excludedStatuses AND t.assignedTo IS NOT NULL")
    List<Task> findTasksThatBecameOverdue(@Param("today") LocalDate today,
                                          @Param("excludedStatuses") List<TaskStatus> excludedStatuses);
}
