import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const Sidebar = ({ isCollapsed, isMobileOpen, onToggle, onMobileClose, conversations, activeConversationId, onSelectConversation, onNewChat, onDeleteConversation }) => {
  return (
    <>
      {/* Mobile Overlay Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        className="fixed inset-0 left-0 w-[260px] bg-white dark:bg-[#0d0d0d] glass-strong border-r border-gray-200 dark:border-white/10 flex flex-col overflow-y-auto z-[2000] md:hidden transition-colors duration-300"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DT</span>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                DipThinq
              </span>
            </div>
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <motion.button
            onClick={onNewChat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all group shadow-sm dark:shadow-none"
          >
            <Plus size={18} className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300" />
            <span className="text-sm font-medium text-indigo-900 dark:text-zinc-300">New Session</span>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="text-xs font-medium text-gray-500 dark:text-zinc-500 px-4 mb-2 uppercase tracking-wider">
            Conversations
          </div>
          <div className="space-y-1">
            {conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <motion.div
                  key={conv.id}
                  className={`relative w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-[rgba(99,102,241,0.06)] ring-1 ring-indigo-300 dark:ring-[rgba(99,102,241,0.12)]'
                      : 'hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                  )}
                  <motion.button
                    onClick={() => onSelectConversation(conv.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                  >
                    <MessageSquare 
                      size={16} 
                      className={`flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500 dark:text-zinc-500'}`} 
                    />
                    <div className="flex-1 text-left min-w-0">
                      <div className={`text-sm font-medium truncate ${isActive ? 'text-gray-900 dark:text-zinc-200' : 'text-gray-700 dark:text-zinc-400'}`}>
                        {conv.title || 'New Conversation'}
                      </div>
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex h-screen bg-white dark:bg-[#0d0d0d] glass-strong border-r border-gray-200 dark:border-white/10 flex-col overflow-y-auto flex-shrink-0 w-[260px] transition-colors duration-300"
      >
      {/* Logo Section */}
      <div className={`border-b border-gray-200 dark:border-white/5 flex-shrink-0 relative ${isCollapsed ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'justify-between'} w-full`}>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">DT</span>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                DipThinq
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">DT</span>
            </motion.div>
          )}
          {!isCollapsed ? (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex-shrink-0 ml-2"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} className="text-gray-600 dark:text-zinc-400" />
            </button>
          ) : (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className={`border-b border-gray-200 dark:border-white/5 flex-shrink-0 ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all group shadow-sm dark:shadow-none`}
        >
          <Plus size={18} className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex-shrink-0" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-indigo-900 dark:text-zinc-300 whitespace-nowrap"
            >
              New Session
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium text-gray-500 dark:text-zinc-500 px-4 mb-2 uppercase tracking-wider"
          >
            Conversations
          </motion.div>
        )}
        <div className="space-y-1">
          {conversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <motion.div
                key={conv.id}
                className={`relative w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} py-2 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-[rgba(99,102,241,0.06)] ring-1 ring-indigo-300 dark:ring-[rgba(99,102,241,0.12)]'
                    : 'hover:bg-gray-100 dark:hover:bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                )}
                <motion.button
                  onClick={() => onSelectConversation(conv.id)}
                  whileHover={{ y: isCollapsed ? 0 : -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 flex-1 min-w-0'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50`}
                >
                  <MessageSquare 
                    size={16} 
                    className={`flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500 dark:text-zinc-500'}`} 
                  />
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className={`text-sm font-medium truncate ${isActive ? 'text-gray-900 dark:text-zinc-200' : 'text-gray-700 dark:text-zinc-400'}`}>
                        {conv.title || 'New Conversation'}
                      </div>
                    </motion.div>
                  )}
                </motion.button>
                {!isCollapsed && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

