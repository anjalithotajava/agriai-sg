package com.agriai.controller;

import com.agriai.entity.Crop;
import com.agriai.repository.CropRepository;
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
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/farms/{farmId}/growing-units/{unitId}/crops")
@RequiredArgsConstructor
public class CropController {
    private final CropRepository crops; private final GrowingUnitRepository units; private final FarmRepository farms;
    private Long uid(Authentication a){return (Long)a.getDetails();}
    private boolean owns(Long unitId,Long uid){
        return units.findById(unitId).map(u->farms.findByIdAndUserId(u.getFarm().getId(),uid).isPresent()).orElse(false);
    }

    @GetMapping
    public ResponseEntity<List<CropRes>> list(@PathVariable Long farmId, @PathVariable Long unitId, Authentication a){
        if(!owns(unitId,uid(a))) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(crops.findByGrowingUnitId(unitId).stream().map(CropRes::of).toList());
    }
    @PostMapping
    public ResponseEntity<CropRes> create(@PathVariable Long farmId, @PathVariable Long unitId, @Valid @RequestBody CropReq r, Authentication a){
        if(!owns(unitId,uid(a))) return ResponseEntity.notFound().build();
        Crop c=Crop.builder().growingUnit(units.getReferenceById(unitId))
                .cropType(r.cropType()).plantingDate(r.plantingDate())
                .expectedHarvestDate(r.expectedHarvestDate()).areaPlanted(r.expectedYieldPerSqm()).notes(r.notes()).harvested(false).build();
        return ResponseEntity.status(201).body(CropRes.of(crops.save(c)));
    }
    @PatchMapping("/{cropId}/harvest")
    public ResponseEntity<CropRes> harvest(@PathVariable Long farmId,@PathVariable Long unitId,@PathVariable Long cropId,@RequestBody HarvestReq r,Authentication a){
        if(!owns(unitId,uid(a))) return ResponseEntity.notFound().build();
        return crops.findById(cropId).filter(c->c.getGrowingUnit().getId().equals(unitId)).map(c->{
            c.setHarvested(true);c.setActualYield(r.actualYield());
            return ResponseEntity.ok(CropRes.of(crops.save(c)));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{cropId}")
    public ResponseEntity<Void> delete(@PathVariable Long farmId,@PathVariable Long unitId,@PathVariable Long cropId,Authentication a){
        if(!owns(unitId,uid(a))) return ResponseEntity.notFound().build();
        return crops.findById(cropId).map(c->{crops.delete(c);return ResponseEntity.noContent().<Void>build();})
                .orElse(ResponseEntity.notFound().build());
    }

    record CropReq(@NotBlank String cropType, @NotNull LocalDate plantingDate, LocalDate expectedHarvestDate,
                   BigDecimal expectedYieldPerSqm, String notes){}
    record HarvestReq(BigDecimal actualYield){}
    record CropRes(Long id,Long unitId,String cropType,LocalDate plantingDate,LocalDate expectedHarvestDate,BigDecimal expectedYieldPerSqm,BigDecimal actualYield,Boolean harvested,String notes){
        static CropRes of(Crop c){return new CropRes(c.getId(),c.getGrowingUnit().getId(),c.getCropType(),c.getPlantingDate(),c.getExpectedHarvestDate(),c.getAreaPlanted(),c.getActualYield(),c.getHarvested(),c.getNotes());}
    }
}
