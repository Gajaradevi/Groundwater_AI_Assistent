import { useState, useEffect } from 'react';
import { chatStorage } from '../services/chatStorage';

/**
 * Custom React Hook: useChatHistory (Phase 3.5)
 * Manages the list of chat sessions, active session state, 
 * switching between chats, deleting chats, and adding messages.
 * Uses functional state updates to prevent state-batching/closure bugs.
 */
export const useChatHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Initialize and load chat sessions from localStorage on component mount
  useEffect(() => {
    const stored = chatStorage.loadSessions();
    if (stored.length > 0) {
      setSessions(stored);
      setActiveSessionId(stored[0].id);
    } else {
      // If localStorage is empty, create a default first chat session
      const defaultSession = chatStorage.createSession("New Chat");
      
      const initialGreeting = {
        id: Date.now(),
        text: "Hello! I am your Groundwater AI Assistant connected to the INGRES database. You can query groundwater recharge, extraction levels, and classifications for any district or state.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      defaultSession.messages = [initialGreeting];
      
      const initialList = [defaultSession];
      setSessions(initialList);
      setActiveSessionId(defaultSession.id);
      chatStorage.saveSessions(initialList);
    }
  }, []);

  /**
   * Spawns a new chat session, adds it to the list, and sets it active.
   */
  const createNewSession = () => {
    const newSession = chatStorage.createSession("New Chat");
    
    const initialGreeting = {
      id: Date.now(),
      text: "Hello! I am your Groundwater AI Assistant connected to the INGRES database. You can query groundwater recharge, extraction levels, and classifications for any district or state.",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    newSession.messages = [initialGreeting];
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      chatStorage.saveSessions(updated);
      return updated;
    });
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  /**
   * Switches the active session.
   * @param {string} id - The ID of the session to switch to.
   */
  const switchSession = (id) => {
    setActiveSessionId(id);
  };

  /**
   * Deletes a chat session by ID.
   * If the active session is deleted, it switches active state to the most recent remaining chat.
   * @param {string} idToDelete - The ID of the session to delete.
   */
  const deleteSession = (idToDelete) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== idToDelete);
      
      if (activeSessionId === idToDelete) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
        } else {
          // If zero sessions remain, spawn a fresh one automatically
          const newSession = chatStorage.createSession("New Chat");
          const initialGreeting = {
            id: Date.now(),
            text: "Hello! I am your Groundwater AI Assistant connected to the INGRES database. You can query groundwater recharge, extraction levels, and classifications for any district or state.",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          newSession.messages = [initialGreeting];
          updated.push(newSession);
          setActiveSessionId(newSession.id);
        }
      }
      chatStorage.saveSessions(updated);
      return updated;
    });
  };

  /**
   * Appends messages to the active session.
   * Automatically derives and updates the chat title from the first user query.
   * @param {Array} newMessages - Array of message objects to append.
   */
  const addMessagesToActiveSession = (newMessages) => {
    setSessions(prevSessions => {
      const updated = prevSessions.map(session => {
        if (session.id === activeSessionId) {
          const updatedMsgs = [...session.messages, ...newMessages];
          
          // Auto-generate chat title from the first user message if current title is default
          let newTitle = session.title;
          if (session.title === "New Chat" || session.title === "") {
            const firstUserMsg = updatedMsgs.find(m => m.sender === 'user');
            if (firstUserMsg) {
              newTitle = firstUserMsg.text;
              if (newTitle.length > 25) {
                newTitle = newTitle.substring(0, 25) + '...';
              }
            }
          }

          return {
            ...session,
            title: newTitle,
            messages: updatedMsgs,
            updatedAt: Date.now()
          };
        }
        return session;
      });

      chatStorage.saveSessions(updated);
      return updated;
    });
  };

  const replaceLastBotMessage = (newMessage) => {
    setSessions(prevSessions => {
      const updated = prevSessions.map(session => {
        if (session.id === activeSessionId) {
          const msgs = [...session.messages];
          let lastBotIndex = -1;
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].sender === 'bot') {
              lastBotIndex = i;
              break;
            }
          }
          if (lastBotIndex !== -1) {
            msgs[lastBotIndex] = {
              ...msgs[lastBotIndex],
              ...newMessage,
              id: msgs[lastBotIndex].id,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          } else {
            msgs.push(newMessage);
          }
          return {
            ...session,
            messages: msgs,
            updatedAt: Date.now()
          };
        }
        return session;
      });
      chatStorage.saveSessions(updated);
      return updated;
    });
  };

  // Find the active session object
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSessionId,
    activeSession,
    createNewSession,
    switchSession,
    deleteSession,
    addMessagesToActiveSession,
    replaceLastBotMessage
  };
};

export default useChatHistory;
