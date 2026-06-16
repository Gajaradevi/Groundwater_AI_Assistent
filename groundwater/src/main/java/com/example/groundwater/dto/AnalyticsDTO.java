package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Data Transfer Object for Analytics page metrics and insights
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private long totalDistricts;
    private long safeCount;
    private long semiCriticalCount;
    private long criticalCount;
    private long overExploitedCount;
    private List<GroundwaterDataDTO> topRiskDistricts;
    private List<GroundwaterDataDTO> topSafeDistricts;
    private String aiInsights;
}
