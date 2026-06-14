package com.example.groundwater.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Generic API Response wrapper
 * All API endpoints will return this structure for consistency
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    /**
     * Response status: true for success, false for error
     */
    private Boolean success;

    /**
     * Response message (e.g., "Data retrieved successfully")
     */
    private String message;

    /**
     * HTTP Status Code
     */
    private Integer statusCode;

    /**
     * Actual data payload
     */
    private T data;

    /**
     * Timestamp when response was generated
     */
    private LocalDateTime timestamp;

    /**
     * Constructor for success responses
     */
    public ApiResponse(Boolean success, String message, Integer statusCode, T data) {
        this.success = success;
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
}
