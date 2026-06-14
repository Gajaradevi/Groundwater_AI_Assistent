import React from 'react';
import { Send } from 'lucide-react';

/**
 * ChatInput Component (Phase 3.5)
 * Renders the text input box, Send button, and suggestion prompt pills below.
 * Maintains structural and class naming compatibility with the original styling.
 */
export function ChatInput({
  inputText,
  setInputText,
  onSubmit,
  suggestions,
  onSuggestionClick,
  loading
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit(inputText);
    setInputText('');
  };

  return (
    <div className="input-container">
      <form onSubmit={handleFormSubmit} className="input-form">
        <input
          type="text"
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about groundwater (e.g. Pune in 2023, critical areas in Telangana)..."
          disabled={loading}
          autoFocus
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!inputText.trim() || loading}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
      
      {/* Suggested Prompt Pills */}
      <div className="suggestions-container">
        {suggestions.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="suggestion-pill"
            onClick={() => onSuggestionClick(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatInput;
