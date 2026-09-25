package com.smartcart.product.jwt;

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

        // Convert the configured JWT secret into the signing key.
        // Product Service uses this key to verify that the JWT
        // was created by our Auth Service and was not modified.
        this.signingKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        // Store the configured JWT expiration time.
        this.expirationTime = expirationTime;
    }

    public String extractEmail(String token) {

        // Email is stored as the JWT subject.
        return extractAllClaims(token)
                .getSubject();
    }

    public String extractRole(String token) {

        // Read the existing "role" claim from the JWT.
        return extractAllClaims(token)
                .get("role", String.class);
    }

    /*
     * NEW METHOD
     *
     * Auth Service now puts the user's database ID into the JWT
     * using the "userId" claim.
     *
     * Product Service can use this method to retrieve that ID.
     *
     * Example:
     *
     * JWT
     * ├── userId = 5
     * ├── email = seller@example.com
     * └── role = SELLER
     */
    public Long extractUserId(String token) {

        // Read the "userId" claim from the JWT.
        return extractAllClaims(token)
                .get("userId", Long.class);
    }

    public boolean isTokenValid(
            String token,
            String email) {

        // Extract the email stored inside the JWT.
        String tokenEmail = extractEmail(token);

        // The token is valid when the email matches
        // and the token has not expired.
        return tokenEmail.equals(email)
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {

        // Get the JWT expiration date and compare it
        // with the current date/time.
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims extractAllClaims(String token) {

        // Parse and verify the JWT using the same secret key
        // that Auth Service uses to sign the token.
        //
        // If somebody modifies the JWT, signature verification
        // will fail and an exception will be thrown.
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}