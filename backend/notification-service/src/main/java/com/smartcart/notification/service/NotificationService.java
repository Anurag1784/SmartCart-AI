package com.smartcart.notification.service;

import com.smartcart.notification.dto.NotificationRequest;
import com.smartcart.notification.dto.NotificationResponse;
import com.smartcart.notification.dto.OrderNotificationRequest;
import com.smartcart.notification.dto.PaymentNotificationRequest;
import com.smartcart.notification.entity.Notification;
import com.smartcart.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {

        this.notificationRepository = notificationRepository;

    }

    public NotificationResponse createNotification(NotificationRequest request) {

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .notificationType(request.getNotificationType())
                .title(request.getTitle())
                .message(request.getMessage())
                .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        return mapToResponse(savedNotification);
    }

    public NotificationResponse createOrderNotification(
            OrderNotificationRequest request) {

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .notificationType("ORDER")
                .title("Order Status Updated")
                .message(
                        "Your order #" + request.getOrderId()
                                + " status is "
                                + request.getOrderStatus()
                                + "."
                )
                .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        return mapToResponse(savedNotification);
    }

    public NotificationResponse createPaymentNotification(
            PaymentNotificationRequest request) {

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .notificationType("PAYMENT")
                .title("Payment Status Updated")
                .message(
                        "Your payment for order #"
                                + request.getOrderId()
                                + " is "
                                + request.getPaymentStatus()
                                + "."
                )
                .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        return mapToResponse(savedNotification);
    }

    public List<NotificationResponse> getNotificationsByUserId(Long userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<NotificationResponse> getUnreadNotificationsByUserId(
            Long userId) {

        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public NotificationResponse markAsRead(Long notificationId) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Notification not found with ID: "
                                        + notificationId
                        )
                );

        notification.setIsRead(true);

        Notification updatedNotification =
                notificationRepository.save(notification);

        return mapToResponse(updatedNotification);
    }

    private NotificationResponse mapToResponse(
            Notification notification) {

        return new NotificationResponse(
                notification.getNotificationId(),
                notification.getUserId(),
                notification.getNotificationType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}