package com.smartcart.payment.config;

import com.smartcart.payment.jwt.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
                // Disable CSRF because this is a stateless REST API.
                .csrf(csrf -> csrf.disable())

                // Enable CORS using the CorsConfigurationSource bean below.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Do not create HTTP sessions.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Every Payment Service endpoint requires authentication.
                .authorizeHttpRequests(auth -> auth
                        .anyRequest()
                        .authenticated()
                )

                // Run our JWT filter before Spring's username/password filter.
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests from your Vite frontend.
        configuration.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:5173",
                        "http://localhost:5174"
                )
        );

        // Allow the HTTP methods used by the frontend.
        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Allow headers such as Authorization and Content-Type.
        configuration.setAllowedHeaders(
                Arrays.asList("*")
        );

        // Allow the browser to send credentials if required.
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // Apply this CORS configuration to every Payment Service endpoint.
        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}