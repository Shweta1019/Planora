package com.planora.module.notification.controller;

import com.planora.common.response.ApiResponse;
import com.planora.module.notification.dto.response.NotificationResponseDto;
import com.planora.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationResponseDto>>> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notificationService.getForUser(userId)));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponseDto>>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Unread fetched", notificationService.getUnreadForUser(userId)));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Count fetched", Map.of("unread", notificationService.countUnread(userId))));
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@PathVariable Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All marked as read"));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long notificationId) {
        notificationService.markRead(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Marked as read"));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
    }

    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<ApiResponse<Void>> deleteAllForUser(@PathVariable Long userId) {
        notificationService.deleteAllForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications deleted successfully"));
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResponse<Void>> deleteMultiple(@RequestBody List<Long> notificationIds) {
        notificationService.deleteMultiple(notificationIds);
        return ResponseEntity.ok(ApiResponse.success("Selected notifications deleted successfully"));
    }
}
