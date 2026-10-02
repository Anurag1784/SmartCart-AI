package com.smartcart.auth.security;

import java.util.List;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.smartcart.auth.jwt.JwtAuthenticationFilter;
import com.smartcart.auth.repository.UserRepository;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
	
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService(
            UserRepository userRepository) {

        return username -> {

            com.smartcart.auth.entity.User user =
                    userRepository.findByEmail(username)
                            .orElseThrow(() ->
                                    new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                            "User not found with email: " + username
                                    ));

            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPasswordHash())
                    .roles(user.getRole().getRoleName())
                    .build();
        };
    }

    // CORS configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend URLs
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:5174"
                )
        );

        // HTTP methods allowed from frontend
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Headers allowed from frontend
        configuration.setAllowedHeaders(List.of("*"));

        // Allow credentials such as cookies/authentication headers
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http

            // Enable CORS
            .cors(cors ->
                    cors.configurationSource(corsConfigurationSource())
            )

            // Disable CSRF because this is a REST API
            .csrf(csrf -> csrf.disable())

            // JWT-based authentication is stateless
            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests
                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                // Public authentication endpoints
                .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/api/auth/forgot-password",
                        "/api/auth/verify-otp",
                        "/api/auth/reset-password"
                ).permitAll()

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            // JWT filter
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}