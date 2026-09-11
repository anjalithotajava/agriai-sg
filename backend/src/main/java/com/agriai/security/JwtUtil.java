package com.agriai.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.expiration-ms}") private long expMs;

    private Key key() { return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }

    public String generate(String email, String role, Long userId) {
        return Jwts.builder()
                .subject(email)
                .claim("role",role)
                .claim("userId",userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expMs))
                .signWith(key()).compact();
    }

    public boolean validate(String token) {
        try { parse(token); return true; } catch(Exception e){ return false; }
    }

    public String email(String t)  { return parse(t).getSubject(); }
    public String role(String t)   { return parse(t).get("role",String.class); }
    public Long   userId(String t) { return parse(t).get("userId",Long.class); }

    private Claims parse(String t) {
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(t).getPayload();
    }
}
