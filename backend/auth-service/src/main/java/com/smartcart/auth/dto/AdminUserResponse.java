package com.smartcart.auth.dto;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String accountStatus;
    private LocalDateTime createdAt;

    public AdminUserResponse(
            Long userId,
            String firstName,
            String lastName,
            String email,
            String phone,
            String role,
            String accountStatus,
            LocalDateTime createdAt) {

        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.accountStatus = accountStatus;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}