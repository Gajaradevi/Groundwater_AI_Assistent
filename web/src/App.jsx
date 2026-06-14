import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { useChatHistory } from './hooks/useChatHistory';
import { apiService } from './services/api';
import { parseQuery } from './services/queryParser';

/**
 * Main App Component (Phase 3.5)
 * Acts as the top-level orchestrator of the application:
 * - Integrates the useChatHistory hook to maintain multi-session conversations.
 * - Handles the toggle state of the collapsible left sidebar.
 * - Processes query submissions: calls the smart parser, triggers Axios API requests,
 *   handles HTTP response status codes/exceptions, and appends user/bot messages.
 */
function App() {
  const {
    sessions,
    activeSessionId,
    activeSession,
    createNewSession,
    switchSession,
    deleteSession,
    addMessagesToActiveSession,
    replaceLastBotMessage
  } = useChatHistory();

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Querying database...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /**
   * Processes the natural language query, performs the live REST call to the Spring Boot
   * backend, handles empty results/network exceptions, and appends response cards to the log.
   * @param {string} text - User inputted query text.
   */
  const submitMessage = async (text, isRegenerate = false) => {
    if (!text.trim()) return;

    if (!isRegenerate) {
      // 1. Add the User's Message to the chat session log immediately
      const userMsg = {
        id: Date.now(),
        text: text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessagesToActiveSession([userMsg]);
    } else {
      setLoadingText('Regenerating analysis...');
    }

    // 2. Parse the Query using the Smart Parser
    const query = parseQuery(text);
    if (query) {
      console.log("Detected query type:", query.type);
      if (query.type === 'ai-compare') {
        console.log("Extracted districts:", { district1: query.params.district1, district2: query.params.district2, year: query.params.year });
      } else if (query.type === 'ai-compare-states') {
        console.log("Extracted states:", { state1: query.params.state1, state2: query.params.state2, year: query.params.year });
      }
    }
    if (!query) {
      // If query cannot be determined, reply with a clean helper prompt bubble
      setLoading(true);
      if (isRegenerate) {
        setLoadingText('Regenerating analysis...');
      } else {
        setLoadingText('Querying database...');
      }
      setTimeout(() => {
        const fallbackMsg = {
          id: Date.now() + 1,
          text: "I couldn't identify the specific district, state, or category in your request. Try asking something like:\n\n• \"Explain stress in Pune in 2023\"\n• \"Show data for Pune in 2023\"\n• \"Show data for Karnataka\"\n• \"Show critical areas in Rajasthan in 2023\"\n• \"Show trends for Hyderabad\"\n• \"Recommend conservation measures for Kolar in 2023\"\n• \"Compare Pune and Nashik in 2023\"",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        if (isRegenerate) {
          replaceLastBotMessage(fallbackMsg);
        } else {
          addMessagesToActiveSession([fallbackMsg]);
        }
        setLoading(false);
      }, 500);
      return;
    }

    // Set custom loader message based on query type
    if (isRegenerate) {
      setLoadingText('Regenerating analysis...');
    } else if (query.type === 'ai-compare' || query.type === 'ai-compare-states') {
      setLoadingText('Generating AI comparison analysis...');
    } else if (query.type === 'ai-recommendations') {
      setLoadingText('Generating conservation recommendations...');
    } else if (query.type && query.type.startsWith('ai-')) {
      setLoadingText('Generating AI analysis...');
    } else if (query.type === 'critical-areas') {
      setLoadingText('Finding critical groundwater areas...');
    } else {
      setLoadingText('Querying database...');
    }
    setLoading(true);

    try {
      let botResponse = {
        id: Date.now() + 1,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        queryType: query.type,
        queryParams: query.params
      };

      // 3. Query the appropriate backend endpoint using the apiService client
      switch (query.type) {
        case 'ai-recommendations': {
          const { district, year } = query.params;
          console.log(`Selected API endpoint: apiService.getAiRecommendations("${district}", ${year})`);
          const result = await apiService.getAiRecommendations(district, year);
          if (result.success && result.data) {
            botResponse.text = result.data;
            botResponse.isAiResponse = true;
          } else {
            botResponse.text = `No groundwater data found for ${district} in ${year} to generate recommendations.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'ai-compare': {
          const { district1, district2, year } = query.params;
          console.log(`Selected API endpoint: apiService.getAiComparison("${district1}", "${district2}", ${year})`);
          const result = await apiService.getAiComparison(district1, district2, year);
          if (result.success && result.data) {
            botResponse.text = result.data;
            botResponse.isAiResponse = true;
          } else {
            botResponse.text = `No groundwater comparison data found for ${district1} and ${district2} in ${year}.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'ai-compare-states': {
          const { state1, state2, year } = query.params;
          console.log(`Selected API endpoint: apiService.getAiStateComparison("${state1}", "${state2}", ${year})`);
          const result = await apiService.getAiStateComparison(state1, state2, year);
          if (result.success && result.data) {
            botResponse.text = result.data;
            botResponse.isAiResponse = true;
          } else {
            botResponse.text = `No groundwater comparison data found for ${state1} and ${state2} in ${year}.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'ai-explain-stress': {
          const { district, year } = query.params;
          console.log(`Selected API endpoint: apiService.getAiStressExplanation("${district}", ${year})`);
          const result = await apiService.getAiStressExplanation(district, year);
          if (result.success && result.data) {
            botResponse.text = result.data;
            botResponse.isAiResponse = true;
          } else {
            botResponse.text = `No groundwater stress explanation found for ${district} in ${year}.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'district-year': {
          const { district, year } = query.params;
          console.log(`Selected API endpoint: apiService.getDistrictYearData("${district}", ${year})`);
          const result = await apiService.getDistrictYearData(district, year);
          if (result.success && result.data) {
            botResponse.text = `Here is the groundwater assessment card for **${district}** (${year}):`;
            botResponse.cardData = result.data;
          } else {
            botResponse.text = `No groundwater data found for ${district} in ${year}.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'district': {
          const { district } = query.params;
          const result = await apiService.getDistrictData(district);
          if (result.success && result.data && result.data.length > 0) {
            botResponse.text = `Found **${result.data.length}** historical records for **${district}** district:`;
            botResponse.listData = result.data.map(item => ({
              title: `Year ${item.year}`,
              subtitle: `Category: ${item.category} • Development Stage: ${item.stageDevelopment}%`,
              value: `${item.totalExtraction} / ${item.extractableResources} km³`
            }));
          } else {
            botResponse.text = `No historical data found for district **${district}**.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'state': {
          const { state } = query.params;
          const result = await apiService.getStateData(state);
          if (result.success && result.data && result.data.length > 0) {
            botResponse.text = `Here is the district-wise groundwater data in **${state}**:`;
            botResponse.listData = result.data.map(item => ({
              title: `${item.district} (${item.year})`,
              subtitle: `Category: ${item.category}`,
              value: `${item.stageDevelopment}%`
            }));
          } else {
            botResponse.text = `No data found for state **${state}**.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'state-year-summary': {
          const { state, year } = query.params;
          const result = await apiService.getStateData(state);
          if (result.success && result.data && result.data.length > 0) {
            // Filter by selected year
            const yearData = result.data.filter(item => item.year === year);
            if (yearData.length > 0) {
              const totalRecharge = yearData.reduce((sum, item) => sum + item.annualRecharge, 0);
              const totalExtraction = yearData.reduce((sum, item) => sum + item.totalExtraction, 0);
              const avgStage = yearData.reduce((sum, item) => sum + item.stageDevelopment, 0) / yearData.length;
              const criticalCount = yearData.filter(item => item.category === 'CRITICAL' || item.category === 'OVER_EXPLOITED').length;

              botResponse.text = `Summary statistics for **${state}** in **${year}**:`;
              botResponse.listData = [
                { title: 'Total Districts Assessed', value: `${yearData.length}` },
                { title: 'Total Annual Recharge', value: `${totalRecharge.toFixed(2)} km³` },
                { title: 'Total Extraction', value: `${totalExtraction.toFixed(2)} km³` },
                { title: 'Average Stage of Development', value: `${avgStage.toFixed(2)}%` },
                { title: 'Critical & Overexploited Areas', value: `${criticalCount} districts` }
              ];
            } else {
              botResponse.text = `No summary data found for **${state}** in year **${year}**.`;
              botResponse.isEmpty = true;
            }
          } else {
            botResponse.text = `No data found for state **${state}**.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'year': {
          const { year } = query.params;
          const result = await apiService.getYearData(year);
          if (result.success && result.data && result.data.length > 0) {
            botResponse.text = `Found **${result.data.length}** groundwater records for year **${year}**:`;
            botResponse.listData = result.data.map(item => ({
              title: `${item.district}, ${item.state}`,
              subtitle: `Category: ${item.category}`,
              value: `${item.stageDevelopment}%`
            }));
          } else {
            botResponse.text = `No records found for year **${year}**.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'critical-areas': {
          const { state, year } = query.params;
          const result = await apiService.getCriticalAreas(state, year);
          if (result.success && result.data && result.data.length > 0) {
            botResponse.text = `Found **${result.data.length}** critical or over-exploited districts in **${state}** (${year}):`;
            botResponse.listData = result.data.map(item => ({
              title: item.district,
              subtitle: `Category: ${item.category} • Recharge: ${item.annualRecharge} km³`,
              value: `${item.stageDevelopment}%`
            }));
          } else {
            botResponse.text = `No critical/over-exploited areas found in **${state}** for year **${year}**.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'trends': {
          const { district, startYear, endYear } = query.params;
          const result = await apiService.getTrendAnalysis(district, startYear, endYear);
          if (result.success && result.data && result.data.length > 0) {
            botResponse.text = `Historical trend analysis for **${district}** (${startYear} - ${endYear}):`;
            botResponse.listData = result.data.map(item => ({
              title: `Year ${item.year}`,
              subtitle: `Extraction: ${item.totalExtraction} km³ / Recharge: ${item.annualRecharge} km³`,
              value: `${item.stageDevelopment}%`
            }));
            botResponse.trendRawData = result.data;
          } else {
            botResponse.text = `No trend analysis data available for **${district}** between **${startYear}** and **${endYear}**.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        case 'category': {
          const { category } = query.params;
          const result = await apiService.getCategoryData(category);
          if (result.success && result.data && result.data.length > 0) {
            botResponse.text = `Found **${result.data.length}** areas categorized as **${category}**:`;
            botResponse.listData = result.data.map(item => ({
              title: `${item.district}, ${item.state}`,
              subtitle: `Year: ${item.year}`,
              value: `${item.stageDevelopment}%`
            }));
          } else {
            botResponse.text = `No records found under category **${category}**.`;
            botResponse.isEmpty = true;
          }
          break;
        }

        default:
          botResponse.text = "Query type not supported yet.";
      }

      if (isRegenerate) {
        replaceLastBotMessage(botResponse);
      } else {
        addMessagesToActiveSession([botResponse]);
      }

    } catch (error) {
      console.error("API call error:", error);
      let text = "Failed to communicate with the groundwater API server.";
      let isError = true;
      let isEmpty = false;

      // Handle Axios error responses if the server responded with an error (e.g. 500/404)
      if (error.response) {
        isError = false;
        isEmpty = true;

        if (query && query.type === 'ai-recommendations') {
          const { district, year } = query.params;
          text = error.response.data?.message || `No groundwater data found for ${district} in ${year} to generate recommendations.`;
        } else if (query && (query.type === 'ai-compare' || query.type === 'ai-compare-states')) {
          text = error.response.data?.message || "No groundwater data found for the requested query.";
        } else if (query && query.type === 'ai-explain-stress') {
          const { district, year } = query.params;
          text = `No groundwater data found for ${district} in ${year} to explain stress.`;
        } else if (query && query.type === 'district-year') {
          const { district, year } = query.params;
          text = `No groundwater data found for ${district} in ${year}.`;
        } else if (query && query.type === 'district') {
          const { district } = query.params;
          text = `No historical data found for district ${district}.`;
        } else if (query && query.type === 'state') {
          const { state } = query.params;
          text = `No data found for state ${state}.`;
        } else if (query && query.type === 'state-year-summary') {
          const { state, year } = query.params;
          text = `No summary data found for ${state} in year ${year}.`;
        } else if (query && query.type === 'year') {
          const { year } = query.params;
          text = `No records found for year ${year}.`;
        } else if (query && query.type === 'critical-areas') {
          const { state, year } = query.params;
          text = `No critical/over-exploited areas found in ${state} for year ${year}.`;
        } else if (query && query.type === 'trends') {
          const { district, startYear, endYear } = query.params;
          text = `No trend analysis data available for ${district} between ${startYear} and ${endYear}.`;
        } else if (query && query.type === 'category') {
          const { category } = query.params;
          text = `No records found under category ${category.replace('_', ' ')}.`;
        } else {
          text = error.response.data?.message || "No groundwater data found for the requested query.";
        }
      } else {
        // Genuine offline connection error (no network / connection refused)
        text = error.message || "Failed to communicate with the groundwater API server.";
        isError = true;
      }

      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        isError,
        isEmpty,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        queryType: query ? query.type : 'error',
        queryParams: query ? query.params : {}
      };
      if (isRegenerate) {
        replaceLastBotMessage(errorMsg);
      } else {
        addMessagesToActiveSession([errorMsg]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (!activeSession || !activeSession.messages) return;
    const userMessages = activeSession.messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) return;
    const lastUserMessage = userMessages[userMessages.length - 1];
    submitMessage(lastUserMessage.text, true);
  };

  return (
    <div className="app-container">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSwitchSession={switchSession}
        onNewChat={createNewSession}
        onDeleteChat={deleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ChatWindow
        activeSession={activeSession}
        loading={loading}
        loadingText={loadingText}
        onSendMessage={submitMessage}
        onRegenerate={handleRegenerate}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}

export default App;
