package com.smartcart.notification.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

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

        // Read the Authorization header sent by the frontend.
        final String authHeader =
                request.getHeader("Authorization");

        // If there is no Bearer token, continue the request normally.
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Remove "Bearer " and keep only the JWT.
        final String token = authHeader.substring(7);

        try {

            // Extract the user's email from the JWT subject.
            String email =
                    jwtService.extractUsername(token);

            // Extract the user's role from the JWT.
            String role =
                    jwtService.extractRole(token);

            // Extract the authenticated user's database ID
            // from the "userId" JWT claim.
            Long userId =
                    jwtService.extractUserId(token);

            /*
             * Create authentication only when:
             *
             * 1. Email exists.
             * 2. User ID exists.
             * 3. No authentication already exists.
             * 4. JWT is valid.
             */
            if (email != null &&
                    userId != null &&
                    SecurityContextHolder.getContext()
                            .getAuthentication() == null &&
                    jwtService.isTokenValid(token)) {

                /*
                 * Store the authenticated user's ID as the
                 * Spring Security principal.
                 *
                 * Later the Notification Controller can retrieve
                 * this userId from SecurityContextHolder.
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                role != null
                                        ? List.of(
                                                new SimpleGrantedAuthority(
                                                        "ROLE_" + role
                                                )
                                        )
                                        : List.of()
                        );

                // Store request-specific authentication details.
                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // Store authentication in Spring Security context.
                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception exception) {

            // Clear authentication if the JWT is invalid.
            SecurityContextHolder.clearContext();
        }

        // Continue processing the request.
        filterChain.doFilter(request, response);
    }
}