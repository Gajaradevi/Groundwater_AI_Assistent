package com.example.groundwater.repository;

import com.example.groundwater.model.GroundwaterData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for GroundwaterData entity
 * JpaRepository provides CRUD operations + pagination, sorting, and custom queries
 * 
 * Spring Data JPA automatically generates SQL queries from method names
 * Example: findByDistrict(String district) → SELECT * FROM groundwater_data WHERE district = ?
 */
@Repository
public interface GroundwaterDataRepository extends JpaRepository<GroundwaterData, Long> {

    /**
     * Find all records for a specific district (any year)
     */
    List<GroundwaterData> findByDistrict(String district);

    /**
     * Find all records for a specific district and year
     */
    Optional<GroundwaterData> findByDistrictAndYear(String district, Integer year);

    /**
     * Find all records for a specific state
     */
    List<GroundwaterData> findByState(String state);

    /**
     * Find all records for a specific year across all districts
     */
    List<GroundwaterData> findByYear(Integer year);

    /**
     * Find records by category (SAFE, SEMI_CRITICAL, CRITICAL, OVER_EXPLOITED)
     */
    @Query("SELECT gd FROM GroundwaterData gd WHERE UPPER(REPLACE(gd.category, '-', '_')) = UPPER(REPLACE(:category, '-', '_'))")
    List<GroundwaterData> findByCategory(@Param("category") String category);

    /**
     * Find records where stage of development exceeds a threshold
     * Used to find over-exploited areas
     */
    List<GroundwaterData> findByStageDevelopmentGreaterThan(Double threshold);

    /**
     * Find records within a range of years (for trend analysis)
     */
    List<GroundwaterData> findByYearBetween(Integer startYear, Integer endYear);

    /**
     * Custom query to find all records for a specific state and year
     */
    @Query("SELECT gd FROM GroundwaterData gd WHERE gd.state = :state AND gd.year = :year")
    List<GroundwaterData> findByStateAndYear(@Param("state") String state, @Param("year") Integer year);

    /**
     * Custom query to get latest assessment year for a district
     */
    @Query(value = "SELECT MAX(year) FROM groundwater_data WHERE district = :district", nativeQuery = true)
    Integer findLatestYearForDistrict(@Param("district") String district);

    /**
     * Custom query to calculate average stage of development for a state
     */
    @Query("SELECT AVG(gd.stageDevelopment) FROM GroundwaterData gd WHERE gd.state = :state AND gd.year = :year")
    Double calculateAverageStageDevelopment(@Param("state") String state, @Param("year") Integer year);

    /**
     * Find all critical and over-exploited areas in a state
     */
    @Query("SELECT gd FROM GroundwaterData gd WHERE gd.state = :state AND gd.year = :year " +
           "AND (UPPER(REPLACE(gd.category, '-', '_')) = 'CRITICAL' " +
           "OR UPPER(REPLACE(gd.category, '-', '_')) = 'OVER_EXPLOITED')")
    List<GroundwaterData> findCriticalAreasInState(@Param("state") String state, @Param("year") Integer year);

    /**
     * Find latest records per district
     */
    @Query("SELECT gd FROM GroundwaterData gd WHERE gd.year = (SELECT MAX(gd2.year) FROM GroundwaterData gd2 WHERE gd2.district = gd.district)")
    List<GroundwaterData> findLatestRecordPerDistrict();

    /**
     * Find top 5 stressed districts for a specific year
     */
    List<GroundwaterData> findTop5ByYearOrderByStageDevelopmentDesc(Integer year);

    /**
     * Find top 5 safest districts for a specific year
     */
    List<GroundwaterData> findTop5ByYearOrderByStageDevelopmentAsc(Integer year);

    /**
     * Find distinct states
     */
    @Query("SELECT DISTINCT gd.state FROM GroundwaterData gd ORDER BY gd.state")
    List<String> findDistinctStates();

    /**
     * Find distinct years
     */
    @Query("SELECT DISTINCT gd.year FROM GroundwaterData gd ORDER BY gd.year DESC")
    List<Integer> findDistinctYears();
}
