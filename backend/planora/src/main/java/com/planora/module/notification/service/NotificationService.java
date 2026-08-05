package com.planora.module.notification.service;

import com.planora.common.enums.Role;
import com.planora.module.notification.dto.response.NotificationResponseDto;
import com.planora.module.notification.entity.Notification;
import com.planora.module.notification.mapper.NotificationMapper;
import com.planora.module.notification.repository.NotificationRepository;
import com.planora.module.user.entity.User;
import com.planora.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final NotificationMapper     notificationMapper;

    // ── Internal helper ── send a notification to one user
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

    // ── Internal helper ── send same notification to every admin
    public void sendToAllAdmins(String title, String message, String type) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            Notification n = Notification.builder()
                    .user(admin)
                    .title(title)
                    .message(message)
                    .type(type)
                    .build();
            notificationRepository.save(n);
        }
    }

    // ── Fetch ─────────────────────────────────────────────────

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

    // ── Mark read ──────────────────────────────────────────────

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

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteAllForUser(Long userId) {
        List<Notification> notifs = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifs);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteMultiple(List<Long> notificationIds) {
        notificationRepository.deleteAllById(notificationIds);
    }
}
