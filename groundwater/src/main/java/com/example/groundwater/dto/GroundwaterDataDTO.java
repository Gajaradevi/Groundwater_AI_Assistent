package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for GroundwaterData
 * Used to transfer data between layers (Controller ↔ Service)
 * (Doesn't expose internal fields like createdAt/updatedAt by default)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroundwaterDataDTO {

    private Long id;
    private String district;
    private String state;
    private Integer year;
    private Double annualRecharge;
    private Double extractableResources;
    private Double totalExtraction;
    private Double stageDevelopment;
    private String category;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
