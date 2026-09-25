package com.smartcart.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$",
            message = "Enter a valid email address"
    )
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    // =========================================================
    // GETTER
    // =========================================================

    public String getEmail() {
        return email;
    }

    // =========================================================
    // SETTER
    // =========================================================

    public void setEmail(String email) {
        this.email = email;
    }
}