/**
 * Chat Storage Service (Phase 3.5)
 * Handles loading and saving chatbot conversations using the browser's localStorage.
 * This guarantees that chat sessions are saved and remain available after a page refresh.
 */

const STORAGE_KEY = 'groundwater_chats';

export const chatStorage = {
  /**
   * Loads all previous chat sessions from localStorage.
   * If no chats exist, it returns an empty array.
   */
  loadSessions: () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error("Error loading chat history from localStorage:", error);
    }
    return [];
  },

  /**
   * Saves the list of all chat sessions to localStorage.
   * @param {Array} sessions - The list of chat session objects to save.
   */
  saveSessions: (sessions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Error saving chat history to localStorage:", error);
    }
  },

  /**
   * Generates a new empty chat session object with a unique ID and timestamps.
   * @param {string} initialTitle - Default title for the chat session.
   */
  createSession: (initialTitle = "New Chat") => {
    const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    return {
      id,
      title: initialTitle,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
};

export default chatStorage;
