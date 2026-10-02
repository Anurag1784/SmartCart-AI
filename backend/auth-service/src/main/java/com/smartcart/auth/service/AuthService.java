package com.smartcart.auth.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcart.auth.dto.AdminUserResponse;
import com.smartcart.auth.dto.AuthResponse;
import com.smartcart.auth.dto.LoginRequest;
import com.smartcart.auth.dto.RegisterRequest;
import com.smartcart.auth.dto.UpdateAccountStatusRequest;
import com.smartcart.auth.entity.PasswordResetToken;
import com.smartcart.auth.entity.Role;
import com.smartcart.auth.entity.User;
import com.smartcart.auth.exception.DuplicateEmailException;
import com.smartcart.auth.exception.InvalidCredentialsException;
import com.smartcart.auth.jwt.JwtService;
import com.smartcart.auth.repository.PasswordResetTokenRepository;
import com.smartcart.auth.repository.RoleRepository;
import com.smartcart.auth.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JavaMailSender mailSender;

    /*
     * SecureRandom is used to generate the OTP.
     */
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailSender = mailSender;
    }

    // =========================================================
    // REGISTRATION
    // =========================================================

    public void register(RegisterRequest request) {

        // Check whether the email is already registered.
        if (userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateEmailException(
                    "Email is already registered");
        }

        /*
         * Get the role selected during registration.
         *
         * CUSTOMER -> CUSTOMER role
         * SELLER   -> SELLER role
         */
        String requestedRole = request.getRole().toUpperCase();

        /*
         * Find the selected role from the roles table.
         */
        Role selectedRole =
                roleRepository.findByRoleNameIgnoreCase(requestedRole);

        // Safety check in case the role does not exist.
        if (selectedRole == null) {

            throw new RuntimeException(
                    "Selected account type is not available");
        }

        // Create a new user.
        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        // Assign CUSTOMER or SELLER role.
        user.setRole(selectedRole);

        // Newly registered accounts are active.
        user.setAccountStatus("ACTIVE");

        /*
         * Never store the original password.
         *
         * Store only the BCrypt hashed password.
         */
        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        user.setPasswordHash(hashedPassword);

        // Save the user.
        userRepository.save(user);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(LoginRequest request) {

        // Find the user using email.
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or password"));

        // Only ACTIVE accounts can log in.
        if (!"ACTIVE".equalsIgnoreCase(
                user.getAccountStatus())) {

            throw new InvalidCredentialsException(
                    "Your account is not active");
        }

        // Compare entered password with stored BCrypt password.
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new InvalidCredentialsException(
                    "Invalid email or password");
        }

        /*
         * Generate JWT using the user's actual role.
         */
        String token = jwtService.generateToken(
                user.getUserId(),
                user.getEmail(),
                user.getRole().getRoleName());

        /*
         * Return the user's role to the frontend.
         */
        return new AuthResponse(
                token,
                "Bearer",
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getRoleName());
    }

    // =========================================================
    // FORGOT PASSWORD - SEND OTP
    // =========================================================

    @Transactional
    public void forgotPassword(String email) {

        /*
         * Find the user by email.
         *
         * If the email does not exist, simply return.
         *
         * This prevents revealing whether an email
         * is registered in SmartCart.
         */
        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return;
        }

        /*
         * Delete any previous unused OTP.
         *
         * This means only the newest OTP remains valid.
         */
        passwordResetTokenRepository
                .deleteByUserAndUsedFalse(user);

        /*
         * Generate a secure 6-digit OTP.
         */
        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000));

        /*
         * OTP will remain valid for 10 minutes.
         */
        LocalDateTime expiresAt =
                LocalDateTime.now().plusMinutes(10);

        /*
         * Create OTP entity.
         */
        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setOtp(otp);
        resetToken.setUser(user);
        resetToken.setExpiresAt(expiresAt);

        /*
         * OTP has not been consumed yet.
         */
        resetToken.setUsed(false);

        /*
         * OTP has not been verified yet.
         */
        resetToken.setVerified(false);

        /*
         * Save OTP in the database.
         */
        passwordResetTokenRepository.save(resetToken);

        /*
         * Create email message.
         */
        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(user.getEmail());

        message.setSubject(
                "SmartCart AI - Password Reset Verification Code");

        message.setText(
                "Hello " + user.getFirstName() + ",\n\n"
                + "We received a request to reset your "
                + "SmartCart AI password.\n\n"
                + "Your verification code is:\n\n"
                + otp + "\n\n"
                + "This verification code will expire in "
                + "10 minutes.\n\n"
                + "If you did not request a password reset, "
                + "you can safely ignore this email.\n\n"
                + "Regards,\n"
                + "SmartCart AI Team");

        /*
         * Send OTP email.
         */
        mailSender.send(message);
    }

    // =========================================================
    // VERIFY OTP
    // =========================================================

    @Transactional
    public void verifyOtp(String email, String otp) {

        /*
         * Find the user using the email.
         */
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or verification code"));

        /*
         * Find an OTP that:
         *
         * 1. Belongs to this user.
         * 2. Matches the entered OTP.
         * 3. Has not already been used.
         */
        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByUserAndOtpAndUsedFalse(
                                user,
                                otp)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Invalid email or verification code"));

        /*
         * Check whether the OTP has expired.
         */
        if (LocalDateTime.now()
                .isAfter(resetToken.getExpiresAt())) {

            throw new InvalidCredentialsException(
                    "Verification code has expired");
        }

        /*
         * Mark the OTP as successfully verified.
         *
         * IMPORTANT:
         * We do NOT mark it as used here.
         *
         * used = false
         * verified = true
         *
         * This allows the next reset-password step
         * to use the verified OTP authorization.
         */
        resetToken.setVerified(true);

        passwordResetTokenRepository.save(resetToken);
    }
    
    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Transactional
    public void resetPassword(String email, String newPassword) {

        /*
         * Find the user using the email.
         */
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid password reset request"));

        /*
         * Find a reset request that:
         *
         * 1. Belongs to this user.
         * 2. Has successfully verified the OTP.
         * 3. Has not already been used.
         */
        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByUserAndVerifiedTrueAndUsedFalse(user)
                        .orElseThrow(() ->
                                new InvalidCredentialsException(
                                        "Please verify the OTP before resetting your password"));

        /*
         * Check whether the OTP verification has expired.
         */
        if (LocalDateTime.now()
                .isAfter(resetToken.getExpiresAt())) {

            throw new InvalidCredentialsException(
                    "Password reset request has expired");
        }

        /*
         * Hash the new password using BCrypt.
         *
         * We never store the plain-text password.
         */
        String hashedPassword =
                passwordEncoder.encode(newPassword);

        /*
         * Update the user's password.
         */
        user.setPasswordHash(hashedPassword);

        userRepository.save(user);

        /*
         * Mark the reset request as used.
         *
         * This prevents the same verified OTP
         * from being used again.
         */
        resetToken.setUsed(true);

        passwordResetTokenRepository.save(resetToken);
    }
    
    // =========================================================
    // ADMIN - USER COUNT BY ROLE
    // =========================================================

    public long countUsersByRole(String roleName) {

        return userRepository.countByRole_RoleNameIgnoreCase(roleName);
    }
    
 // =========================================================
 // ADMIN - GET USERS BY ROLE
 // =========================================================

 public List<AdminUserResponse> getUsersByRole(String roleName) {

     return userRepository
             .findByRole_RoleNameIgnoreCase(roleName)
             .stream()
             .map(user -> new AdminUserResponse(
                     user.getUserId(),
                     user.getFirstName(),
                     user.getLastName(),
                     user.getEmail(),
                     user.getPhone(),
                     user.getRole().getRoleName(),
                     user.getAccountStatus(),
                     user.getCreatedAt()
             ))
             .toList();
    }
     //=========================================================
     //ADMIN - UPDATE USER ACCOUNT STATUS
    //=========================================================

   @Transactional
   public String updateAccountStatus(
        Long userId,
        UpdateAccountStatusRequest request) {

     // Find the user using the user ID.
     User user = userRepository.findById(userId)
           .orElseThrow(() ->
                   new RuntimeException(
                           "User not found with ID: " + userId));

        // Get the requested status.
     String newStatus = request.getStatus().toUpperCase();

    // Update the user's account status.
    user.setAccountStatus(newStatus);

    // Save the updated user.
    userRepository.save(user);

    // Return the new status.
    return newStatus;
  }
}