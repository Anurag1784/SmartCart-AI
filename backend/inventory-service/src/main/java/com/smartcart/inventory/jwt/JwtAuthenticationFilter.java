package com.smartcart.inventory.jwt;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println(
                "=================================================="
        );

        System.out.println(
                "JWT FILTER EXECUTED"
        );

        System.out.println(
                "Request URI: " + request.getRequestURI()
        );

        String authorizationHeader =
                request.getHeader("Authorization");

        // =====================================================
        // CHECK AUTHORIZATION HEADER
        // =====================================================

        if (authorizationHeader == null) {

            System.out.println(
                    "JWT DEBUG: Authorization header is NULL"
            );

            filterChain.doFilter(request, response);
            return;
        }

        System.out.println(
                "JWT DEBUG: Authorization header received"
        );

        if (!authorizationHeader.startsWith("Bearer ")) {

            System.out.println(
                    "JWT DEBUG: Authorization header does NOT start with Bearer"
            );

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authorizationHeader.substring(7);

        System.out.println(
                "JWT DEBUG: Bearer token received"
        );

        try {

            // =================================================
            // EXTRACT EMAIL
            // =================================================

            String email =
                    jwtService.extractEmail(token);

            System.out.println(
                    "JWT DEBUG: Extracted email = " + email
            );

            // =================================================
            // EXTRACT ROLE
            // =================================================

            String role =
                    jwtService.extractRole(token);

            System.out.println(
                    "JWT DEBUG: Extracted role = " + role
            );

            // =================================================
            // CHECK CURRENT AUTHENTICATION
            // =================================================

            boolean alreadyAuthenticated =
                    SecurityContextHolder.getContext()
                            .getAuthentication() != null;

            System.out.println(
                    "JWT DEBUG: Already authenticated = "
                            + alreadyAuthenticated
            );

            // =================================================
            // VALIDATE TOKEN
            // =================================================

            boolean tokenValid =
                    jwtService.isTokenValid(
                            token,
                            email
                    );

            System.out.println(
                    "JWT DEBUG: Token valid = " + tokenValid
            );

            // =================================================
            // CREATE AUTHENTICATION
            // =================================================

            if (email != null &&
                    !alreadyAuthenticated &&
                    tokenValid) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + role
                                        )
                                )
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "JWT DEBUG: Authentication SUCCESS"
                );

                System.out.println(
                        "JWT DEBUG: Principal = " + email
                );

                System.out.println(
                        "JWT DEBUG: Role = " + role
                );

            } else {

                System.out.println(
                        "JWT DEBUG: Authentication NOT CREATED"
                );

                System.out.println(
                        "JWT DEBUG: email != null = "
                                + (email != null)
                );

                System.out.println(
                        "JWT DEBUG: alreadyAuthenticated = "
                                + alreadyAuthenticated
                );

                System.out.println(
                        "JWT DEBUG: tokenValid = "
                                + tokenValid
                );
            }

        } catch (Exception exception) {

            System.out.println(
                    "JWT DEBUG: EXCEPTION OCCURRED"
            );

            exception.printStackTrace();

            SecurityContextHolder.clearContext();
        }

        System.out.println(
                "JWT DEBUG: Passing request to next filter"
        );

        filterChain.doFilter(request, response);

        System.out.println(
                "JWT DEBUG: Response status = "
                        + response.getStatus()
        );

        System.out.println(
                "=================================================="
        );
    }
}