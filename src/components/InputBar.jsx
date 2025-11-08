import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ChevronDown, Sparkles, Code, Search, Check } from 'lucide-react';
import { agents } from '../agents';
import { models, getModelById } from '../models';

const iconMap = {
  'Sparkles': Sparkles,
  'Code': Code,
  'Search': Search
};

const InputBar = ({ onSend, isLoading, selectedAgent, onSelectAgent, selectedModel, onSelectModel, placeholder }) => {
  const [input, setInput] = useState('');
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const textareaRef = useRef(null);
  const agentSelectorRef = useRef(null);
  const modelSelectorRef = useRef(null);

  const selectedAgentData = agents.find(a => a.id === selectedAgent) || agents[0];
  const SelectedIcon = iconMap[selectedAgentData.icon] || Sparkles;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (agentSelectorRef.current && !agentSelectorRef.current.contains(event.target)) {
        setIsAgentSelectorOpen(false);
      }
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
        setIsModelSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full"
    >
      {/* Text Input Container with Agent Selector inside */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg sm:rounded-xl px-1 sm:px-1.5 md:px-2 lg:px-3 py-1.5 sm:py-2 md:py-2.5 min-h-[44px] sm:min-h-[48px] transition-colors duration-300 shadow-sm dark:shadow-none">
        {/* Agent Selector */}
        <div className="relative flex-shrink-0" ref={agentSelectorRef}>
          <motion.button
            type="button"
            onClick={() => setIsAgentSelectorOpen(!isAgentSelectorOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-2.5 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 touch-manipulation min-w-0"
            aria-label="Select agent"
          >
            <SelectedIcon size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-200 hidden sm:inline whitespace-nowrap">
              {selectedAgentData.shortName}
            </span>
            <ChevronDown 
              size={9} 
              className={`text-gray-600 dark:text-zinc-400 transition-transform flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 ${isAgentSelectorOpen ? 'rotate-180' : ''}`} 
            />
          </motion.button>

          <AnimatePresence>
            {isAgentSelectorOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-2 left-0 w-[calc(100vw-1rem)] sm:w-56 max-w-[280px] bg-white dark:bg-[#1a1a1a] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden z-50"
              >
                {agents.map((agent) => {
                  const AgentIcon = iconMap[agent.icon] || Sparkles;
                  const isSelected = agent.id === selectedAgent;
                  
                  return (
                    <motion.button
                      key={agent.id}
                      type="button"
                      onClick={() => {
                        onSelectAgent(agent.id);
                        setIsAgentSelectorOpen(false);
                      }}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-all ${
                        isSelected ? 'bg-indigo-50 dark:bg-white/5' : ''
                      }`}
                    >
                      <AgentIcon size={14} className="sm:w-4 sm:h-4 text-indigo-400 flex-shrink-0" />
                      <span className="flex-1 text-left text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-200 truncate">{agent.name}</span>
                      {isSelected && <Check size={14} className="sm:w-4 sm:h-4 text-indigo-400 flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Model Selector */}
        <div className="relative flex-shrink-0" ref={modelSelectorRef}>
          <motion.button
            type="button"
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-2.5 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 touch-manipulation min-w-0"
            aria-label="Select model"
          >
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 min-w-0">
              <span className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-tight leading-none flex-shrink-0">
                {getModelById(selectedModel).provider === 'OpenAI' ? 'GPT' : 
                 getModelById(selectedModel).provider === 'DeepSeek' ? 'DS' :
                 getModelById(selectedModel).provider === 'Google' ? 'GEM' :
                 getModelById(selectedModel).provider === 'Anthropic' ? 'CLD' : 'AI'}
              </span>
              <span className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-medium text-gray-700 dark:text-zinc-200 hidden sm:inline whitespace-nowrap max-w-[60px] sm:max-w-[70px] md:max-w-[80px] lg:max-w-none truncate">
                {getModelById(selectedModel).name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-gray-700 dark:text-zinc-200 sm:hidden truncate max-w-[50px]">
                {getModelById(selectedModel).name.split(' ')[0]}
              </span>
            </div>
            <ChevronDown 
              size={9} 
              className={`text-gray-600 dark:text-zinc-400 transition-transform flex-shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 ${isModelSelectorOpen ? 'rotate-180' : ''}`} 
            />
          </motion.button>

          <AnimatePresence>
            {isModelSelectorOpen && (
              <>
                {/* Mobile overlay backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99] sm:hidden"
                  onClick={() => setIsModelSelectorOpen(false)}
                />
                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="fixed sm:absolute bottom-20 sm:bottom-full left-2 sm:left-0 right-2 sm:right-auto mb-0 sm:mb-2 w-auto sm:w-64 md:w-72 max-w-[calc(100vw-1rem)] sm:max-w-none bg-white dark:bg-[#1a1a1a] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden z-[100] max-h-[60vh] sm:max-h-[450px] overflow-y-auto"
                >
                {models.map((model) => {
                  const isSelected = model.id === selectedModel;
                  const providerAbbr = model.provider === 'OpenAI' ? 'GPT' : 
                                      model.provider === 'DeepSeek' ? 'DS' :
                                      model.provider === 'Google' ? 'GEM' :
                                      model.provider === 'Anthropic' ? 'CLD' : 'AI';
                  
                  return (
                    <motion.button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onSelectModel(model.id);
                        setIsModelSelectorOpen(false);
                      }}
                      whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-all border-b border-gray-100 dark:border-white/5 last:border-b-0 ${
                        isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center">
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          {providerAbbr}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-zinc-200 truncate">{model.name}</span>
                          {isSelected && <Check size={12} className="sm:w-3.5 sm:h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-zinc-400">{model.provider}</span>
                          <span className="text-gray-400 dark:text-zinc-600 text-[10px] sm:text-xs">·</span>
                          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-zinc-400 truncate">{model.description}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask anything"}
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none text-sm sm:text-[15px] text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 px-1 sm:px-1.5 md:px-2 py-1.5 sm:py-2 max-h-32 overflow-y-auto min-w-0 focus-visible:outline-none touch-manipulation"
          aria-label="Message input"
        />
        
        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!input.trim() || isLoading}
          whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
          whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
          className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 touch-manipulation min-w-[32px] ${
            input.trim() && !isLoading
              ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95'
              : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          ) : (
            <Send size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default InputBar;

