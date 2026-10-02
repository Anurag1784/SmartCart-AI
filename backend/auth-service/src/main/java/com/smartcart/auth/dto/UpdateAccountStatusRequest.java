package com.smartcart.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateAccountStatusRequest {

    @NotBlank(message = "Account status is required")
    @Pattern(
        regexp = "ACTIVE|INACTIVE",
        message = "Account status must be ACTIVE or INACTIVE"
    )
    private String status;

    // =========================================================
    // GETTER AND SETTER
    // =========================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}