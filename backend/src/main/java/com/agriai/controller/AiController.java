package com.agriai.controller;

import com.agriai.entity.*;
import com.agriai.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final PredictionRepository preds;
    private final UserRepository users;
    private final GrowingUnitRepository units;
    private final RestTemplate rest;
    @Value("${ai.service.url}") private String aiUrl;
    private Long uid(Authentication a){return (Long)a.getDetails();}

    // FR21 + FR22
    @PostMapping("/predict")
    public ResponseEntity<?> predict(@Valid @RequestBody PredictReq req, Authentication a){
        try {
            Map<String,Object> payload=new HashMap<>();
            payload.put("crop_type",req.cropType());
            payload.put("temperature",req.temperature());
            payload.put("humidity",req.humidity());
            payload.put("nutrient_ec",req.nutrientEc());
            payload.put("growing_method",req.growingMethod());

            ResponseEntity<AiRes> resp=rest.postForEntity(aiUrl+"/predict",payload,AiRes.class);
            AiRes ai=resp.getBody();
            if(ai==null) return ResponseEntity.status(503).body(Map.of("message","AI service unavailable"));

            GrowingUnit unit=req.growingUnitId()!=null?units.getReferenceById(req.growingUnitId()):null;
            preds.save(Prediction.builder()
                    .user(users.getReferenceById(uid(a))).growingUnit(unit)
                    .cropType(req.cropType()).temperature(req.temperature())
                    .humidity(req.humidity()).nutrientEc(req.nutrientEc())
                    .growingMethod(req.growingMethod())
                    .predictedYieldPerSqm(BigDecimal.valueOf(ai.predictedYieldPerSqm()))
                    .confidence(BigDecimal.valueOf(ai.confidence()))
                    .suggestedWindowStart(LocalDate.now().plusDays(5))
                    .suggestedWindowEnd(LocalDate.now().plusDays(13))
                    .modelUsed(ai.modelUsed()).build());

            return ResponseEntity.ok(new PredictRes(
                    ai.predictedYieldPerSqm(),ai.confidence(),
                    LocalDate.now().plusDays(5).toString(),
                    LocalDate.now().plusDays(13).toString(),
                    ai.modelUsed(),ai.featureImportance(),ai.suggestedCycleDays()));
        } catch(Exception e){
            return ResponseEntity.status(503)
                    .body(Map.of("message","AI service unavailable: "+e.getMessage()));
        }
    }

    @GetMapping("/history")
    public List<HistRes> history(Authentication a){
        return preds.findByUserIdOrderByCreatedAtDesc(uid(a)).stream()
                .map(p->new HistRes(p.getId(),p.getCropType(),
                        p.getPredictedYieldPerSqm(),p.getConfidence(),
                        p.getModelUsed(),p.getCreatedAt().toString())).toList();
    }

    record PredictReq(@NotBlank String cropType,@NotNull BigDecimal temperature,
                      @NotNull BigDecimal humidity,@NotNull BigDecimal nutrientEc,
                      @NotBlank String growingMethod,Long growingUnitId){}
    record AiRes(double predictedYieldPerSqm,double confidence,String modelUsed,
                 Map<String,Double> featureImportance,Map<String,Integer> suggestedCycleDays){}
    record PredictRes(double predictedYieldPerSqm,double confidence,
                      String suggestedWindowStart,String suggestedWindowEnd,
                      String modelUsed,Map<String,Double> featureImportance,
                      Map<String,Integer> suggestedCycleDays){}
    record HistRes(Long id,String cropType,BigDecimal predictedYieldPerSqm,
                   BigDecimal confidence,String modelUsed,String createdAt){}
}
