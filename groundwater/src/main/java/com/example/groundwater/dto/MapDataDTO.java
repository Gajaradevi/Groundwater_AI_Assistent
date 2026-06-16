package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for sending groundwater coordinates and basic details to map
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MapDataDTO {
    private String district;
    private String state;
    private double latitude;
    private double longitude;
    private String category;
    private double stageDevelopment;
    private int year;
}
