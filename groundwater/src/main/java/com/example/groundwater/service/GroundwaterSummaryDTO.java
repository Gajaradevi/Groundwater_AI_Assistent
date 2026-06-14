package com.example.groundwater.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for returning state-level summary statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroundwaterSummaryDTO {

    private String state;
    private Integer year;
    private Double totalExtraction;
    private Double totalRecharge;
    private Integer totalDistricts;
    private Double averageStageDevelopment;
    private Long criticalAndOverexploitedAreas;
}
