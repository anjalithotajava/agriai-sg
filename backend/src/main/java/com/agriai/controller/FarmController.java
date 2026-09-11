package com.agriai.controller;

import com.agriai.entity.*;
import com.agriai.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {
    private final FarmRepository farms;
    private final UserRepository users;
    private Long uid(Authentication a){return (Long)a.getDetails();}

    @GetMapping
    public List<FarmRes> list(Authentication a){
        return farms.findByUserId(uid(a)).stream().map(FarmRes::of).toList();
    }
    @GetMapping("/{id}")
    public ResponseEntity<FarmRes> get(@PathVariable Long id,Authentication a){
        return farms.findByIdAndUserId(id,uid(a)).map(f->ResponseEntity.ok(FarmRes.of(f)))
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<FarmRes> create(@Valid @RequestBody FarmReq r,Authentication a){
        Farm f=Farm.builder().user(users.getReferenceById(uid(a)))
                .name(r.name()).location(r.location()).totalArea(r.totalArea()).build();
        return ResponseEntity.status(201).body(FarmRes.of(farms.save(f)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<FarmRes> update(@PathVariable Long id,@Valid @RequestBody FarmReq r,Authentication a){
        return farms.findByIdAndUserId(id,uid(a)).map(f->{
            f.setName(r.name());f.setLocation(r.location());f.setTotalArea(r.totalArea());
            return ResponseEntity.ok(FarmRes.of(farms.save(f)));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,Authentication a){
        return farms.findByIdAndUserId(id,uid(a)).map(f->{farms.delete(f);
            return ResponseEntity.noContent().<Void>build();}).orElse(ResponseEntity.notFound().build());
    }

    record FarmReq(@NotBlank String name,String location,BigDecimal totalArea){}
    record FarmRes(Long id,String name,String location,BigDecimal totalArea){
        static FarmRes of(Farm f){return new FarmRes(f.getId(),f.getName(),f.getLocation(),f.getTotalArea());}
    }
}
