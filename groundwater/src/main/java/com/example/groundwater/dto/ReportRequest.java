package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for requesting an AI-generated groundwater report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String reportType; // DISTRICT, STATE, COMPARATIVE, TREND
    private String district;
    private String state;
    private Integer year;
    private String compareDistrict;
    private String compareState;
}
