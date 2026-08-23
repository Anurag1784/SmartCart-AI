package com.smartcart.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartcart.auth.dto.AuthResponse;
import com.smartcart.auth.dto.LoginRequest;
import com.smartcart.auth.dto.RegisterRequest;
import com.smartcart.auth.entity.Role;
import com.smartcart.auth.entity.User;
import com.smartcart.auth.exception.DuplicateEmailException;
import com.smartcart.auth.exception.InvalidCredentialsException;
import com.smartcart.auth.jwt.JwtService;
import com.smartcart.auth.repository.RoleRepository;
import com.smartcart.auth.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email is already registered");
        }

        Role customerRole = getDefaultCustomerRole();

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(customerRole);
        user.setAccountStatus("ACTIVE");

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        user.setPasswordHash(hashedPassword);

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or password"));

        if (!"ACTIVE".equalsIgnoreCase(user.getAccountStatus())) {
            throw new InvalidCredentialsException(
                    "Invalid email or password");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new InvalidCredentialsException(
                    "Invalid email or password");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().getRoleName()
        );

        return new AuthResponse(
                token,
                "Bearer",
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().getRoleName()
        );
    }

    private Role getDefaultCustomerRole() {

        return roleRepository.findById(1L)
                .orElseThrow(() ->
                        new RuntimeException(
                                "CUSTOMER role not found"));
    }
}