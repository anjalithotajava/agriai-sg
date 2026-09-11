package com.agriai.controller;

import com.agriai.entity.GrowingUnit;
import com.agriai.repository.FarmRepository;
import com.agriai.repository.GrowingUnitRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/farms/{farmId}/growing-units") @RequiredArgsConstructor
public class GrowingUnitController {
    private final GrowingUnitRepository units; private final FarmRepository farms;
    private Long uid(Authentication a){return (Long)a.getDetails();}

    @GetMapping("/{unitId}")
    public ResponseEntity<GrowingUnit> listUnits(@PathVariable Long unitId, Authentication a){
        return ResponseEntity.ok(units.findById(unitId).get());
    }
    @GetMapping()
    public ResponseEntity<List<UnitRes>> list(@PathVariable Long farmId, Authentication a){
        return farms.findByIdAndUserId(farmId,uid(a)).map(f->
                        ResponseEntity.ok(units.findByFarmId(farmId).stream().map(UnitRes::of).toList()))
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<UnitRes> create(@PathVariable Long farmId, @Valid @RequestBody UnitReq r, Authentication a){
        return farms.findByIdAndUserId(farmId,uid(a)).map(f->{
            GrowingUnit u=GrowingUnit.builder().farm(f).name(r.name()).areaSqm(r.areaSqm()).growingMethod(r.growingMethod()).build();
            return ResponseEntity.status(201).body(UnitRes.of(units.save(u)));
        }).orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{unitId}")
    public ResponseEntity<UnitRes> update(@PathVariable Long farmId,@PathVariable Long unitId,@Valid @RequestBody UnitReq r,Authentication a){
        if(farms.findByIdAndUserId(farmId,uid(a)).isEmpty()) return ResponseEntity.notFound().build();
        return units.findByIdAndFarmId(unitId,farmId).map(u->{
            u.setName(r.name());u.setAreaSqm(r.areaSqm());u.setGrowingMethod(r.growingMethod());
            return ResponseEntity.ok(UnitRes.of(units.save(u)));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{unitId}")
    public ResponseEntity<Void> delete(@PathVariable Long farmId,@PathVariable Long unitId,Authentication a){
        if(farms.findByIdAndUserId(farmId,uid(a)).isEmpty()) return ResponseEntity.notFound().build();
        return units.findByIdAndFarmId(unitId,farmId).map(u->{units.delete(u);
            return ResponseEntity.noContent().<Void>build();}).orElse(ResponseEntity.notFound().build());
    }

    record UnitReq(@NotBlank String name, @NotNull BigDecimal areaSqm, @NotNull GrowingUnit.GrowingMethod growingMethod){}
    record UnitRes(Long id,Long farmId,String name,BigDecimal areaSqm,String growingMethod){
        static UnitRes of(GrowingUnit u){return new UnitRes(u.getId(),u.getFarm().getId(),u.getName(),u.getAreaSqm(),u.getGrowingMethod().name());}
    }
}

