package com.planora.module.activitylog.service;

import com.planora.module.activitylog.dto.response.ActivityLogResponseDto;
import com.planora.module.activitylog.entity.ActivityLog;
import com.planora.module.activitylog.mapper.ActivityLogMapper;
import com.planora.module.activitylog.repository.ActivityLogRepository;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ActivityLogMapper activityLogMapper;

    // called internally when any significant action happens
    public void log(Long userId, String action, String description, String entityType, Long entityId) {
        ActivityLog.ActivityLogBuilder builder = ActivityLog.builder()
                .action(action)
                .description(description)
                .entityType(entityType)
                .entityId(entityId);

        userRepository.findById(userId).ifPresent(builder::user);
        activityLogRepository.save(builder.build());
    }

    public List<ActivityLogResponseDto> getRecentActivity() {
        return activityLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream().map(activityLogMapper::toResponseDto).collect(Collectors.toList());
    }

    public List<ActivityLogResponseDto> getByUser(Long userId) {
        return activityLogRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(activityLogMapper::toResponseDto).collect(Collectors.toList());
    }

    public List<ActivityLogResponseDto> getByEntity(String entityType, Long entityId) {
        return activityLogRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .stream().map(activityLogMapper::toResponseDto).collect(Collectors.toList());
    }
}
