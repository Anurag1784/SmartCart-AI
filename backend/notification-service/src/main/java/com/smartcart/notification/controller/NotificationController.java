package com.smartcart.notification.controller;

import com.smartcart.notification.dto.NotificationRequest;
import com.smartcart.notification.dto.NotificationResponse;
import com.smartcart.notification.dto.OrderNotificationRequest;
import com.smartcart.notification.dto.PaymentNotificationRequest;
import com.smartcart.notification.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE GENERAL NOTIFICATION
    // =========================================================

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody NotificationRequest request) {

        NotificationResponse response =
                notificationService.createNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // CREATE ORDER NOTIFICATION
    // =========================================================

    @PostMapping("/order")
    public ResponseEntity<NotificationResponse> createOrderNotification(
            @Valid @RequestBody OrderNotificationRequest request) {

        NotificationResponse response =
                notificationService.createOrderNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // CREATE PAYMENT NOTIFICATION
    // =========================================================

    @PostMapping("/payment")
    public ResponseEntity<NotificationResponse> createPaymentNotification(
            @Valid @RequestBody PaymentNotificationRequest request) {

        NotificationResponse response =
                notificationService.createPaymentNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET USER NOTIFICATIONS
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @PathVariable Long userId,
            Authentication authentication) {

        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        /*
         * Allow the user to access only their own notifications.
         */
        if (!authenticatedUserId.equals(userId)) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(
                notificationService.getNotificationsByUserId(userId)
        );
    }

    // =========================================================
    // GET UNREAD USER NOTIFICATIONS
    // =========================================================

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>>
            getUnreadNotifications(
                    @PathVariable Long userId,
                    Authentication authentication) {

        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        /*
         * Allow the user to access only their own
         * unread notifications.
         */
        if (!authenticatedUserId.equals(userId)) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(
                notificationService
                        .getUnreadNotificationsByUserId(userId)
        );
    }

    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        /*
         * The notification service will verify that the
         * notification belongs to the authenticated user.
         *
         * For now, we pass the authenticated user ID
         * into the service.
         */
        Long authenticatedUserId =
                (Long) authentication.getPrincipal();

        return ResponseEntity.ok(
                notificationService.markAsRead(
                        notificationId,
                        authenticatedUserId
                )
        );
    }
}