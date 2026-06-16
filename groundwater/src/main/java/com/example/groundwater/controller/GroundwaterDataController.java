package com.example.groundwater.controller;

import com.example.groundwater.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.groundwater.service.AiService;
import com.example.groundwater.service.GroundwaterDataService;
import com.example.groundwater.service.GroundwaterSummaryDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST API Controller for Groundwater Data
 * Exposes endpoints for querying groundwater resources
 * 
 * Base URL: http://localhost:8080/api/v1/groundwater
 * All responses are wrapped in ApiResponse<T> format for consistency
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/groundwater")
@Tag(name = "Groundwater Data API", description = "APIs for querying groundwater resource data")
public class GroundwaterDataController {

    private static final Logger log = LoggerFactory.getLogger(GroundwaterDataController.class);
    private final GroundwaterDataService groundwaterDataService;
    private final AiService aiService;

    public GroundwaterDataController(GroundwaterDataService groundwaterDataService, AiService aiService) {
        this.groundwaterDataService = groundwaterDataService;
        this.aiService = aiService;
    }

    /**
     * Endpoint: GET /api/v1/groundwater/all
     * Get all groundwater records
     * @return List of all GroundwaterData records
     */
    @GetMapping("/all")
    @Operation(summary = "Get all groundwater data", description = "Retrieves all groundwater resource records from the database")
    public ResponseEntity<ApiResponse<List<GroundwaterDataDTO>>> getAllData() {
        try {
            List<GroundwaterDataDTO> data = groundwaterDataService.getAllData();
            ApiResponse<List<GroundwaterDataDTO>> response = new ApiResponse<>(
                    true,
                    "All groundwater data retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/{id}
     * Get data by record ID
     * @param id - Record ID
     * @return Single GroundwaterData record
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get data by ID", description = "Retrieves a specific groundwater record by its ID")
    public ResponseEntity<ApiResponse<GroundwaterDataDTO>> getDataById(
            @PathVariable Long id) {
        try {
            GroundwaterDataDTO data = groundwaterDataService.getDataById(id);
            ApiResponse<GroundwaterDataDTO> response = new ApiResponse<>(
                    true,
                    "Data retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/district/{district}
     * Get all records for a specific district
     * @param district - District name
     * @return List of records for that district
     */
    @GetMapping("/district/{district}")
    @Operation(summary = "Get data by district", description = "Retrieves all groundwater records for a specific district")
    public ResponseEntity<ApiResponse<List<GroundwaterDataDTO>>> getDataByDistrict(
            @PathVariable String district) {
        try {
            List<GroundwaterDataDTO> data = groundwaterDataService.getDataByDistrict(district);
            ApiResponse<List<GroundwaterDataDTO>> response = new ApiResponse<>(
                    true,
                    "Data for district '" + district + "' retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/district/{district}/year/{year}
     * Get latest assessment data for a district in specific year
     * @param district - District name
     * @param year - Assessment year
     * @return GroundwaterData for that district-year
     */
    @GetMapping("/district/{district}/year/{year}")
    @Operation(summary = "Get district data by year", description = "Retrieves groundwater data for a specific district and year")
    public ResponseEntity<ApiResponse<GroundwaterDataDTO>> getDataByDistrictAndYear(
            @PathVariable String district,
            @PathVariable Integer year) {
        try {
            GroundwaterDataDTO data = groundwaterDataService.getDataByDistrictAndYear(district, year);
            ApiResponse<GroundwaterDataDTO> response = new ApiResponse<>(
                    true,
                    "Data for " + district + " (" + year + ") retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/state/{state}
     * Get all records for a specific state
     * @param state - State/UT name
     * @return List of records for that state
     */
    @GetMapping("/state/{state}")
    @Operation(summary = "Get data by state", description = "Retrieves all groundwater records for a specific state/UT")
    public ResponseEntity<ApiResponse<List<GroundwaterDataDTO>>> getDataByState(
            @PathVariable String state) {
        try {
            List<GroundwaterDataDTO> data = groundwaterDataService.getDataByState(state);
            ApiResponse<List<GroundwaterDataDTO>> response = new ApiResponse<>(
                    true,
                    "Data for state '" + state + "' retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/state/{state}/year/{year}/summary
     * Get state-level summary statistics
     * @param state - State name
     * @param year - Assessment year
     * @return Summary with aggregated metrics
     */
    @GetMapping("/state/{state}/year/{year}/summary")
    @Operation(summary = "Get state summary", description = "Retrieves aggregated statistics for a state in a specific year")
    public ResponseEntity<ApiResponse<GroundwaterSummaryDTO>> getStateSummary(
            @PathVariable String state,
            @PathVariable Integer year) {
        try {
            GroundwaterSummaryDTO summary = groundwaterDataService.getStateSummary(state, year);
            ApiResponse<GroundwaterSummaryDTO> response = new ApiResponse<>(
                    true,
                    "Summary for " + state + " (" + year + ") retrieved successfully",
                    200,
                    summary
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/year/{year}
     * Get all records for a specific year across all states
     * @param year - Assessment year
     * @return List of records for that year
     */
    @GetMapping("/year/{year}")
    @Operation(summary = "Get data by year", description = "Retrieves all groundwater records for a specific assessment year")
    public ResponseEntity<ApiResponse<List<GroundwaterDataDTO>>> getDataByYear(
            @PathVariable Integer year) {
        try {
            List<GroundwaterDataDTO> data = groundwaterDataService.getDataByYear(year);
            ApiResponse<List<GroundwaterDataDTO>> response = new ApiResponse<>(
                    true,
                    "Data for year " + year + " retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/category/{category}
     * Get all records in a specific category
     * @param category - SAFE, SEMI_CRITICAL, CRITICAL, OVER_EXPLOITED
     * @return List of records in that category
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "Get data by category", description = "Retrieves all groundwater records in a specific category (SAFE, SEMI_CRITICAL, CRITICAL, OVER_EXPLOITED)")
    public ResponseEntity<ApiResponse<List<GroundwaterDataDTO>>> getDataByCategory(
            @PathVariable String category) {
        try {
            List<GroundwaterDataDTO> data = groundwaterDataService.getDataByCategory(category);
            ApiResponse<List<GroundwaterDataDTO>> response = new ApiResponse<>(
                    true,
                    "Data for category '" + category + "' retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/critical-areas?state={state}&year={year}
     * Find all critical and over-exploited areas in a state
     * @param state - State name
     * @param year - Assessment year
     * @return List of critical areas
     */
    @GetMapping("/critical-areas")
    @Operation(summary = "Get critical areas", description = "Retrieves all critical and over-exploited areas in a state for a specific year")
    public ResponseEntity<ApiResponse<List<GroundwaterDataDTO>>> getCriticalAreas(
            @RequestParam String state,
            @RequestParam Integer year) {
        try {
            List<GroundwaterDataDTO> data = groundwaterDataService.getCriticalAreas(state, year);
            ApiResponse<List<GroundwaterDataDTO>> response = new ApiResponse<>(
                    true,
                    "Critical areas for " + state + " (" + year + ") retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/trend-analysis?district={district}&startYear={startYear}&endYear={endYear}
     * Get trend analysis for a district across multiple years
     * @param district - District name
     * @param startYear - Starting year
     * @param endYear - Ending year
     * @return List of historical data for trend analysis
     */
    @GetMapping("/trend-analysis")
    @Operation(summary = "Get trend analysis", description = "Retrieves historical data for trend analysis of a district across multiple years")
    public ResponseEntity<ApiResponse<List<GroundwaterDataDTO>>> getTrendAnalysis(
            @RequestParam String district,
            @RequestParam Integer startYear,
            @RequestParam Integer endYear) {
        try {
            List<GroundwaterDataDTO> data = groundwaterDataService.getTrendAnalysis(district, startYear, endYear);
            ApiResponse<List<GroundwaterDataDTO>> response = new ApiResponse<>(
                    true,
                    "Trend analysis for " + district + " (" + startYear + "-" + endYear + ") retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: POST /api/v1/groundwater
     * Create a new groundwater record
     * @param dataDTO - GroundwaterData to save
     * @return Created record with generated ID
     */
    @PostMapping
    @Operation(summary = "Create groundwater data", description = "Creates a new groundwater resource record")
    public ResponseEntity<ApiResponse<GroundwaterDataDTO>> createData(
            @RequestBody GroundwaterDataDTO dataDTO) {
        try {
            GroundwaterDataDTO createdData = groundwaterDataService.createData(dataDTO);
            ApiResponse<GroundwaterDataDTO> response = new ApiResponse<>(
                    true,
                    "Groundwater data created successfully",
                    201,
                    createdData
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: PUT /api/v1/groundwater/{id}
     * Update an existing groundwater record
     * @param id - Record ID to update
     * @param dataDTO - Updated data
     * @return Updated record
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update groundwater data", description = "Updates an existing groundwater resource record")
    public ResponseEntity<ApiResponse<GroundwaterDataDTO>> updateData(
            @PathVariable Long id,
            @RequestBody GroundwaterDataDTO dataDTO) {
        try {
            GroundwaterDataDTO updatedData = groundwaterDataService.updateData(id, dataDTO);
            ApiResponse<GroundwaterDataDTO> response = new ApiResponse<>(
                    true,
                    "Groundwater data updated successfully",
                    200,
                    updatedData
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: DELETE /api/v1/groundwater/{id}
     * Delete a groundwater record
     * @param id - Record ID to delete
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete groundwater data", description = "Deletes a specific groundwater resource record")
    public ResponseEntity<ApiResponse<String>> deleteData(
            @PathVariable Long id) {
        try {
            groundwaterDataService.deleteData(id);
            ApiResponse<String> response = new ApiResponse<>(
                    true,
                    "Groundwater data deleted successfully",
                    200,
                    null
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Health check endpoint
     * @return Server status message
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Checks if the API server is running")
    public ResponseEntity<ApiResponse<String>> health() {
        ApiResponse<String> response = new ApiResponse<>(
                true,
                "Groundwater Data API is running successfully",
                200,
                "Server Status: Active"
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint: GET /api/v1/groundwater/ai/explain-stress?district={district}&year={year}
     * Get AI-powered explanation of the groundwater stress in a district
     * @param district - District name
     * @param year - Assessment year
     * @return AI stress explanation
     */
    @GetMapping("/ai/explain-stress")
    @Operation(summary = "Get AI-powered stress explanation", description = "Retrieves an AI-generated explanation of the groundwater stress stage for a specific district and year using RAG pattern")
    public ResponseEntity<ApiResponse<String>> explainStress(
            @RequestParam String district,
            @RequestParam Integer year) {
        try {
            String explanation = aiService.explainStress(district, year);
            ApiResponse<String> response = new ApiResponse<>(
                    true,
                    "AI groundwater stress explanation generated successfully",
                    200,
                    explanation
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/ai/compare?district1={district1}&district2={district2}&year={year}
     * Get AI-powered comparison of groundwater metrics between two districts for a year
     * @param district1 - Name of the first district
     * @param district2 - Name of the second district
     * @param year - Assessment year
     * @return AI comparison explanation
     */
    @GetMapping("/ai/compare")
    @Operation(summary = "Get AI-powered district comparison", description = "Retrieves an AI-generated comparison of groundwater metrics between two districts for a specific year using RAG pattern")
    public ResponseEntity<ApiResponse<String>> compareDistricts(
            @RequestParam String district1,
            @RequestParam String district2,
            @RequestParam Integer year) {
        try {
            String comparison = aiService.compareDistricts(district1, district2, year);
            ApiResponse<String> response = new ApiResponse<>(
                    true,
                    "AI district comparison generated successfully",
                    200,
                    comparison
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/ai/recommendations?district={district}&year={year}
     * Get AI-powered conservation recommendations for a district
     * @param district - District name
     * @param year - Assessment year
     * @return AI-generated conservation recommendations in markdown
     */
    @GetMapping("/ai/recommendations")
    @Operation(summary = "Get AI-powered conservation recommendations", description = "Retrieves AI-generated groundwater conservation recommendations for a specific district and year using RAG pattern")
    public ResponseEntity<ApiResponse<String>> getConservationRecommendations(
            @RequestParam String district,
            @RequestParam Integer year) {
        try {
            String recommendations = aiService.recommendConservationMeasures(district, year);
            ApiResponse<String> response = new ApiResponse<>(
                    true,
                    "AI conservation recommendations generated successfully",
                    200,
                    recommendations
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Generic exception handler for all endpoints
     * @param e - Exception caught
     * @param <T> response payload type
     * @return Error response
     */
    private <T> ResponseEntity<ApiResponse<T>> handleException(Exception e) {
        ApiResponse<T> response = new ApiResponse<>(
                false,
                e.getMessage() != null ? e.getMessage() : "An error occurred",
                500,
                null
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Endpoint: GET /api/v1/groundwater/ai/compare-states?state1={state1}&state2={state2}&year={year}
     * Get AI-powered comparison of groundwater metrics between two states for a year
     * @param state1 - Name of the first state
     * @param state2 - Name of the second state
     * @param year - Assessment year
     * @return AI comparison explanation
     */
    @GetMapping("/ai/compare-states")
    @Operation(summary = "Get AI-powered state comparison", description = "Retrieves an AI-generated comparison of groundwater metrics between two states for a specific year using RAG pattern")
    public ResponseEntity<ApiResponse<String>> compareStates(
            @RequestParam String state1,
            @RequestParam String state2,
            @RequestParam Integer year) {
        try {
            String comparison = aiService.compareStates(state1, state2, year);
            ApiResponse<String> response = new ApiResponse<>(
                    true,
                    "AI state comparison generated successfully",
                    200,
                    comparison
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/map-data
     * Retrieves coordinates and basic metrics for districts map
     */
    @GetMapping("/map-data")
    @Operation(summary = "Get map data", description = "Retrieves coordinates and categories for Leaflet map markers")
    public ResponseEntity<ApiResponse<List<MapDataDTO>>> getMapData() {
        try {
            List<MapDataDTO> data = groundwaterDataService.getMapData();
            ApiResponse<List<MapDataDTO>> response = new ApiResponse<>(
                    true,
                    "Map data retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/dashboard
     * Retrieves aggregated statistics for the dashboard
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard metrics", description = "Retrieves aggregated counts, top lists, and category distribution for the dashboard")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboardData() {
        try {
            DashboardDTO data = groundwaterDataService.getDashboardData();
            ApiResponse<DashboardDTO> response = new ApiResponse<>(
                    true,
                    "Dashboard data retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/statistics
     * Retrieves filtered data for charts and dropdown selections
     */
    @GetMapping("/statistics")
    @Operation(summary = "Get statistics", description = "Retrieves state summaries, district details, and trends with optional filters")
    public ResponseEntity<ApiResponse<StatisticsDTO>> getStatistics(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer year) {
        try {
            StatisticsDTO data = groundwaterDataService.getStatistics(state, district, year);
            ApiResponse<StatisticsDTO> response = new ApiResponse<>(
                    true,
                    "Statistics retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Endpoint: GET /api/v1/groundwater/analytics
     * Retrieves analytical scores, rankings, and AI-generated insight statements
     */
    @GetMapping("/analytics")
    @Operation(summary = "Get analytics data", description = "Retrieves risk scores, state rankings, and AI generated insights and conservation suggestions")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getAnalyticsData() {
        log.info("Analytics request received");
        try {
            AnalyticsDTO data = groundwaterDataService.getAnalyticsData();
            
            // Call AI service to populate AI insights
            String insights = aiService.generateAnalyticsInsights(
                    data.getTopRiskDistricts(),
                    data.getTopSafeDistricts()
            );
            data.setAiInsights(insights);

            ApiResponse<AnalyticsDTO> response = new ApiResponse<>(
                    true,
                    "Analytics retrieved successfully",
                    200,
                    data
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to generate analytics data, returning fallback: {}", e.getMessage());
            // Fallback: return fallback data when error occurs
            AnalyticsDTO fallbackData = new AnalyticsDTO(
                    0, 0, 0, 0, 0,
                    java.util.Collections.emptyList(),
                    java.util.Collections.emptyList(),
                    "Analytics AI is currently offline. Please check connection."
            );
            ApiResponse<AnalyticsDTO> response = new ApiResponse<>(
                    true,
                    "Analytics retrieved (Fallback Mode)",
                    200,
                    fallbackData
            );
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Endpoint: POST /api/v1/groundwater/ai/report
     * Generates custom comprehensive markdown reports
     */
    @PostMapping("/ai/report")
    @Operation(summary = "Generate AI report", description = "Generates a structured comprehensive markdown report based on selections using Groq")
    public ResponseEntity<ApiResponse<ReportResponseDTO>> generateReport(@RequestBody ReportRequest request) {
        log.info("Report request received");
        try {
            ReportResponseDTO reportResponse = aiService.generateReport(request);
            ApiResponse<ReportResponseDTO> response = new ApiResponse<>(
                    true,
                    "AI report generated successfully",
                    200,
                    reportResponse
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to generate report: {}", e.getMessage());
            return handleException(e);
        }
    }
}
