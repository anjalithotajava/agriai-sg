package com.agriai.repository;

import com.agriai.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByGrowingUnitId(Long unitId);

    @Query("SELECT COUNT(c) FROM Crop c WHERE c.growingUnit.farm.user.id = :userId AND c.harvested = false")
    long countActiveCropsByUserId(@Param("userId") Long userId);
}
