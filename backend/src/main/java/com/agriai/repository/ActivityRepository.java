package com.agriai.repository;

import com.agriai.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByFarmIdOrderByActivityDateDesc(Long farmId);

    @Query("SELECT COUNT(a) FROM Activity a WHERE a.farm.user.id = :userId AND a.activityDate >= :since")
    long countRecentByUserId(@Param("userId") Long userId, @Param("since") LocalDate since);

    @Query(value = "SELECT a.activity_date as date, COUNT(*) as count FROM activities a " +
           "INNER JOIN farms f ON a.farm_id = f.id " +
           "WHERE f.user_id = :userId AND a.activity_date >= :since " +
           "GROUP BY a.activity_date ORDER BY a.activity_date", nativeQuery = true)
    List<Object[]> countByDateForUser(@Param("userId") Long userId, @Param("since") LocalDate since);
}
