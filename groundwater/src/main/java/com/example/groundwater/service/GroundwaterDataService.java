package com.example.groundwater.service;

import com.example.groundwater.dto.*;
import com.example.groundwater.model.GroundwaterData;
import com.example.groundwater.repository.GroundwaterDataRepository;
import com.example.groundwater.config.DistrictCoordinates;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for GroundwaterData
 * Contains all business logic and data processing
 * 
 * @Service annotation makes this a Spring-managed service bean
 * @RequiredArgsConstructor auto-injects dependencies (from Lombok)
 */
@Service
@RequiredArgsConstructor
public class GroundwaterDataService {

    // Dependency injection - repository is auto-wired
    private final GroundwaterDataRepository groundwaterDataRepository;

    /**
     * Get all groundwater data records
     * @return List of all GroundwaterDataDTOs
     */
    public List<GroundwaterDataDTO> getAllData() {
        return groundwaterDataRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get data by ID
     * @param id - Record ID
     * @return GroundwaterDataDTO or throw exception if not found
     */
    public GroundwaterDataDTO getDataById(Long id) {
        GroundwaterData data = groundwaterDataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found with ID: " + id));
        return convertToDTO(data);
    }

    /**
     * Get all records for a specific district
     * @param district - District name
     * @return List of records for that district
     */
    public List<GroundwaterDataDTO> getDataByDistrict(String district) {
        return groundwaterDataRepository.findByDistrict(district)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get data for a specific district and year (latest assessment)
     * @param district - District name
     * @param year - Assessment year
     * @return GroundwaterDataDTO for that district-year combination
     */
    public GroundwaterDataDTO getDataByDistrictAndYear(String district, Integer year) {
        GroundwaterData data = groundwaterDataRepository.findByDistrictAndYear(district, year)
                .orElseThrow(() -> new RuntimeException("No data found for district: " + district + " and year: " + year));
        return convertToDTO(data);
    }

    /**
     * Get all records for a specific state
     * @param state - State/UT name
     * @return List of all records in that state
     */
    public List<GroundwaterDataDTO> getDataByState(String state) {
        return groundwaterDataRepository.findByState(state)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get state-level summary statistics for a given year
     * @param state - State name
     * @param year - Assessment year
     * @return Summary with total extraction, recharge, average stage development
     */
    public GroundwaterSummaryDTO getStateSummary(String state, Integer year) {
        List<GroundwaterData> stateData = groundwaterDataRepository.findByStateAndYear(state, year);
        
        if (stateData.isEmpty()) {
            throw new RuntimeException("No data found for state: " + state + " and year: " + year);
        }

        Double totalExtraction = stateData.stream()
                .mapToDouble(GroundwaterData::getTotalExtraction)
                .sum();

        Double totalRecharge = stateData.stream()
                .mapToDouble(GroundwaterData::getAnnualRecharge)
                .sum();

        Double averageStageDevelopment = stateData.stream()
                .mapToDouble(GroundwaterData::getStageDevelopment)
                .average()
                .orElse(0.0);

        long criticalAreas = stateData.stream()
                .filter(d -> {
                    if (d.getCategory() == null) return false;
                    String normalized = d.getCategory().toUpperCase().replace("-", "_");
                    return "CRITICAL".equals(normalized) || "OVER_EXPLOITED".equals(normalized);
                })
                .count();

        return new GroundwaterSummaryDTO(
                state,
                year,
                totalExtraction,
                totalRecharge,
                stateData.size(),
                averageStageDevelopment,
                criticalAreas
        );
    }

    /**
     * Get all records for a specific year across all states/districts
     * @param year - Assessment year
     * @return List of records for that year
     */
    public List<GroundwaterDataDTO> getDataByYear(Integer year) {
        return groundwaterDataRepository.findByYear(year)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all records in a specific category
     * @param category - SAFE, SEMI_CRITICAL, CRITICAL, OVER_EXPLOITED
     * @return List of records in that category
     */
    public List<GroundwaterDataDTO> getDataByCategory(String category) {
        return groundwaterDataRepository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Find critical and over-exploited areas in a state/year
     * @param state - State name
     * @param year - Assessment year
     * @return List of critical areas
     */
    public List<GroundwaterDataDTO> getCriticalAreas(String state, Integer year) {
        return groundwaterDataRepository.findCriticalAreasInState(state, year)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get trend analysis for a district (data across multiple years)
     * @param district - District name
     * @param startYear - Starting year
     * @param endYear - Ending year
     * @return List of historical data for trend analysis
     */
    public List<GroundwaterDataDTO> getTrendAnalysis(String district, Integer startYear, Integer endYear) {
        List<GroundwaterData> allData = groundwaterDataRepository.findByYearBetween(startYear, endYear);
        
        return allData.stream()
                .filter(d -> d.getDistrict().equalsIgnoreCase(district))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create/Save a new groundwater record
     * @param dataDTO - Data to save
     * @return Saved data with generated ID
     */
    public GroundwaterDataDTO createData(GroundwaterDataDTO dataDTO) {
        GroundwaterData data = new GroundwaterData();
        data.setDistrict(dataDTO.getDistrict());
        data.setState(dataDTO.getState());
        data.setYear(dataDTO.getYear());
        data.setAnnualRecharge(dataDTO.getAnnualRecharge());
        data.setExtractableResources(dataDTO.getExtractableResources());
        data.setTotalExtraction(dataDTO.getTotalExtraction());
        data.setStageDevelopment(dataDTO.getStageDevelopment());
        data.setCategory(dataDTO.getCategory());
        data.setRemarks(dataDTO.getRemarks());

        GroundwaterData savedData = groundwaterDataRepository.save(data);
        return convertToDTO(savedData);
    }

    /**
     * Update an existing groundwater record
     * @param id - Record ID to update
     * @param dataDTO - Updated data
     * @return Updated GroundwaterDataDTO
     */
    public GroundwaterDataDTO updateData(Long id, GroundwaterDataDTO dataDTO) {
        GroundwaterData data = groundwaterDataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found with ID: " + id));

        data.setDistrict(dataDTO.getDistrict());
        data.setState(dataDTO.getState());
        data.setYear(dataDTO.getYear());
        data.setAnnualRecharge(dataDTO.getAnnualRecharge());
        data.setExtractableResources(dataDTO.getExtractableResources());
        data.setTotalExtraction(dataDTO.getTotalExtraction());
        data.setStageDevelopment(dataDTO.getStageDevelopment());
        data.setCategory(dataDTO.getCategory());
        data.setRemarks(dataDTO.getRemarks());

        GroundwaterData updatedData = groundwaterDataRepository.save(data);
        return convertToDTO(updatedData);
    }

    /**
     * Delete a groundwater record
     * @param id - Record ID to delete
     */
    public void deleteData(Long id) {
        if (!groundwaterDataRepository.existsById(id)) {
            throw new RuntimeException("Record not found with ID: " + id);
        }
        groundwaterDataRepository.deleteById(id);
    }

    /**
     * Get data for interactive Leaflet map
     */
    public List<MapDataDTO> getMapData() {
        List<GroundwaterData> latest = groundwaterDataRepository.findLatestRecordPerDistrict();
        return latest.stream()
                .map(r -> {
                    double[] coords = DistrictCoordinates.getCoordinates(r.getDistrict());
                    return new MapDataDTO(
                            r.getDistrict(),
                            r.getState(),
                            coords[0],
                            coords[1],
                            r.getCategory(),
                            r.getStageDevelopment(),
                            r.getYear()
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Get aggregated dashboard summary data
     */
    public DashboardDTO getDashboardData() {
        List<GroundwaterData> latest = groundwaterDataRepository.findLatestRecordPerDistrict();

        long total = latest.size();
        long safe = latest.stream().filter(r -> "SAFE".equalsIgnoreCase(r.getCategory())).count();
        long semi = latest.stream().filter(r -> "SEMI_CRITICAL".equalsIgnoreCase(r.getCategory()) || "SEMI-CRITICAL".equalsIgnoreCase(r.getCategory())).count();
        long critical = latest.stream().filter(r -> "CRITICAL".equalsIgnoreCase(r.getCategory())).count();
        long over = latest.stream().filter(r -> "OVER_EXPLOITED".equalsIgnoreCase(r.getCategory()) || "OVER-EXPLOITED".equalsIgnoreCase(r.getCategory())).count();

        // Categories Map
        Map<String, Long> dist = new HashMap<>();
        dist.put("SAFE", safe);
        dist.put("SEMI_CRITICAL", semi);
        dist.put("CRITICAL", critical);
        dist.put("OVER_EXPLOITED", over);

        // Find top 5 stressed/safest for 2023
        List<GroundwaterData> topStressed = groundwaterDataRepository.findTop5ByYearOrderByStageDevelopmentDesc(2023);
        List<GroundwaterData> topSafest = groundwaterDataRepository.findTop5ByYearOrderByStageDevelopmentAsc(2023);

        List<GroundwaterDataDTO> topStressedDTOs = topStressed.stream().map(this::convertToDTO).collect(Collectors.toList());
        List<GroundwaterDataDTO> topSafestDTOs = topSafest.stream().map(this::convertToDTO).collect(Collectors.toList());

        return new DashboardDTO(
                total,
                safe,
                semi,
                critical,
                over,
                topStressedDTOs,
                topSafestDTOs,
                dist
        );
    }

    /**
     * Get statistics page data with dynamic filters
     */
    public StatisticsDTO getStatistics(String state, String district, Integer year) {
        int queryYear = (year != null) ? year : 2023;

        // 1. State-wise comparison (avg stage development across states for queryYear)
        List<GroundwaterData> yearData = groundwaterDataRepository.findByYear(queryYear);
        Map<String, List<GroundwaterData>> byState = yearData.stream()
                .collect(Collectors.groupingBy(GroundwaterData::getState));

        List<StatisticsDTO.StateAverageDTO> stateWiseData = new ArrayList<>();
        for (Map.Entry<String, List<GroundwaterData>> entry : byState.entrySet()) {
            double avg = entry.getValue().stream()
                    .mapToDouble(GroundwaterData::getStageDevelopment)
                    .average()
                    .orElse(0.0);
            stateWiseData.add(new StatisticsDTO.StateAverageDTO(entry.getKey(), Math.round(avg * 100.0) / 100.0));
        }

        // 2. District-wise stage development for selected state & year
        String queryState = (state != null && !state.isEmpty()) ? state : (stateWiseData.isEmpty() ? "" : stateWiseData.get(0).getState());
        List<GroundwaterData> stateYearData = groundwaterDataRepository.findByStateAndYear(queryState, queryYear);
        List<GroundwaterDataDTO> districtWiseData = stateYearData.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // 3. Annual trends for selected district
        String queryDistrict = (district != null && !district.isEmpty()) ? district : (districtWiseData.isEmpty() ? "Pune" : districtWiseData.get(0).getDistrict());
        List<GroundwaterData> districtHistory = groundwaterDataRepository.findByDistrict(queryDistrict);
        List<GroundwaterDataDTO> yearlyTrends = districtHistory.stream()
                .sorted(Comparator.comparingInt(GroundwaterData::getYear))
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // 4. Category distribution for state & year (or nationwide if state is empty)
        List<GroundwaterData> catBase = (state != null && !state.isEmpty()) ? stateYearData : yearData;
        long safe = catBase.stream().filter(r -> "SAFE".equalsIgnoreCase(r.getCategory())).count();
        long semi = catBase.stream().filter(r -> "SEMI_CRITICAL".equalsIgnoreCase(r.getCategory()) || "SEMI-CRITICAL".equalsIgnoreCase(r.getCategory())).count();
        long critical = catBase.stream().filter(r -> "CRITICAL".equalsIgnoreCase(r.getCategory())).count();
        long over = catBase.stream().filter(r -> "OVER_EXPLOITED".equalsIgnoreCase(r.getCategory()) || "OVER-EXPLOITED".equalsIgnoreCase(r.getCategory())).count();

        Map<String, Long> categoryDistribution = new HashMap<>();
        categoryDistribution.put("SAFE", safe);
        categoryDistribution.put("SEMI_CRITICAL", semi);
        categoryDistribution.put("CRITICAL", critical);
        categoryDistribution.put("OVER_EXPLOITED", over);

        // 5. Dropdown filter values
        List<String> availableStates = groundwaterDataRepository.findDistinctStates();
        List<Integer> availableYears = groundwaterDataRepository.findDistinctYears();

        return new StatisticsDTO(
                stateWiseData,
                districtWiseData,
                yearlyTrends,
                categoryDistribution,
                availableStates,
                availableYears
        );
    }

    /**
     * Get analytics indicators (without AI parts - populated in controller)
     */
    public AnalyticsDTO getAnalyticsData() {
        List<GroundwaterData> latestRecords = groundwaterDataRepository.findLatestRecordPerDistrict();

        long total = latestRecords.size();
        long safe = latestRecords.stream().filter(r -> r.getCategory() != null && "SAFE".equalsIgnoreCase(r.getCategory().trim())).count();
        long semi = latestRecords.stream().filter(r -> r.getCategory() != null && ("SEMI_CRITICAL".equalsIgnoreCase(r.getCategory().trim().replace("-", "_")) || "SEMI-CRITICAL".equalsIgnoreCase(r.getCategory().trim()))).count();
        long critical = latestRecords.stream().filter(r -> r.getCategory() != null && "CRITICAL".equalsIgnoreCase(r.getCategory().trim())).count();
        long over = latestRecords.stream().filter(r -> r.getCategory() != null && ("OVER_EXPLOITED".equalsIgnoreCase(r.getCategory().trim().replace("-", "_")) || "OVER-EXPLOITED".equalsIgnoreCase(r.getCategory().trim()))).count();

        // Sort latestRecords by stage of development descending to get top risk districts
        List<GroundwaterDataDTO> topRisk = latestRecords.stream()
                .sorted((a, b) -> Double.compare(b.getStageDevelopment(), a.getStageDevelopment()))
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Sort latestRecords by stage of development ascending to get top safe districts
        List<GroundwaterDataDTO> topSafe = latestRecords.stream()
                .sorted(Comparator.comparingDouble(GroundwaterData::getStageDevelopment))
                .limit(10)
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        AnalyticsDTO dto = new AnalyticsDTO();
        dto.setTotalDistricts(total);
        dto.setSafeCount(safe);
        dto.setSemiCriticalCount(semi);
        dto.setCriticalCount(critical);
        dto.setOverExploitedCount(over);
        dto.setTopRiskDistricts(topRisk);
        dto.setTopSafeDistricts(topSafe);
        return dto;
    }

    /**
     * Helper method: Convert Entity to DTO
     * @param data - GroundwaterData entity
     * @return GroundwaterDataDTO
     */
    private GroundwaterDataDTO convertToDTO(GroundwaterData data) {
        return new GroundwaterDataDTO(
                data.getId(),
                data.getDistrict(),
                data.getState(),
                data.getYear(),
                data.getAnnualRecharge(),
                data.getExtractableResources(),
                data.getTotalExtraction(),
                data.getStageDevelopment(),
                data.getCategory(),
                data.getRemarks(),
                data.getCreatedAt(),
                data.getUpdatedAt()
        );
    }
}
