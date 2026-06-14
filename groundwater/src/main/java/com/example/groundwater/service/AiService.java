package com.example.groundwater.service;

import com.example.groundwater.dto.GroundwaterDataDTO;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

/**
 * Service class that handles AI-powered operations using Spring AI and Groq.
 * It uses the Retrieval-Augmented Generation (RAG) pattern:
 * 1. Fetches data from MySQL database using the existing GroundwaterDataService.
 * 2. Injects this data into a structured system and user prompt context.
 * 3. Sends the prompt to Groq API.
 * 4. Returns a concise explanation back to the user.
 */
@Service
public class AiService {

    private final ChatClient chatClient;
    private final GroundwaterDataService groundwaterDataService;

    // Constructor injection for ChatClient (configured via application.properties) 
    // and GroundwaterDataService to query MySQL.
    public AiService(ChatClient chatClient, GroundwaterDataService groundwaterDataService) {
        this.chatClient = chatClient;
        this.groundwaterDataService = groundwaterDataService;
    }

    /**
     * Generates a concise groundwater stress explanation for a given district and year.
     * Uses Retrieval-Augmented Generation (RAG).
     *
     * @param district The name of the district (e.g. Pune)
     * @param year The assessment year (e.g. 2023)
     * @return Markdown-formatted concise analysis from Groq
     */
    public String explainStress(String district, Integer year) {
        // 1. Fetch live data context from database
        GroundwaterDataDTO data = groundwaterDataService.getDataByDistrictAndYear(district, year);
        if (data == null) {
            throw new RuntimeException("No data found in database for district: " + district + " and year: " + year);
        }

        // 2. Build instructions for the AI
        String systemInstruction = "You are an expert hydrogeologist and environmental analyst specialized in Indian groundwater resources. "
                + "Provide a concise explanation (between 100 to 150 words) of the groundwater stress level based on the provided data. "
                + "Format your answer in professional, easy-to-read markdown. Use bullet points where appropriate. "
                + "Do not use placeholders, and do not hallucinate numbers. Use only the data context provided below.";

        String dataContext = String.format(
                "Data Context:\n"
                + "- District: %s\n"
                + "- State: %s\n"
                + "- Year: %d\n"
                + "- Annual Recharge: %.2f Ham\n"
                + "- Extractable Resources: %.2f Ham\n"
                + "- Total Extraction: %.2f Ham\n"
                + "- Stage of Development: %.2f%%\n"
                + "- Category: %s\n"
                + "- Remarks: %s\n",
                data.getDistrict(),
                data.getState(),
                data.getYear(),
                data.getAnnualRecharge(),
                data.getExtractableResources(),
                data.getTotalExtraction(),
                data.getStageDevelopment(),
                data.getCategory(),
                data.getRemarks()
        );

        String userPrompt = String.format(
                "%s\n\n"
                + "Please explain the groundwater stress level for %s district in %d. "
                + "Include: \n"
                + "1. An assessment of its Stage of Development (%.2f%%) and current category status (%s).\n"
                + "2. Brief geological or usage-based causes for this extraction rate.\n"
                + "3. A concise recommendation for local water management (e.g., rainwater harvesting, crop selection shift). "
                + "Keep the total word count strictly between 100 and 150 words.",
                dataContext,
                data.getDistrict(),
                data.getYear(),
                data.getStageDevelopment(),
                data.getCategory()
        );

        String fullPrompt = systemInstruction + "\n\n" + userPrompt;

        // 3. Call Groq via Spring AI ChatClient
        ChatResponse response = chatClient.call(new Prompt(fullPrompt));

        // 4. Return result text
        if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
            return response.getResult().getOutput().getContent();
        } else {
            throw new RuntimeException("Could not get a valid response from the AI model.");
        }
    }

    /**
     * Compares groundwater resource metrics between two districts for a specific year.
     * Uses Retrieval-Augmented Generation (RAG).
     *
     * @param district1 The name of the first district
     * @param district2 The name of the second district
     * @param year The assessment year
     * @return Markdown-formatted concise comparison from Groq
     */
    public String compareDistricts(String district1, String district2, Integer year) {
        // 1. Fetch data for district 1
        GroundwaterDataDTO data1 = null;
        try {
            data1 = groundwaterDataService.getDataByDistrictAndYear(district1, year);
        } catch (Exception e) {
            // Handled or will throw below if null
        }
        if (data1 == null) {
            throw new RuntimeException("No groundwater data found for " + district1 + " in " + year + ".");
        }

        // 2. Fetch data for district 2
        GroundwaterDataDTO data2 = null;
        try {
            data2 = groundwaterDataService.getDataByDistrictAndYear(district2, year);
        } catch (Exception e) {
            // Handled or will throw below if null
        }
        if (data2 == null) {
            throw new RuntimeException("No groundwater data found for " + district2 + " in " + year + ".");
        }

        // 3. Build instructions & structured prompt for the AI comparison
        String systemInstruction = "You are a groundwater resource expert. "
                + "Compare the following two districts using only the provided groundwater data.\n\n"
                + "Instructions:\n"
                + "- Compare groundwater availability.\n"
                + "- Compare extraction levels.\n"
                + "- Compare stage development.\n"
                + "- Identify which district faces greater groundwater stress.\n"
                + "- Provide a concise conclusion.\n"
                + "- Use markdown formatting.\n"
                + "- Keep response strictly between 120 and 180 words.\n"
                + "- Do not hallucinate.\n"
                + "- Use only supplied data.";

        String dataContext = String.format(
                "District 1:\n"
                + "- District: %s\n"
                + "- State: %s\n"
                + "- Year: %d\n"
                + "- Annual Recharge: %.2f Ham\n"
                + "- Extractable Resources: %.2f Ham\n"
                + "- Total Extraction: %.2f Ham\n"
                + "- Stage of Development: %.2f%%\n"
                + "- Category: %s\n\n"
                + "District 2:\n"
                + "- District: %s\n"
                + "- State: %s\n"
                + "- Year: %d\n"
                + "- Annual Recharge: %.2f Ham\n"
                + "- Extractable Resources: %.2f Ham\n"
                + "- Total Extraction: %.2f Ham\n"
                + "- Stage of Development: %.2f%%\n"
                + "- Category: %s\n",
                data1.getDistrict(), data1.getState(), data1.getYear(),
                data1.getAnnualRecharge(), data1.getExtractableResources(), data1.getTotalExtraction(), data1.getStageDevelopment(), data1.getCategory(),
                data2.getDistrict(), data2.getState(), data2.getYear(),
                data2.getAnnualRecharge(), data2.getExtractableResources(), data2.getTotalExtraction(), data2.getStageDevelopment(), data2.getCategory()
        );

        String fullPrompt = systemInstruction + "\n\n" + dataContext;

        // 4. Call Groq via ChatClient
        ChatResponse response = chatClient.call(new Prompt(fullPrompt));

        // 5. Return result text
        if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
            return response.getResult().getOutput().getContent();
        } else {
            throw new RuntimeException("Could not get a valid response from the AI model.");
        }
    }

    /**
     * Compares groundwater resource summary metrics between two states for a specific year.
     * Uses Retrieval-Augmented Generation (RAG).
     *
     * @param state1 The name of the first state
     * @param state2 The name of the second state
     * @param year The assessment year
     * @return Markdown-formatted concise comparison from Groq
     */
    public String compareStates(String state1, String state2, Integer year) {
        // 1. Fetch data for state 1
        GroundwaterSummaryDTO summary1 = null;
        try {
            summary1 = groundwaterDataService.getStateSummary(state1, year);
        } catch (Exception e) {
            // Handled or will throw below if null
        }
        if (summary1 == null) {
            throw new RuntimeException("No groundwater data found for " + state1 + " in " + year + ".");
        }

        // 2. Fetch data for state 2
        GroundwaterSummaryDTO summary2 = null;
        try {
            summary2 = groundwaterDataService.getStateSummary(state2, year);
        } catch (Exception e) {
            // Handled or will throw below if null
        }
        if (summary2 == null) {
            throw new RuntimeException("No groundwater data found for " + state2 + " in " + year + ".");
        }

        // 3. Build instructions & structured prompt for the AI comparison
        String systemInstruction = "You are a groundwater resource expert. "
                + "Compare the following two states using only the provided state-level groundwater summaries.\n\n"
                + "Instructions:\n"
                + "- Compare groundwater availability (total recharge).\n"
                + "- Compare total extraction levels.\n"
                + "- Compare the average stage of development.\n"
                + "- Compare critical and overexploited districts count.\n"
                + "- Identify which state faces greater groundwater stress overall.\n"
                + "- Provide a concise conclusion.\n"
                + "- Use markdown formatting.\n"
                + "- Keep response strictly between 120 and 180 words.\n"
                + "- Do not hallucinate.\n"
                + "- Use only supplied data.";

        String dataContext = String.format(
                "State 1:\n"
                + "- State: %s\n"
                + "- Year: %d\n"
                + "- Total Annual Recharge: %.2f km3\n"
                + "- Total Annual Extraction: %.2f km3\n"
                + "- Average Stage of Development: %.2f%%\n"
                + "- Total Districts Assessed: %d\n"
                + "- Critical/Overexploited Districts: %d\n\n"
                + "State 2:\n"
                + "- State: %s\n"
                + "- Year: %d\n"
                + "- Total Annual Recharge: %.2f km3\n"
                + "- Total Annual Extraction: %.2f km3\n"
                + "- Average Stage of Development: %.2f%%\n"
                + "- Total Districts Assessed: %d\n"
                + "- Critical/Overexploited Districts: %d\n",
                summary1.getState(), summary1.getYear(),
                summary1.getTotalRecharge(), summary1.getTotalExtraction(), summary1.getAverageStageDevelopment(),
                summary1.getTotalDistricts(), summary1.getCriticalAndOverexploitedAreas(),
                summary2.getState(), summary2.getYear(),
                summary2.getTotalRecharge(), summary2.getTotalExtraction(), summary2.getAverageStageDevelopment(),
                summary2.getTotalDistricts(), summary2.getCriticalAndOverexploitedAreas()
        );

        String fullPrompt = systemInstruction + "\n\n" + dataContext;

        // 4. Call Groq via ChatClient
        ChatResponse response = chatClient.call(new Prompt(fullPrompt));

        // 5. Return result text
        if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
            return response.getResult().getOutput().getContent();
        } else {
            throw new RuntimeException("Could not get a valid response from the AI model.");
        }
    }

    /**
     * Generates AI-powered groundwater conservation recommendations for a given district and year.
     * Uses Retrieval-Augmented Generation (RAG):
     * 1. Fetches real groundwater data from MySQL via GroundwaterDataService.
     * 2. Builds a structured prompt asking for practical conservation measures.
     * 3. Sends the prompt to Groq via Spring AI ChatClient.
     * 4. Returns the markdown-formatted recommendations.
     *
     * @param district The name of the district (e.g. Kolar)
     * @param year The assessment year (e.g. 2023)
     * @return Markdown-formatted conservation recommendations from Groq
     */
    public String recommendConservationMeasures(String district, Integer year) {
        // 1. Fetch live data context from database
        GroundwaterDataDTO data = groundwaterDataService.getDataByDistrictAndYear(district, year);
        if (data == null) {
            throw new RuntimeException("No groundwater data found for " + district + " in " + year + ".");
        }

        // 2. Build the system instruction telling the AI its role and rules
        String systemInstruction = "You are a groundwater conservation expert.\n\n"
                + "Analyze the following groundwater data and recommend practical conservation measures.\n\n"
                + "Instructions:\n"
                + "1. Use only the supplied data.\n"
                + "2. Identify the groundwater risk level.\n"
                + "3. Explain the key concern.\n"
                + "4. Provide 5 practical conservation measures.\n"
                + "5. Provide short-term recommendations.\n"
                + "6. Provide long-term recommendations.\n"
                + "7. Keep response between 150 and 250 words.\n"
                + "8. Format response using markdown.\n"
                + "9. Do not hallucinate.";

        // 3. Build the data context block with all available groundwater metrics
        String dataContext = String.format(
                "District: %s\n"
                + "State: %s\n"
                + "Year: %d\n"
                + "Annual Recharge: %.2f Ham\n"
                + "Extractable Resources: %.2f Ham\n"
                + "Total Extraction: %.2f Ham\n"
                + "Stage of Development: %.2f%%\n"
                + "Category: %s\n"
                + "Remarks: %s\n",
                data.getDistrict(),
                data.getState(),
                data.getYear(),
                data.getAnnualRecharge(),
                data.getExtractableResources(),
                data.getTotalExtraction(),
                data.getStageDevelopment(),
                data.getCategory(),
                data.getRemarks()
        );

        // 4. Combine system instruction + data into a single prompt
        String fullPrompt = systemInstruction + "\n\n" + dataContext;

        // 5. Call Groq via Spring AI ChatClient
        ChatResponse response = chatClient.call(new Prompt(fullPrompt));

        // 6. Return result text
        if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
            return response.getResult().getOutput().getContent();
        } else {
            throw new RuntimeException("Could not get a valid response from the AI model.");
        }
    }
}
