import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Loader2, Menu, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';
import SettingsModal from './SettingsModal';
import { agents, getAgentById } from '../agents';
import { models, getModelById } from '../models';
import { useTheme } from '../contexts/ThemeContext';

const ChatUI = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(agents[0].id);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputBarRef = useRef(null);
  const [inputBarHeight, setInputBarHeight] = useState(100);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Load conversations and selected model from localStorage (but don't auto-select conversation)
  useEffect(() => {
    const savedConversations = localStorage.getItem('dipthinq-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        // Don't auto-select any conversation - start with landing page
      } catch (e) {
        console.error('Error loading conversations:', e);
      }
    }
    
    // Load selected model
    const savedModel = localStorage.getItem('dipthinq-selected-model');
    if (savedModel && models.find(m => m.id === savedModel)) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('dipthinq-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save selected model to localStorage
  useEffect(() => {
    localStorage.setItem('dipthinq-selected-model', selectedModel);
  }, [selectedModel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Detect device size and input bar height
  useEffect(() => {
    const updateDimensions = () => {
      // Update viewport height
      const vh = window.innerHeight;
      setViewportHeight(vh);
      
      // Detect device type
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const isDesktop = window.innerWidth >= 1024;
      
      // Update input bar height
      if (inputBarRef.current) {
        const rect = inputBarRef.current.getBoundingClientRect();
        const height = rect.height;
        const safeAreaBottom = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0', 
          10
        );
        
        // Device-specific padding adjustments
        let extraPadding = 10;
        if (isMobile) {
          extraPadding = 15; // More padding on mobile
        } else if (isTablet) {
          extraPadding = 12;
        } else {
          extraPadding = 10;
        }
        
        // Calculate total height needed
        const totalHeight = height + safeAreaBottom + extraPadding;
        setInputBarHeight(Math.max(totalHeight, 80)); // Minimum 80px
      }
    };

    // Initial calculation
    const timeoutId = setTimeout(updateDimensions, 200);
    
    // Listen to resize events
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateDimensions, 300); // Delay for orientation change
    });

    // Use ResizeObserver for input bar
    let resizeObserver;
    const setupResizeObserver = () => {
      if (inputBarRef.current && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          updateDimensions();
        });
        resizeObserver.observe(inputBarRef.current);
      } else if (!inputBarRef.current) {
        // Retry if ref not ready
        setTimeout(setupResizeObserver, 100);
      }
    };
    setupResizeObserver();

    // Periodic check in case ResizeObserver doesn't fire (backup)
    const intervalId = setInterval(updateDimensions, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  const handleNewChat = () => {
    // Check if current conversation is empty
    const currentConversation = conversations.find(c => c.id === activeConversationId);
    const isCurrentEmpty = currentConversation && 
      (!currentConversation.messages || currentConversation.messages.length === 0);
    
    // If current conversation exists and is empty, don't create a new one
    if (isCurrentEmpty) {
      return;
    }
    
    // Create new conversation only if current one has messages or no conversation exists
    const newConversation = {
      id: Date.now(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setMessages([]);
  };

  const handleSelectConversation = (id) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setActiveConversationId(id);
      setMessages(conversation.messages || []);
    }
  };

  const handleDeleteConversation = (id) => {
    const updatedConversations = conversations.filter(c => c.id !== id);
    setConversations(updatedConversations);
    
    // If deleted conversation was active, clear it
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    
    // Update localStorage
    if (updatedConversations.length > 0) {
      localStorage.setItem('dipthinq-conversations', JSON.stringify(updatedConversations));
    } else {
      localStorage.removeItem('dipthinq-conversations');
    }
  };

  const handleDeleteAllConversations = () => {
    setConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    localStorage.removeItem('dipthinq-conversations');
  };

  // Generate title from first user message
  const generateTitle = async (userMessage) => {
    try {
      // Use a simpler, faster model for title generation (GPT-3.5 or DeepSeek)
      const titleModelId = 'openai/gpt-3.5-turbo'; // Fast and cheap for title generation
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `You are a title generator. Your ONLY task is to create a short title.

User's first message: "${userMessage}"

Generate a title that:
- Is 3-5 words maximum
- Describes the main topic or question
- Is in title case (Capitalize Each Word)
- Is concise and clear

IMPORTANT: Return ONLY the title text. No quotes, no explanations, no "Title:" prefix, no markdown, nothing else. Just the title words.`,
          agentId: selectedAgent, // Still use agent for consistency
          modelId: titleModelId,
          history: []
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          let generatedTitle = data.response.trim();
          
          // Clean up title - remove quotes, markdown, and extra formatting
          generatedTitle = generatedTitle
            .replace(/^["'`]|["'`]$/g, '') // Remove surrounding quotes
            .replace(/^#+\s*/, '') // Remove markdown headers
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/\*/g, '') // Remove italic markdown
            .replace(/^Title:\s*/i, '') // Remove "Title:" prefix
            .replace(/^The title is:\s*/i, '') // Remove other prefixes
            .trim();
          
          // Limit to 5 words max
          const words = generatedTitle.split(/\s+/);
          const cleanTitle = words.slice(0, 5).join(' ').trim();
          
          // If we got a valid title, return it
          if (cleanTitle && cleanTitle.length > 0 && cleanTitle.length <= 50) {
            return cleanTitle;
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Title generation API error:', errorData);
      }
    } catch (error) {
      console.error('Error generating title:', error);
    }
    // Fallback to first 30 chars if generation fails
    return userMessage.substring(0, 30);
  };

  const handleSend = async (content) => {
    if (!content.trim() || isLoading) return;

    // Create new conversation if none exists
    let currentConvId = activeConversationId;
    const isFirstMessage = messages.length === 0;
    if (!currentConvId) {
      const newConv = {
        id: Date.now(),
        title: 'New Conversation',
        messages: [],
        createdAt: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      currentConvId = newConv.id;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Generate title if this is the first message (non-blocking)
    let conversationTitle = conversations.find(c => c.id === currentConvId)?.title || 'New Conversation';
    if (isFirstMessage && conversationTitle === 'New Conversation') {
      // Use a temporary title for now
      conversationTitle = content.trim().substring(0, 30);
      
      // Generate title asynchronously without blocking
      generateTitle(content.trim()).then(title => {
        if (title && title !== conversationTitle) {
          setConversations(prev => prev.map(conv => 
            conv.id === currentConvId ? { ...conv, title } : conv
          ));
        }
      }).catch(error => {
        console.error('Failed to generate title:', error);
        // Keep the fallback title
      });
    }

    // Update conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === currentConvId) {
        return {
          ...conv,
          messages: newMessages,
          title: conversationTitle,
          lastMessage: content.substring(0, 100)
        };
      }
      return conv;
    });
    
    // If conversation was just created, add it
    if (!conversations.find(c => c.id === currentConvId)) {
      updatedConversations.unshift({
        id: currentConvId,
        title: conversationTitle,
        messages: newMessages,
        lastMessage: content.substring(0, 100),
        createdAt: new Date().toISOString()
      });
    }
    
    setConversations(updatedConversations);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          agentId: selectedAgent,
          modelId: getModelById(selectedModel).modelId,
          history: messages
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to get response from server');
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response || data.message || 'Sorry, I could not generate a response.',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Update conversation with final messages
      const finalConversations = updatedConversations.map(conv => {
        if (conv.id === currentConvId) {
          return {
            ...conv,
            messages: finalMessages,
            lastMessage: assistantMessage.content.substring(0, 100)
          };
        }
        return conv;
      });
      setConversations(finalConversations);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.message || 'Sorry, there was an error processing your request. Please check your API configuration.',
        timestamp: new Date().toISOString(),
        error: true
      };
      const errorMessages = [...newMessages, errorMessage];
      setMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const currentAgent = getAgentById(selectedAgent);
  const currentConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-screen bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isSidebarOpen}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onMobileClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          handleSelectConversation(id);
          setIsSidebarOpen(false);
        }}
        onNewChat={() => {
          handleNewChat();
          setIsSidebarOpen(false);
        }}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col w-full h-full min-h-0 overflow-hidden">
        {/* Top Navbar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0 transition-colors duration-300"
        >
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                aria-label="Open sidebar"
              >
                <Menu size={18} className="text-gray-600 dark:text-zinc-400" />
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-zinc-200 truncate">
                {currentConversation?.title || 'DipThinq'}
              </h1>
            </div>
            {/* Watermark - Below title */}
            <p className="text-xs text-gray-400 dark:text-zinc-600 font-light pl-0 md:pl-0">
              Built by <span className="font-normal text-gray-500 dark:text-zinc-500">Dishank Patel</span>
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-gray-600 dark:text-zinc-400" />
              ) : (
                <Moon size={18} className="text-gray-600 dark:text-zinc-400" />
              )}
            </motion.button>
            <motion.button
              onClick={() => setIsSettingsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              aria-label="Open settings"
            >
              <Settings size={18} className="text-gray-600 dark:text-zinc-400" />
            </motion.button>
          </div>
        </motion.header>

        {/* Messages Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 min-w-0 bg-white dark:bg-[#0d0d0d] transition-colors duration-300 relative"
          style={{ 
            paddingBottom: `${inputBarHeight}px`,
            scrollPaddingBottom: `${inputBarHeight}px`
          }}
        >
          {messages.length === 0 || !activeConversationId ? (
            <div className="h-full flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-lg w-full"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-indigo-300 dark:border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    DT
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-zinc-200 mb-3">
                  Welcome to DipThinq
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                  Your intelligent multi-agent conversation platform. Choose an agent from the sidebar or start a new conversation to begin.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <motion.button
                    onClick={handleNewChat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all text-sm font-medium text-indigo-900 dark:text-zinc-200 shadow-sm dark:shadow-none"
                  >
                    Start New Conversation
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 max-w-full">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  agentIcon={currentAgent.icon}
                />
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Loader2 size={16} className="text-white animate-spin" />
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <motion.div
                          className="w-2 h-2 bg-gray-500 dark:bg-zinc-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-500 dark:bg-zinc-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-500 dark:bg-zinc-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar - Fixed at bottom */}
        <div 
          ref={inputBarRef}
          className="w-full border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 flex-shrink-0 transition-colors duration-300"
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
            paddingBottom: `max(0.5rem, env(safe-area-inset-bottom, 0px))`,
            backgroundColor: 'inherit'
          }}
        >
            <InputBar
              onSend={handleSend}
              isLoading={isLoading}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              placeholder="Ask anything"
            />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDeleteAllChats={handleDeleteAllConversations}
        conversationsCount={conversations.length}
      />
    </div>
  );
};

export default ChatUI;
