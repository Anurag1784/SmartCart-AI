package com.smartcart.auth.controller;

import java.util.List;


import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import com.smartcart.auth.dto.UpdateAccountStatusRequest;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcart.auth.dto.AdminUserResponse;
import com.smartcart.auth.dto.AuthResponse;
import com.smartcart.auth.dto.CustomerSummaryResponse;
import com.smartcart.auth.dto.ForgotPasswordRequest;
import com.smartcart.auth.dto.LoginRequest;
import com.smartcart.auth.dto.RegisterRequest;
import com.smartcart.auth.dto.ResetPasswordRequest;
import com.smartcart.auth.dto.VerifyOtpRequest;
import com.smartcart.auth.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {

        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request.getEmail());

        return ResponseEntity.ok(
                "If an account exists for this email, a verification code has been sent.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        authService.verifyOtp(
                request.getEmail(),
                request.getOtp());

        return ResponseEntity.ok(
                "OTP verified successfully. You can now reset your password.");
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(
                request.getEmail(),
                request.getNewPassword());

        return ResponseEntity.ok(
                "Password reset successfully. You can now login with your new password.");
    }
    
      // =========================================================
      // CUSTOMER - GET CUSTOMER SUMMARY
      // =========================================================

       @GetMapping("/users/{userId}/summary")
       public ResponseEntity<CustomerSummaryResponse> getCustomerSummary(
             @PathVariable Long userId) {

             CustomerSummaryResponse response =
                 authService.getCustomerSummary(userId);

         return ResponseEntity.ok(response);
        }
    
    
    // =========================================================
    // ADMIN - USER COUNT
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/user-count")
    public ResponseEntity<Long> countUsersByRole(
            @RequestParam String role) {

        long count = authService.countUsersByRole(role);

        return ResponseEntity.ok(count);
    }
     // =========================================================
     // ADMIN - GET USERS BY ROLE
     // =========================================================

     @PreAuthorize("hasRole('ADMIN')")
     @GetMapping("/admin/users")
     public ResponseEntity<List<AdminUserResponse>> getUsersByRole(
             @RequestParam String role) {

         List<AdminUserResponse> users =
                 authService.getUsersByRole(role);

         return ResponseEntity.ok(users);
     }
     
     
  // =========================================================
  // ADMIN - UPDATE USER ACCOUNT STATUS
  // =========================================================

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/admin/users/{userId}/status")
  public ResponseEntity<String> updateAccountStatus(
          @PathVariable Long userId,
          @Valid @RequestBody UpdateAccountStatusRequest request) {

      String updatedStatus =
              authService.updateAccountStatus(userId, request);

      return ResponseEntity.ok(
              "User account status updated to " + updatedStatus);
  }
}