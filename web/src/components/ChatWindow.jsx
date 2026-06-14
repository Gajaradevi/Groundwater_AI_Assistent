import React, { useRef, useEffect, useState } from 'react';
import { Droplet, Sparkles, AlertCircle, Loader2, Calendar, TrendingUp, Activity, Menu } from 'lucide-react';
import ChatInput from './ChatInput';
import CopyButton from './CopyButton';
import RegenerateButton from './RegenerateButton';
import SuggestedQuestions from './SuggestedQuestions';
import TrendChart from './TrendChart';
import RiskGauge from './RiskGauge';
import DownloadChatButton from './DownloadChatButton';

// Helper function to render basic markdown (bold text and bullet points)
const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    const trimmed = line.trim();
    
    // Handle ### Headings
    if (trimmed.startsWith('### ')) {
      const headingContent = trimmed.substring(4);
      const parts = headingContent.split('**');
      const renderedLine = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i}>{part}</strong>;
        }
        return part;
      });
      return (
        <h4 key={index} className="md-h4" style={{ 
          fontSize: '1.05rem', 
          fontWeight: '700', 
          margin: '12px 0 6px 0', 
          fontFamily: 'var(--font-display)',
          color: 'var(--primary, #00d2ff)' 
        }}>
          {renderedLine}
        </h4>
      );
    }
    
    const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
    let content = line;
    
    if (isBullet) {
      // Strip starting bullet character
      content = line.replace(/^\s*[\*\-]\s+/, '');
    }
    
    // Split by bold markdown **
    const parts = content.split('**');
    const renderedLine = parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i}>{part}</strong>;
      }
      return part;
    });
    
    if (isBullet) {
      return (
        <div key={index} className="md-bullet" style={{ display: 'flex', gap: '8px', margin: '4px 0 4px 12px' }}>
          <span style={{ color: 'var(--accent, #00d2ff)' }}>•</span>
          <span>{renderedLine}</span>
        </div>
      );
    }
    
    return (
      <div key={index} className="md-para" style={{ margin: '4px 0', minHeight: '1.2em' }}>
        {renderedLine}
      </div>
    );
  });
};

/**
 * ChatWindow Component (Phase 3.5 / 4.1)
 * Displays the main interface of the active conversation session:
 * - App header with status badge and menu button to open collapsed sidebar
 * - Message timeline scroll box supporting text bubbles, data cards, empty states
 * - Inline load spinner
 * - ChatInput nested subcomponent at the footer
 */
