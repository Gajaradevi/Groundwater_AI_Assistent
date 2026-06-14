package com.example.groundwater.service;

import com.example.groundwater.dto.GroundwaterDataDTO;
import com.example.groundwater.model.GroundwaterData;
import com.example.groundwater.repository.GroundwaterDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
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
