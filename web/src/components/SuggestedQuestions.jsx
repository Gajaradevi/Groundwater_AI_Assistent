import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * SuggestedQuestions Component (Phase 4.5)
 * Renders 3–4 context-aware follow-up question pills after each AI response.
 * Questions are generated based on the query type and parameters from the preceding query.
 */

const generateSuggestions = (queryType, queryParams) => {
  if (!queryType || !queryParams) return [];

  const { district, district1, district2, state, state1, state2, year } = queryParams || {};

  switch (queryType) {
    case 'ai-explain-stress':
      return [
        district ? `Compare ${district} and Nagpur` : null,
        district ? `Recommend measures for ${district}` : null,
        `Show critical areas in Maharashtra`,
        district ? `Show trends for ${district}` : null
      ].filter(Boolean);

    case 'ai-compare':
      return [
        district1 ? `Explain stress in ${district1}` : null,
        district2 ? `Explain stress in ${district2}` : null,
        district1 ? `Show trends for ${district1}` : null,
        `Show critical areas in Maharashtra`
      ].filter(Boolean);

    case 'ai-compare-states':
      return [
        state1 ? `Show ${state1} data` : null,
        state2 ? `Show ${state2} data` : null,
        state1 ? `Critical areas in ${state1}` : null,
        state2 ? `Critical areas in ${state2}` : null
      ].filter(Boolean);

    case 'ai-recommendations':
      return [
        district ? `Explain stress in ${district}` : null,
        district ? `Compare ${district} and Pune` : null,
        `Show critical areas in Maharashtra`,
        district ? `Show trends for ${district}` : null
      ].filter(Boolean);

    case 'trends':
      return [
        district ? `Explain stress in ${district}` : null,
        district ? `${district} in ${year || 2023}` : null,
        district ? `Recommend measures for ${district}` : null,
        `Show critical areas in Maharashtra`
      ].filter(Boolean);

    case 'district-year':
    case 'district':
      return [
        district ? `Explain stress in ${district}` : null,
        district ? `Show trends for ${district}` : null,
        district ? `Recommend measures for ${district}` : null,
        district ? `Compare ${district} and Nashik` : null
      ].filter(Boolean);

    case 'critical-areas':
      return [
        state ? `Show ${state} data` : null,
        `Compare Pune and Nagpur`,
        `Explain stress in Pune`,
        `Show trends for Hyderabad`
      ].filter(Boolean);

    case 'state':
    case 'state-year-summary':
      return [
        state ? `Critical areas in ${state}` : null,
        `Compare Pune and Nashik`,
        `Explain stress in Hyderabad`,
        `Show trends for Pune`
      ].filter(Boolean);

    case 'category':
      return [
        `Show critical areas in Maharashtra`,
        `Explain stress in Pune`,
        `Compare Pune and Nagpur`,
        `Show trends for Hyderabad`
      ];

    default:
      return [
        `Explain stress in Pune in 2023`,
        `Show critical areas in Maharashtra`,
        `Compare Pune and Nagpur`,
        `Show trends for Hyderabad`
      ];
  }
};

export function SuggestedQuestions({ queryType, queryParams, onSendMessage }) {
  const suggestions = generateSuggestions(queryType, queryParams);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggested-questions">
      <div className="suggested-questions-label">
        <Sparkles size={12} />
        <span>Follow-up questions</span>
      </div>
      <div className="suggested-questions-pills">
        {suggestions.slice(0, 4).map((q, idx) => (
          <button
            key={idx}
            type="button"
            className="suggested-q-pill"
            onClick={() => onSendMessage(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SuggestedQuestions;
