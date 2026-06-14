import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * RegenerateButton Component (Phase 4.5)
 * Renders a subtle "Regenerate" button below the last AI response.
 * Clicking re-sends the last user query to get a fresh response.
 */
export function RegenerateButton({ onRegenerate, loading }) {
  return (
    <button
      type="button"
      className="regenerate-btn"
      onClick={onRegenerate}
      disabled={loading}
      title="Regenerate response"
      aria-label="Regenerate AI response"
    >
      <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
      <span>Regenerate</span>
    </button>
  );
}

export default RegenerateButton;
