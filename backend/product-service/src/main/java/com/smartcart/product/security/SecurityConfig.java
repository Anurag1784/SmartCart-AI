package com.smartcart.product.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.smartcart.product.jwt.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public UserDetailsService userDetailsService() {

        return username -> {

            throw new UsernameNotFoundException(
                    "Product Service does not use username/password authentication"
            );
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // Disable CSRF because this is a stateless REST API
            .csrf(csrf -> csrf.disable())

            // Enable CORS configuration defined below
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))

            // JWT-based authentication is stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // =================================================
                // CORS PREFLIGHT REQUEST
                // =================================================

                // Browser sends OPTIONS before certain cross-origin
                // requests. It must be allowed so CORS can complete.
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()
                
             // =================================================
             // ADMIN CATEGORY MANAGEMENT
             // =================================================

             /*
              * Only ADMIN users are allowed to create,
              * update, or delete categories.
              *
              * SELLER and CUSTOMER users can only view
              * categories through the public GET endpoints below.
              */

             // Create category
             .requestMatchers(
                 HttpMethod.POST,
                 "/api/categories"
             ).hasRole("ADMIN")

             // Update category
             .requestMatchers(
                 HttpMethod.PUT,
                 "/api/categories/**"
             ).hasRole("ADMIN")

             // Delete category
             .requestMatchers(
                 HttpMethod.DELETE,
                 "/api/categories/**"
             ).hasRole("ADMIN")


                // =================================================
                // PUBLIC PRODUCT APIs
                // =================================================

                // Customer-facing product browsing does not require
                // login. Users should be able to view the catalog.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products",
                    "/api/products/**",
                    "/api/categories",
                    "/api/categories/**"
                ).permitAll()


                // =================================================
                // PUBLIC PRODUCT IMAGES
                // =================================================

                /*
                 * Uploaded product images are public resources.
                 *
                 * Example:
                 *
                 * GET
                 * /uploads/products/abc123.jpg
                 *
                 * Customers should be able to see product images
                 * without sending a JWT.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/uploads/**"
                ).permitAll()


                // =================================================
                // EVERYTHING ELSE
                // =================================================

                // Product creation, updating, deleting and
                // every other protected endpoint requires JWT.
                .anyRequest().authenticated()
            )

            // Return 401 when authentication is missing/invalid
            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(
                    new HttpStatusEntryPoint(
                        HttpStatus.UNAUTHORIZED
                    )
                )
            )

            // Process JWT before Spring's username/password filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // Allow our SmartCart React frontend.
        configuration.setAllowedOrigins(
                List.of(
                    "http://localhost:5173",
                    "http://localhost:5174"
                )
        );

        // Allow the HTTP methods used by our frontend.
        configuration.setAllowedMethods(
                List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
                )
        );

        // Allow Authorization header so React can send the JWT.
        configuration.setAllowedHeaders(
                List.of(
                    "Authorization",
                    "Content-Type"
                )
        );

        // We are using the Authorization header for JWT,
        // not browser cookies.
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}