package com.smartcart.notification.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    /*
     * Extract the email from the JWT subject.
     */
    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    /*
     * Extract the user's role from the JWT.
     */
    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }

    /*
     * NEW:
     * Extract the authenticated user's database ID
     * from the "userId" JWT claim.
     *
     * Auth Service creates the JWT with:
     *
     * userId
     * email
     * role
     */
    public Long extractUserId(String token) {

        return extractAllClaims(token)
                .get("userId", Long.class);
    }

    /*
     * Validate the JWT signature and structure.
     */
    public boolean isTokenValid(String token) {

        try {

            extractAllClaims(token);

            return true;

        } catch (Exception exception) {

            return false;
        }
    }

    /*
     * Generic method for extracting a claim.
     */
    private <T> T extractClaim(
            String token,
            java.util.function.Function<Claims, T> claimsResolver) {

        Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    /*
     * Parse the JWT and verify its signature using
     * the same secret used by Auth Service.
     */
    private Claims extractAllClaims(String token) {

        SecretKey key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}