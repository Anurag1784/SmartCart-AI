package com.smartcart.notification.controller;

import com.smartcart.notification.dto.NotificationRequest;
import com.smartcart.notification.dto.NotificationResponse;
import com.smartcart.notification.dto.OrderNotificationRequest;
import com.smartcart.notification.dto.PaymentNotificationRequest;
import com.smartcart.notification.service.NotificationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {

        this.notificationService = notificationService;

    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody NotificationRequest request) {

        NotificationResponse response =
                notificationService.createNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

    @PostMapping("/order")
    public ResponseEntity<NotificationResponse> createOrderNotification(
            @Valid @RequestBody OrderNotificationRequest request) {

        NotificationResponse response =
                notificationService.createOrderNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

    @PostMapping("/payment")
    public ResponseEntity<NotificationResponse> createPaymentNotification(
            @Valid @RequestBody PaymentNotificationRequest request) {

        NotificationResponse response =
                notificationService.createPaymentNotification(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getNotificationsByUserId(userId)
        );

    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotificationsByUserId(userId)
        );

    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId)
        );

    }

}