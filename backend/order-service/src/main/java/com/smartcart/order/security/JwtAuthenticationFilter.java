package com.smartcart.order.security;

import com.smartcart.order.jwt.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // =========================================================
        // GET AUTHORIZATION HEADER
        // =========================================================

        String authorizationHeader =
                request.getHeader("Authorization");

        // =========================================================
        // CHECK BEARER TOKEN
        // =========================================================

        /*
         * The frontend sends:
         *
         * Authorization: Bearer <JWT>
         *
         * We only process the request when the header
         * contains a Bearer token.
         */

        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            // Remove "Bearer " and keep only the JWT.
            String token =
                    authorizationHeader.substring(7);

            // =====================================================
            // VALIDATE TOKEN
            // =====================================================

            if (jwtUtil.isTokenValid(token)) {

                try {

                    // =================================================
                    // EXTRACT USER INFORMATION
                    // =================================================

                    /*
                     * Auth Service stores the database user ID
                     * inside the JWT as the "userId" claim.
                     */

                    Long userId =
                            jwtUtil.extractUserId(token);

                    /*
                     * Auth Service stores the role inside
                     * the JWT as the "role" claim.
                     */

                    String role =
                            jwtUtil.extractRole(token);

                    // =================================================
                    // CREATE AUTHORITY
                    // =================================================

                    /*
                     * Spring Security expects roles in the format:
                     *
                     * ROLE_CUSTOMER
                     * ROLE_SELLER
                     * ROLE_ADMIN
                     *
                     * Our JWT contains:
                     *
                     * CUSTOMER
                     * SELLER
                     * ADMIN
                     *
                     * Therefore we add the "ROLE_" prefix here.
                     */

                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority(
                                    "ROLE_" + role
                            );

                    // =================================================
                    // CREATE AUTHENTICATION
                    // =================================================

                    /*
                     * Principal = userId
                     *
                     * This is important because later the
                     * Seller Orders endpoint can obtain the
                     * authenticated seller's database ID directly.
                     *
                     * Authorities = user's role
                     */

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId,
                                    null,
                                    Collections.singletonList(authority)
                            );

                    // =================================================
                    // STORE AUTHENTICATION
                    // =================================================

                    /*
                     * Store the authenticated user inside
                     * Spring Security's SecurityContext.
                     */

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                } catch (Exception exception) {

                    /*
                     * If the required userId or role cannot be
                     * extracted, we do not create authentication.
                     *
                     * The request will then be treated as
                     * unauthenticated by Spring Security.
                     */

                    SecurityContextHolder
                            .clearContext();
                }
            }
        }

        // Continue processing the HTTP request.
        filterChain.doFilter(request, response);
    }
}