package com.planora.module.notification.service;

import com.planora.module.notification.dto.response.NotificationResponseDto;
import com.planora.module.notification.entity.Notification;
import com.planora.module.notification.mapper.NotificationMapper;
import com.planora.module.notification.repository.NotificationRepository;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    // called internally from any service when an event occurs
    public void send(Long userId, String title, String message, String type) {
        userRepository.findById(userId).ifPresent(user -> {
            Notification n = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .build();
            notificationRepository.save(n);
        });
    }

    public List<NotificationResponseDto> getForUser(Long userId) {
        return notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(notificationMapper::toResponseDto).collect(Collectors.toList());
    }

    public List<NotificationResponseDto> getUnreadForUser(Long userId) {
        return notificationRepository.findByUserUserIdAndIsReadFalse(userId)
                .stream().map(notificationMapper::toResponseDto).collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUserUserIdAndIsReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void markRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
