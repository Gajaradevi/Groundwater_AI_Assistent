package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for Statistics page charts and filters
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDTO {
    private List<StateAverageDTO> stateWiseData;
    private List<GroundwaterDataDTO> districtWiseData;
    private List<GroundwaterDataDTO> yearlyTrends;
    private Map<String, Long> categoryDistribution;
    private List<String> availableStates;
    private List<Integer> availableYears;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StateAverageDTO {
        private String state;
        private double averageStageDevelopment;
    }
}
