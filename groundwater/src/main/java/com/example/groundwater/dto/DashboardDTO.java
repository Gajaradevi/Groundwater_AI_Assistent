package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for Dashboard page aggregated metrics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalDistricts;
    private long safeCount;
    private long semiCriticalCount;
    private long criticalCount;
    private long overExploitedCount;
    private List<GroundwaterDataDTO> topStressedDistricts;
    private List<GroundwaterDataDTO> topSafestDistricts;
    private Map<String, Long> categoryDistribution;
}
