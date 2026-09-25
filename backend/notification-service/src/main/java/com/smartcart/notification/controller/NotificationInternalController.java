package com.smartcart.notification.controller;

import com.smartcart.notification.dto.InternalOrderNotificationRequest;
import com.smartcart.notification.dto.NotificationResponse;
import com.smartcart.notification.entity.Notification;
import com.smartcart.notification.repository.NotificationRepository;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/notifications")
public class NotificationInternalController {

    private final NotificationRepository notificationRepository;

    @Value("${notification.internal.secret}")
    private String internalSecret;

    public NotificationInternalController(
            NotificationRepository notificationRepository) {

        this.notificationRepository =
                notificationRepository;
    }

    // =========================================================
    // CREATE SELLER ORDER NOTIFICATION
    // =========================================================

    @PostMapping("/order")
    public ResponseEntity<NotificationResponse>
            createSellerOrderNotification(

                    @RequestHeader(
                            "X-Internal-Service-Secret"
                    )
                    String providedSecret,

                    @Valid @RequestBody
                    InternalOrderNotificationRequest request) {

        // =====================================================
        // VERIFY INTERNAL SERVICE SECRET
        // =====================================================

        if (!internalSecret.equals(providedSecret)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        // =====================================================
        // CREATE NOTIFICATION
        // =====================================================

        Notification notification =
                Notification.builder()
                        .userId(request.getSellerId())
                        .notificationType("ORDER")
                        .title("Order Status Updated")
                        .message(
                                "Your order #"
                                        + request.getOrderId()
                                        + " status is "
                                        + request.getOrderStatus()
                                        + "."
                        )
                        .build();

        Notification savedNotification =
                notificationRepository.save(
                        notification
                );

        // =====================================================
        // MAP ENTITY → RESPONSE
        // =====================================================

        NotificationResponse response =
                new NotificationResponse(
                        savedNotification.getNotificationId(),
                        savedNotification.getUserId(),
                        savedNotification.getNotificationType(),
                        savedNotification.getTitle(),
                        savedNotification.getMessage(),
                        savedNotification.getIsRead(),
                        savedNotification.getCreatedAt()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}