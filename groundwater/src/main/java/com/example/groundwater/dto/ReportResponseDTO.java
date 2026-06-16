package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for structured AI-generated report response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDTO {
    private String title;
    private String executiveSummary;
    private String statistics;
    private String findings;
    private String recommendations;
    private String conclusion;
}
