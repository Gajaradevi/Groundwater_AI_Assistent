package com.example.groundwater.config;

import java.util.HashMap;
import java.util.Map;

/**
 * Static lookup configuration containing latitude and longitude coordinates
 * for districts to support plotting markers on the Leaflet map.
 */
public class DistrictCoordinates {

    private static final Map<String, double[]> COORDINATES = new HashMap<>();

    static {
        // Maharashtra
        COORDINATES.put("pune", new double[]{18.5204, 73.8567});
        COORDINATES.put("nashik", new double[]{19.9975, 73.7898});
        COORDINATES.put("ahmednagar", new double[]{19.0948, 74.7480});
        COORDINATES.put("aurangabad", new double[]{19.8762, 75.3433});
        COORDINATES.put("nagpur", new double[]{21.1458, 79.0882});

        // Karnataka
        COORDINATES.put("bengaluru", new double[]{12.9716, 77.5946});
        COORDINATES.put("mysore", new double[]{12.2958, 76.6394});
        COORDINATES.put("belgaum", new double[]{15.8497, 74.4977});
        COORDINATES.put("gulbarga", new double[]{17.3297, 76.8343});

        // Telangana
        COORDINATES.put("hyderabad", new double[]{17.3850, 78.4867});
        COORDINATES.put("ranga reddy", new double[]{17.2000, 78.1500});
        COORDINATES.put("medak", new double[]{18.0300, 78.2600});
        COORDINATES.put("warangal", new double[]{18.0000, 79.5800});

        // Uttar Pradesh
        COORDINATES.put("agra", new double[]{27.1767, 78.0081});
        COORDINATES.put("lucknow", new double[]{26.8467, 80.9462});
        COORDINATES.put("kanpur", new double[]{26.4499, 80.3319});
        COORDINATES.put("varanasi", new double[]{25.3176, 82.9739});

        // Rajasthan
        COORDINATES.put("jaipur", new double[]{26.9124, 75.7873});
        COORDINATES.put("jodhpur", new double[]{26.2389, 73.0243});
        COORDINATES.put("udaipur", new double[]{24.5854, 73.7125});
    }

    /**
     * Get latitude and longitude for a district.
     * Returns center of India if district is not found.
     *
     * @param district District name
     * @return double array of [latitude, longitude]
     */
    public static double[] getCoordinates(String district) {
        if (district == null) {
            return new double[]{20.5937, 78.9629}; // Center of India
        }
        double[] coords = COORDINATES.get(district.trim().toLowerCase());
        if (coords == null) {
            // Generates a slightly offset coordinate around central India to avoid overlapping markers
            double hashOffset = (double) (district.hashCode() % 100) / 50.0;
            return new double[]{20.5937 + hashOffset, 78.9629 + hashOffset};
        }
        return coords;
    }
}
