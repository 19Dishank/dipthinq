import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, onDeleteAllChats, conversationsCount }) => {
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const handleDeleteAll = () => {
    onDeleteAllChats();
    setShowDeleteWarning(false);
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[1200] p-4"
          >
            <div className="glass-strong rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden bg-white dark:bg-[#0d0d0d] transition-colors duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-200">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-zinc-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-300 mb-2">
                      API Configuration
                    </label>
                    <p className="text-sm text-gray-600 dark:text-zinc-500">
                      Configure your API keys in the environment variables.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-300 mb-2">
                      Appearance
                    </label>
                    <p className="text-sm text-gray-600 dark:text-zinc-500">
                      Toggle between light and dark mode using the theme button in the header.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-300 mb-2">
                      Data Management
                    </label>
                    {!showDeleteWarning ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-zinc-500 mb-3">
                          You have {conversationsCount} conversation{conversationsCount !== 1 ? 's' : ''} saved.
                        </p>
                        <motion.button
                          onClick={() => setShowDeleteWarning(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={conversationsCount === 0}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all text-sm font-medium text-red-700 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                          Delete All Chats
                        </motion.button>
                      </div>
                    ) : (
                      <div className="space-y-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                              Warning: This action cannot be undone
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-400">
                              All {conversationsCount} conversation{conversationsCount !== 1 ? 's' : ''} will be permanently deleted.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <motion.button
                            onClick={handleDeleteAll}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                          >
                            Confirm Delete
                          </motion.button>
                          <motion.button
                            onClick={() => setShowDeleteWarning(false)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 text-sm font-medium transition-colors"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-300 mb-2">
                      About
                    </label>
                    <p className="text-sm text-gray-600 dark:text-zinc-500">
                      DipThinq v1.0.0 - Multi-Brain Conversational Intelligence
                    </p>
                  </div>

                  {/* Watermark */}
                  <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-400 dark:text-zinc-600 text-center">
                      Built by <span className="font-semibold text-gray-600 dark:text-zinc-400">Dishank Patel</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;

