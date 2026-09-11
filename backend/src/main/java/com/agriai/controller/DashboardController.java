package com.agriai.controller;

import com.agriai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final FarmRepository farms;
    private final GrowingUnitRepository units;
    private final CropRepository crops;
    private final ActivityRepository acts;
    private Long uid(Authentication a){return (Long)a.getDetails();}

    // FR18 – Summary cards
    @GetMapping("/summary")
    public SummaryRes summary(Authentication a){
        Long uid=uid(a);
        return new SummaryRes(
            farms.findByUserId(uid).size(),
            units.countByUserId(uid),
            crops.countActiveCropsByUserId(uid),
            acts.countRecentByUserId(uid,LocalDate.now().minusDays(7))
        );
    }

    // FR19 – Activity chart data
    @GetMapping("/activity-chart")
    public List<Map<String,Object>> chart(
            @RequestParam(defaultValue="30") int days, Authentication a){
        return acts.countByDateForUser(uid(a),LocalDate.now().minusDays(days))
                .stream().map(r->{
                    Map<String,Object> m=new LinkedHashMap<>();
                    m.put("date", r[0] != null ? r[0].toString().substring(0,10) : "");
                    m.put("count", r[1] instanceof Number ? ((Number)r[1]).longValue() : 0L);
                    return m;
                }).toList();
    }

    record SummaryRes(long farms,long growingUnits,long activeCrops,long activitiesThisWeek){}
}
