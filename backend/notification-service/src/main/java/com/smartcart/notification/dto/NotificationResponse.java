package com.smartcart.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long notificationId;

    private Long userId;

    private String notificationType;

    private String title;

    private String message;

    private Boolean isRead;

    private LocalDateTime createdAt;
}