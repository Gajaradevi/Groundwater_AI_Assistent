package com.example.groundwater.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity class representing groundwater resource data for a district
 * Maps to the 'groundwater_data' table in MySQL
 */
@Entity
@Table(name = "groundwater_data")
@Data // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // Generates no-arg constructor
@AllArgsConstructor // Generates constructor with all fields
public class GroundwaterData {

    /**
     * Unique identifier for each groundwater assessment record
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of the district/block/mandal
     */
    @Column(nullable = false, length = 100)
    private String district;

    /**
     * State/UT where the district is located
     */
    @Column(nullable = false, length = 100)
    private String state;

    /**
     * Assessment year (e.g., 2023, 2024)
     */
    @Column(nullable = false)
    private Integer year;

    /**
     * Annual groundwater recharge in cubic kilometers (km³)
     */
    @Column(nullable = false)
    private Double annualRecharge;

    /**
     * Total extractable groundwater resources in km³
     */
    @Column(nullable = false)
    private Double extractableResources;

    /**
     * Total groundwater extraction in km³
     */
    @Column(nullable = false)
    private Double totalExtraction;

    /**
     * Stage of Groundwater Development (percentage)
     * Formula: (Total Extraction / Extractable Resources) * 100
     */
    @Column(nullable = false)
    private Double stageDevelopment;

    /**
     * Category classification: SAFE, SEMI_CRITICAL, CRITICAL, OVER_EXPLOITED
     */
    @Column(nullable = false, length = 30)
    private String category; // Enum or String

    /**
     * Additional remarks or notes about the assessment
     */
    @Column(length = 500)
    private String remarks;

    /**
     * Timestamp when the record was created
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the record was last updated
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * JPA lifecycle callback - runs before saving
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * JPA lifecycle callback - runs before updating
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
