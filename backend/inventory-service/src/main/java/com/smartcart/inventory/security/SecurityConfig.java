package com.smartcart.inventory.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import com.smartcart.inventory.jwt.JwtAuthenticationFilter;

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
                    "Inventory Service does not use username/password authentication"
            );
        };
    }

    /*
     * =========================================================
     * CORS CONFIGURATION
     * =========================================================
     *
     * SmartCart React frontend can run on:
     *
     * http://localhost:5173
     * http://localhost:5174
     *
     * Vite may use 5174 automatically when 5173
     * is already occupied.
     *
     * Inventory Service runs on:
     *
     * http://localhost:8082
     *
     * Because these are different origins, the browser
     * applies CORS security rules.
     *
     * We explicitly allow both frontend development ports.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * Allow both possible SmartCart React frontend ports.
         *
         * 5173 = normal Vite port
         * 5174 = fallback Vite port when 5173 is occupied
         */
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:5174"
                )
        );

        /*
         * Allow the HTTP methods used by the
         * Inventory Service.
         */
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        /*
         * Allow the headers sent by Axios/browser.
         *
         * Authorization is required because the frontend
         * sends the JWT as:
         *
         * Authorization: Bearer <token>
         */
        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        /*
         * We are not using browser cookies for authentication.
         *
         * Authentication is handled using the JWT
         * Authorization header.
         */
        configuration.setAllowCredentials(false);

        /*
         * Register this CORS configuration for every
         * Inventory Service endpoint.
         */
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // Disable CSRF because this is a REST API
            .csrf(csrf -> csrf.disable())

            /*
             * Enable CORS using the CorsConfigurationSource
             * defined above.
             *
             * This allows browser preflight requests to
             * pass before the actual API request.
             */
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))

            // JWT authentication is stateless
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Configure endpoint authorization
            .authorizeHttpRequests(auth -> auth

                /*
                 * Browser sends OPTIONS as a CORS
                 * preflight request.
                 *
                 * It must not require JWT authentication.
                 */
                .requestMatchers(
                    org.springframework.http.HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                /*
                 * All actual Inventory Service
                 * endpoints still require authentication.
                 */
                .anyRequest().authenticated()
            )

            /*
             * Return 401 when authentication is missing
             * or invalid.
             */
            .exceptionHandling(exception ->
                exception.authenticationEntryPoint(
                    new HttpStatusEntryPoint(
                        HttpStatus.UNAUTHORIZED
                    )
                )
            )

            /*
             * Process JWT before Spring's
             * username/password authentication filter.
             */
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}