export function ChatWindow({
  activeSession,
  loading,
  loadingText = "Querying database...",
  onSendMessage,
  onRegenerate,
  isSidebarOpen,
  onToggleSidebar
}) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const messages = activeSession ? activeSession.messages : [];

  // Find the last bot message in the message list to show regenerate button below it
  const botMessages = messages.filter(m => m.sender === 'bot');
  const lastBotMessageId = botMessages.length > 0 ? botMessages[botMessages.length - 1].id : null;

  // Suggestion pills shown below the main input field (includes AI-powered suggestion)
  const suggestions = [
    "Explain stress in Pune in 2023",
    "Pune in 2023",
    "Show Karnataka data",
    "Critical areas in Maharashtra"
  ];

  // Auto-scroll chat area to the bottom when new messages arrive or loader turns on
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = (text) => {
    onSendMessage(text);
  };

  const handleSuggestionClick = (prompt) => {
    onSendMessage(prompt);
  };

  // Maps assessment status classifications to CSS styling classes
  const getCategoryBadgeClass = (category) => {
    if (!category) return '';
    const normalized = category.toUpperCase().replace('-', '_');
    switch (normalized) {
      case 'SAFE': return 'badge-safe';
      case 'SEMI_CRITICAL': return 'badge-semi-critical';
      case 'CRITICAL': return 'badge-critical';
      case 'OVER_EXPLOITED': return 'badge-over-exploited';
      default: return '';
    }
  };

  // Formats DB category keys for text headers (e.g. SEMI_CRITICAL -> SEMI CRITICAL)
  const formatCategory = (category) => {
    return category ? category.replace('_', ' ') : '';
  };

  return (
    <div className="chat-window-container" role="main" aria-label="Conversation Thread">
      {/* Header Bar */}
      <header className="header">
        <div className="header-title-container">
          {/* Menu button visible only if sidebar is collapsed */}
          {!isSidebarOpen && (
            <button 
              type="button"
              className="sidebar-open-toggle-btn" 
              onClick={onToggleSidebar} 
              title="Open Sidebar"
              aria-label="Open Sidebar"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="header-icon-glow">
            <Droplet size={20} fill="currentColor" />
          </div>
          <h1>Groundwater AI Assistant</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DownloadChatButton messages={messages} />
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>API Connected</span>
          </div>
        </div>
      </header>

      {/* Message List Area */}
      <main className="chat-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Sparkles size={36} />
            </div>
            <h3>Welcome to Groundwater Assistant</h3>
            <p>Query groundwater metrics, recharges, extractions, and regional classifications directly from the live database.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              {msg.isError ? (
                /* Connection/Server Offline Error Box */
                <div className="api-error-card">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Connection Error:</strong> {msg.text}
                    <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
                      Please ensure your Spring Boot application is running on port 8080 and MySQL is active.
                    </p>
                  </div>
                </div>
              ) : (
                /* Standard Message Bubbles or Structured Cards */
                <div className={`message-content-col ${msg.sender}`}>
                  {msg.text && (
                    <div className="message-bubble" style={{ position: 'relative' }}>
                      {msg.sender === 'bot' && <CopyButton textToCopy={msg.text} />}
                      <div className="message-text">{renderMarkdown(msg.text)}</div>
                      <div className="message-meta">{msg.timestamp}</div>
                    </div>
                  )}

                  {/* Empty State UI Card for missing data */}
                  {msg.isEmpty && (
                    <div className="groundwater-card" style={{ borderStyle: 'dashed', borderColor: 'var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 6px', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '50%', color: 'var(--text-muted)', display: 'inline-flex' }}>
                          <Droplet size={24} style={{ opacity: 0.6 }} />
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
                          No Data Available
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          The requested groundwater record could not be found in the database.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Groundwater Assessment Metric DTO card */}
                  {msg.cardData && (
                    <div className="groundwater-card">
                      <div className="groundwater-card-header">
                        <div>
                          <h4 className="groundwater-card-title">{msg.cardData.district}</h4>
                          <span className="groundwater-card-subtitle">{msg.cardData.state}</span>
                        </div>
                        <span className={`category-badge ${getCategoryBadgeClass(msg.cardData.category)}`}>
                          {formatCategory(msg.cardData.category)}
                        </span>
                      </div>

                      <div className="groundwater-card-grid">
                        <div className="groundwater-card-item">
                          <span className="groundwater-card-label">Assessment Year</span>
                          <span className="groundwater-card-value"><Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> {msg.cardData.year}</span>
                        </div>
                        <div className="groundwater-card-item" style={{ gridColumn: 'span 2' }}>
                          <span className="groundwater-card-label">Stage of Development</span>
                          <RiskGauge value={msg.cardData.stageDevelopment} category={msg.cardData.category} />
                        </div>
                        <div className="groundwater-card-item">
                          <span className="groundwater-card-label">Annual Recharge</span>
                          <span className="groundwater-card-value">{msg.cardData.annualRecharge} km³</span>
                        </div>
                        <div className="groundwater-card-item">
                          <span className="groundwater-card-label">Extractable Resources</span>
                          <span className="groundwater-card-value">{msg.cardData.extractableResources} km³</span>
                        </div>
                        <div className="groundwater-card-item" style={{ gridColumn: 'span 2' }}>
                          <span className="groundwater-card-label">Total Annual Extraction</span>
                          <span className="groundwater-card-value"><TrendingUp size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> {msg.cardData.totalExtraction} km³</span>
                        </div>
                      </div>

                      {msg.cardData.remarks && (
                        <div className="groundwater-card-remarks">
                          <strong>Remarks:</strong> {msg.cardData.remarks}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multi-record historical listing results */}
                  {msg.listData && (
                    <div className="data-list">
                      {msg.listData.map((item, idx) => (
                        <div key={idx} className="data-list-item">
                          <div className="data-list-item-left">
                            <span className="data-list-title">{item.title}</span>
                            {item.subtitle && <span className="data-list-subtitle">{item.subtitle}</span>}
                          </div>
                          <span className="data-list-value">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trend chart visualization if available */}
                  {msg.trendRawData && (
                    <TrendChart trendData={msg.trendRawData} />
                  )}

                  {/* Suggested contextual follow-up questions */}
                  {msg.sender === 'bot' && !msg.isError && (
                    <SuggestedQuestions
                      queryType={msg.queryType}
                      queryParams={msg.queryParams}
                      onSendMessage={handleSendMessage}
                    />
                  )}

                  {/* Regenerate response option for last bot message */}
                  {msg.id === lastBotMessageId && (
                    <RegenerateButton onRegenerate={onRegenerate} loading={loading} />
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Database Loading Screen Bubble */}
        {loading && (
          <div className="message-wrapper bot">
            <div className="api-loader-container">
              <Loader2 className="spinner" size={16} />
              <span>{loadingText}</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </main>

      {/* Input bar controls */}
      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSubmit={handleSendMessage}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        loading={loading}
      />
    </div>
  );
}

export default ChatWindow;
