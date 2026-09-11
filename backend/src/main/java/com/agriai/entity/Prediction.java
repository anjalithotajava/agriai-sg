package com.agriai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Prediction {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "growing_unit_id")
    private GrowingUnit growingUnit;

    @Column(name = "crop_type", nullable = false, length = 100)
    private String cropType;

    @Column(precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(precision = 5, scale = 2)
    private BigDecimal humidity;

    @Column(name = "nutrient_ec", precision = 5, scale = 2)
    private BigDecimal nutrientEc;

    @Column(name = "growing_method", length = 50)
    private String growingMethod;

    @Column(name = "predicted_yield_per_sqm", precision = 8, scale = 3)
    private BigDecimal predictedYieldPerSqm;

    @Column(precision = 5, scale = 2)
    private BigDecimal confidence;

    @Column(name = "suggested_window_start")
    private LocalDate suggestedWindowStart;

    @Column(name = "suggested_window_end")
    private LocalDate suggestedWindowEnd;

    @Column(name = "model_used", length = 50)
    private String modelUsed;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
