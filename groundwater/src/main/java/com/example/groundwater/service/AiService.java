package com.example.groundwater.service;

import com.example.groundwater.dto.*;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class that handles AI-powered operations using Spring AI and Groq.
 * It uses the Retrieval-Augmented Generation (RAG) pattern with fallback options.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private final ChatClient chatClient;
    private final GroundwaterDataService groundwaterDataService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiService(ChatClient chatClient, GroundwaterDataService groundwaterDataService) {
        this.chatClient = chatClient;
        this.groundwaterDataService = groundwaterDataService;
    }

    /**
     * Generates a concise groundwater stress explanation for a given district and year.
     * Uses Retrieval-Augmented Generation (RAG).
     */
    public String explainStress(String district, Integer year) {
        GroundwaterDataDTO data;
        try {
            data = groundwaterDataService.getDataByDistrictAndYear(district, year);
        } catch (Exception e) {
            log.error("Database query failed in explainStress: {}", e.getMessage());
            return String.format("**Database Error:** Unable to retrieve data for district %s in year %d.", district, year);
        }

        if (data == null) {
            return String.format("**No Data:** No record found in database for district: %s, year: %d.", district, year);
        }

        String systemInstruction = "You are an expert hydrogeologist specialized in Indian groundwater resources. "
                + "Provide a concise explanation (between 100 to 150 words) of the groundwater stress level based on the data. "
                + "Format in professional markdown using bullet points. Do not hallucinate numbers.";

        String userPrompt = String.format(
                "Data Context:\n"
                + "- District: %s, State: %s, Year: %d\n"
                + "- Recharge: %.2f Ham, Extraction: %.2f Ham\n"
                + "- Stage of Development: %.2f%%, Category: %s, Remarks: %s\n\n"
                + "Please explain the groundwater stress level. Assess the stage of development, category, and usage-based causes.",
                data.getDistrict(), data.getState(), data.getYear(),
                data.getAnnualRecharge(), data.getTotalExtraction(),
                data.getStageDevelopment(), data.getCategory(), data.getRemarks()
        );

        String fullPrompt = systemInstruction + "\n\n" + userPrompt;

        try {
            log.info("Groq request started for explainStress - District: {}, Year: {}", district, year);
            ChatResponse response = chatClient.call(new Prompt(fullPrompt));
            log.info("Groq response received successfully for explainStress");

            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getContent();
            } else {
                throw new RuntimeException("Empty response from AI client");
            }
        } catch (Exception e) {
            log.error("Groq request failed in explainStress, returning fallback: {}", e.getMessage());
            return String.format(
                "### Groundwater Stress Summary (Fallback)\n\n"
                + "* **District:** %s (%s)\n"
                + "* **Assessment Year:** %d\n"
                + "* **Stage of Development:** %.2f%% (%s)\n"
                + "* **Resource Metrics:** Annual recharge of %.2f Ham vs. Total annual extraction of %.2f Ham.\n"
                + "* **Status:** Classified as **%s**. *Note: AI-generated insights are currently unavailable due to Groq service limits or configuration issues.*",
                data.getDistrict(), data.getState(), data.getYear(),
                data.getStageDevelopment(), data.getCategory(),
                data.getAnnualRecharge(), data.getTotalExtraction(), data.getCategory()
            );
        }
    }

    /**
     * Compares groundwater resource metrics between two districts for a specific year.
     */
    public String compareDistricts(String district1, String district2, Integer year) {
        GroundwaterDataDTO data1 = null;
        GroundwaterDataDTO data2 = null;
        try {
            data1 = groundwaterDataService.getDataByDistrictAndYear(district1, year);
            data2 = groundwaterDataService.getDataByDistrictAndYear(district2, year);
        } catch (Exception e) {
            log.error("Database query failed in compareDistricts: {}", e.getMessage());
        }

        if (data1 == null || data2 == null) {
            return "**Comparison Error:** Unable to retrieve data for one or both districts for comparison.";
        }

        String systemInstruction = "You are a groundwater resource expert. Compare the following two districts. "
                + "Compare availability, extraction, stage of development, and identify which district faces greater stress. "
                + "Keep response strictly between 120 and 180 words, formatted in markdown.";

        String dataContext = String.format(
                "District 1:\n- Name: %s, State: %s, Stage: %.2f%%, Category: %s, Extraction: %.2f Ham\n\n"
                + "District 2:\n- Name: %s, State: %s, Stage: %.2f%%, Category: %s, Extraction: %.2f Ham\n",
                data1.getDistrict(), data1.getState(), data1.getStageDevelopment(), data1.getCategory(), data1.getTotalExtraction(),
                data2.getDistrict(), data2.getState(), data2.getStageDevelopment(), data2.getCategory(), data2.getTotalExtraction()
        );

        String fullPrompt = systemInstruction + "\n\n" + dataContext;

        try {
            log.info("Groq request started for compareDistricts - {} vs {} ({})", district1, district2, year);
            ChatResponse response = chatClient.call(new Prompt(fullPrompt));
            log.info("Groq response received successfully for compareDistricts");

            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getContent();
            } else {
                throw new RuntimeException("Empty response from AI client");
            }
        } catch (Exception e) {
            log.error("Groq request failed in compareDistricts, returning fallback: {}", e.getMessage());
            GroundwaterDataDTO moreStressed = (data1.getStageDevelopment() > data2.getStageDevelopment()) ? data1 : data2;
            GroundwaterDataDTO lessStressed = (moreStressed == data1) ? data2 : data1;
            return String.format(
                "### District Comparison Summary (Fallback)\n\n"
                + "A comparative analysis between **%s** (%s) and **%s** (%s) in %d shows:\n\n"
                + "* **Water Stress Index:** **%s** has a higher Stage of Development of **%.2f%%** (%s) compared to **%s** with **%.2f%%** (%s).\n"
                + "* **Volumetric Extraction:** **%s** extracts %.2f Ham of groundwater annually, while **%s** extracts %.2f Ham.\n"
                + "* **Stress Evaluation:** **%s** exhibits higher vulnerability and groundwater risk than **%s**.\n"
                + "*Note: Detailed AI comparative text is unavailable due to Groq service status.*",
                data1.getDistrict(), data1.getState(), data2.getDistrict(), data2.getState(), year,
                moreStressed.getDistrict(), moreStressed.getStageDevelopment(), moreStressed.getCategory(),
                lessStressed.getDistrict(), lessStressed.getStageDevelopment(), lessStressed.getCategory(),
                data1.getDistrict(), data1.getTotalExtraction(), data2.getDistrict(), data2.getTotalExtraction(),
                moreStressed.getDistrict(), lessStressed.getDistrict()
            );
        }
    }

    /**
     * Compares groundwater resource summary metrics between two states for a specific year.
     */
    public String compareStates(String state1, String state2, Integer year) {
        GroundwaterSummaryDTO summary1 = null;
        GroundwaterSummaryDTO summary2 = null;
        try {
            summary1 = groundwaterDataService.getStateSummary(state1, year);
            summary2 = groundwaterDataService.getStateSummary(state2, year);
        } catch (Exception e) {
            log.error("Database query failed in compareStates: {}", e.getMessage());
        }

        if (summary1 == null || summary2 == null) {
            return "**Comparison Error:** Unable to retrieve state-level data summaries for comparison.";
        }

        String systemInstruction = "You are a groundwater resource expert. Compare the following two states using state summaries. "
                + "Compare recharge, extraction, average stage development, and count of critical areas. "
                + "Keep response strictly between 120 and 180 words, formatted in markdown.";

        String dataContext = String.format(
                "State 1:\n- State: %s, Avg Stage: %.2f%%, Districts: %d, Critical/OE: %d, Total Extraction: %.2f km3\n\n"
                + "State 2:\n- State: %s, Avg Stage: %.2f%%, Districts: %d, Critical/OE: %d, Total Extraction: %.2f km3\n",
                summary1.getState(), summary1.getAverageStageDevelopment(), summary1.getTotalDistricts(), summary1.getCriticalAndOverexploitedAreas(), summary1.getTotalExtraction(),
                summary2.getState(), summary2.getAverageStageDevelopment(), summary2.getTotalDistricts(), summary2.getCriticalAndOverexploitedAreas(), summary2.getTotalExtraction()
        );

        String fullPrompt = systemInstruction + "\n\n" + dataContext;

        try {
            log.info("Groq request started for compareStates - {} vs {} ({})", state1, state2, year);
            ChatResponse response = chatClient.call(new Prompt(fullPrompt));
            log.info("Groq response received successfully for compareStates");

            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getContent();
            } else {
                throw new RuntimeException("Empty response from AI client");
            }
        } catch (Exception e) {
            log.error("Groq request failed in compareStates, returning fallback: {}", e.getMessage());
            GroundwaterSummaryDTO moreStressed = (summary1.getAverageStageDevelopment() > summary2.getAverageStageDevelopment()) ? summary1 : summary2;
            GroundwaterSummaryDTO lessStressed = (moreStressed == summary1) ? summary2 : summary1;
            return String.format(
                "### State Summary Comparison (Fallback)\n\n"
                + "Comparing state-wide metrics for **%s** and **%s** in %d:\n\n"
                + "* **Average Water Development:** **%s** averages **%.2f%%** stage of development compared to **%s**'s average of **%.2f%%**.\n"
                + "* **Critical Regions:** **%s** has **%d** critical/overexploited districts out of %d, while **%s** has **%d** out of %d.\n"
                + "* **Extraction Scale:** Total annual extraction is %.2f km³ for %s and %.2f km³ for %s.\n"
                + "*Note: Fully detailed AI analysis is offline at the moment.*",
                summary1.getState(), summary2.getState(), year,
                summary1.getState(), summary1.getAverageStageDevelopment(), summary2.getState(), summary2.getAverageStageDevelopment(),
                summary1.getState(), summary1.getCriticalAndOverexploitedAreas(), summary1.getTotalDistricts(),
                summary2.getState(), summary2.getCriticalAndOverexploitedAreas(), summary2.getTotalDistricts(),
                summary1.getTotalExtraction(), summary1.getState(), summary2.getTotalExtraction(), summary2.getState()
            );
        }
    }

    /**
     * Generates AI-powered groundwater conservation recommendations for a district.
     */
    public String recommendConservationMeasures(String district, Integer year) {
        GroundwaterDataDTO data;
        try {
            data = groundwaterDataService.getDataByDistrictAndYear(district, year);
        } catch (Exception e) {
            log.error("Database query failed in recommendConservationMeasures: {}", e.getMessage());
            return "**Database Error:** Unable to retrieve data for recommendations.";
        }

        if (data == null) {
            return "**No Data:** Groundwater data missing for conservation planning.";
        }

        String systemInstruction = "You are a groundwater conservation expert. Provide 5 practical conservation measures based on the data. "
                + "Include short-term and long-term actions. Keep between 150 and 250 words in markdown bullet points.";

        String dataContext = String.format(
                "District: %s, State: %s, Year: %d\n"
                + "Stage of Development: %.2f%%, Category: %s, Remarks: %s\n",
                data.getDistrict(), data.getState(), data.getYear(),
                data.getStageDevelopment(), data.getCategory(), data.getRemarks()
        );

        String fullPrompt = systemInstruction + "\n\n" + dataContext;

        try {
            log.info("Groq request started for recommendConservationMeasures - District: {}", district);
            ChatResponse response = chatClient.call(new Prompt(fullPrompt));
            log.info("Groq response received successfully for recommendConservationMeasures");

            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getContent();
            } else {
                throw new RuntimeException("Empty response from AI client");
            }
        } catch (Exception e) {
            log.error("Groq request failed in recommendConservationMeasures, returning fallback: {}", e.getMessage());
            return String.format(
                "### Conservation Recommendations (Fallback for %s)\n\n"
                + "Because the stage of development is **%.2f%%** (%s), the following standard conservation protocols should be deployed:\n\n"
                + "1. **Rainwater Harvesting:** Mandatory installation of rooftop rainwater harvesting systems in all municipal and commercial buildings.\n"
                + "2. **Agricultural Efficiency:** Implement micro-irrigation systems (drip and sprinkler) for crops to reduce agricultural draft by up to 30%%.\n"
                + "3. **Aquifer Recharge:** Build community check dams and recharge shafts to direct monsoon runoff back into shallow aquifers.\n"
                + "4. **Crop Diversification:** Restrict cultivation of water-intensive crops (e.g., sugarcane, paddy) and transition to millets or oilseeds.\n"
                + "5. **Community Audits:** Set up block-level water governance committees to monitor local water tables and extraction volumes daily.",
                data.getDistrict(), data.getStageDevelopment(), data.getCategory()
            );
        }
    }

    /**
     * Generates a comprehensive 6-section groundwater report response DTO
     */
    public ReportResponseDTO generateReport(ReportRequest request) {
        StringBuilder context = new StringBuilder();
        String title = "";
        String reportTypeStr = request.getReportType();

        if ("DISTRICT".equalsIgnoreCase(reportTypeStr)) {
            String district = request.getDistrict();
            Integer year = request.getYear() != null ? request.getYear() : 2023;
            title = "Groundwater Assessment Report: " + district + " (" + year + ")";
            try {
                GroundwaterDataDTO data = groundwaterDataService.getDataByDistrictAndYear(district, year);
                context.append(String.format("District: %s\nState: %s\nYear: %d\nAnnual Recharge: %.2f km3\nExtractable Resources: %.2f km3\nTotal Extraction: %.2f km3\nStage of Development: %.2f%%\nCategory: %s\nRemarks: %s\n",
                        data.getDistrict(), data.getState(), data.getYear(), data.getAnnualRecharge(),
                        data.getExtractableResources(), data.getTotalExtraction(), data.getStageDevelopment(),
                        data.getCategory(), data.getRemarks()));
            } catch (Exception e) {
                context.append("No specific data found for district: ").append(district).append(" and year: ").append(year);
            }
        } else if ("STATE".equalsIgnoreCase(reportTypeStr)) {
            String state = request.getState();
            Integer year = request.getYear() != null ? request.getYear() : 2023;
            title = "State Groundwater Resource Report: " + state + " (" + year + ")";
            try {
                GroundwaterSummaryDTO summary = groundwaterDataService.getStateSummary(state, year);
                context.append(String.format("State: %s\nYear: %d\nTotal Districts Assessed: %d\nTotal Annual Recharge: %.2f km3\nTotal Annual Extraction: %.2f km3\nAverage Stage of Development: %.2f%%\nCritical/Overexploited Districts Count: %d\n",
                        summary.getState(), summary.getYear(), summary.getTotalDistricts(), summary.getTotalRecharge(),
                        summary.getTotalExtraction(), summary.getAverageStageDevelopment(), summary.getCriticalAndOverexploitedAreas()));
                
                List<GroundwaterDataDTO> districts = groundwaterDataService.getDataByState(state).stream()
                        .filter(d -> d.getYear().equals(year))
                        .collect(Collectors.toList());
                context.append("\nDistrict Details:\n");
                for (GroundwaterDataDTO d : districts) {
                    context.append(String.format("- %s: Stage: %.1f%%, Category: %s\n", d.getDistrict(), d.getStageDevelopment(), d.getCategory()));
                }
            } catch (Exception e) {
                context.append("No specific summary data found for state: ").append(state).append(" and year: ").append(year);
            }
        } else if ("COMPARATIVE".equalsIgnoreCase(reportTypeStr)) {
            String dist1 = request.getDistrict();
            String dist2 = request.getCompareDistrict();
            Integer year = request.getYear() != null ? request.getYear() : 2023;
            title = "Comparative Groundwater Assessment: " + dist1 + " vs " + dist2 + " (" + year + ")";
            
            try {
                GroundwaterDataDTO d1 = groundwaterDataService.getDataByDistrictAndYear(dist1, year);
                context.append(String.format("Entity 1: %s (%s)\nStage Development: %.2f%%\nCategory: %s\nAnnual Recharge: %.2f km3\nTotal Extraction: %.2f km3\n\n",
                        d1.getDistrict(), d1.getState(), d1.getStageDevelopment(), d1.getCategory(), d1.getAnnualRecharge(), d1.getTotalExtraction()));
            } catch (Exception e) {}
            try {
                GroundwaterDataDTO d2 = groundwaterDataService.getDataByDistrictAndYear(dist2, year);
                context.append(String.format("Entity 2: %s (%s)\nStage Development: %.2f%%\nCategory: %s\nAnnual Recharge: %.2f km3\nTotal Extraction: %.2f km3\n",
                        d2.getDistrict(), d2.getState(), d2.getStageDevelopment(), d2.getCategory(), d2.getAnnualRecharge(), d2.getTotalExtraction()));
            } catch (Exception e) {}
        } else if ("TREND".equalsIgnoreCase(reportTypeStr)) {
            String district = request.getDistrict();
            title = "Historical Groundwater Trend Analysis: " + district;
            try {
                List<GroundwaterDataDTO> trends = groundwaterDataService.getTrendAnalysis(district, 2020, 2023);
                context.append("Historical Trend Data for ").append(district).append(":\n");
                for (GroundwaterDataDTO d : trends) {
                    context.append(String.format("- Year %d: Recharge: %.2f km3, Extraction: %.2f km3, Stage: %.2f%%, Category: %s\n",
                             d.getYear(), d.getAnnualRecharge(), d.getTotalExtraction(), d.getStageDevelopment(), d.getCategory()));
                }
            } catch (Exception e) {
                context.append("No historical trend data found for ").append(district);
            }
        }

        String systemInstruction = "You are a professional environmental analyst. "
                + "Generate a detailed groundwater assessment report based on the provided data context. "
                + "You MUST return your response as a valid, parsable JSON object matching this schema exactly:\n"
                + "{\n"
                + "  \"title\": \"String - Professional title of the report\",\n"
                + "  \"executiveSummary\": \"String - Professional executive summary containing 2-3 key bullet points or short paragraphs\",\n"
                + "  \"statistics\": \"String - Detailed summary of region's statistics with bullet points\",\n"
                + "  \"findings\": \"String - 3 detailed findings about the region's groundwater draft and resources\",\n"
                + "  \"recommendations\": \"String - 4 actionable recommendations for water conservation and management\",\n"
                + "  \"conclusion\": \"String - Closing remarks and outlook\"\n"
                + "}\n"
                + "Do NOT wrap the output in markdown code blocks like ```json. Return only the raw JSON string starting with { and ending with }.";

        String userPrompt = "Report Title: " + title + "\n\nData Context:\n" + context.toString() + "\n\nPlease generate the structured JSON report.";
        String fullPrompt = systemInstruction + "\n\n" + userPrompt;

        try {
            log.info("Groq request started for generateReport - Type: {}, Context Length: {}", reportTypeStr, context.length());
            ChatResponse response = chatClient.call(new Prompt(fullPrompt));
            log.info("Groq response received successfully for generateReport");

            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                String rawJson = response.getResult().getOutput().getContent().trim();
                // Strip code fence if the LLM wrapped it anyway
                if (rawJson.startsWith("```")) {
                    rawJson = rawJson.replaceAll("^```json\\s*", "").replaceAll("```$", "").trim();
                }
                return objectMapper.readValue(rawJson, ReportResponseDTO.class);
            } else {
                throw new RuntimeException("Empty response from AI client");
            }
        } catch (Exception e) {
            log.error("Groq request failed or JSON parsing failed in generateReport: {}, returning fallback report", e.getMessage());
            return generateFallbackReport(request, title, context.toString());
        }
    }

    /**
     * Helper to generate a fallback ReportResponseDTO
     */
    private ReportResponseDTO generateFallbackReport(ReportRequest request, String title, String dataContext) {
        String execSummary = String.format(
            "This is a fallback summary prepared automatically from the groundwater database. The AI analysis engine is currently offline or unreachable. "
            + "The assessment evaluated the regional parameters for the specified criteria (%s). Based on historical records, water extraction levels "
            + "in highly developed zones exceed recommended thresholds, demanding immediate planning.", request.getReportType()
        );

        String stats = dataContext.isEmpty() ? "No database records were accessible for this specific configuration."
                : dataContext.replace("\n", "\n* ");

        String findings = 
            "* Groundwater recharge levels fluctuate depending on monsoon intensity and urban development trends.\n"
            + "* Over-reliance on tube wells for farming constitutes the primary driver of water table decline.\n"
            + "* Aquifer replenishment rates are insufficient to offset current municipal extraction volumes.";

        String recommendations = 
            "* mandatory installation of localized artificial groundwater recharge mechanisms.\n"
            + "* Policy support for switching from high-water crops like sugarcane to climate-resilient pulses.\n"
            + "* Community-led micro-irrigation campaigns to achieve a 20-30% reduction in agricultural draft.\n"
            + "* Deployment of Leaflet-based spatial trackers to monitor regional groundwater extraction tables.";

        String conclusion = "In conclusion, immediate municipal and rural conservation action is recommended to stabilize water levels. AI-guided modeling should be run when Groq is available.";

        return new ReportResponseDTO(title, execSummary, stats, findings, recommendations, conclusion);
    }

    /**
     * Generates concise summary of national analytics trends
     */
    public String generateAnalyticsInsights(List<GroundwaterDataDTO> topRisk,
                                            List<GroundwaterDataDTO> topSafe) {
        StringBuilder context = new StringBuilder();
        context.append("Top Risk Districts:\n");
        for (int i = 0; i < Math.min(5, topRisk.size()); i++) {
            GroundwaterDataDTO r = topRisk.get(i);
            context.append(String.format("- %s, %s: Stage: %.1f%%, Category: %s\n",
                    r.getDistrict(), r.getState(), r.getStageDevelopment(), r.getCategory()));
        }
        context.append("\nTop Safe Districts:\n");
        for (int i = 0; i < Math.min(5, topSafe.size()); i++) {
            GroundwaterDataDTO r = topSafe.get(i);
            context.append(String.format("- %s, %s: Stage: %.1f%%, Category: %s\n",
                    r.getDistrict(), r.getState(), r.getStageDevelopment(), r.getCategory()));
        }

        String systemInstruction = "You are an expert hydrogeologist. Summarize the overall groundwater stress trends in India based on the risk data. "
                + "Provide a concise summary card (between 100 and 150 words) with key observations. Format your output in professional markdown with 2-3 key bullet points. Do not hallucinate.";

        String fullPrompt = systemInstruction + "\n\nData Context:\n" + context.toString();
        try {
            log.info("Groq request started for generateAnalyticsInsights");
            ChatResponse response = chatClient.call(new Prompt(fullPrompt));
            log.info("Groq response received successfully for generateAnalyticsInsights");

            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                return response.getResult().getOutput().getContent();
            } else {
                throw new RuntimeException("Empty response from AI client");
            }
        } catch (Exception e) {
            log.error("Groq request failed in generateAnalyticsInsights, returning fallback: {}", e.getMessage());
            return "### Key Groundwater Observations (Fallback)\n\n"
                    + "* **Critical Stress Concentrations:** High stage of development (exceeding 100%) is concentrated in specific districts, indicating that water extraction exceeds natural recharge rates.\n"
                    + "* **Resource Imbalance:** Safe zones reside mostly in areas with high rainfall and lower population density, displaying stages of development below 30%.\n"
                    + "* **Mitigation Need:** Systemic shifts to sustainable agriculture and mandatory rain harvesting are vital in high-risk zones.";
        }
    }
}
