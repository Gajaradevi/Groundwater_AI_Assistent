import React, { useState } from 'react';
import { 
  Plus, Search, MessageSquare, Trash2, ChevronLeft, Menu, LogOut, User,
  LayoutDashboard, Map, BarChart3, TrendingUp, FileText
} from 'lucide-react';

/**
 * Sidebar Component (Phase 6)
 * Renders the collapsible left panel containing:
 * - Navigation menu to switch between pages
 * - Collapse toggle button
 * - "New Chat" button and search bar (visible for Chat page or always)
 * - List of previous conversations
 */
export function Sidebar({
  sessions,
  activeSessionId,
  onSwitchSession,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
  user,
  onLogout,
  currentPage = 'dashboard',
  onPageChange
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter history list based on search bar input
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} aria-label="Groundwater AI Sidebar">
      {/* Sidebar Header containing title and toggle chevron */}
      <div className="sidebar-header">
        {isOpen ? (
          <h2 className="sidebar-title">Groundwater AI</h2>
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
          {/* Navigation Menu */}
          <nav className="sidebar-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`sidebar-nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => onPageChange('dashboard')}
            >
              <LayoutDashboard size={16} className="nav-icon" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`sidebar-nav-item ${currentPage === 'map' ? 'active' : ''}`}
              onClick={() => onPageChange('map')}
            >
              <Map size={16} className="nav-icon" />
              <span>Interactive Map</span>
            </button>
            <button
              type="button"
              className={`sidebar-nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
              onClick={() => onPageChange('analytics')}
            >
              <TrendingUp size={16} className="nav-icon" />
              <span>Analytics Insights</span>
            </button>
            <button
              type="button"
              className={`sidebar-nav-item ${currentPage === 'statistics' ? 'active' : ''}`}
              onClick={() => onPageChange('statistics')}
            >
              <BarChart3 size={16} className="nav-icon" />
              <span>Statistics Charts</span>
            </button>
            <button
              type="button"
              className={`sidebar-nav-item ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => onPageChange('reports')}
            >
              <FileText size={16} className="nav-icon" />
              <span>AI Report Generator</span>
            </button>
            <button
              type="button"
              className={`sidebar-nav-item ${currentPage === 'chat' ? 'active' : ''}`}
              onClick={() => onPageChange('chat')}
            >
              <MessageSquare size={16} className="nav-icon" />
              <span>Chat Assistant</span>
            </button>
          </nav>

          <hr className="sidebar-divider" />

          {/* Action Area: New Chat Button */}
          <div className="sidebar-actions">
            <button 
              type="button" 
              className="new-chat-btn" 
              onClick={() => {
                onNewChat();
                onPageChange('chat');
              }}
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
                  className={`sidebar-item ${session.id === activeSessionId && currentPage === 'chat' ? 'active' : ''}`}
                  onClick={() => {
                    onSwitchSession(session.id);
                    onPageChange('chat');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSwitchSession(session.id);
                      onPageChange('chat');
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

          {/* Sidebar Footer containing User Profile & Logout */}
          <div className="sidebar-footer">
            <div className="user-profile-info">
              <div className="user-avatar" title={`${user?.fullName} (${user?.role})`}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name" title={user?.fullName}>{user?.fullName}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
            <button 
              type="button" 
              className="logout-btn" 
              onClick={onLogout} 
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </>
      ) : (
        /* Collapsed Sidebar View: Show minimal vertical list of action buttons */
        <div className="sidebar-collapsed-icons" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 69px)', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            className={`collapsed-nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onPageChange('dashboard')} 
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
          </button>
          <button 
            type="button"
            className={`collapsed-nav-btn ${currentPage === 'map' ? 'active' : ''}`}
            onClick={() => onPageChange('map')} 
            title="Interactive Map"
          >
            <Map size={18} />
          </button>
          <button 
            type="button"
            className={`collapsed-nav-btn ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => onPageChange('analytics')} 
            title="Analytics Insights"
          >
            <TrendingUp size={18} />
          </button>
          <button 
            type="button"
            className={`collapsed-nav-btn ${currentPage === 'statistics' ? 'active' : ''}`}
            onClick={() => onPageChange('statistics')} 
            title="Statistics Charts"
          >
            <BarChart3 size={18} />
          </button>
          <button 
            type="button"
            className={`collapsed-nav-btn ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => onPageChange('reports')} 
            title="AI Report Generator"
          >
            <FileText size={18} />
          </button>
          <button 
            type="button"
            className={`collapsed-nav-btn ${currentPage === 'chat' ? 'active' : ''}`}
            onClick={() => onPageChange('chat')} 
            title="Chat Assistant"
          >
            <MessageSquare size={18} />
          </button>
          
          <hr className="sidebar-divider-collapsed" style={{ width: '60%', border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
          
          <button 
            type="button"
            className="collapsed-nav-btn new-chat-collapsed-btn" 
            onClick={() => {
              onNewChat();
              onPageChange('chat');
            }} 
            title="Start new chat session"
          >
            <Plus size={18} />
          </button>

          <button 
            type="button"
            className="collapsed-nav-btn logout-collapsed-btn" 
            onClick={onLogout} 
            title={`Log Out (${user?.fullName})`}
            aria-label="Log Out"
            style={{ marginTop: 'auto', marginBottom: '16px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
