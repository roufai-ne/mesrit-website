// src/components/Chatbot.js
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, MessageCircle } from 'lucide-react';

/**
 * Composant Chatbot flottant
 * Permet aux visiteurs de poser des questions sur le contenu du site
 */
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Bonjour! Je suis l'assistant virtuel du MESRIT. Comment puis-je vous aider aujourd'hui?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Envoyer un message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Ajouter le message de l'utilisateur
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Préparer l'historique de conversation
      const conversationHistory = messages
        .slice(-10) // Garder les 10 derniers messages
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Appeler l'API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          provider: 'groq' // 'groq' (gratuit), 'openai' ou 'claude'
        })
      });

      const data = await response.json();

      // Afficher le message d'erreur de l'API directement dans le chat — pas de throw
      // (un throw ici, même attrapé, déclenche l'overlay dev de Next.js)
      if (!data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || "Désolé, je n'ai pas pu traiter votre demande.",
          timestamp: new Date(),
          isError: true
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('[Chatbot] Erreur réseau:', error);

      let errorContent = "Désolé, je n'ai pas pu traiter votre demande.";
      if (error.message?.includes('Failed to fetch')) {
        errorContent = "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
      } else if (error.message?.includes('timeout')) {
        errorContent = "Le serveur met trop de temps à répondre. Veuillez réessayer.";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Suggestions de questions
  const suggestedQuestions = [
    "Quelles sont les dernières actualités?",
    "Comment contacter le ministère?",
    "Quels sont les services disponibles?",
    "Où trouver les ressources pour étudiants?"
  ];

  const handleSuggestionClick = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir/fermer le chat */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg flex items-center justify-center bg-niger-orange hover:bg-niger-orange-dark transition-[transform,box-shadow]"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
        aria-expanded={isOpen}
        aria-controls="chatbot-dialog"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close-icon"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <X className="size-6 text-white" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="open-icon"
              initial={{ opacity: 0, rotate: 45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -45 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <MessageCircle className="size-6 text-white" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Chat — Assistant MESRIT"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-niger-orange px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="size-5 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">Assistant MESRIT</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-green-300 animate-pulse" aria-hidden="true" />
                    En ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fermer la conversation"
                className="flex-shrink-0 size-8 rounded-full flex items-center justify-center text-white/90 hover:bg-white/15 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950/40">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="size-7 rounded-full bg-niger-orange/10 dark:bg-niger-orange/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <Bot className="size-4 text-niger-orange" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-niger-orange text-white rounded-2xl rounded-br-md'
                        : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-2xl rounded-bl-md'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap text-pretty">{msg.content}</p>
                    <p className={`text-[11px] mt-1 tabular-nums ${
                      msg.role === 'user' ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-end gap-2 justify-start" role="status" aria-label="Chargement de la réponse…">
                  <div className="size-7 rounded-full bg-niger-orange/10 dark:bg-niger-orange/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <Bot className="size-4 text-niger-orange" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5" aria-hidden="true">
                      <div className="size-1.5 bg-niger-orange/50 rounded-full animate-bounce"></div>
                      <div className="size-1.5 bg-niger-orange/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="size-1.5 bg-niger-orange/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (seulement si peu de messages) */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Questions suggérées</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="text-xs bg-niger-orange/10 hover:bg-niger-orange/20 dark:bg-niger-orange/15 dark:hover:bg-niger-orange/25 text-niger-orange dark:text-niger-orange-light border border-niger-orange/20 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id="chatbot-input"
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  aria-label="Votre message"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-niger-orange/40 focus:border-niger-orange disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Envoyer le message"
                  className="size-10 flex-shrink-0 flex items-center justify-center bg-niger-orange hover:bg-niger-orange-dark text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-[transform,opacity,background-color]"
                >
                  <Send className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 text-center">
                Assistant virtuel basé sur IA • Réponses sur le contenu public du site
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
