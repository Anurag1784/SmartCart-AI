package com.smartcart.product.jwt;

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

        // =========================================================
        // READ AUTHORIZATION HEADER
        // =========================================================

        // Read the Authorization header sent by the frontend.
        String authorizationHeader =
                request.getHeader("Authorization");

        // If there is no Bearer token, continue the request normally.
        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // =========================================================
        // EXTRACT JWT
        // =========================================================

        // Remove "Bearer " and keep only the actual JWT.
        String token = authorizationHeader.substring(7);

        try {

            // =====================================================
            // EXTRACT EMAIL
            // =====================================================

            // Extract the email from the JWT subject.
            String email =
                    jwtService.extractEmail(token);


            // =====================================================
            // EXTRACT ROLE
            // =====================================================

            // Extract the user's role from the JWT.
            String role =
                    jwtService.extractRole(token);


            // =====================================================
            // EXTRACT USER ID
            // =====================================================

            /*
             * Extract the authenticated user's database ID
             * from the "userId" JWT claim.
             */
            Long userId =
                    jwtService.extractUserId(token);


            // =====================================================
            // VALIDATE JWT
            // =====================================================

            /*
             * Only create Authentication when:
             *
             * 1. Email exists.
             * 2. User ID exists.
             * 3. No authentication has already been created.
             * 4. JWT is valid.
             */
            if (email != null &&
                    userId != null &&
                    SecurityContextHolder.getContext()
                            .getAuthentication() == null &&
                    jwtService.isTokenValid(token, email)) {

                // =================================================
                // CREATE SPRING SECURITY AUTHENTICATION
                // =================================================

                /*
                 * The principal is now the authenticated user's ID.
                 *
                 * The role becomes:
                 *
                 * SELLER  → ROLE_SELLER
                 * CUSTOMER → ROLE_CUSTOMER
                 * ADMIN    → ROLE_ADMIN
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + role
                                        )
                                )
                        );


                // =================================================
                // STORE REQUEST DETAILS
                // =================================================

                // Store request-specific authentication details.
                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );


                // =================================================
                // STORE AUTHENTICATION
                // =================================================

                // Put the authenticated user into
                // Spring Security's SecurityContext.
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception exception) {

            /*
             * If the JWT is invalid or cannot be parsed,
             * remove any authentication from the security context.
             */
            SecurityContextHolder.clearContext();
        }

        // =========================================================
        // CONTINUE REQUEST
        // =========================================================

        // Continue processing the request.
        filterChain.doFilter(request, response);
    }
}