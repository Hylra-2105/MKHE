import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useAuthStore } from '@/stores/useAuthStore';
import { getChatHistoryApi, sendChatMessageApi } from '@/api/aiApi';

const Chatbot = () => {
  const { t, i18n } = useTranslation('chatbot');
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const res = await getChatHistoryApi();
          if (res.data && res.data.messages && res.data.messages.length > 0) {
            setMessages(res.data.messages);
            return;
          }
        } catch (error) {
          console.error('Failed to load chat history', error);
        }
      }
      
      setMessages([{ role: 'assistant', content: t('initial_greeting') }]);
    };
    
    loadHistory();
  }, [user, t]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessageApi(userMessage);
      const reply = response.data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      
      if (!isOpenRef.current) {
        setHasUnread(true);
        setShowGreeting(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('error') }]);
      
      if (!isOpenRef.current) {
        setHasUnread(true);
        setShowGreeting(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Minimize Button */}
      {!isOpen && !isMinimized && (
        <button
          onClick={() => setIsMinimized(true)}
          className="fixed bottom-[148px] right-1 p-1 bg-white/80 dark:bg-[#2d1c15]/80 backdrop-blur-sm rounded-full shadow-sm border border-black/5 dark:border-white/10 text-gray-500 hover:text-gray-700 dark:text-mkhe-text/80 dark:hover:text-mkhe-text z-50 transition-colors cursor-pointer"
          title="Minimize buttons"
        >
          <X size={18} />
        </button>
      )}

      {/* Floating Facebook Button */}
      <a
        href="https://www.facebook.com/profile.php?id=61590251406483"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (isMinimized) {
            e.preventDefault();
            setIsMinimized(false);
          }
        }}
        className={`fixed bottom-[92px] p-4 bg-[#1877F2] text-white rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center cursor-pointer ${isOpen ? 'hidden' : 'flex'} ${isMinimized ? '-right-8 opacity-60 hover:opacity-100 hover:-right-6' : 'right-6 hover:scale-110'}`}
      >
        <FaFacebook size={28} />
      </a>

      {/* Floating Chat Container */}
      <div className={`fixed bottom-6 z-50 flex items-end transition-all duration-300 ${isOpen ? 'hidden' : 'flex'} ${isMinimized ? '-right-8' : 'right-6'}`}>
        
        {/* Chatbot Greeting Balloon */}
        {showGreeting && !isMinimized && (
          <div className="absolute right-[calc(100%+16px)] bottom-2 bg-white dark:bg-[#2d1c15] text-gray-800 dark:text-mkhe-text text-[13px] p-3 pr-8 rounded-2xl rounded-br-sm shadow-xl border border-black/5 dark:border-mkhe-border/30 w-52 text-left animate-[bounce_2s_infinite]">
             <p className="font-bold mb-0.5 text-mkhe-primary">{t('title')}</p>
             {hasUnread ? t('balloon_unread') : t('balloon_default')}
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 setShowGreeting(false);
               }} 
               className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:text-mkhe-text/60 dark:hover:text-mkhe-text transition-colors cursor-pointer"
             >
               <X size={14} />
             </button>
             {/* Tail arrow */}
             <div className="absolute -right-2 bottom-3 w-4 h-4 bg-white dark:bg-[#2d1c15] border-b border-r border-black/5 dark:border-mkhe-border/30 rotate-[-45deg] rounded-sm"></div>
          </div>
        )}

        <button
          onClick={() => {
            if (isMinimized) {
              setIsMinimized(false);
            } else {
              setIsOpen(true);
              setShowGreeting(false);
              setHasUnread(false);
            }
          }}
          className={`relative p-4 bg-mkhe-primary text-white rounded-full shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${isMinimized ? 'opacity-60 hover:opacity-100 hover:-translate-x-2' : 'hover:scale-110'}`}
        >
          <MessageCircle size={28} />
          {/* Unread Dot Indicator */}
          {hasUnread && !isMinimized && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-mkhe-bg rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white dark:bg-mkhe-bg border border-black/5 dark:border-mkhe-border/50 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-white dark:bg-transparent border-b border-black/5 dark:border-mkhe-border/50 p-5 flex justify-between items-center z-10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-mkhe-primary/10 dark:bg-mkhe-primary/20 p-2 rounded-full">
                <MessageCircle size={20} className="text-mkhe-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide leading-tight text-mkhe-primary">{t('title')}</h3>
                <p className="text-xs text-gray-500 dark:text-mkhe-text/70 font-medium">{t('subtitle')}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 transition-colors cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#faf8f5] dark:bg-[#20130d]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3.5 px-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-mkhe-primary text-white rounded-br-sm' 
                      : 'bg-white dark:bg-[#2d1c15] text-gray-800 dark:text-mkhe-text rounded-bl-sm border border-black/5 dark:border-mkhe-border/30'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:text-inherit prose-strong:font-bold prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#2d1c15] border border-black/5 dark:border-mkhe-border/30 p-3 px-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-mkhe-primary" />
                  <span className="text-[14px] text-gray-500 dark:text-mkhe-text/70 font-medium">{t('thinking')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-mkhe-bg border-t border-black/5 dark:border-mkhe-border/50">
            <div className="flex items-end gap-2 bg-[#f4f4f5] dark:bg-[#20130d] p-1.5 rounded-[24px] focus-within:ring-2 focus-within:ring-mkhe-primary/20 focus-within:bg-white dark:focus-within:bg-[#2d1c15] transition-all border border-transparent focus-within:border-mkhe-primary/30">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; // Max height 128px (max-h-32)
                }}
                onKeyDown={handleKeyPress}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent !border-0 !outline-none !ring-0 focus:ring-0 focus:outline-none resize-none max-h-32 min-h-[40px] px-3 py-2.5 text-[15px] text-gray-700 dark:text-mkhe-text placeholder-gray-400 dark:placeholder-mkhe-text/50 shadow-none"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 flex items-center justify-center bg-mkhe-primary text-white rounded-full hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer transition-all mb-0.5 mr-0.5 flex-shrink-0"
              >
                <Send size={18} className="relative right-[1px] top-[1px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
