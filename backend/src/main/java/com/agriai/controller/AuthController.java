package com.agriai.controller;

import com.agriai.entity.User;
import com.agriai.repository.UserRepository;
import com.agriai.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterReq req) {
        if (users.existsByEmail(req.email()))
            return ResponseEntity.badRequest().body(new Err("Email already registered"));
        User u = User.builder()
                .name(req.name()).email(req.email())
                .passwordHash(encoder.encode(req.password()))
                .role(req.role()!=null?req.role():User.Role.FARMER)
                .active(true).build();
        u = users.save(u);
        return ResponseEntity.status(201).body(new UserRes(u.getId(),u.getName(),u.getEmail(),u.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginReq req) {
        Optional<ResponseEntity> usersOpt=users.findByEmail(req.email())
                .filter(u->u.getActive()&&encoder.matches(req.password(),u.getPasswordHash()))
                .map(u->ResponseEntity.ok(new AuthRes(
                        jwt.generate(u.getEmail(),u.getRole().name(),u.getId()),
                        u.getId(),u.getName(),u.getEmail(),u.getRole().name())));
        return usersOpt.orElseGet(() -> ResponseEntity.status(401).body(new Err("Invalid email or password")));
    }

    record RegisterReq(@NotBlank String name,@Email @NotBlank String email,@Size(min=8)@NotBlank String password,User.Role role){}
    record LoginReq(@Email @NotBlank String email,@NotBlank String password){}
    record AuthRes(String token,Long id,String name,String email,String role){}
    record UserRes(Long id,String name,String email,String role){}
    record Err(String message){}
}
