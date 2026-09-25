package com.smartcart.auth.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationTime;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationTime) {

        // Convert the configured JWT secret into a secure signing key.
        this.signingKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        // Store the configured token expiration time.
        this.expirationTime = expirationTime;
    }

    /*
     * Existing token-generation method.
     *
     * We are keeping this method for now so existing code does not
     * immediately break while we introduce the new userId-based method.
     *
     * The next step will update AuthService to use the new method below.
     */
    public String generateToken(String email, String role) {

        Date now = new Date();

        // Calculate when the JWT should expire.
        Date expiration = new Date(
                now.getTime() + expirationTime
        );

        return Jwts.builder()

                // The subject remains the user's email.
                .subject(email)

                // Store the user's role inside the JWT.
                .claim("role", role)

                // Store when the token was created.
                .issuedAt(now)

                // Store when the token expires.
                .expiration(expiration)

                // Digitally sign the JWT.
                .signWith(signingKey)

                // Convert the JWT into its final String form.
                .compact();
    }

    /*
     * NEW method for Seller/Admin authorization.
     *
     * userId is now included inside the JWT as a trusted claim.
     *
     * Example:
     *
     * userId = 10
     * email  = seller@smartcart.com
     * role   = SELLER
     *
     * The next AuthService change will call this method.
     */
    public String generateToken(
            Long userId,
            String email,
            String role) {

        Date now = new Date();

        // Calculate the token expiration time.
        Date expiration = new Date(
                now.getTime() + expirationTime
        );

        return Jwts.builder()

                // Keep email as the JWT subject.
                .subject(email)

                // NEW: Store the database user ID in the JWT.
                // Product Service will later use this to identify
                // the authenticated seller.
                .claim("userId", userId)

                // Keep the existing role claim.
                .claim("role", role)

                // Store token creation time.
                .issuedAt(now)

                // Store token expiration time.
                .expiration(expiration)

                // Sign the token using the existing secret.
                .signWith(signingKey)

                // Convert the JWT into a String.
                .compact();
    }

    public String extractEmail(String token) {

        // The email is stored as the JWT subject.
        return extractAllClaims(token)
                .getSubject();
    }

    public String extractRole(String token) {

        // Read the existing role claim from the JWT.
        return extractAllClaims(token)
                .get("role", String.class);
    }

    /*
     * NEW method.
     *
     * This allows services to retrieve the authenticated user's
     * database ID from the JWT.
     */
    public Long extractUserId(String token) {

        return extractAllClaims(token)
                .get("userId", Long.class);
    }

    public boolean isTokenValid(
            String token,
            String email) {

        // Extract the email stored inside the token.
        String tokenEmail = extractEmail(token);

        // The token is valid only when:
        // 1. The email matches.
        // 2. The token has not expired.
        return tokenEmail.equals(email)
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {

        // Compare JWT expiration time with the current time.
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims extractAllClaims(String token) {

        // Verify the JWT signature using our existing signing key.
        // If the token was modified or is invalid, parsing fails.
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}