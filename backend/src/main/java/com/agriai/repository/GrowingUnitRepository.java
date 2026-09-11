package com.agriai.repository;

import com.agriai.entity.GrowingUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GrowingUnitRepository extends JpaRepository<GrowingUnit, Long> {
    List<GrowingUnit> findByFarmId(Long farmId);
    Optional<GrowingUnit> findByIdAndFarmId(Long id, Long farmId);

    @Query("SELECT COUNT(u) FROM GrowingUnit u WHERE u.farm.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
