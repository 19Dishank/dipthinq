import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code, Search, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../contexts/ThemeContext';

const iconMap = {
  'Sparkles': Sparkles,
  'Code': Code,
  'Search': Search
};

const ChatMessage = React.memo(({ message, agentIcon }) => {
  const isUser = message.role === 'user';
  const IconComponent = iconMap[agentIcon] || Sparkles;
  const { theme } = useTheme();
  const [copiedCodeBlocks, setCopiedCodeBlocks] = useState(new Set());

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      const codeHash = code.substring(0, 50); // Use first 50 chars as identifier
      setCopiedCodeBlocks(prev => new Set(prev).add(codeHash));
      setTimeout(() => {
        setCopiedCodeBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(codeHash);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
    >
      <div className={`flex items-start ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-full ${!isUser ? 'gap-1.5 sm:gap-3' : 'gap-2 sm:gap-3'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${!isUser ? 'hidden sm:block' : ''}`}>
          {!isUser ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <IconComponent size={14} className="sm:w-[18px] sm:h-[18px] text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-700 dark:from-zinc-500 dark:to-zinc-600 flex items-center justify-center">
              <span className="text-[10px] sm:text-sm font-semibold text-white">U</span>
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <motion.div
          className={`px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-xl sm:rounded-2xl drop-shadow-lg ${
            isUser
              ? 'max-w-[90%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%] bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-indigo-300 dark:border-indigo-500/30 text-indigo-900 dark:text-zinc-100 backdrop-blur-sm'
              : 'max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80ch] w-full bg-gray-50 dark:bg-gradient-to-br dark:from-[#1E1E1E] dark:to-[#2a2a2a] text-gray-900 dark:text-zinc-100 border border-gray-200 dark:border-gray-800'
          }`}
        >
          {isUser ? (
            <p className="text-sm sm:text-[15px] md:text-base leading-6 sm:leading-7 break-words whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm sm:text-[15px] md:text-base leading-6 sm:leading-7 md:leading-8 prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-semibold prose-p:my-2 sm:prose-p:my-3 prose-ul:my-2 sm:prose-ul:my-3 prose-ol:my-2 sm:prose-ol:my-3 prose-li:my-1 sm:prose-li:my-1.5 prose-code:text-xs sm:prose-code:text-[13px] md:prose-code:text-[14px] prose-code:bg-gray-200 dark:prose-code:bg-gray-800 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-2 sm:prose-pre:my-3 prose-headings:text-gray-900 dark:prose-headings:text-zinc-100 prose-p:text-gray-900 dark:prose-p:text-zinc-100 prose-strong:text-gray-900 dark:prose-strong:text-zinc-100">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const codeString = String(children).replace(/\n$/, '');
                    const codeHash = codeString.substring(0, 50); // Use first 50 chars as identifier
                    const isCopied = copiedCodeBlocks.has(codeHash);

                    return !inline && match ? (
                      <div className="relative my-2 sm:my-3 md:my-4 rounded-lg overflow-hidden group syntax-highlighter-wrapper">
                        <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{language}</span>
                          <motion.button
                            onClick={() => handleCopyCode(codeString)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                            aria-label="Copy code"
                          >
                            {isCopied ? (
                              <>
                                <Check size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                                <span className="text-green-600 dark:text-green-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                        <SyntaxHighlighter
                          style={theme === 'dark' ? oneDark : oneLight}
                          language={language}
                          PreTag="div"
                          className="!m-0 !rounded-none"
                          customStyle={{
                            margin: 0,
                            padding: '0.5rem',
                            background: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
                            fontSize: '11px',
                            lineHeight: '1.5',
                          }}
                          codeTagProps={{
                            style: {
                              fontSize: 'inherit',
                            }
                          }}
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-gray-200 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-[13px] md:text-[14px] font-mono text-gray-900 dark:text-gray-100" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="my-2 sm:my-2.5 md:my-3 text-gray-900 dark:text-zinc-100 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-2 sm:my-2.5 md:my-3 ml-4 sm:ml-6 md:ml-8 list-disc space-y-1 sm:space-y-1.5 text-gray-900 dark:text-zinc-100">{children}</ul>,
                  ol: ({ children }) => <ol className="my-2 sm:my-2.5 md:my-3 ml-4 sm:ml-6 md:ml-8 list-decimal space-y-1 sm:space-y-1.5 text-gray-900 dark:text-zinc-100">{children}</ol>,
                  li: ({ children }) => <li className="my-1 sm:my-1.5 text-gray-900 dark:text-zinc-100 leading-relaxed">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 sm:mt-5 md:mt-6 mb-2 sm:mb-3 text-gray-900 dark:text-zinc-100">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base sm:text-lg md:text-xl font-semibold mt-3 sm:mt-4 md:mt-5 mb-2 sm:mb-2.5 text-gray-900 dark:text-zinc-100">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm sm:text-base md:text-lg font-semibold mt-2 sm:mt-3 md:mt-4 mb-1 sm:mb-1.5 text-gray-900 dark:text-zinc-100">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-400 dark:border-gray-500 pl-3 sm:pl-4 md:pl-5 my-2 sm:my-3 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 py-1.5 sm:py-2 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-medium">
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-zinc-100">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-900 dark:text-zinc-100">{children}</em>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;

