package com.agriai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "growing_units")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class GrowingUnit {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "area_sqm", nullable = false, precision = 10, scale = 2)
    private BigDecimal areaSqm;

    @Enumerated(EnumType.STRING)
    @Column(name = "growing_method", nullable = false)
    private GrowingMethod growingMethod;

    @OneToMany(mappedBy = "growingUnit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Crop> crops;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum GrowingMethod { HYDROPONIC, AEROPONIC, AQUAPONIC, SOIL_BASED }
}
