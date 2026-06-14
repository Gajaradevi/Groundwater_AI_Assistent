import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Trash2, ChevronLeft, Menu } from 'lucide-react';

/**
 * Sidebar Component (Phase 3.5)
 * Renders the collapsible left panel containing:
 * - Collapse toggle button
 * - "New Chat" button
 * - Search bar to filter historical chat sessions
 * - List of previous conversations with click-to-activate and click-to-delete actions
 */
export function Sidebar({
  sessions,
  activeSessionId,
  onSwitchSession,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter history list based on search bar input
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} aria-label="Chat History Sidebar">
      {/* Sidebar Header containing title and toggle chevron */}
      <div className="sidebar-header">
        {isOpen ? (
          <h2 className="sidebar-title">Chat History</h2>
        ) : (
          <span className="sidebar-title-collapsed">GW</span>
        )}
        <button 
          type="button"
          className="sidebar-toggle-btn" 
          onClick={onToggle} 
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen ? (
        <>
          {/* Action Area: New Chat Button */}
          <div className="sidebar-actions">
            <button 
              type="button" 
              className="new-chat-btn" 
              onClick={onNewChat}
              title="Start a new chat session"
            >
              <Plus size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search Box Area */}
          <div className="sidebar-search">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={14} />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Search chat sessions"
              />
            </div>
          </div>

          {/* Scrollable list of chat sessions */}
          <div className="sidebar-list">
            {filteredSessions.length === 0 ? (
              <div className="sidebar-empty">No sessions found</div>
            ) : (
              filteredSessions.map(session => (
                <div
                  key={session.id}
                  className={`sidebar-item ${session.id === activeSessionId ? 'active' : ''}`}
                  onClick={() => onSwitchSession(session.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSwitchSession(session.id);
                    }
                  }}
                  title={session.title}
                >
                  <MessageSquare size={14} className="chat-icon" />
                  <span className="chat-title">{session.title}</span>
                  <button
                    type="button"
                    className="delete-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid switching session when deleting
                      onDeleteChat(session.id);
                    }}
                    title="Delete Chat"
                    aria-label={`Delete chat ${session.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Collapsed Sidebar View: Show minimal vertical list of action buttons */
        <div className="sidebar-collapsed-icons">
          <button 
            type="button"
            className="new-chat-icon-btn" 
            onClick={onNewChat} 
            title="Start new chat session"
            aria-label="Start new chat session"
          >
            <Plus size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
