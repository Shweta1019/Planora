package com.planora.module.task.service;

import com.planora.common.enums.TaskStatus;
import com.planora.module.notification.service.NotificationService;
import com.planora.module.task.entity.Task;
import com.planora.module.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs every day at 00:01 AM.
 * Marks tasks that are past due date (and not yet completed) as OVERDUE,
 * then sends a notification to the assigned employee.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TaskOverdueScheduler {

    private final TaskRepository      taskRepository;
    private final NotificationService notificationService;

    // Statuses that should NOT be flipped to OVERDUE
    private static final List<TaskStatus> EXCLUDE = List.of(
            TaskStatus.COMPLETED,
            TaskStatus.OVERDUE
    );

    @Scheduled(cron = "0 1 0 * * *")   // every day at 00:01
    @Transactional
    public void markOverdueTasks() {
        LocalDate today = LocalDate.now();
        List<Task> tasks = taskRepository.findTasksThatBecameOverdue(today, EXCLUDE);

        log.info("Overdue scheduler running — found {} task(s) to mark overdue", tasks.size());

        for (Task task : tasks) {
            task.setStatus(TaskStatus.OVERDUE);
            task.setCompletionPercentage(0);
            taskRepository.save(task);

            // Notify the assigned employee
            if (task.getAssignedTo() != null) {
                String taskName    = task.getTitle();
                String projectName = task.getProject() != null ? task.getProject().getProjectName() : "your project";
                notificationService.send(
                        task.getAssignedTo().getUserId(),
                        "Task Overdue ⚠️",
                        "Your task \"" + taskName + "\" in " + projectName +
                        " was not completed by its due date (" + task.getDueDate() + ") and is now marked as Overdue. Please complete it as soon as possible.",
                        "TASK_OVERDUE"
                );
            }
        }
    }
}
