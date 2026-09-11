package com.agriai.controller;


import com.agriai.entity.Activity;
import com.agriai.entity.GrowingUnit;
import com.agriai.repository.ActivityRepository;
import com.agriai.repository.FarmRepository;
import com.agriai.repository.GrowingUnitRepository;
import com.agriai.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/farms/{farmId}/activities") @RequiredArgsConstructor
public class ActivityController {
    private final ActivityRepository acts; private final FarmRepository farms;
    private final GrowingUnitRepository units; private final UserRepository users;
    private Long uid(Authentication a){return (Long)a.getDetails();}

    @GetMapping
    public ResponseEntity<List<ActRes>> list(@PathVariable Long farmId, Authentication a){
        return farms.findByIdAndUserId(farmId,uid(a)).map(f->
                        ResponseEntity.ok(acts.findByFarmIdOrderByActivityDateDesc(farmId).stream().map(ActRes::of).toList()))
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<ActRes> log(@PathVariable Long farmId, @Valid @RequestBody ActReq r, Authentication a){
        return farms.findByIdAndUserId(farmId,uid(a)).map(f->{
            GrowingUnit u=r.growingUnitId()!=null?units.getReferenceById(r.growingUnitId()):null;
            Activity act=Activity.builder().farm(f).growingUnit(u).type(r.type())
                    .activityDate(r.activityDate()).notes(r.notes()).quantity(r.quantity())
                    .loggedBy(users.getReferenceById(uid(a))).build();
            return ResponseEntity.status(201).body(ActRes.of(acts.save(act)));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{actId}")
    public ResponseEntity<Void> delete(@PathVariable Long farmId,@PathVariable Long actId,Authentication a){
        if(farms.findByIdAndUserId(farmId,uid(a)).isEmpty()) return ResponseEntity.notFound().build();
        return acts.findById(actId).map(ac->{acts.delete(ac);return ResponseEntity.noContent().<Void>build();})
                .orElse(ResponseEntity.notFound().build());
    }

    record ActReq(@NotNull Activity.ActivityType type, @NotNull LocalDate activityDate, Long growingUnitId, String notes, String quantity){}
    record ActRes(Long id,Long farmId,Long growingUnitId,String type,LocalDate activityDate,String notes,String quantity){
        static ActRes of(Activity a){return new ActRes(a.getId(),a.getFarm().getId(),
                a.getGrowingUnit()!=null?a.getGrowingUnit().getId():null,
                a.getType().name(),a.getActivityDate(),a.getNotes(),a.getQuantity());}
    }
}
