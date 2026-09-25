package com.smartcart.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcart.auth.entity.PasswordResetToken;
import com.smartcart.auth.entity.User;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    /*
     * Find an unused OTP belonging to a specific user.
     *
     * Used during OTP verification.
     */
    Optional<PasswordResetToken> findByUserAndOtpAndUsedFalse(
            User user,
            String otp
    );

    /*
     * Find a verified but unused password reset request.
     *
     * Used when the user finally resets the password.
     */
    Optional<PasswordResetToken> findByUserAndVerifiedTrueAndUsedFalse(
            User user
    );

    /*
     * Delete any previous unused OTP for the user.
     *
     * This ensures that only the latest OTP remains valid.
     */
    void deleteByUserAndUsedFalse(User user);
}