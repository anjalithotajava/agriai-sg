package com.agriai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crops")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Crop {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "growing_unit_id", nullable = false)
    private GrowingUnit growingUnit;

    @Column(name = "crop_type", nullable = false, length = 100)
    private String cropType;

    @Column(name = "planting_date", nullable = false)
    private LocalDate plantingDate;

    @Column(name = "expected_harvest_date")
    private LocalDate expectedHarvestDate;

    @Column(name = "area_planted", precision = 10, scale = 2)
    private BigDecimal areaPlanted;

    @Column(name = "actual_yield", precision = 10, scale = 3)
    private BigDecimal actualYield;

    @Column(nullable = false)
    private Boolean harvested = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
