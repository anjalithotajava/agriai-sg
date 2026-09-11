package com.agriai.controller;

import com.agriai.entity.User;
import com.agriai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository users;

    @GetMapping("/users")
    public List<AdminUserRes> list(){
        return users.findAll().stream().map(AdminUserRes::of).toList();
    }
    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserRes> role(@PathVariable Long id,@RequestBody RoleReq r){
        return users.findById(id).map(u->{u.setRole(r.role());
            return ResponseEntity.ok(AdminUserRes.of(users.save(u)));})
            .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/users/{id}/status")
    public ResponseEntity<AdminUserRes> status(@PathVariable Long id,@RequestBody StatusReq r){
        return users.findById(id).map(u->{u.setActive(r.active());
            return ResponseEntity.ok(AdminUserRes.of(users.save(u)));})
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        return users.findById(id).map(u->{users.delete(u);
            return ResponseEntity.noContent().<Void>build();})
            .orElse(ResponseEntity.notFound().build());
    }

    record RoleReq(User.Role role){}
    record StatusReq(boolean active){}
    record AdminUserRes(Long id,String name,String email,String role,Boolean active,String createdAt){
        static AdminUserRes of(User u){
            return new AdminUserRes(u.getId(),u.getName(),u.getEmail(),u.getRole().name(),
                    u.getActive(),u.getCreatedAt()!=null?u.getCreatedAt().toString():null);
        }
    }
}
